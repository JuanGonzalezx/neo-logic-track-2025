const axios = require('axios');

const PRODUCTS_API_BASE_URL = process.env.PRODUCTS_SERVICE_URL || 'http://localhost:3001/api/v1/products';

async function findProductById(id) {
  try {
    const response = await axios.get(`${PRODUCTS_API_BASE_URL}/${id}`);
    return response.data;
  } catch (error) {
    if (error.response && error.response.status === 404) {
      return null;
    }
    console.error('Error finding product:', error.response ? error.response.data : error.message);
    return null;
  }
}

module.exports = { findProductById };
