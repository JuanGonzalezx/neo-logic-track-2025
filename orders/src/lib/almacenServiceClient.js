const axios = require('axios');

const ALMACEN_API_BASE_URL = process.env.ALMACEN_API_BASE_URL;

async function findCityByAlmacen(almacen_id) {
    try {
        const almacen = await axios.get(`${ALMACEN_API_BASE_URL}/${almacen_id}`);
        if (!almacen) {
            throw new Error("no se encontro al almacen");
        }
        return almacen.data.direccion.ciudadId

    } catch (error) {
        if (error.response && error.response.status === 404) {
            return null;
        }
        console.error('Error finding city:', error.response ? error.response.data : error.message);
        return null;
    }
}

async function findAlmacenById(almacen_id) {
    try {
        const response = await axios.get(`${ALMACEN_API_BASE_URL}/${almacen_id}`);
        if (response.status === 200) {
            return response.data; // Devuelve el almacen encontrado
        } else {
            throw new Error('Error al encontrar almacen: ' + (response.data.message || 'Desconocido'));
        }
    } catch (error) {
        console.error('Error finding almacen by ID:', error.response ? error.response.data : error.message);
        throw new Error(`Fallo al encontrar almacen: ${error.response ? error.response.data.message : 'Error desconocido'}`);
    }
}


module.exports = { findCityByAlmacen, findAlmacenById };
