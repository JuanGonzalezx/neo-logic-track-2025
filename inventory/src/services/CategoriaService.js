// src/services/CategoriaService.js
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

class CategoriaService {

    async findOrCreateCategoria({ nombre }) {

        if (!nombre) {
            throw new Error("El nombre es requerido para crear una categoria.");
        }
        let categoria = await prisma.categoria.findFirst({
            where: { nombre },
        });

        if (!categoria) {
            categoria = await prisma.categoria.create({
                data: { nombre },
            });
            return categoria;
        }
        else {
            return categoria;
        }

    }


    async getAll() {
        return prisma.categoria.findMany();
    }

    async getById(id) {
        const categoria = await prisma.categoria.findUnique({
            where: { id },
            include: { Producto: true }
        });
        if (!categoria) throw new Error('categoria no encontrado');
        return categoria;
    }

    async getByName(name) {
        const categoria = await prisma.categoria.findFirst({
            where: { name }
        });
        return categoria;
    }


    async update(id, data) {
        // Prevenir cambiar el nombre a uno que ya existe
        if (data.name) {
            const existing = await prisma.categoria.findFirst({
                where: { name: data.name },
            });
            if (existing) throw new Error(`El nombre de categoria '${data.name}' ya está en uso.`);
        }
        try {
            return prisma.categoria.update({
                where: { id },
                data,
            });
        } catch (error) {
            if (error.code === 'P2025') throw new Error('categoria no encontrado para actualizar.');
            throw error;
        }
    }

    async delete(id) {
        const categoria = await this.getById(id);
        if (categoria.Producto && categoria.Producto.length > 0) {
            throw new Error('No se puede eliminar la categoria, tiene productos asociados.');
        }

        try {
            return prisma.categoria.delete({ where: { id } });
        } catch (error) {
            if (error.code === 'P2025') throw new Error('categoria no encontrada para eliminar.');
            throw error;
        }
    }

}

module.exports = new CategoriaService();