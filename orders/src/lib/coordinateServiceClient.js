const axios = require('axios');

const COORDINATE_API_BASE_URL = process.env.COORDINATE_SERVICE_URL;

async function createCoordinate(data) {
  try {
    console.log('Creating coordinate with data:', data);
    
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

async function createCoordinateForOrder(data) {
  try {
    console.log('Creating coordinate for order with data:', data);
    
    const response = await axios.post(`${COORDINATE_API_BASE_URL}/order`, data);
    return response.data;
  } catch (error) {
    if (error.response && error.response.status === 404) {
      return null;
    }
    console.error('Error creating coordinate for order:', error.response ? error.response.data : error.message);
    return null;
  }
}

async function findCoordinateById(id) {
  try {
    console.log('Finding coordinate by ID:', id);
    const response = await axios.get(`${COORDINATE_API_BASE_URL}/${id}`);
    console.log('Coordinate found:', response.data);
    return response.data;
  } catch (error) {
    if (error.response && error.response.status === 404) {
      return null;
    }
    console.error('Error finding coordinate by ID:', error.response ? error.response.data : error.message);
    return null;
  }
}

async function getLastCoordinateByUserId(userId) {
  try {
    const response = await axios.get(`${COORDINATE_API_BASE_URL}User/user/${userId}`);

    return response.data;
  } catch (error) {
    if (error.response && error.response.status === 404) {
      return null;
    }
    console.error('Error getting last coordinate by user ID:', error.response ? error.response.data : error.message);
    return null;
  }
}

module.exports = { createCoordinate, createCoordinateForOrder, findCoordinateById, getLastCoordinateByUserId };
