const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const { findUser, findRepartidorByCity, sendEmailOrder } = require('../lib/userServiceClient');
const { findCityByAlmacen } = require('../lib/almacenServiceClient');
const { validateOrderProducts, updateOrderService, deleteOrders, calcularDistancia } = require('../services/orderService');
const { createCoordinate, createCoordinateForOrder, findCoordinateById, getLastCoordinateByUserId } = require('../lib/coordinateServiceClient');

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
    let order = await prisma.order.findUnique({
      where: { id },
      include: { OrderProducts: true },
    });

    let coordinate = null;
    if(order.coordinate_id) {
      coordinate = await findCoordinateById(order.coordinate_id);
      if (!coordinate) {
        console.warn(`Coordinate with ID ${order.coordinate_id} not found`); 
     }
    }
    order = {
      ...order,
      coordinate
    }

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    res.status(200).json({ ...order });
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
  let { auto_assign, customer_email, customer_name, delivery_address,
    id_almacen, latitude, longitude, orderProducts, status
  } = req.body;
  try {

    await validateOrderProducts(orderProducts, id_almacen);

    const city = await findCityByAlmacen(id_almacen)

    let repartidor = null;
    let repartidores = null;
    let repartidorMasCercano = null;
    let coordinate = null;

    if (!auto_assign) {

      coordinate = await createCoordinateForOrder({
        latitude,
        longitude,
        cityId: city,
        street: delivery_address,
        postal_code: req.body.postal_code || "00000"
      });
      status = "PENDING"
      repartidor = "00000000-0000-0000-0000-000000000000"; // Default repartidor
      repartidorMasCercano = {
        email: "",
        fullname: "No asignado"
      };
    } else {
      repartidores = await findRepartidorByCity(city)

      const repartidoresConCoordenadas = await Promise.all(
        repartidores.map(async (r) => {
          try {

            const coord = await getLastCoordinateByUserId(r.id);

            if (coord.coordinate.latitude && coord.coordinate.longitude) {
              return {
                ...r,
                latitude: coord.coordinate.latitude,
                longitude: coord.coordinate.longitude,
              };
            } else {
              console.warn(`Coordenadas inválidas para repartidor ${r.id}`);
              return null;
            }
          } catch (error) {
            console.error(`Error obteniendo coordenada para repartidor ${r.id}:`, error);
            return null;
          }
        })
      );

      // Filtrar coordenadas válidas
      const repartidoresValidos = repartidoresConCoordenadas.filter(
        (r) => r && r.latitude && r.longitude
      );

      if (repartidoresValidos.length === 0) {
        console.warn("No se encontraron repartidores con coordenadas válidas.");
        return null;
      }

      // Calcular distancias
      repartidoresValidos.forEach((r) => {
        r.distancia = calcularDistancia(
          latitude,
          longitude,
          r.latitude,
          r.longitude
        );
      });

      // Ordenar por distancia
      repartidoresValidos.sort((a, b) => a.distancia - b.distancia);
      console.log("Repartidores ordenados por distancia:", repartidoresValidos);

      repartidorMasCercano = repartidoresValidos[0];
      console.log("Repartidor asignado:", repartidorMasCercano);
      repartidor = repartidorMasCercano.id;

      const coordenada = {
        latitude,
        longitude,
        cityId: city,
        street: delivery_address,
        user_id: repartidor,
        postal_code: req.body.postal_code || "00000"
      }
      coordinate = await createCoordinate(coordenada)
      console.log("Coordenada creada:", coordinate);
      status = "ASSIGNED";
    }

    // Crear la orden
    const order = await prisma.order.create({
      data: {
        delivery_id: repartidor,
        delivery_address,
        status,
        customer_email,
        customer_name,
        delivery_email: repartidorMasCercano.email || "",
        delivery_name: repartidorMasCercano.fullname || "",
        id_almacen: id_almacen,
        coordinate_id: coordinate.id,
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

      await sendEmailOrder(customer_email, customer_name, order.id)
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
