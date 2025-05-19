const axios = require('axios');

const PRODUCTS_API_BASE_URL = process.env.PRODUCTS_SERVICE_URL || 'http://localhost:3001/api/v1/productos';
const ALMACENPRODUCTS_API_BASE_URL = process.env.ALMACENPRODUCTS_SERVICE_URL || 'http://localhost:3001/api/v1/almacenproductos';
const MOVEMENTS_API_BASE_URL = process.env.MOVEMENTS_SERVICE_URL || 'http://localhost:3001/api/v1/movements';
const AUTH_API_BASE_URL = process.env.AUTH_SERVICE_URL || 'http://localhost:3000/api/v1/auth';




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

async function reduceStock(product_id, almacen_id, amount) {
  try {
    let responseAlmacen = await axios.get(`${ALMACENPRODUCTS_API_BASE_URL}/producto/${product_id}/almacen/${almacen_id}`);

    if (amount > responseAlmacen.data.cantidad_stock) {
      throw new Error("La cantidad del producto es mayor al disponible en el stock");
    }

    let stockActual = responseAlmacen.data.cantidad_stock - amount
    if (stockActual < responseAlmacen.data.nivel_reorden) {

      let data = {
        fullname: "Oye ",
        producto: product_id,
        email: "juan.cardona36713@ucaldas.edu.co"
      }

      let responseAlmacen = await axios.post(`${AUTH_API_BASE_URL}/stock`, data);
    }

    responseAlmacen.data.cantidad_stock = stockActual
    const response = await axios.put(`${ALMACENPRODUCTS_API_BASE_URL}/${responseAlmacen.data.id}`, responseAlmacen.data);

    return responseAlmacen.data;
  } catch (error) {
    throw new Error(error);
  }
}

async function createMovements(id_producto, id_almacen, amount) {
  try {
    let fecha = new Date();
    let data = {
      id_producto: id_producto,
      id_almacen: id_almacen,
      tipo: false,
      cantidad: amount,
      fecha
    }

    const response = await axios.post(`${MOVEMENTS_API_BASE_URL}`, data);
    return response.data;
  } catch (error) {
    console.error('Error create movements', error.response ? error.response.data : error.message);
    throw new Error(error);
  }
}


module.exports = { findProductById, reduceStock, createMovements };
