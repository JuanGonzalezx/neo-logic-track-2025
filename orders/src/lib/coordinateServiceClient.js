const axios = require('axios');

const COORDINATE_API_BASE_URL = process.env.COORDINATE_SERVICE_URL || 'http://localhost:3003/api/v1/coordinates';

async function createCoordinate(id) {
  try {
    const response = await axios.post(`${COORDINATE_API_BASE_URL}`, data);
    return response.data;
  } catch (error) {
    if (error.response && error.response.status === 404) {
      return null;
    }
    console.error('Error finding product:', error.response ? error.response.data : error.message);
    return null;
  }
}

async function findCoordinateById(id) {
  try {
    const response = await axios.get(`${COORDINATE_API_BASE_URL}/${id}`);
    return response.data;
  } catch (error) {
    if (error.response && error.response.status === 404) {
      return null;
    }
    console.error('Error finding coordinate by ID:', error.response ? error.response.data : error.message);
    return null;
  }
}

module.exports = { createCoordinate, findCoordinateById };
