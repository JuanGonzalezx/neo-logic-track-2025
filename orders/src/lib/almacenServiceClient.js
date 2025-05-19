const axios = require('axios');

const ALMACEN_API_BASE_URL = process.env.ALMACEN_API_BASE_URL || 'http://localhost:3001/api/v1/almacenes';

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


module.exports = { findCityByAlmacen };
