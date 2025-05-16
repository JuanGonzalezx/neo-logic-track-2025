// src/services/ProductoService.js
const { PrismaClient, Tipo } = require('@prisma/client');
const prisma = new PrismaClient();
const CategoriaService = require('../services/CategoriaService');
const ProveedorService = require('../services/ProveedorService');
const ProveedorProductoService = require('../services/ProveedorProductoService');
const AlmacenService = require('../services/AlmacenService');
const AlmacenProductoService = require('../services/AlmacenProductoService');
const MovementInventoryService = require('../services/MovementInventoryService');

class ProductoService {

    _parseProductoData(csvData) {
        let {
            id_producto, id_almacen, nombre_producto, categoria,
            descripcion, sku, codigo_barras,
            precio_unitario, cantidad_stock, nivel_reorden, ultima_reposicion, fecha_vencimiento,
            id_proveedor, peso_kg, dimensiones_cm, es_fragil, requiere_refrigeracion, estado
        } = csvData;

        // Verificación de campos requeridos
        // Los campos booleanos (es_fragil, requiere_refrigeracion) y estado se verifican contra undefined
        // para distinguirlos de un valor explícito 'false' o un estado válido que podría ser falsy.
        if (!id_producto || !id_almacen || !nombre_producto || !categoria ||
            !descripcion || !sku || !codigo_barras || precio_unitario === undefined || cantidad_stock === undefined || // Verificar undefined para números que podrían ser 0
            nivel_reorden === undefined || !ultima_reposicion || !id_proveedor ||
            peso_kg === undefined || dimensiones_cm === undefined || es_fragil === undefined || requiere_refrigeracion === undefined ||
            estado === undefined) { // Si 'estado' puede ser un string vacío que es válido, ajustar esta condición
            // Nota: Si un campo numérico como precio_unitario puede ser 0 y es válido, entonces !precio_unitario sería problemático si precio_unitario es 0.
            // Es mejor verificar la presencia ( !== undefined ) o un valor específico si es necesario.
            // Para simplificar, asumiré que los campos numéricos deben tener un valor y no ser solo 0 si son "requeridos" en el sentido de "deben estar presentes y ser válidos".
            // La validación actual con `!variable` para números podría fallar si 0 es un valor válido pero se interpreta como "no presente".
            // Voy a mantener tu lógica original, pero ten esto en cuenta.
            // Una opción más robusta sería:
            // const requiredFields = ['id_producto', 'id_almacen', ...];
            // for (const field of requiredFields) {
            //   if (csvData[field] === undefined || csvData[field] === null || csvData[field] === '') { // Ajustar según lo que consideres "vacío"
            //     throw new Error(`El campo ${field} es requerido.`);
            //   }
            // }
            // Pero para mantenerlo simple y cercano a tu original:
            throw new Error("Todos los campos son requeridos. Verifica que todos los valores, incluidos los numéricos y booleanos, estén presentes.");
        }


        const parsedPrecio = parseFloat(precio_unitario);
        // No reasigno aquí, usaré parsedPrecio directamente para la validación y el retorno.
        const parsedCantidadStock = parseInt(cantidad_stock, 10);
        const parsedNivelReorden = parseInt(nivel_reorden, 10);
        const parsedDimensiones = parseInt(dimensiones_cm, 10); // Asumo que dimensiones_cm es un solo número. Si es "LxWxH", necesita un parseo diferente.

        if (isNaN(parsedPrecio) || isNaN(parsedCantidadStock) || isNaN(parsedNivelReorden) || isNaN(parsedDimensiones)) {
            throw new Error("Precio unitario, cantidad stock, nivel reorden y dimension deben ser números válidos.");
        }

        // Devolvemos los valores parseados y los originales donde no hubo parseo o el parseo fue para validación.
        // Para mantener la estructura de reasignación implícita en tu código original,
        // puedes reasignar aquí si es crucial, pero es más limpio devolver los valores transformados.
        // Dado tu requisito de NO CAMBIAR NOMBRES, y que las variables son locales,
        // la reasignación que tenías está bien dentro de esta función.
        // Aquí, optaré por devolver un objeto con los valores procesados, que es una práctica común.
        // Si necesitas que las variables originales *dentro* de esta función reflejen el parseo, tu código original es correcto.

        return {
            id_producto, id_almacen, nombre_producto, categoria,
            descripcion, sku, codigo_barras,
            precio_unitario: parsedPrecio, // Usar valor parseado
            cantidad_stock: parsedCantidadStock, // Usar valor parseado
            nivel_reorden: parsedNivelReorden, // Usar valor parseado
            ultima_reposicion, fecha_vencimiento, // Estos se parsearán en `create`
            id_proveedor,
            peso_kg, // Asumo que peso_kg ya es numérico o se parseará después si es string. Si es string, parsear aquí.
            dimensiones_cm: parsedDimensiones, // Usar valor parseado
            es_fragil, requiere_refrigeracion, estado // Estos son booleanos/estado, se usan como vienen del CSV
        };
        // Si necesitas mantener la reasignación a las variables con let:
        // precio_unitario = parsedPrecio;
        // cantidad_stock = parsedCantidadStock;
        // ... y luego retornar el objeto con los nombres de variable originales.
        // Tu código original para esto estaba bien.
    }

