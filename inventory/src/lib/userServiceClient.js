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
        // Asegurarse de que la URL base esté configurada correctamente
        const response = await axios.post(USERS_API_BASE_URL, userData);

        // Verificar que la respuesta sea exitosa
        if (response.status === 201) {
            console.log('Usuario creado con éxito:', response.data);
            return response.data; // Devuelve el usuario creado
        } else {
            throw new Error('Error al crear usuario: ' + (response.data.message || 'Desconocido'));
        }
    } catch (error) {
        // Mejor manejo de errores para ver la causa exacta
        console.error('Error creando gerente en el servicio de usuarios:', error.response ? error.response.data : error.message);

        // Manejo de errores personalizados
        if (error.response && error.response.data) {
            throw new Error(`Fallo al crear gerente: ${error.response.data.message}`);
        } else {
            throw new Error('Error desconocido al crear gerente');
        }
    }
}

module.exports = { findUser, createUser, findUserByEmail };