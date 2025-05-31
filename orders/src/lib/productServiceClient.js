const axios = require('axios');

const PRODUCTS_API_BASE_URL = process.env.PRODUCTS_SERVICE_URL || 'http://localhost:3001/api/v1/productos';
const ALMACENPRODUCTS_API_BASE_URL = process.env.ALMACENPRODUCTS_SERVICE_URL || 'http://localhost:3001/api/v1/almacenproductos';
const MOVEMENTS_API_BASE_URL = process.env.MOVEMENTS_SERVICE_URL || 'http://localhost:3001/api/v1/movements';
const AUTH_API_BASE_URL = process.env.AUTH_SERVICE_URL || 'http://localhost:3000/api/v1';
const ALMACENES_API_BASE_URL = process.env.ALMACENES_SERVICE_URL || 'http://localhost:3001/api/v1/almacenes';





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

function calcularVolumen(dimensiones) {
  const parts = dimensiones.split('x').map(Number);
  const [largo, ancho, alto] = parts;
  return ((largo * ancho * alto) / 10000);
}

async function returnStockAndCapacity(id_almacen, id_producto, amount) {

  let almacenProducto = (await axios.get(`${ALMACENPRODUCTS_API_BASE_URL}/producto/${id_producto}/almacen/${id_almacen}`)).data
  let almacen = (await axios.get(`${ALMACENES_API_BASE_URL}/${id_almacen}`)).data ///si daaaaaaaaaaaa
  let producto = (await axios.get(`${PRODUCTS_API_BASE_URL}/${id_producto}`)).data ///si daaaaaaaaaaaa

  const stockNuevo = almacenProducto.cantidad_stock + amount
  const capacidadNueva = almacen.capacidad_usada_m3 + calcularVolumen(producto.dimensiones_cm) * amount

  const updateStock = {
    cantidad_stock: stockNuevo
  }
  let updateAlmPro = (await axios.put(`${ALMACENPRODUCTS_API_BASE_URL}/${almacenProducto.id}`, updateStock)).data
  let updateAlm = (await axios.put(`${ALMACENES_API_BASE_URL}/${almacen.id_almacen}/capacidad/${capacidadNueva}`)).data
}

async function reduceStock(product_id, almacen_id, amount) {
  try {

    let responseAlmacen = (await axios.get(`${ALMACENPRODUCTS_API_BASE_URL}/producto/${product_id}/almacen/${almacen_id}`)).data

    if (amount > responseAlmacen.cantidad_stock) {
      throw new Error("La cantidad del producto es mayor al disponible en el stock");
    }

    let stockActual = responseAlmacen.cantidad_stock - amount
    if (stockActual < responseAlmacen.nivel_reorden) {

      const almacen = await (await axios.get(`${ALMACENES_API_BASE_URL}/${almacen_id}`)).data
      const despachador = await (await axios.get(`${AUTH_API_BASE_URL}/users/${almacen.despachadorId}`)).data

      let data = {
        fullname: despachador.fullname,
        producto: product_id,
        email: despachador.email
      }

      let res = await axios.post(`${AUTH_API_BASE_URL}/auth/stock`, data);
    }

    responseAlmacen.cantidad_stock = stockActual
    const response = await axios.put(`${ALMACENPRODUCTS_API_BASE_URL}/${responseAlmacen.id}`, responseAlmacen);
    return responseAlmacen.data;
  } catch (error) {
    throw new Error(error);
  }
}

async function createMovements(id_producto, id_almacen, amount, id_proveedor) {
  try {

    let fecha = new Date();
    let data = {
      id_producto: id_producto,
      id_almacen: id_almacen,
      id_proveedor: null,
      tipo: false,
      cantidad: amount,
      fecha
    }
    console.log(data);

    const response = await axios.post(`${MOVEMENTS_API_BASE_URL}`, data);
    return response.data;
  } catch (error) {
    console.error('Error create movements', error.response ? error.response.data : error.message);
    throw new Error(error);
  }
}


module.exports = { findProductById, reduceStock, createMovements, returnStockAndCapacity };
