// src/services/AlmacenService.js
const fs = require("fs");
const path = require("path");
const csv = require("csv-parser");
const pLimit = require('p-limit').default;
const { PrismaClient, EstadoAlmacen } = require('@prisma/client');
const prisma = new PrismaClient();
const DepartamentoService = require('./DepartamentoSerice');
const CiudadService = require('./CiudadSerice');
const { findUser, createUser, findUserByEmail } = require('../lib/userServiceClient'); // Ajusta la ruta

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

  // Leer CSV completo
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

  // Normalización texto (minusculas, trim, sin acentos)
  const normalizeString = (str) => {
    if (!str) return "";
    return str.toString().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim().toLowerCase();
  };

  // Cargar ciudades + departamentos para validaciones
  log("Cargando ciudades y departamentos...");
  const allCities = await prisma.ciudad.findMany({ include: { departamento: true } });
  log(`  → ${allCities.length} ciudades cargadas.`);

  // Crear mapas para búsquedas rápidas
  const cityMapFullKey = new Map();
  const cityMapByName = new Map();

  allCities.forEach((c) => {
    const cityKeyFull = `${normalizeString(c.nombre)}|${normalizeString(c.departamento?.nombre)}`;
    cityMapFullKey.set(cityKeyFull, c);

    const cityKeyName = normalizeString(c.nombre);
    if (!cityMapByName.has(cityKeyName)) cityMapByName.set(cityKeyName, []);
    cityMapByName.get(cityKeyName).push(c);
  });

  // Parámetros para control de concurrencia y reintentos
  const concurrencyLimit = 10; // Reducido para evitar saturación de DB
  const maxRetries = 3; // Intentos para crear almacén si falla transacción
  const retryDelayMs = 500; // Delay antes de reintentar

  const limit = pLimit(concurrencyLimit);
  const nuevosGerentesCache = new Map();

  const batches = chunk(results, 300);

  // Función para esperar tiempo (delay)
  const sleep = (ms) => new Promise((res) => setTimeout(res, ms));

  // Función para crear almacén con reintentos
  const createAlmacenWithRetry = async (payload, filaNum) => {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        await this.create(payload);
        appendLog(`Fila ${filaNum}: Almacén '${payload.id_almacen}' creado correctamente.`);
        return true;
      } catch (error) {
        appendLog(`Fila ${filaNum}: Error al crear almacén '${payload.id_almacen}', intento ${attempt}: ${error.message}`);
        if (attempt < maxRetries) {
          await sleep(retryDelayMs * attempt); // backoff progresivo
        } else {
          throw error; // re-lanzar error tras último intento
        }
      }
    }
  };

  const errors = [];
  let totalCreated = 0;
  let totalSkippedExist = 0;

  for (let batchIndex = 0; batchIndex < batches.length; batchIndex++) {
    const batch = batches[batchIndex];
    log(`Procesando batch ${batchIndex + 1} de ${batches.length} (${batch.length} filas)`);

    const promises = batch.map((row, i) =>
      limit(async () => {
        const filaNum = batchIndex * 300 + i + 1;
        try {
          const normalizedCiudad = normalizeString(row.ciudad);
          const normalizedDepartamento = normalizeString(row.departamento);

          if (!normalizedCiudad || !normalizedDepartamento) {
            const msg = `Fila ${filaNum}: Ciudad o departamento inválidos`;
            appendLog(msg);
            errors.push({ fila: filaNum, mensaje: msg });
            return;
          }

          // Buscar ciudad validando el caso especial de Bogotá (ignorar departamento)
          let ciudadEntity = null;
          if (normalizedCiudad === "bogota" || normalizedCiudad === "bogotá") {
            const posiblesCiudades = cityMapByName.get(normalizedCiudad);
            if (posiblesCiudades && posiblesCiudades.length > 0) {
              ciudadEntity = posiblesCiudades[0];
              appendLog(`Fila ${filaNum}: Ciudad Bogotá detectada, se ignora departamento en validación.`);
            }
          } else {
            const ciudadKey = `${normalizedCiudad}|${normalizedDepartamento}`;
            ciudadEntity = cityMapFullKey.get(ciudadKey);
          }

          if (!ciudadEntity) {
            const msg = `Fila ${filaNum}: Ciudad "${row.ciudad}" con departamento "${row.departamento}" no existe en base de datos`;
            appendLog(msg);
            errors.push({ fila: filaNum, mensaje: msg });
            return;
          }

          // Validar si almacén ya existe
          const exists = await prisma.almacen.findUnique({ where: { id_almacen: row.id_almacen } });
          if (exists) {
            totalSkippedExist++;
            appendLog(`Fila ${filaNum}: Almacén con ID '${row.id_almacen}' ya existe. Se omite.`);
            return;
          }

          // Validar datos del gerente
          if (!row.gerente || !row.email || !row.telefono) {
            const msg = `Fila ${filaNum}: Faltan datos obligatorios para crear gerente (nombre, email o teléfono)`;
            appendLog(msg);
            errors.push({ fila: filaNum, mensaje: msg });
            return;
          }

          const emailKey = row.email.toLowerCase();
          let gerenteEntity = nuevosGerentesCache.get(emailKey);

          if (!gerenteEntity) {
            gerenteEntity = await findUserByEmail(row.email);

            if (!gerenteEntity) {
              const payloadUser = {
                fullname: row.gerente.trim(),
                email: row.email.trim(),
                number: row.telefono.trim(),
                roleId: process.env.ROL_GERENTE_ID,
                current_password: process.env.CONTRASENA_GENERICA,
              };
              gerenteEntity = await createUser(payloadUser);
              nuevosGerentesCache.set(emailKey, gerenteEntity);
              log(`Fila ${filaNum}: Gerente creado con ID ${gerenteEntity?.id || "N/A"}`);
            } else {
              log(`Fila ${filaNum}: Gerente existente encontrado con ID ${gerenteEntity.id}`);
            }
          }

          // Preparar payload para almacén
          const almacenPayload = {
            id_almacen: row.id_almacen,
            nombre_almacen: row.nombre_almacen,
            direccion: row.direccion,
            ciudad: ciudadEntity.nombre,
            departamento: ciudadEntity.departamento.nombre,
            pais: row.pais,
            codigo_postal: row.codigo_postal,
            latitud: row.latitud,
            longitud: row.longitud,
            gerente: row.gerente,
            telefono: row.telefono,
            email: row.email,
            capacidad_m2: row.capacidad_m2,
            estado: row.estado,
          };

          await createAlmacenWithRetry(almacenPayload, filaNum);
          totalCreated++;
        } catch (error) {
          const msg = `Fila ${filaNum}: Error al procesar almacén '${row.id_almacen}': ${error.message}`;
          appendLog(msg);
          errors.push({ fila: filaNum, mensaje: msg });
        }
      })
    );

    await Promise.all(promises);
    log(`Batch ${batchIndex + 1} completado`);
  }

  log(`Carga masiva terminada. Total creados: ${totalCreated}, existentes omitidos: ${totalSkippedExist}, errores: ${errors.length}`);
  logStream.end();

  return {
    totalCreados: totalCreated,
    totalOmitidos: totalSkippedExist,
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

      const nuevoAlmacen = await tx.almacen.create({
        data: {
          id_almacen,
          nombre_almacen,
          direccionId: nuevaDireccion.id,
          gerente: gerenteEntity.fullname || nombre_gerente,
          gerenteId: gerenteEntity.id,
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
