// src/services/ProveedorService.js
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

class ProveedorService {

    async findOrCreateProveedor({ id }) {
        if (!id) {
            throw new Error("Id es requerido para crear una proveedor.");
        }
        let proveedor = await prisma.proveedor.findUnique({
            where: { id },
        });

        if (!proveedor) {
            proveedor = await prisma.proveedor.create({
                data: { id },
            });
            return proveedor;
        }
        else {
            throw new Error(`El proveedor '${id}' ya está en uso.`);
        }

    }


    async getAll() {
        return prisma.proveedor.findMany();
    }

    async getById(id) {
        const proveedor = await prisma.proveedor.findUnique({
            where: { id }
        });
        if (!proveedor) throw new Error('proveedor no encontrado');
        return proveedor;
    }

    async update(id, data) {
        // Prevenir cambiar el nombre a uno que ya existe
        if (data.id) {
            throw new Error(`No es posible cambiar el id`);
        }
        if (data.nombre) {
            const existing = await prisma.proveedor.findFirst({
                where: { nombre: data.nombre, NOT: { id } },
            });
            if (existing) throw new Error(`El nombre de proveedor '${data.nombre}' ya está en uso.`);
        }
        try {
            return prisma.proveedor.update({
                where: { id },
                data,
            });
        } catch (error) {
            if (error.code === 'P2025') throw new Error('proveedor no encontrado para actualizar.');
            throw error;
        }
    }

    async delete(id) {
        const proveedor = await this.getById(id); // Valida existencia y obtiene info
        if (proveedor.ProveedorProducto && proveedor.ProveedorProducto.length > 0) {
            throw new Error('No se puede eliminar el proveedor, tiene productos asociados asociadas.');
        }

        try {
            return prisma.proveedor.delete({ where: { id } });
        } catch (error) {
            if (error.code === 'P2025') throw new Error('proveedor no encontrado para eliminar.');
            throw error;
        }
    }
}

module.exports = new ProveedorService();