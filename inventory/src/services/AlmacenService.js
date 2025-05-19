// src/services/AlmacenService.js
const fs = require("fs");
const path = require("path");
const { v4: uuidv4 } = require("uuid");
const csv = require("csv-parser");
const pLimit = require('p-limit').default;
const { PrismaClient, EstadoAlmacen } = require('@prisma/client');
const prisma = new PrismaClient();
const DepartamentoService = require('./DepartamentoSerice');
const CiudadService = require('./CiudadSerice');
const { findUser, createUser, findUserByEmail, findDespachadorByCity } = require('../lib/userServiceClient'); // Ajusta la ruta

const logDir = path.join(__dirname, "../../logs");
if (!fs.existsSync(logDir)) fs.mkdirSync(logDir, { recursive: true });

const createLogStream = () => {
  const now = new Date();
  const date = now.toISOString().split("T")[0];
  const time = now.toTimeString().split(" ")[0].replace(/:/g, "-");
  const logFileName = `almacenes-bulk-log-${date}_${time}.log`;
  return fs.createWriteStream(path.join(logDir, logFileName), { flags: "a" });
};

const normalizeString = (str) =>
  str
    ?.normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\w\s]/gi, "")
    .trim()
    .toLowerCase();

const chunk = (array, size) => {
  const result = [];
  for (let i = 0; i < array.length; i += size) {
    result.push(array.slice(i, i + size));
  }
  return result;
};

class AlmacenService {
  _parseAlmacenData(csvData) {
    const {
      id_almacen, nombre_almacen, direccion, ciudad: nombre_ciudad,
      departamento: nombre_departamento, pais, codigo_postal,
      latitud, longitud, gerente: nombre_gerente, telefono, email,
      capacidad_m2, estado
    } = csvData;

    if (!id_almacen || !nombre_almacen || !direccion || !nombre_ciudad ||
      !nombre_departamento || !pais || !codigo_postal || latitud === undefined ||
      longitud === undefined || !nombre_gerente || capacidad_m2 === undefined || !estado) {
      throw new Error("Faltan campos requeridos para crear el almacén.");
    }

    const parsedLatitud = parseFloat(latitud);
    const parsedLongitud = parseFloat(longitud);
    const parsedCapacidad = parseInt(capacidad_m2, 10);

    if (isNaN(parsedLatitud) || isNaN(parsedLongitud) || isNaN(parsedCapacidad)) {
      throw new Error("Latitud, longitud y capacidad_m2 deben ser números válidos.");
    }

    const estadoEnum = estado.trim().toUpperCase();
    if (!EstadoAlmacen[estadoEnum]) {
      throw new Error(`Estado de almacén inválido: '${estado}'. Valores permitidos: ${Object.keys(EstadoAlmacen).join(', ')}`);
    }

    return {
      id_almacen, nombre_almacen, calle_direccion: direccion, nombre_ciudad,
      nombre_departamento, pais, codigo_postal, latitud: parsedLatitud,
      longitud: parsedLongitud, nombre_gerente, telefono_gerente: telefono,
      email_gerente: email, capacidad_m3: parsedCapacidad, estadoAlmacen: EstadoAlmacen[estadoEnum]
    };
  }


