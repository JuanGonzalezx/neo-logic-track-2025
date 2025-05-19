// src/lib/cityServiceClient.js
const axios = require('axios');

const CITIES_API_BASE_URL = process.env.CITIES_SERVICE_URL || 'http://localhost:3001/api/v1/cities';

/**
 * Busca una ciudad por su ID en el microservicio de inventory.
 * @param {string} ciudadId
 * @returns {Promise<object|null>}
 */
async function findCityById(ciudadId) {
    console.log('ciudadId:', ciudadId);
    if (!ciudadId) return null;
    try {
        const response = await axios.get(`${CITIES_API_BASE_URL}/${ciudadId}`);
        return response.data;
    } catch (error) {
        if (error.response && error.response.status === 404) {
            return null;
        }
        console.error('Error finding city by id:', error.response ? error.response.data : error.message);
        return null;
    }
}

module.exports = { findCityById };
