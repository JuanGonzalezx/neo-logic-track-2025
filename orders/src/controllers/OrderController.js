const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const { findUser } = require('../lib/userServiceClient');
const { findCityByAlmacen } = require('../lib/almacenServiceClient');
const { findRepartidorByCity } = require('../lib/userServiceClient');
const { validateOrderProducts, updateOrderService, deleteOrders } = require('../services/orderService');
const { findCoordinateById } = require('../lib/coordinateServiceClient');

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

const getOrdersByAlmacen = async (req, res) => {
  const { id_almacen } = req.params;
  try {
    const orders = await prisma.order.findMany({
      where: { id_almacen },
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
  let { location_id, delivery_address, status, id_almacen,
    orderProducts, coordinate_id, distance, timeEstimated,
    deliveryAutomatic, client_id } = req.body;
  try {
    const client = await findUser(client_id);
    if (!client) {
      return res.status(400).json({ message: `Client with id ${client_id} not found` });
    }
    // Validar todos los productos, llama a dos funciones
    //1. Para actualizar stock y mandar email si es el caso
    //2. Crea el movimiento con tipo salida
    const validate = await validateOrderProducts(orderProducts, id_almacen);
    
    const coordinate = await findCoordinateById(coordinate_id)
    if (!coordinate) {  
      return res.status(400).json({ message: `Coordinate with id ${coordinate_id} not found` });
    }

    let repartidor = null;

    if (deliveryAutomatic) {
      const city = await findCityByAlmacen(id_almacen)
      repartidor = await findRepartidorByCity(city)
      repartidor = repartidor.id
      if (!repartidor) {
        status = "PENDING"
      }
      status = "ASSIGNED"
    } else {
      status = "PENDING"
      repartidor = "00000000-0000-0000-0000-000000000000"; // Default repartidor
    }

    // Crear la orden
    const order = await prisma.order.create({
      data: {
        delivery_id: repartidor,
        location_id,
        delivery_address,
        status,
        id_almacen: id_almacen,
        client_id: client_id,
        timeEstimated: timeEstimated,
        distance: distance,
        coordinate_id: coordinate_id,
        creation_date: new Date()
      }, include: {
        OrderProducts: true,
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
    res.status(201).json({ message: order });
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(400).json({ message: error.message });
  }
};

// Actualizar orden con validaciones
const updateOrder = async (req, res) => {
  const { id } = req.params;

  try {
    if (req.body.id_almacen) {
      throw new Error("No puedes cambiar el almacen de la orden");
    }

    const order = await updateOrderService(id, req.body)
    res.status(200).json({ message: "Pedido actualizado exitosamente", order: order });
  } catch (error) {
    console.error('Error updating order:', error);
    res.status(400).json({ message: error.message });
  }
};


const deleteOrder = async (req, res) => {
  const { id } = req.params;
  try {
    const deletedOrder = deleteOrders(id);
    if (!deleteOrder) {
      throw new Error("Dont found the order");
    }
    res.status(204).json({ message: 'Order deleted successfully' });
  } catch (error) {
    console.error('Error deleting order:', error);
    return res.status(500).json({ message: 'Error deleting order', error: error.message });
  }
};


module.exports = {
  getAllOrders,
  getOrderById,
  getOrdersByAlmacen,
  createOrder,
  updateOrder,
  deleteOrder
};
