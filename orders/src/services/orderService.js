const { PrismaClient } = require('@prisma/client');
const userServiceClient = require('../lib/userServiceClient');
const { returnStockAndCapacity } = require('../lib/productServiceClient')

const prisma = new PrismaClient();

class OrderService {

  async createOrder(orderData) {
    // Validar que delivery_id exista en users
    // const deliveryUser = await userServiceClient.findUser({ id: orderData.delivery_id });
    // if (!deliveryUser) {
    //   const error = new Error(`User with id ${orderData.delivery_id} not found`);
    //   error.statusCode = 400;
    //   throw error;
    // }

    // Crear la orden en la base de datos
    const newOrder = await prisma.order.create({
      data: {
        delivery_id: orderData.delivery_id,
        location_id: orderData.location_id,
        creation_date: new Date(orderData.creation_date),
        delivery_address: orderData.delivery_address,
        status: orderData.status,
        // Suponiendo que orderProducts es un array de productos asociados
        orderProducts: {
          create: orderData.orderProducts || [],
        },
      },
      include: {
        orderProducts: true,
      },
    });

    return newOrder;
  }

  async assignRepartidor(city) {
    const repartidor = await userServiceClient.findRepartidorByCity(city)
  }

  async getOrderWithDelivery(orderId) {
    // Obtener la orden
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { orderProducts: true },
    });
    if (!order) {
      const error = new Error('Order not found');
      error.statusCode = 404;
      throw error;
    }

    // Obtener info delivery user
    const deliveryUser = await userServiceClient.findUser({ id: order.delivery_id });

    return {
      ...order,
      deliveryUser,
    };
  }

  // async updateOrder(order_id) {
  //   const order = await 
  // }

  

  async deleteOrder(order_id) {
  try {
    const order = await prisma.order.findUnique({ where: { id: order_id } });
    if (!order) {
      return null; // para manejar en el controlador
    }
    const products = await prisma.orderProducts.findMany({ where: { order_id } });
    for (const prod of products) {
      await returnStockAndCapacity(order.id_almacen, prod.product_id, prod.amount);
    }
    await prisma.orderProducts.deleteMany({ where: { order_id } });
    await prisma.order.delete({ where: { id: order_id } });
    return true;
  } catch (error) {
    throw new Error("No se puede eliminar el pedido: " + error.message);
  }
}
}

module.exports = new OrderService();