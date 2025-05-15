const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Get all order products
const getAllOrderProducts = async (req, res) => {
  try {
    const orderProducts = await prisma.orderProducts.findMany({
      include: {
        order: true,
      },
    });
    res.status(200).json(orderProducts);
  } catch (error) {
    console.error('Error fetching order products:', error);
    res.status(500).json({ message: 'Error fetching order products', error: error.message });
  }
};

// Get order product by ID
const getOrderProductById = async (req, res) => {
  const { id } = req.params;
  try {
    const orderProduct = await prisma.orderProducts.findUnique({
      where: { id },
      include: {
        order: true,
      },
    });
    if (!orderProduct) {
      return res.status(404).json({ message: 'Order product not found' });
    }
    res.status(200).json(orderProduct);
  } catch (error) {
    console.error('Error fetching order product:', error);
    res.status(500).json({ message: 'Error fetching order product', error: error.message });
  }
};

// Create a new order product
const createOrderProduct = async (req, res) => {
  const { order_id, product_id, amount } = req.body;
  try {
    const orderProduct = await prisma.orderProducts.create({
      data: {
        order_id,
        product_id,
        amount,
      },
    });
    res.status(201).json(orderProduct);
  } catch (error) {
    console.error('Error creating order product:', error);
    res.status(500).json({ message: 'Error creating order product', error: error.message });
  }
};

// Update an order product
const updateOrderProduct = async (req, res) => {
  const { id } = req.params;
  const { order_id, product_id, amount } = req.body;
  try {
    const orderProduct = await prisma.orderProducts.update({
      where: { id },
      data: {
        order_id,
        product_id,
        amount,
      },
    });
    res.status(200).json(orderProduct);
  } catch (error) {
    console.error('Error updating order product:', error);
    res.status(500).json({ message: 'Error updating order product', error: error.message });
  }
};

// Delete an order product
const deleteOrderProduct = async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.orderProducts.delete({
      where: { id },
    });
    res.status(200).json({ message: 'Order product deleted successfully' });
  } catch (error) {
    console.error('Error deleting order product:', error);
    res.status(500).json({ message: 'Error deleting order product', error: error.message });
  }
};

module.exports = {
  getAllOrderProducts,
  getOrderProductById,
  createOrderProduct,
  updateOrderProduct,
  deleteOrderProduct,
};
