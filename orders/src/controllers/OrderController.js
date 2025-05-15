const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const { findUser } = require('../lib/userServiceClient');
const { findProductById } = require('../lib/productServiceClient');

// Función para validar todos los productos en orderProducts
async function validateOrderProducts(orderProducts) {
  if (!Array.isArray(orderProducts)) return false;

  for (const op of orderProducts) {
    if (!op.product_id) {
      throw new Error('Each orderProduct must have a product_id');
    }
    const productExists = await findProductById(op.product_id);
    if (!productExists) {
      throw new Error(`Product with id ${op.product_id} not found`);
    }
  }
  return true;
}

// Obtener todas las órdenes
const getAllOrders = async (req, res) => {
  try {
    const orders = await prisma.order.findMany({
      include: { orderProducts: true },
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
      include: { orderProducts: true },
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

// Crear una nueva orden con validaciones
const createOrder = async (req, res) => {
  const { delivery_id, location_id, delivery_address, status, orderProducts } = req.body;
  try {
    // Validar que delivery_id exista
    const user = await findUser({ id: delivery_id });
    if (!user) {
      return res.status(400).json({ message: `User with id ${delivery_id} not found` });
    }

    // Validar todos los productos
    await validateOrderProducts(orderProducts);

    // Crear la orden
    const order = await prisma.order.create({
      data: {
        delivery_id,
        location_id,
        delivery_address,
        status,
        creation_date: new Date(),
        orderProducts: {
          create: orderProducts,
        },
      },
    });
    res.status(201).json(order);
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(400).json({ message: error.message });
  }
};

// Actualizar orden con validaciones
const updateOrder = async (req, res) => {
  const { id } = req.params;
  const { delivery_id, location_id, delivery_address, status, orderProducts } = req.body;
  try {
    // Validar delivery_id si viene
    if (delivery_id) {
      const user = await findUser({ id: delivery_id });
      if (!user) {
        return res.status(400).json({ message: `User with id ${delivery_id} not found` });
      }
    }

    // Validar todos los productos
    await validateOrderProducts(orderProducts);

    // Actualizar orden y productos (borramos los anteriores y creamos los nuevos)
    const order = await prisma.order.update({
      where: { id },
      data: {
        delivery_id,
        location_id,
        delivery_address,
        status,
        orderProducts: {
          deleteMany: {},
          create: orderProducts,
        },
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
    await prisma.order.delete({
      where: { id },
    });
    res.status(200).json({ message: 'Order deleted successfully' });
  } catch (error) {
    console.error('Error deleting order:', error);
    res.status(500).json({ message: 'Error deleting order', error: error.message });
  }
};

module.exports = {
  getAllOrders,
  getOrderById,
  createOrder,
  updateOrder,
  deleteOrder,
};