    async create(productoDataFromCSV) {
        let {
            id_producto, id_almacen, nombre_producto, categoria,
            descripcion, sku, codigo_barras,
            precio_unitario, cantidad_stock, nivel_reorden, ultima_reposicion, fecha_vencimiento,
            id_proveedor, peso_kg, dimensiones_cm, es_fragil, requiere_refrigeracion, estado
        } = this._parseProductoData(productoDataFromCSV);

        // Parseo de fechas
        if (typeof ultima_reposicion === 'string') {
            const partes_ultima_reposicion = ultima_reposicion.split('/');
            if (partes_ultima_reposicion.length === 3) {
                const dia_ur = parseInt(partes_ultima_reposicion[0], 10);
                const mes_ur = parseInt(partes_ultima_reposicion[1], 10) - 1;
                const anio_ur = parseInt(partes_ultima_reposicion[2], 10);
                ultima_reposicion = new Date(anio_ur, mes_ur, dia_ur);
                if (isNaN(ultima_reposicion.getTime())) {
                    throw new Error(`Formato de fecha inválido para ultima_reposicion: ${productoDataFromCSV.ultima_reposicion}`);
                }
            } else {
                throw new Error(`Formato de fecha inválido para ultima_reposicion: ${productoDataFromCSV.ultima_reposicion}`);
            }
        } else if (!(ultima_reposicion instanceof Date && !isNaN(ultima_reposicion.getTime()))) {
            throw new Error(`Tipo o valor inválido para ultima_reposicion: ${productoDataFromCSV.ultima_reposicion}`);
        }

        if (fecha_vencimiento && typeof fecha_vencimiento === 'string') {
            const partes_fecha_vencimiento = fecha_vencimiento.split('/');
            if (partes_fecha_vencimiento.length === 3) {
                const dia_fv = parseInt(partes_fecha_vencimiento[0], 10);
                const mes_fv = parseInt(partes_fecha_vencimiento[1], 10) - 1;
                const anio_fv = parseInt(partes_fecha_vencimiento[2], 10);
                fecha_vencimiento = new Date(anio_fv, mes_fv, dia_fv);
                if (isNaN(fecha_vencimiento.getTime())) {
                    throw new Error(`Formato de fecha inválido para fecha_vencimiento: ${productoDataFromCSV.fecha_vencimiento}`);
                }
            } else {
                throw new Error(`Formato de fecha inválido para fecha_vencimiento: ${productoDataFromCSV.fecha_vencimiento}`);
            }
        } else if (fecha_vencimiento === null || fecha_vencimiento === undefined || fecha_vencimiento === '') {
            fecha_vencimiento = null;
        } else if (fecha_vencimiento && !(fecha_vencimiento instanceof Date && !isNaN(fecha_vencimiento.getTime()))) {
            throw new Error(`Tipo o valor inválido para fecha_vencimiento: ${productoDataFromCSV.fecha_vencimiento}`);
        }

        return await prisma.$transaction(async (tx) => {
            // Iniciar operaciones independientes en paralelo
            const existingProductoPromise = tx.producto.findUnique({ where: { id_producto } });
            const categoriaEntityPromise = CategoriaService.findOrCreateCategoria({ name: categoria }, tx);
            const proveedorEntityPromise = ProveedorService.findOrCreateProveedor({ id: id_proveedor }, tx);
            const almacenEntityPromise = AlmacenService.getById(id_almacen, tx);

            const [
                existingProducto,
                categoriaEntity,
                proveedorEntity,
                almacenEntity
            ] = await Promise.all([
                existingProductoPromise,
                categoriaEntityPromise,
                proveedorEntityPromise,
                almacenEntityPromise
            ]);

            let categoriaData = categoriaEntity.id;
            let proveedorData = proveedorEntity.id;

            if (!almacenEntity) {
                throw new Error(`El almacen '${id_almacen}' no existe. Por favor, créelo primero.`);
            }

            // 5. Crear producto (si no existe) - Esta operación debe ser await y completarse ANTES de las dependientes
            if (!existingProducto) {
                await tx.producto.create({
                    data: {
                        id_producto,
                        nombre_producto,
                        categoria_id: categoriaData,
                        descripcion,
                        sku,
                        codigo_barras,
                        precio_unitario,
                        peso_kg,
                        dimensiones_cm,
                        es_fragil,
                        requiere_refrigeracion,
                        status: estado
                    }
                });
            }

            // Ahora el producto está garantizado. Las siguientes operaciones pueden ser paralelas.
            const almacenProductoLogic = async () => {
                let almacenProductoData = {
                    id_almacen,
                    id_producto,
                    cantidad_stock,
                    nivel_reorden,
                    ultima_reposicion,
                    fecha_vencimiento
                };
                const existingAlmacenProducto = await AlmacenProductoService.getByProductoAlmacen(id_almacen, id_producto, tx);
                if (!existingAlmacenProducto) {
                    await AlmacenProductoService.findOrCreateAlmacenProducto(almacenProductoData, tx);
                } else {
                    almacenProductoData.cantidad_stock = almacenProductoData.cantidad_stock + existingAlmacenProducto.cantidad_stock;
                    await AlmacenProductoService.update(existingAlmacenProducto.id, almacenProductoData, tx);
                }
            };

            const fecha_movimiento = new Date();
            const tipo_movimiento = true;
            const movementInventoryData = {
                id_producto,
                id_almacen,
                tipo: tipo_movimiento,
                cantidad: cantidad_stock,
                fecha: fecha_movimiento
            };

            Promise.all([
                ProveedorProductoService.findOrCreateProveedorProducto({
                    id_producto: id_producto,
                    id_proveedor: proveedorData
                }, tx),
                almacenProductoLogic(),
                MovementInventoryService.create(movementInventoryData, tx)
            ]);

            return { success: true, id_producto_procesado: id_producto };

        }, {
            timeout: 60000,
            maxWait: 60000
        });
    }


