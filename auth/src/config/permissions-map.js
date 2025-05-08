
const PERMISSIONS = {

    ROLES: {
      CREATE: { url: '/api/v1/roles', method: 'POST' },
      GET_ALL: { url: '/api/v1/roles', method: 'GET' },
      GET_BY_ID: { url: '/api/v1/roles/:id', method: 'GET' }, 
      UPDATE: { url: '/api/v1/roles/:id', method: 'PUT' },
      DELETE: { url: '/api/v1/roles/:id', method: 'DELETE' },
      ASSIGN_PERMISSIONS: { url: '/api/v1/roles/:id/permissions', method: 'POST' },
      REMOVE_PERMISSIONS: { url: '/api/v1/roles/:id/permissions', method: 'DELETE' },
    },
    
    PERMISSIONS_CRUD: {
      CREATE: { url: '/api/v1/permissions', method: 'POST' },
      GET_ALL: { url: '/api/v1/permissions', method: 'GET' },
      GET_BY_ID: { url: '/api/v1/permissions/:id', method: 'GET' },
      UPDATE: { url: '/api/v1/permissions/:id', method: 'PUT' },
      DELETE: { url: '/api/v1/permissions/:id', method: 'DELETE' },
    },
    
    USERS: {
      GET_ALL: { url: '/api/v1/users', method: 'GET' },
      GET_BY_ID: { url: '/api/v1/users/:id', method: 'GET' },
      UPDATE_USER: { url: '/api/v1/users/:id', method: 'PUT' }, 
      DELETE_USER: { url: '/api/v1/users/:id', method: 'DELETE' },
    },

};
  
module.exports = PERMISSIONS;