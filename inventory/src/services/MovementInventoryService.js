const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const ProductoService = require('./ProductoService');
const AlmacenService = require('./AlmacenService');

class MovementInventoryService {
    async create(data) {
        const { id_producto, id_almacen, tipo, cantidad, fecha } = data;

        if (!id_producto || !id_almacen || !tipo || !cantidad || !fecha) {
            throw new Error("Todos los campos son requeridos.");
        }

        const producto = await ProductoService.getById(id_producto);
        if (!producto) throw new Error(`El producto '${id_producto}' no existe`);

        const almacen = await AlmacenService.getById(id_almacen);
        if (!almacen) throw new Error(`El almacén '${id_almacen}' no existe`);

        return prisma.movement_Inventory.create({
            data: {
                id: `${id_producto}-${id_almacen}-${fecha}`,
                id_producto,
                id_almacen,
                tipo,
                cantidad,
                fecha: new Date(fecha)
            }
        });
    }

    async getAll() {
        return prisma.movement_Inventory.findMany();
    }

    async getById(id) {
        const found = await prisma.movement_Inventory.findFirst({ where: { id } });
        if (!found) throw new Error("Movimiento no encontrado.");
        return found;
    }

    async getByAlmacen(id_almacen) {
        const almacen = await prisma.almacen.findFirst({ where: { id_almacen } });
        if (!almacen) throw new Error('Este almacén no existe');

        const movimientos = await prisma.movement_Inventory.findMany({ where: { id_almacen } });
        if (movimientos.length <= 0) throw new Error('Este almacén no tiene movimientos');

        return movimientos;
    }

    async delete(id) {
        const found = await this.getById(id); // valida existencia
        try {
            return prisma.movement_Inventory.delete({ where: { id } });
        } catch (error) {
            if (error.code === 'P2025') throw new Error('Movimiento no encontrado para eliminar.');
            throw error;
        }
    }
}

module.exports = new MovementInventoryService();