  async bulkCreateFromCSV(filePath) {
    const startTime = Date.now(); // <- MARCAR INICIO
    const results = [];
    const logStream = createLogStream();

    const log = (msg) => {
      const timestamp = `[${new Date().toISOString()}] `;
      console.log(timestamp + msg);
      logStream.write(timestamp + msg + "\n");
    };
    const appendLog = (msg) => {
      console.log(msg);
      logStream.write(msg + "\n");
    };

    // Leer CSV
    await new Promise((resolve, reject) => {
      fs.createReadStream(filePath, { encoding: "utf8" })
        .pipe(csv({ separator: "," }))
        .on("data", (row) => results.push(row))
        .on("end", () => {
          log(`Archivo CSV leído. Registros: ${results.length}`);
          resolve();
        })
        .on("error", (err) => {
          log(`Error leyendo CSV: ${err.message}`);
          reject(err);
        });
    });

    const normalizeString = (str) => {
      if (!str) return "";
      return str.toString().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim().toLowerCase();
    };

    log("Cargando ciudades y departamentos...");
    const allCities = await prisma.ciudad.findMany({ include: { departamento: true } });
    log(`  → ${allCities.length} ciudades cargadas.`);

    // Mapas para búsqueda rápida
    const cityMapFullKey = new Map();
    const cityMapByName = new Map();
    allCities.forEach((c) => {
      const cityKeyFull = `${normalizeString(c.nombre)}|${normalizeString(c.departamento?.nombre)}`;
      cityMapFullKey.set(cityKeyFull, c);

      const cityKeyName = normalizeString(c.nombre);
      if (!cityMapByName.has(cityKeyName)) cityMapByName.set(cityKeyName, []);
      cityMapByName.get(cityKeyName).push(c);
    });

    // --- Paso 1: Preparar usuarios (gerentes) ---
    const nuevosGerentesCache = new Map();
    const emailsToCreate = new Map();

    for (const row of results) {
      const emailKey = row.email?.toLowerCase();
      if (emailKey && !nuevosGerentesCache.has(emailKey)) {
        nuevosGerentesCache.set(emailKey, null); // marcar para buscar
      }
    }

    // Buscar usuarios existentes en paralelo con límite para no saturar
    const limitUsuarios = pLimit(300);
    await Promise.all(
      [...nuevosGerentesCache.keys()].map(email =>
        limitUsuarios(async () => {
          try {
            const user = await findUserByEmail(email);
            if (user) {
              nuevosGerentesCache.set(email, user);
              log(`Usuario encontrado en cache: ${email} con ID: ${user.id || "N/A"}`);
            } else {
              emailsToCreate.set(email, true);
              log(`Usuario NO encontrado, marcar para creación: ${email}`);
            }
          } catch (error) {
            appendLog(`Error buscando usuario ${email}: ${error.message}`);
            emailsToCreate.set(email, true); // intentar crear por si acaso
          }
        })
      )
    );

    // Crear usuarios nuevos en paralelo con límite
    const createUserLimit = pLimit(300);
    await Promise.all(
      results.map(row => createUserLimit(async () => {
        const emailKey = row.email?.toLowerCase();
        if (emailKey && emailsToCreate.has(emailKey)) {
          const payloadUser = {
            fullname: row.gerente.trim(),
            email: row.email.trim(),
            number: row.telefono.trim(),
            roleId: process.env.ROL_GERENTE_ID,
            current_password: process.env.CONTRASENA_GENERICA,
          };
          try {
            const createdUser = await createUser(payloadUser);
            // Mapea userId a id para mantener uniformidad
            const userWithId = {
              ...createdUser,
              id: createdUser.userId || createdUser.id
            };
            nuevosGerentesCache.set(emailKey, userWithId);
            emailsToCreate.delete(emailKey);
            log(`Usuario creado: ${emailKey} con ID ${userWithId.id || "N/A"}`);
          } catch (error) {
            appendLog(`Error creando usuario ${emailKey}: ${error.message}`);
          }
        }
      }))
    );

    // --- Paso 2: Validar almacenes ya existentes en batch para evitar múltiples consultas
    const allAlmacenIds = results.map(r => r.id_almacen);
    const existingAlmacenes = await prisma.almacen.findMany({
      where: { id_almacen: { in: allAlmacenIds } },
      select: { id_almacen: true }
    });
    const existingAlmacenesSet = new Set(existingAlmacenes.map(a => a.id_almacen));
    log(`Almacenes existentes detectados: ${existingAlmacenesSet.size}`);

    // --- Paso 3: Preparar direcciones y almacenes para bulk insert ---
    const direccionesToInsert = [];
    const almacenesToInsert = [];
    const direccionIdMap = new Map();
    const errors = [];

    for (const [idx, row] of results.entries()) {
      const filaNum = idx + 1;
      const normalizedCiudad = normalizeString(row.ciudad);
      const normalizedDepartamento = normalizeString(row.departamento);

      if (!normalizedCiudad || !normalizedDepartamento) {
        const errorMsg = `Fila ${filaNum}: Ciudad o departamento inválidos`;
        appendLog(errorMsg);
        errors.push({ fila: filaNum, error: "Ciudad o departamento inválidos" });
        continue;
      }

      // Ciudad especial Bogotá
      let ciudadEntity = null;
      if (normalizedCiudad === "bogota" || normalizedCiudad === "bogotá") {
        const posiblesCiudades = cityMapByName.get(normalizedCiudad);
        ciudadEntity = posiblesCiudades?.[0] || null;
        appendLog(`Fila ${filaNum}: Ciudad Bogotá detectada, se ignora departamento.`);
      } else {
        const ciudadKey = `${normalizedCiudad}|${normalizedDepartamento}`;
        ciudadEntity = cityMapFullKey.get(ciudadKey);
      }

      if (!ciudadEntity) {
        const errorMsg = `Fila ${filaNum}: Ciudad "${row.ciudad}" con departamento "${row.departamento}" no existe`;
        appendLog(errorMsg);
        errors.push({ fila: filaNum, error: "Ciudad no existe en BD" });
        continue;
      }

      const emailKey = row.email?.toLowerCase();
      const gerenteObj = nuevosGerentesCache.get(emailKey);
      if (!emailKey || !gerenteObj) {
        const errorMsg = `Fila ${filaNum}: Gerente no encontrado o inválido para email ${emailKey}`;
        appendLog(errorMsg);
        errors.push({ fila: filaNum, error: "Gerente no válido" });
        continue;
      }

      if (existingAlmacenesSet.has(row.id_almacen)) {
        appendLog(`Fila ${filaNum}: Almacén '${row.id_almacen}' ya existe. Omitido.`);
        continue;
      }

      // Generar ID único para dirección si no es UUID (usa hash o UUID)
      let direccionId = row.direccion;
      if (!direccionIdMap.has(direccionId)) {
        direccionId = uuidv4();
        direccionIdMap.set(row.direccion, direccionId);

        direccionesToInsert.push({
          id: direccionId,
          calle: row.direccion,
          ciudadId: ciudadEntity.id,
          latitud: parseFloat(row.latitud),
          longitud: parseFloat(row.longitud),
          createdAt: new Date(),
          updatedAt: new Date(),
        });
      } else {
        direccionId = direccionIdMap.get(row.direccion);
      }

      const almacenObj = {
        id_almacen: row.id_almacen,
        nombre_almacen: row.nombre_almacen,
        direccionId,
        gerente: row.gerente,
        capacidad_m3: parseInt(row.capacidad_m2 || 0),
        capacidad_usada_m3: 0,
        estado: row.estado.toUpperCase()
      };

      const gerenteId = gerenteObj?.id;
      log(`Fila ${filaNum}: email=${emailKey}, gerenteId=${gerenteId || "NO ASIGNADO"}`);

      if (gerenteId) {
        almacenObj.gerenteId = gerenteId;
      } else {
        appendLog(`Fila ${filaNum}: gerenteId NO encontrado para email ${emailKey}`);
        errors.push({ fila: filaNum, error: "gerenteId no asignado" });
      }

      almacenesToInsert.push(almacenObj);
    }

    // --- Paso 4: Bulk insert direcciones ---
    try {
      const insertDirecciones = await prisma.direccion.createMany({
        data: direccionesToInsert,
        skipDuplicates: true,
      });
      log(`Direcciones insertadas: ${insertDirecciones.count}`);
    } catch (error) {
      appendLog(`Error insertando direcciones: ${error.message}`);
      errors.push({ error: `Insertar direcciones: ${error.message}` });
    }

    // --- Paso 5: Bulk insert almacenes ---
    try {
      const insertAlmacenes = await prisma.almacen.createMany({
        data: almacenesToInsert,
        skipDuplicates: true,
      });
      log(`Almacenes insertados: ${insertAlmacenes.count}`);
    } catch (error) {
      appendLog(`Error insertando almacenes: ${error.message}`);
      errors.push({ error: `Insertar almacenes: ${error.message}` });
    }


    const endTime = Date.now();
    const durationSeconds = ((endTime - startTime) / 1000).toFixed(2);
    log(`Tiempo total de carga masiva: ${durationSeconds} segundos`);

    logStream.end();
    return {
      totalCreados: almacenesToInsert.length,
      errores: errors,
    };
  }




