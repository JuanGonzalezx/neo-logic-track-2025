const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const ProductoService = require('./ProductoService');
const AlmacenService = require('./AlmacenService');

class AlmacenProductoService {
    async findOrCreateAlmacenProducto(data) {
        const { id_producto, id_almacen, cantidad_stock, nivel_reorden, ultima_reposicion, fecha_vencimiento } = data;

        if (!id_producto || !id_almacen) {
            throw new Error("id_producto e id_almacen son requeridos.");
        }

        const existing = await prisma.almacenProducto.findFirst({
            where: { id_producto, id_almacen },
        });

        if (existing) {
            return existing
        }

        return prisma.almacenProducto.create({
            data: {
                id_producto,
                id_almacen,
                cantidad_stock,
                nivel_reorden,
                ultima_reposicion,
                fecha_vencimiento
            }
        });
    }

    async getAll() {
        return prisma.almacenProducto.findMany();
    }

    async getById(id) {
        const found = await prisma.almacenProducto.findFirst({ where: { id } });
        if (!found) throw new Error("AlmacenProducto no encontrado.");
        return found;
    }

    async getByProductoAlmacen(id_almacen, id_producto) {
        const found = await prisma.almacenProducto.findFirst({
            where:
                { id_almacen: id_almacen, id_producto: id_producto }
        });        
        return found;
    }

    async getByProducto(id_producto) {
        const producto = await prisma.producto.findFirst({ where: { id_producto } });
        if (!producto) throw new Error('Este producto no existe');
        const almacenProducto = prisma.almacenProducto.findMany({ where: { id_producto } });
        if ((almacenProducto.length <= 0)) throw new Error('Este producto no está en almacenes');
        return almacenProducto
    }

    async getByAlmacen(id_almacen) {
        const almacen = await prisma.almacen.findFirst({ where: { id_almacen } });
        if (!almacen) throw new Error('Este almacen no existe');
        const almacenProducto = prisma.almacenProducto.findMany({ where: { id_almacen } });
        if (almacenProducto.length <= 0) throw new Error('Este almacen no tiene productos');
        return almacenProducto
    }

    async update(id, data) {
        try {
            return prisma.almacenProducto.update({
                where: { id },
                data,
            });
        } catch (error) {
            if (error.code === 'P2025') throw new Error('Stock no encontrado para actualizar.');
            throw error;
        }
    }

    async delete(id) {
        try {
            return prisma.almacenProducto.delete({ where: { id } });
        } catch (error) {
            if (error.code === 'P2025') throw new Error('AlmacenProducto no encontrado para eliminar.');
            throw error;
        }
    }

    async deleteProductos(id) {
        try {
            return prisma.almacenProducto.deleteMany({ where: { id_producto: id } });
        } catch (error) {
            if (error.code === 'P2025') throw new Error('Producto no encontrado para eliminar.');
            throw error;
        }
    }
}

module.exports = new AlmacenProductoService();
