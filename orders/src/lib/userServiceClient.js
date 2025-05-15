const axios = require('axios');

const USERS_API_BASE_URL = process.env.USERS_SERVICE_URL || 'http://localhost:3000/api/v1/users';

async function findUser(queryParams) {
  try {
    const response = await axios.get(USERS_API_BASE_URL, { params: queryParams });
    if (response.data && response.data.length > 0) {
      return response.data[0];
    }
    return null;
  } catch (error) {
    if (error.response && error.response.status === 404) {
      return null;
    }
    console.error('Error finding user:', error.response ? error.response.data : error.message);
    return null;
  }
}

module.exports = { findUser };