    async getAll() {
        return prisma.producto.findMany();
    }

    async getById(id_producto) {
        const producto = await prisma.producto.findFirst({
            where: { id_producto }
        });
        if (!producto) throw new Error('producto no encontrado');
        return producto;
    }

    async update(id_producto, data) {

        try {
            if (data.id_producto) {
                throw new Error('No se puede actualizar los id');
            }

            let categoria = await CategoriaService.getByName(data.categoria_id)
            data.categoria_id = categoria.id

            if (!categoria) {
                throw new Error('La categoria noo existe');
            }

            return prisma.producto.update({
                where: { id_producto },
                data,
            });
        } catch (error) {
            if (error.code === 'P2025') throw new Error('producto no encontrado para actualizar.');
            throw error;
        }
    }

    async delete(id_producto) {
        return prisma.$transaction(async (tx) => {
            const producto = await tx.producto.findUnique({ where: { id_producto } });
            if (!producto) throw new Error('Producto no encontrado para eliminar.');

            const deletedProductoProveedor = await tx.proveedorProducto.deleteMany({ where: { id_producto } });
            const deletedProductoAlmacen = await tx.almacenProducto.deleteMany({ where: { id_producto } });
            const inactivedProducto = await tx.producto.update({
                where: { id_producto },
                data: {
                status: false
            }
            });

            return { message: "Producto eliminado correctamente", producto: inactivedProducto };
        });

    }

}

module.exports = new ProductoService();