const axios = require('axios');

const USERS_API_BASE_URL = process.env.USERS_SERVICE_URL || 'http://localhost:3000/api/v1/users';

async function findUser(queryParams) {
  try {
    const data = await axios.get(`${USERS_API_BASE_URL}/${queryParams}`);

    if (!data) {
      throw new Error("no se encontro al usuario");
    }
    return data

  } catch (error) {
    if (error.response && error.response.status === 404) {
      return null;
    }
    console.error('Error finding user:', error.response ? error.response.data : error.message);
    return null;
  }
}

async function findDespachadorByCity(city) {
    if (!city) return null;
    try {
        const response = await axios.get(`${USERS_API_BASE_URL}/despachadores/${city}`);
        return response.data;
    } catch (error) {
        if (error.response && error.response.status === 404) {
            return null;
        }
        console.error('Error finding despachador by city in user service:', error.response ? error.response.data : error.message);
        return null;
    }
}

async function findRepartidorByCity(city) {
    if (!city) return null;
    try {
      
        const response = await axios.get(`${USERS_API_BASE_URL}/repartidores/${city}`);
        return response.data;
    } catch (error) {
        if (error.response && error.response.status === 404) {
            return null;
        }
        console.error('Error finding repartidor by city in user service:', error.response ? error.response.data : error.message);
        return null;
    }
}

module.exports = { findUser, findDespachadorByCity, findRepartidorByCity };
