const axios = require('axios');

const USERS_API_BASE_URL = process.env.USERS_SERVICE_URL || 'http://localhost:3000/api/v1/users';
const AUTH_API_BASE_URL = process.env.AUTH_SERVICE_URL || 'http://localhost:3000/api/v1/auth';

async function findUser(queryParams) {
  try {
    // Espera un objeto { id: '...' }, pero solo usa el id string
    const id = typeof queryParams === 'object' && queryParams.id ? queryParams.id : queryParams;
    const data = await axios.get(`${USERS_API_BASE_URL}/${id}`);

    if (!data) {
      throw new Error("no se encontro al usuario");
    }
    return data;

  } catch (error) {
    if (error.response && error.response.status === 404) {
      return null;
    }
    console.error('Error finding user:', error.response ? error.response.data : error.message);
    return null;
  }
}

async function sendEmailOrder(email, fullname, order) {
  try {
    const data = {
      email,
      fullname,
      order
    };
    const response = await axios.post(`${AUTH_API_BASE_URL}/order`, data);
    return response.data;
  } catch (error) {
    console.error('Error sending email:', error.response ? error.response.data : error.message);
    throw error;
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

    if (!response.data.data) {
      const repartidor = await axios.post(`${USERS_API_BASE_URL}/repartidor/${city}`);
      return repartidor.data
    }
    return response.data.data;
  } catch (error) {
    if (error.response && error.response.status === 404) {
      return null;
    }
    console.error('Error finding repartidor by city in user service:', error.response ? error.response.data : error.message);
    return null;
  }
}

module.exports = { findUser, findDespachadorByCity, findRepartidorByCity ,sendEmailOrder, findDespachadorByCity, findRepartidorByCity };
