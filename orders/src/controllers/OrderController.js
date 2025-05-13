const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Get all orders
const getAllOrders = async (req, res) => {
  try {
    const orders = await prisma.order.findMany({
      include: {
        orderProducts: true,
      },
    });
    res.status(200).json(orders);
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ message: 'Error fetching orders', error: error.message });
  }
};

// Get order by ID
const getOrderById = async (req, res) => {
  const { id } = req.params;
  try {
    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        orderProducts: true,
      },
    });
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    res.status(200).json(order);
  } catch (error) {
    console.error('Error fetching order:', error);
    res.status(500).json({ message: 'Error fetching order', error: error.message });
  }
};

// Create a new order
const createOrder = async (req, res) => {
  const { delivery_id, location_id, delivery_address, status, orderProducts } = req.body;
  try {
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
    res.status(500).json({ message: 'Error creating order', error: error.message });
  }
};

// Update an order
const updateOrder = async (req, res) => {
  const { id } = req.params;
  const { delivery_id, location_id, delivery_address, status, orderProducts } = req.body;
  try {
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
    res.status(500).json({ message: 'Error updating order', error: error.message });
  }
};

// Delete an order
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
