const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const { findUser } = require('../lib/userServiceClient');
const { findProductById, reduceStock, createMovements } = require('../lib/productServiceClient');
const { createOrderProduct } = require('./OrderProductsController');
const { findCityByAlmacen } = require('../lib/almacenServiceClient');
const { findRepartidorByCity } = require('../lib/userServiceClient');
const orderService = require('../services/orderService');


// Función para validar todos los productos en orderProducts
async function validateOrderProducts(orderProducts, id_almacen) {
  try {
    for (const op of orderProducts) {
      const productExists = await findProductById(op.product_id);

      if (!productExists) {
        throw new Error(`Product with id ${op.product_id} not found`);
      }

      // Reduce el stock en almacenProducto
      await reduceStock(op.product_id, id_almacen, op.amount);

      // Crea el movimiento de salida de ese almacen 
      await createMovements(op.product_id, id_almacen, op.amount, op.id_proveedor)

    }
  } catch (error) {
    console.error('Error creating order:', error);
    throw new Error(error);
  }
}

// Obtener todas las órdenes
const getAllOrders = async (req, res) => {
  try {
    const orders = await prisma.order.findMany({
      include: { OrderProducts: true },
    });
    res.status(200).json(orders);
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ message: 'Error fetching orders', error: error.message });
  }
};

// Obtener orden por ID con datos del usuario delivery
const getOrderById = async (req, res) => {
  const { id } = req.params;
  try {
    const order = await prisma.order.findUnique({
      where: { id },
      include: { OrderProducts: true },
    });
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    const deliveryUser = await findUser({ id: order.delivery_id });

    res.status(200).json({ ...order, deliveryUser });
  } catch (error) {
    console.error('Error fetching order:', error);
    res.status(500).json({ message: 'Error fetching order', error: error.message });
  }
};
// Obtener órdenes por almacenId
const getOrdersByAlmacen = async (req, res) => {
  const { id_almacen } = req.params;
  try {
    const orders = await prisma.order.findMany({
      where: { id_almacen },        // filtro por almacenId
      include: { OrderProducts: true },
    });
    res.status(200).json(orders);
  } catch (error) {
    console.error('Error fetching orders by almacenId:', error);
    res.status(500).json({ message: 'Error fetching orders by almacenId', error: error.message });
  }
};

// Crear una nueva orden con validaciones
const createOrder = async (req, res) => {
  const { location_id, delivery_address, status, id_almacen, orderProducts, } = req.body;
  try {

    // Validar todos los productos, llama a dos funciones
    //1. Para actualizar stock y mandar email si es el caso
    //2. Crea el movimiento con tipo salida
    const validate = await validateOrderProducts(orderProducts, id_almacen);

    const city = await findCityByAlmacen(id_almacen)

    const repartidor = await findRepartidorByCity(city)

    // Crear la orden
    const order = await prisma.order.create({
      data: {
        delivery_id: repartidor.id,
        location_id,
        delivery_address,
        status,
        id_almacen: id_almacen,
        creation_date: new Date()
      },
    });

    // await createOrderProducts
    for (const op of orderProducts) {
      const orderProduct = await prisma.orderProducts.create({
        data: {
          order_id: order.id,
          product_id: op.product_id,
          amount: op.amount,
        },
      });
    }
    res.status(201).json({ message: req.body });
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(400).json({ message: error.message });
  }
};

// Actualizar orden con validaciones
const updateOrder = async (req, res) => {
  const { id } = req.params;
  const { delivery_id, location_id, delivery_address, status, orderProducts, id_almacen } = req.body;
  try {
    // Validar delivery_id si viene
    if (delivery_id) {
      const user = await findUser({ id: delivery_id });
      if (!user) {
        return res.status(400).json({ message: `User with id ${delivery_id} not found` });
      }
    }

    // Validar todos los productos
    await validateOrderProducts(orderProducts, id_almacen);

    // Actualizar orden y productos (borramos los anteriores y creamos los nuevos)
    const order = await prisma.order.update({
      where: { id },
      data: {
        delivery_id,
        location_id,
        delivery_address,
        status,
      },
    });
    res.status(200).json(order);
  } catch (error) {
    console.error('Error updating order:', error);
    res.status(400).json({ message: error.message });
  }
};

// Borrar una orden
const deleteOrder = async (req, res) => {
  const { id } = req.params;
  try {
    const deletedOrder = orderService.deleteOrder(id);
    if (!deleteOrder) {
      throw new Error("Don´t found the order");
    }
    res.status(204).json({ message: 'Order deleted successfully' });
  } catch (error) {
    console.error('Error deleting order:', error);
    res.status(500).json({ message: 'Error deleting order', error: error.message });
  }
};

module.exports = {
  getAllOrders,
  getOrderById,
  getOrdersByAlmacen,
  createOrder,
  updateOrder,
  deleteOrder,
};
