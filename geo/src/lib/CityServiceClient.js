// src/lib/userServiceClient.js (o una ruta similar)
const axios = require('axios');

const CITY_API_BASE_URL = process.env.CITY_SERVICE_URL || 'http://localhost:3001/api/v1/ciudades';

/**
 * Busca un usuario (gerente) por varios criterios.
 * El servicio de usuarios debería tener un endpoint flexible para esto.
 * @param {object} queryParams ej: { email: '...', nombre_completo: '...' }
 * @returns {Promise<object|null>}
 */
async function findCity(queryParams) {
    try {
        const response = await axios.get(`${CITY_API_BASE_URL}/${queryParams}`);
        return response;
    } catch (error) {
        console.error('Error finding city in city service:', error.response ? error.response.data : error.message);
        return null;
    }
}

module.exports = {
    findCity
};