  async create(almacenDataFromCSV) {
    const {
      id_almacen, nombre_almacen, calle_direccion, nombre_ciudad,
      nombre_departamento, pais, codigo_postal, latitud, longitud,
      nombre_gerente, telefono_gerente, email_gerente,
      capacidad_m3, estadoAlmacen
    } = this._parseAlmacenData(almacenDataFromCSV);

    const existingAlmacen = await prisma.almacen.findUnique({ where: { id_almacen } });
    if (existingAlmacen) {
      throw new Error(`Almacén con ID '${id_almacen}' ya existe.`);
    }

    const departamentoEntity = await DepartamentoService.findDepartamentoByNombre({ nombre: nombre_departamento });
    if (!departamentoEntity) {
      throw new Error(`El departamento '${nombre_departamento}' no existe. Por favor, créelo primero.`);
    }

    if (departamentoEntity.pais.toUpperCase() !== pais.toUpperCase()) {
      console.warn(`Advertencia: El país '${pais}' del CSV no coincide con el país '${departamentoEntity.pais}' del departamento '${nombre_departamento}' encontrado en la BD.`);
    }

    const ciudadEntity = await CiudadService.findCiudadByNombreAndDepartamentoId({
      nombre: nombre_ciudad,
      departamentoId: departamentoEntity.id
    });
    if (!ciudadEntity) {
      throw new Error(`La ciudad '${nombre_ciudad}' no existe en el departamento '${nombre_departamento}'. Por favor, créela primero.`);
    }
    if (ciudadEntity.codigo_postal !== codigo_postal) {
      console.warn(`Advertencia: El código postal '${codigo_postal}' del CSV no coincide con el código postal '${ciudadEntity.codigo_postal}' de la ciudad '${nombre_ciudad}' encontrada en la BD.`);
    }

    let gerenteEntity;
    if (email_gerente) {
      gerenteEntity = await findUserByEmail(email_gerente);
    }

    let despachadorEntity;

    if (!gerenteEntity) {
      const gerentePayload = {
        fullname: nombre_gerente,
        email: email_gerente,
        number: telefono_gerente,
        roleId: '681462eaef7752d9d59866d8',
        current_password: 'GeneratedPassword123!',
      };
      gerenteEntity = await createUser(gerentePayload);
    }

    return prisma.$transaction(async (tx) => {
      const nuevaDireccion = await tx.direccion.create({
        data: {
          calle: calle_direccion,
          ciudadId: ciudadEntity.id,
          latitud,
          longitud,
        },
      });
      
      despachadorEntity = await findDespachadorByCity(ciudadEntity.id)
      console.log(despachadorEntity.data);
      

      const nuevoAlmacen = await tx.almacen.create({
        data: {
          id_almacen,
          nombre_almacen,
          direccionId: nuevaDireccion.id,
          gerente: gerenteEntity.fullname || nombre_gerente,
          gerenteId: gerenteEntity.id,
          despachador:despachadorEntity.data.fullname,
          despachadorId: despachadorEntity.data.id,
          capacidad_m3,
          capacidad_usada_m3: 0,
          estado: estadoAlmacen
        },
        include: {
          direccion: { include: { ciudad: { include: { departamento: true } } } }
        }
      });
      return nuevoAlmacen;
    });
  }

