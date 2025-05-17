// src/services/AlmacenService.js
const { PrismaClient, EstadoAlmacen } = require('@prisma/client');
const prisma = new PrismaClient();
const DepartamentoService = require('./DepartamentoSerice');
const CiudadService = require('./CiudadSerice');
const { findUser, createUser, findUserByEmail } = require('../lib/userServiceClient'); // Ajusta la ruta

class AlmacenService {
    // Método auxiliar para parsear y validar los datos del CSV
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

    async create(almacenDataFromCSV) {
        const {
            id_almacen, nombre_almacen, calle_direccion, nombre_ciudad,
            nombre_departamento, pais, codigo_postal, latitud, longitud,
            nombre_gerente, telefono_gerente, email_gerente,
            capacidad_m3, estadoAlmacen
        } = this._parseAlmacenData(almacenDataFromCSV);
        // console.log('almacenDataFromCSV', almacenDataFromCSV);
        // 1. Validar existencia de almacen
        const existingAlmacen = await prisma.almacen.findUnique({ where: { id_almacen } });
        if (existingAlmacen) {
            throw new Error(`Almacén con ID '${id_almacen}' ya existe.`);
        }

        // 2. Validar/Crear Departamento y Ciudad

        const departamentoEntity = await DepartamentoService.findDepartamentoByNombre({ nombre: nombre_departamento });
        if (!departamentoEntity) {
            throw new Error(`El departamento '${nombre_departamento}' no existe. Por favor, créelo primero.`);
        }

        // Opcional: Validar si el 'pais' del CSV coincide con departamentoEntity.pais
        if (departamentoEntity.pais.toUpperCase() !== pais.toUpperCase()) {
            console.warn(`Advertencia: El país '${pais}' del CSV no coincide con el país '${departamentoEntity.pais}' del departamento '${nombre_departamento}' encontrado en la BD.`);
            // Podrías decidir lanzar un error aquí si la consistencia del país es crítica:
            // throw new Error(`El país '${pais}' proporcionado para el departamento '${nombre_departamento}' no coincide con el registrado ('${departamentoEntity.pais}').`);
        }

        // Validar existencia de Ciudad (¡NO CREAR!)
        const ciudadEntity = await CiudadService.findCiudadByNombreAndDepartamentoId({
            nombre: nombre_ciudad,
            departamentoId: departamentoEntity.id
        });
        if (!ciudadEntity) {
            throw new Error(`La ciudad '${nombre_ciudad}' no existe en el departamento '${nombre_departamento}'. Por favor, créela primero.`);
        }
        // Opcional: Validar si el 'codigo_postal' del CSV coincide con ciudadEntity.codigo_postal
        if (ciudadEntity.codigo_postal !== codigo_postal) {
            console.warn(`Advertencia: El código postal '${codigo_postal}' del CSV no coincide con el código postal '${ciudadEntity.codigo_postal}' de la ciudad '${nombre_ciudad}' encontrada en la BD.`);
            // Podrías decidir lanzar un error aquí si la consistencia del código postal es crítica:
            // throw new Error(`El código postal '${codigo_postal}' proporcionado para la ciudad '${nombre_ciudad}' no coincide con el registrado ('${ciudadEntity.codigo_postal}').`);
        }

        // El servicio de ciudad ya maneja la creación del departamento si es necesario
        // const ciudadEntity = await CiudadService.findOrCreateCiudad({
        //     nombre: nombre_ciudad,
        //     codigo_postal,
        //     nombre_departamento,
        //     pais_departamento: pais,
        // });

        // 3. Validar/Crear Gerente
        let gerenteEntity;
        // Intentar encontrar por email si está disponible (más único)
        if (email_gerente) {
            console.log(`Buscando gerente por email: ${email_gerente}`);
            console.log(await findUser({ email: email_gerente }));
            gerenteEntity = await findUserByEmail(email_gerente);
            console.log('Gerente encontrado por email:', gerenteEntity);
        }

        if (!gerenteEntity) {
            console.log(`Gerente '${nombre_gerente}' no encontrado, creando nuevo gerente...`);
            // Asegúrate que el payload coincida con lo que espera tu servicio de usuarios
            // Podrías necesitar un rolId por defecto, o un password temporal, etc.
            const gerentePayload = {
                fullname: nombre_gerente, // Ajustar según servicio de usuarios
                email: email_gerente,
                number: telefono_gerente,
                roleId: '681462eaef7752d9d59866d8',
                current_password: 'GeneratedPassword123!',
            };
            gerenteEntity = await createUser(gerentePayload);
        }

        // 4. Crear Almacén y Dirección en una transacción
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
                    gerente: gerenteEntity.fullname || nombre_gerente, // Usa el nombre del gerente del servicio o el original
                    gerenteId: gerenteEntity.id, // Si decides guardar el ID
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

        // Parsear los datos de entrada de forma similar a _parseAlmacenData pero para campos opcionales
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
            // Actualizar Departamento/Ciudad si se proveen
            if (nombre_departamento && pais && nombre_ciudad && codigo_postal) {
                const ciudadEntity = await CiudadService.findOrCreateCiudad({
                    nombre: nombre_ciudad,
                    codigo_postal,
                    nombre_departamento,
                    pais_departamento: pais,
                });
                ciudadIdToUse = ciudadEntity.id;
            }

            // Actualizar Dirección si cambia la calle, ciudad, lat o long
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
                direccionIdToUse = updatedDireccion.id; // Sigue siendo la misma ID pero se actualiza
            }


            // Actualizar Gerente si se provee
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

            // Preparar datos para actualizar Almacen
            const almacenUpdatePayload = {};
            if (nombre_almacen !== undefined) almacenUpdatePayload.nombre_almacen = nombre_almacen;
            if (gerenteNombreToUse !== almacenActual.gerente_nombre) almacenUpdatePayload.gerente_nombre = gerenteNombreToUse;
            if (capacidad_m2 !== undefined) almacenUpdatePayload.capacidad_m2 = parseInt(capacidad_m2, 10);
            if (estado !== undefined) {
                const estadoEnum = estado.trim().toUpperCase();
                if (!EstadoAlmacen[estadoEnum]) throw new Error(`Estado de almacén inválido: '${estado}'.`);
                almacenUpdatePayload.estado = EstadoAlmacen[estadoEnum];
            }
            almacenUpdatePayload.direccionId = direccionIdToUse; // Siempre se incluye por si cambia

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
        // Validar que no tenga stock asociado (AlmacenProducto)
        const stockCount = await prisma.almacenProducto.count({ where: { id_almacen } });
        if (stockCount > 0) {
            throw new Error('No se puede eliminar el almacén, tiene stock de productos asociado.');
        }
        // Validar que no tenga movimientos de inventario (Movement_Inventory)
        const movementCount = await prisma.movement_Inventory.count({ where: { id_almacen } });
        if (movementCount > 0) {
            throw new Error('No se puede eliminar el almacén, tiene movimientos de inventario registrados.');
        }


        return prisma.$transaction(async (tx) => {
            const almacen = await tx.almacen.findUnique({ where: { id_almacen } });
            if (!almacen) throw new Error('Almacén no encontrado para eliminar.');

            const deletedAlmacen = await tx.almacen.delete({ where: { id_almacen } });
            // La dirección asociada también se elimina gracias a la FK y la acción ON DELETE RESTRICT/CASCADE
            // Si es RESTRICT y no se borra la dirección antes, fallará.
            // Es mejor borrarla explícitamente si la relación es 1 a 1.
            await tx.direccion.delete({ where: { id: almacen.direccionId } });

            return deletedAlmacen;
        });
    }
}

module.exports = new AlmacenService();