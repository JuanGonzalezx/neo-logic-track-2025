// src/services/CoordinatesUserService.js
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const UserService = require('../lib/UserServiceClient');
const CoordinateService = require('./CoordinateService');

class CoordinateUserService {
    async create(data) {

        if (!data.user_id || !data.coordinate_id) {
            throw new Error("Los campos user_id y coordinate_id son requeridos.");
        }

        const user = await UserService.findUser(data.user_id);
        if (!user) {
            throw new Error("No existe un usuario con ese id.");
        }

        const coordinate = await CoordinateService.getById(data.coordinate_id);
        if (!coordinate) {
            throw new Error("No existe una coordenada con ese id.");
        }

        const existingRelation = await prisma.coordinates_User.findFirst({
            where: {
                user_id: data.user_id,
                coordinate_id: data.coordinate_id
            }
        });

        if (existingRelation) {
            throw new Error("Ya existe esta relación usuario-coordenada.");
        }

        const coordinatesUser = await prisma.coordinates_User.create({
            data: {
                user_id: data.user_id,
                coordinate_id: data.coordinate_id
            }
        });
        return coordinatesUser;
    }

    async getAll() {
        return prisma.coordinates_User.findMany();
    }

    async getById(id) {
        const coordinatesUser = await prisma.coordinates_User.findUnique({
            where: { id }
        });
        if (!coordinatesUser) throw new Error('Relación usuario-coordenada no encontrada');
        return coordinatesUser;
    }

    async getByUserId(user_id) {
        const relations = await prisma.coordinates_User.findMany({
            where: { user_id },
            include: {
                coordinate: true
            }
        });
        if (!relations || relations.length === 0) {
            throw new Error('No se encontraron coordenadas para este usuario');
        }
        return relations;
    }

    async getByCoordinateId(coordinate_id) {
        const relations = await prisma.coordinates_User.findMany({
            where: { coordinate_id },
            include: {
                user: true
            }
        });
        if (!relations || relations.length === 0) {
            throw new Error('No se encontraron usuarios para esta coordenada');
        }
        return relations;
    }

    async delete(id) {
        try {
            return prisma.coordinates_User.delete({
                where: { id }
            });
        } catch (error) {
            if (error.code === 'P2025') throw new Error('Relación no encontrada para eliminar.');
            throw error;
        }
    }

    async deleteByUserAndCoordinate(user_id, coordinate_id) {
        try {
            const relation = await prisma.coordinates_User.findFirst({
                where: {
                    user_id,
                    coordinate_id
                }
            });

            if (!relation) {
                throw new Error('Relación usuario-coordenada no encontrada');
            }

            return prisma.coordinates_User.delete({
                where: { id: relation.id }
            });
        } catch (error) {
            if (error.code === 'P2025') throw new Error('Relación no encontrada para eliminar.');
            throw error;
        }
    }
}

module.exports = new CoordinateUserService();