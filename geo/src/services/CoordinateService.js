// src/services/coordinateService.js
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const CityServiceClient = require('../lib/CityServiceClient');

class CoordinateService {

    async findOrCreate(data) {
console.log(data);

        if (!data.latitude || !data.longitude || !data.cityId || !data.street) {
            throw new Error("Los campos latitude, longitude, cityId y userId son requeridos.");
        }

        let coordinate = await prisma.coordinates.findFirst({
            where: { latitude: data.latitude, longitude: data.longitude }
        });

        if (coordinate) {
           return coordinate;
        }

        const city = await CityServiceClient.findCity(data.cityId);
        if (!city) {
            throw new Error("No existe una ciudad con ese id.");
        }

        coordinate = await prisma.coordinates.create({
            data: {
                latitude: data.latitude,
                longitude: data.longitude,
                cityId: data.cityId,
                street: data.street,
                postal_code: data.postal_code
            }
        });
        return coordinate;
    }


    async getAll() {
        return prisma.coordinates.findMany();
    }

    async getById(id) {
        const coordinate = await prisma.coordinates.findUnique({
            where: { id }
        });
        if (!coordinate) throw new Error('coordinate no encontrado');
        return coordinate;
    }

    async update(id, data) {

        try {
            const coo = await prisma.coordinates.findUnique({
                where: { id }
            });
            if (!coo) throw new Error('coordinate no encontrado');

            if (data.latitude && data.longitude) {
                let coordinate = await prisma.coordinates.findFirst({
                    where: { latitude: data.latitude, longitude: data.longitude }
                });

                if (coordinate) {
                    throw new Error("Ya existe una coordinate con esas coordenadas.");
                }
            }


            const city = await CityServiceClient.findCity(data.cityId);
            if (!city) {
                throw new Error("No existe una ciudad con ese id.");
            }

            return prisma.coordinates.update({
                where: { id },
                data,
            });
        } catch (error) {
            if (error.code === 'P2025') throw new Error('coordinate no encontrado para actualizar.');
            throw error;
        }
    }

    async delete(id) {
        try {
            const coordinateUser = await prisma.coordinates_User.deleteMany({
                where: { coordinate_id: id }
            });

            await prisma.coordinates.delete({ where: { id } });

            return
        } catch (error) {
            if (error.code === 'P2025') throw new Error('coordinate no encontrada para eliminar.');
            throw error;
        }
    }

}

module.exports = new CoordinateService();