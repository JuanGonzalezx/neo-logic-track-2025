// src/services/DepartamentoService.js
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

class DepartamentoService {
    async findOrCreateDepartamento({ nombre }) {
        if (!nombre) {
            throw new Error("Nombre y país son requeridos para el departamento.");
        }
        let departamento = await prisma.departamento.findFirst({
            where: { nombre },
        });

        if (!departamento) {
            departamento = await prisma.departamento.create({
                data: { nombre, pais },
            });
        }
        return departamento;
    }

    async findDepartamentoByNombre({ nombre }) {
        if (!nombre) {
            throw new Error("Nombre es requerido para buscar el departamento.");
        }
        const departamento = await prisma.departamento.findFirst({
            where: { nombre }, // Asumiendo que 'nombre' es único según tu migration
        });
        return departamento; // Devuelve el departamento o null si no se encuentra
    }

    async getAll() {
        return prisma.departamento.findMany({ include: { ciudades: true } });
    }

    async getById(id) {
        const departamento = await prisma.departamento.findFirst({
            where: { id },
            include: { ciudades: true },
        });
        if (!departamento) throw new Error('Departamento no encontrado');
        return departamento;
    }

    async update(id, data) {
        // Prevenir cambiar el nombre a uno que ya existe
        if (data.nombre) {
            const existing = await prisma.departamento.findFirst({
                where: { nombre: data.nombre, NOT: { id } },
            });
            if (existing) throw new Error(`El nombre de departamento '${data.nombre}' ya está en uso.`);
        }
        try {
            return prisma.departamento.update({
                where: { id },
                data,
            });
        } catch (error) {
            if (error.code === 'P2025') throw new Error('Departamento no encontrado para actualizar.');
            throw error;
        }
    }

    async delete(id) {
        const departamento = await this.getById(id); // Valida existencia y obtiene info
        if (departamento.ciudades && departamento.ciudades.length > 0) {
            throw new Error('No se puede eliminar el departamento, tiene ciudades asociadas.');
        }
        try {
            return prisma.departamento.delete({ where: { id } });
        } catch (error) {
            if (error.code === 'P2025') throw new Error('Departamento no encontrado para eliminar.');
            throw error;
        }
    }
}

module.exports = new DepartamentoService();