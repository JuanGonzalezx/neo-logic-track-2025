// src/lib/userServiceClient.js (o una ruta similar)
const axios = require('axios');

const USERS_API_BASE_URL = process.env.USERS_SERVICE_URL || 'http://localhost:3000/api/v1/users';

/**
 * Busca un usuario (gerente) por varios criterios.
 * El servicio de usuarios debería tener un endpoint flexible para esto.
 * @param {object} queryParams ej: { email: '...', nombre_completo: '...' }
 * @returns {Promise<object|null>}
 */
async function findUser(queryParams) {
    try {
        const response = await axios.get(USERS_API_BASE_URL, { params: queryParams });
        if (response.data && response.data.length > 0) {
            // Asumimos que el servicio de usuarios devuelve un array, incluso si solo hay un resultado
            return response.data[0]; // Devuelve el primer usuario encontrado
        }
        return null;
    } catch (error) {
        // Si el error es 404 (no encontrado), no es un error crítico para este flujo, simplemente no existe.
        if (error.response && error.response.status === 404) {
            return null;
        }
        console.error('Error finding user in user service:', error.response ? error.response.data : error.message);
        // Para otros errores, podríamos querer relanzar o manejar de forma diferente.
        // Por ahora, si falla la comunicación, asumimos que no se pudo validar/encontrar.
        return null;
    }
}

async function findUserByEmail(email) {
    if (!email) return null;
    try {
        const response = await axios.get(`${USERS_API_BASE_URL}/email/${email}`);
        console.log('findUserByEmail', response.data);
        console.log("AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA")
        return response.data; // Asumimos que este endpoint devuelve el objeto usuario directamente o null/404 si no existe
    } catch (error) {
        if (error.response && error.response.status === 404) {
            return null;
        }
        console.error('Error finding user by email in user service:', error.response ? error.response.data : error.message);
        return null;
    }
}
/**
 * Crea un nuevo usuario (gerente).
 * @param {object} userData ej: { nombre_completo, email, telefono, rolId (si es necesario), etc. }
 * @returns {Promise<object>}
 */
async function createUser(userData) {
    try {
        // Asume que el endpoint para crear usuarios es POST a la URL base
        const response = await axios.post(USERS_API_BASE_URL, userData);
        return response.data; // Devuelve el usuario creado
    } catch (error) {
        console.error('Error creating user in user service:', error.response ? error.response.data : error.message);
        throw new Error(`Failed to create gerente in user service: ${error.response?.data?.message || error.message}`);
    }
}

module.exports = { findUser, createUser, findUserByEmail };