const { PrismaClient } = require('@prisma/client');
const userServiceClient = require('../lib/userServiceClient');
const { returnStockAndCapacity } = require('../lib/productServiceClient')
const { findProductById, reduceStock, createMovements } = require('../lib/productServiceClient');
const { updateOrderProduct } = require('../controllers/OrderProductsController');
const { findUser } = require('../lib/userServiceClient');


const prisma = new PrismaClient();

class OrderService {

  async calcularDistancia(lat1, lon1, lat2, lon2) {
    const R = 6371; // Radio de la Tierra en km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Distancia en km
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

  async updateOrderService(order_id, data) {
    try {

      const order = await prisma.order.findUnique({ where: { id: order_id }, include: { OrderProducts: true } })
      if (!order) {
        throw new Error("No existe esa orden a eliminar");
      }

      if (data.delivery_id) {
        const user = await findUser({ id: data.delivery_id });
        if (!user) {
          throw new Error(`User with id ${data.delivery_id} not found`);
        }
      }

      if (data.orderProducts) {
        for (const op of order.OrderProducts) {
          await returnStockAndCapacity(order.id_almacen, op.product_id, op.amount)
        }

        await validateOrderProducts(data.orderProducts, order.id_almacen);

        await prisma.orderProducts.deleteMany({
          where: { order_id: order_id }
        });

        await prisma.orderProducts.createMany({
          data: data.orderProducts.map(product => ({
            order_id: order_id,
            product_id: product.product_id,
            amount: product.amount,
          }))
        });
      }

      // Solo actualizar los campos que realmente vienen en data
      const updateData = {};
      if (data.delivery_id !== undefined) updateData.delivery_id = data.delivery_id;
      if (data.coordinate_id !== undefined) updateData.coordinate_id = data.coordinate_id;
      if (data.delivery_address !== undefined) updateData.delivery_address = data.delivery_address;
      if (data.status !== undefined) updateData.status = data.status;
      if (data.timeEstimated !== undefined) updateData.timeEstimated = data.timeEstimated;
      if (data.distance !== undefined) updateData.distance = data.distance;
      if (data.client_id !== undefined) updateData.client_id = data.client_id;

      const orderUpdate = await prisma.order.update({
        where: { id: order_id },
        data: updateData,
        include: { OrderProducts: true }
      });
      return orderUpdate;
    }
    catch (error) {
      throw new Error(error);
    }
  }

  async deleteOrders(order_id) {
    try {
      const order = await prisma.order.findUnique({ where: { id: order_id } })
      if (!order) {
        throw new Error("No existe esa orden a eliminar");
      }
      const products = await prisma.orderProducts.findMany({ where: { order_id: order_id } })
      for (const prod of products) {
        const productExists = await returnStockAndCapacity(order.id_almacen, prod.product_id, prod.amount);
      }

      const deleteProducts = await prisma.orderProducts.deleteMany({ where: { order_id: order_id } })
      const deleteOrder = await prisma.order.update({ where: { id: order_id }, data: { status: "CANCELLED" } });

    } catch (error) {
      throw new Error(error);
    }
  }
}

async function validateOrderProducts(orderProducts, id_almacen) {
  console.log("Validating order products:", orderProducts);

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
module.exports = new OrderService();

module.exports.validateOrderProducts = validateOrderProducts;