  async getAll() {
    return prisma.almacen.findMany({
      include: {
        direccion: { include: { ciudad: { include: { departamento: true } } } }
      }
    });
  }

  async getById(id_almacen) {
    const almacen = await prisma.almacen.findUnique({
      where: { id_almacen },
      include: {
        direccion: { include: { ciudad: { include: { departamento: true } } } }
      }
    });
    if (!almacen) throw new Error('Almacén no encontrado');
    return almacen;
  }

  async update(id_almacen, updateData) {
    const almacenActual = await prisma.almacen.findUnique({
      where: { id_almacen },
      include: { direccion: { include: { ciudad: { include: { departamento: true } } } } }
    });
    if (!almacenActual) throw new Error(`Almacén con ID '${id_almacen}' no encontrado para actualizar.`);

    const {
      nombre_almacen, direccion: calle_direccion, ciudad: nombre_ciudad,
      departamento: nombre_departamento, pais, codigo_postal,
      latitud, longitud, gerente: nombre_gerente, telefono: telefono_gerente,
      email: email_gerente, capacidad_m2, estado
    } = updateData;

    let direccionIdToUse = almacenActual.direccionId;
    let ciudadIdToUse = almacenActual.direccion.ciudadId;
    let gerenteNombreToUse = almacenActual.gerente_nombre;

    return prisma.$transaction(async (tx) => {
      if (nombre_departamento && pais && nombre_ciudad && codigo_postal) {
        const ciudadEntity = await CiudadService.findOrCreateCiudad({
          nombre: nombre_ciudad,
          codigo_postal,
          nombre_departamento,
          pais_departamento: pais,
        });
        ciudadIdToUse = ciudadEntity.id;
      }

      if (calle_direccion !== undefined ||
        (ciudadIdToUse !== almacenActual.direccion.ciudadId) ||
        (latitud !== undefined && parseFloat(latitud) !== almacenActual.direccion.latitud) ||
        (longitud !== undefined && parseFloat(longitud) !== almacenActual.direccion.longitud)) {

        const updatedDireccion = await tx.direccion.update({
          where: { id: almacenActual.direccionId },
          data: {
            calle: calle_direccion !== undefined ? calle_direccion : almacenActual.direccion.calle,
            ciudadId: ciudadIdToUse,
            latitud: latitud !== undefined ? parseFloat(latitud) : almacenActual.direccion.latitud,
            longitud: longitud !== undefined ? parseFloat(longitud) : almacenActual.direccion.longitud,
          }
        });
        direccionIdToUse = updatedDireccion.id;
      }

      if (nombre_gerente) {
        let gerenteEntity;
        if (email_gerente) gerenteEntity = await findUser({ email: email_gerente });
        if (!gerenteEntity) gerenteEntity = await findUser({ nombre_completo: nombre_gerente });

        if (!gerenteEntity) {
          gerenteEntity = await createUser({
            nombre_completo: nombre_gerente,
            email: email_gerente,
            telefono: telefono_gerente,
          });
        }
        gerenteNombreToUse = gerenteEntity.nombre_completo || nombre_gerente;
      }

      const almacenUpdatePayload = {};
      if (nombre_almacen !== undefined) almacenUpdatePayload.nombre_almacen = nombre_almacen;
      if (gerenteNombreToUse !== almacenActual.gerente_nombre) almacenUpdatePayload.gerente_nombre = gerenteNombreToUse;
      if (capacidad_m2 !== undefined) almacenUpdatePayload.capacidad_m2 = parseInt(capacidad_m2, 10);
      if (estado !== undefined) {
        const estadoEnum = estado.trim().toUpperCase();
        if (!EstadoAlmacen[estadoEnum]) throw new Error(`Estado de almacén inválido: '${estado}'.`);
        almacenUpdatePayload.estado = EstadoAlmacen[estadoEnum];
      }
      almacenUpdatePayload.direccionId = direccionIdToUse;

      return tx.almacen.update({
        where: { id_almacen },
        data: almacenUpdatePayload,
        include: {
          direccion: { include: { ciudad: { include: { departamento: true } } } }
        }
      });
    });
  }

  async updateCapacidadm3(id_almacen, capacidad_usada_m3) {
    return await prisma.almacen.update({
      where: { id_almacen: id_almacen },
      data: { capacidad_usada_m3: capacidad_usada_m3 }
    });
  }

  async delete(id_almacen) {
    const stockCount = await prisma.almacenProducto.count({ where: { id_almacen } });
    if (stockCount > 0) {
      throw new Error('No se puede eliminar el almacén, tiene stock de productos asociado.');
    }
    const movementCount = await prisma.movement_Inventory.count({ where: { id_almacen } });
    if (movementCount > 0) {
      throw new Error('No se puede eliminar el almacén, tiene movimientos de inventario registrados.');
    }

    return prisma.$transaction(async (tx) => {
      const almacen = await tx.almacen.findUnique({ where: { id_almacen } });
      if (!almacen) throw new Error('Almacén no encontrado para eliminar.');

      const deletedAlmacen = await tx.almacen.delete({ where: { id_almacen } });
      await tx.direccion.delete({ where: { id: almacen.direccionId } });

      return deletedAlmacen;
    });
  }
}

module.exports = new AlmacenService();
