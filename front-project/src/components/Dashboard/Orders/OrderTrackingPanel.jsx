import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Spin } from 'antd';
import { orderAPI } from '../../../api/order';
import { productAPI } from '../../../api/product';
import { warehouseAPI } from '../../../api/warehouse';
import OrderRouteMap from './OrderRouteMap';
import OrderDetailsPanel from './OrderDetailsPanel';
import './OrderTracking.css';

const OrderTrackingPage = () => {
  const { orderId } = useParams();
  const [loading, setLoading] = useState(true);
  const [order, setOrder] = useState(null);
  const [warehouse, setWarehouse] = useState(null);
  const [productsDetails, setProductsDetails] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const orderResp = await orderAPI.getOrderById(orderId);
        if (orderResp.status !== 200) throw new Error("Order not found");
        setOrder(orderResp.data);

        const whResp = await warehouseAPI.getById(orderResp.data.id_almacen);
        if (whResp.status !== 200) throw new Error("Warehouse not found");
        setWarehouse(whResp.data);

        const orderProducts = orderResp.data.OrderProducts || orderResp.data.orderProducts || [];
        const productPromises = orderProducts.map(async (p) => {
          const r = await productAPI.getProductById(p.product_id);
          return {
            ...p,
            details: r.status === 200 ? r.data : null
          };
        });
        setProductsDetails(await Promise.all(productPromises));
      } catch (e) {
        setOrder(null);
        setWarehouse(null);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [orderId]);

  if (loading) return <div className="loading-container"><Spin tip="Cargando orden..." /></div>;
  if (!order || !warehouse) return <div className="loading-container">No se encontró la orden.</div>;

  const warehouseMarker = {
    lat: parseFloat(warehouse.direccion.latitud),
    lng: parseFloat(warehouse.direccion.longitud)
  };
  console.log(order)
  const orderMarker = {
    lat: parseFloat(order.coordinate.latitude),
    lng: parseFloat(order.coordinate.longitude)
  };
  console.log(order)
  const deliveryUserId = order.delivery_id;
  return (
    <div className="order-tracking-page">
      <h2>Seguimiento de Orden</h2>
      <OrderDetailsPanel order={order} warehouse={warehouse} productsDetails={productsDetails} />
      <OrderRouteMap
        warehouseMarker={warehouseMarker}
        orderMarker={orderMarker}
        deliveryUserId={deliveryUserId} // Si tienes esto
      />
    </div>
  );
};

export default OrderTrackingPage;
