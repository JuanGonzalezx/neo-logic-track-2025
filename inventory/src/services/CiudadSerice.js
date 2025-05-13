// src/services/CiudadService.js
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const DepartamentoService = require('./DepartamentoSerice');

class CiudadService {
    async findOrCreateCiudad({ nombre, codigo_postal, nombre_departamento, pais_departamento, departamentoId }) {
        if (!nombre || !codigo_postal) {
            throw new Error("Nombre y código postal son requeridos para la ciudad.");
        }

        let depId = departamentoId;
        if (!depId) {
            if (!nombre_departamento) {
                throw new Error("Se requiere nombre_departamento y pais_departamento si no se provee departamentoId.");
            }
            const departamento = await DepartamentoService.findOrCreateDepartamento({
                nombre: nombre_departamento,
                pais: pais_departamento,
            });
            depId = departamento.id;
        } else {
            // Validar que el departamentoId proporcionado existe
            const deptoExists = await prisma.departamento.findUnique({ where: { id: depId } });
            if (!deptoExists) throw new Error(`Departamento con ID '${depId}' no encontrado.`);
        }

        let ciudad = await prisma.ciudad.findUnique({
            where: { nombre_departamentoId: { nombre, departamentoId: depId } },
        });

        if (!ciudad) {
            ciudad = await prisma.ciudad.create({
                data: {
                    nombre,
                    codigo_postal,
                    departamentoId: depId,
                },
            });
        }
        return ciudad;
    }


    // Nuevo método para buscar únicamente por nombre y departamentoId
    async findCiudadByNombreAndDepartamentoId({ nombre, departamentoId }) {
        if (!nombre || !departamentoId) {
            throw new Error("Nombre de ciudad y ID de departamento son requeridos para buscar la ciudad.");
        }
        const ciudad = await prisma.ciudad.findUnique({
            where: {
                nombre_departamentoId: { // Usando el índice unique @@unique([nombre, departamentoId])
                    nombre,
                    departamentoId,
                }
            },
        });
        return ciudad; // Devuelve la ciudad o null si no se encuentra
    }
    
    async getAll() {
        return prisma.ciudad.findMany({ include: { departamento: true } });
    }

    async getById(id) {
        const ciudad = await prisma.ciudad.findUnique({
            where: { id },
            include: { departamento: true },
        });
        if (!ciudad) throw new Error('Ciudad no encontrada');
        return ciudad;
    }

    async update(id, data) {
        const { nombre, codigo_postal, departamentoId } = data;
        const ciudadActual = await prisma.ciudad.findUnique({ where: {id}});
        if (!ciudadActual) throw new Error('Ciudad no encontrada para actualizar.');

        let depIdToCheck = departamentoId || ciudadActual.departamentoId;
        let nombreToCheck = nombre || ciudadActual.nombre;

        if (departamentoId) {
             const deptoExists = await prisma.departamento.findUnique({ where: { id: departamentoId } });
             if (!deptoExists) throw new Error(`Departamento con ID '${departamentoId}' no encontrado.`);
        }

        if (nombre || departamentoId) { // Solo chequear si se intenta cambiar nombre o departamento
            const existing = await prisma.ciudad.findFirst({
                where: {
                    nombre: nombreToCheck,
                    departamentoId: depIdToCheck,
                    NOT: { id },
                },
            });
            if (existing) throw new Error(`La ciudad '${nombreToCheck}' ya existe en el departamento especificado.`);
        }
        try {
            return prisma.ciudad.update({
                where: { id },
                data: { nombre, codigo_postal, departamentoId },
            });
        } catch (error) {
            if (error.code === 'P2025') throw new Error('Ciudad no encontrada para actualizar.');
            throw error;
        }
    }

    async delete(id) {
        const ciudad = await this.getById(id); // Valida existencia
        const direccionesAsociadas = await prisma.direccion.count({ where: { ciudadId: id } });
        if (direccionesAsociadas > 0) {
            throw new Error('No se puede eliminar la ciudad, tiene direcciones asociadas.');
        }
        try {
            return prisma.ciudad.delete({ where: { id } });
        } catch (error) {
            if (error.code === 'P2025') throw new Error('Ciudad no encontrada para eliminar.');
            throw error;
        }
    }
}

module.exports = new CiudadService();