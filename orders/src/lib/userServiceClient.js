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

module.exports = { findUser };
