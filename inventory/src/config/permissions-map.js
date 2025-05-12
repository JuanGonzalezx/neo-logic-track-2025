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
    PROVEEDORES: {
        CREATE: { url: '/api/v1/proveedores', method: 'POST' },
        GET_ALL: { url: '/api/v1/proveedores', method: 'GET' },
        GET_BY_ID: { url: '/api/v1/proveedores/:id_proveedor', method: 'GET' },
        UPDATE: { url: '/api/v1/proveedores/:id_proveedor', method: 'PUT' },
        DELETE: { url: '/api/v1/proveedores/:id_proveedor', method: 'DELETE' },
    },
    CATEGORIAS: {
        CREATE: { url: '/api/v1/categorias', method: 'POST' },
        GET_ALL: { url: '/api/v1/categorias', method: 'GET' },
        // GET_BY_ID: { url: '/api/v1/categorias/:id_categoria', method: 'GET' },
        GET_BY_NAME: { url: '/api/v1/categorias/:name_categoria', method: 'GET' },
        UPDATE: { url: '/api/v1/categorias/:id_categoria', method: 'PUT' },
        DELETE: { url: '/api/v1/categorias/:id_categoria', method: 'DELETE' },
    },
    PRODUCTOS: {
        CREATE: { url: '/api/v1/productos', method: 'POST' },
        GET_ALL: { url: '/api/v1/productos', method: 'GET' },
        GET_BY_ID: { url: '/api/v1/productos/:id_producto', method: 'GET' },
        UPDATE: { url: '/api/v1/productos/:id_producto', method: 'PUT' },
        DELETE: { url: '/api/v1/productos/:id_producto', method: 'DELETE' },
    },
     PROVEEDOR_PRODUCTOS: {
        CREATE: { url: '/api/v1/proveedorproductos', method: 'POST' },
        GET_ALL: { url: '/api/v1/proveedorproductos', method: 'GET' },
        GET_BY_ID: { url: '/api/v1/proveedorproductos/:id_proveedorproductos', method: 'GET' },
        GET_BY_PRODUCTO: { url: '/api/v1/proveedorproductos/producto/:id_producto', method: 'GET' },
        GET_BY_PROVEEDOR: { url: '/api/v1/proveedorproductos/proveedor/:id_proveedor', method: 'GET' },
        UPDATE: { url: '/api/v1/proveedorproductos/:id_proveedorproductos', method: 'PUT' },
        DELETE: { url: '/api/v1/proveedorproductos/:id_proveedorproductos', method: 'DELETE' },
    },
    ALMACEN_PRODUCTO: {
        CREATE: { url: '/api/v1/almacenproductos', method: 'POST' },
        GET_ALL: { url: '/api/v1/almacenproductos', method: 'GET' },
        GET_BY_ID: { url: '/api/v1/almacenproductos/:id_almacenproductos', method: 'GET' },
        GET_BY_PRODUCTO: { url: '/api/v1/almacenproductos/producto/:id_almacenproductos', method: 'GET' },
        GET_BY_PROVEEDOR: { url: '/api/v1/almacenproductos/proveedor/:id_almacenproductos', method: 'GET' },
        UPDATE: { url: '/api/v1/almacenproductos/:id_almacenproductos', method: 'PUT' },
        DELETE: { url: '/api/v1/almacenproductos/:id_almacenproductos', method: 'DELETE' },
    },
     MOVEMENT_INVENTORY: {
        CREATE: { url: '/api/v1/movement', method: 'POST' },
        GET_ALL: { url: '/api/v1/movement', method: 'GET' },
        GET_BY_ID: { url: '/api/v1/movement/:id_movement', method: 'GET' },
        GET_BY_PRODUCTO: { url: '/api/v1/movement/almacen/:id_almacen', method: 'GET' },
        DELETE: { url: '/api/v1/movement/:id_movement', method: 'DELETE' },
    },
};

module.exports = PERMISSIONS;