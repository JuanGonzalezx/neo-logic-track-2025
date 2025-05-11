// src/config/permissions-map.js
const PERMISSIONS = {
    // ... (tus permisos existentes)
    DEPARTAMENTOS: {
        CREATE: { url: '/api/v1/departamentos', method: 'POST' },
        GET_ALL: { url: '/api/v1/departamentos', method: 'GET' },
        GET_BY_ID: { url: '/api/v1/departamentos/:id', method: 'GET' },
        UPDATE: { url: '/api/v1/departamentos/:id', method: 'PUT' },
        DELETE: { url: '/api/v1/departamentos/:id', method: 'DELETE' },
    },
    CIUDADES: {
        CREATE: { url: '/api/v1/ciudades', method: 'POST' },
        GET_ALL: { url: '/api/v1/ciudades', method: 'GET' },
        GET_BY_ID: { url: '/api/v1/ciudades/:id', method: 'GET' },
        UPDATE: { url: '/api/v1/ciudades/:id', method: 'PUT' },
        DELETE: { url: '/api/v1/ciudades/:id', method: 'DELETE' },
    },
    ALMACENES: {
        CREATE: { url: '/api/v1/almacenes', method: 'POST' },
        GET_ALL: { url: '/api/v1/almacenes', method: 'GET' },
        GET_BY_ID: { url: '/api/v1/almacenes/:id_almacen', method: 'GET' }, // Corregido :id a :id_almacen
        UPDATE: { url: '/api/v1/almacenes/:id_almacen', method: 'PUT' },   // Corregido :id a :id_almacen
        DELETE: { url: '/api/v1/almacenes/:id_almacen', method: 'DELETE' }, // Corregido :id a :id_almacen
    },
    // ... (USERS, ROLES, etc.)
     USERS: {
       GET_ALL: { url: '/api/v1/users', method: 'GET' }, // Usado para buscar gerentes
       CREATE: { url: '/api/v1/users', method: 'POST' },  // Usado para crear gerentes
     // ... otros permisos de USERS
     },
};

module.exports = PERMISSIONS;