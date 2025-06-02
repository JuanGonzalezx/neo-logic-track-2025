import React, { useEffect, useRef, useState } from "react";
import { GoogleMap, Marker, DirectionsRenderer, useJsApiLoader } from "@react-google-maps/api";
import { createGeoSocket } from "../../../api/socket";

const WAREHOUSE_ICON = "/assets/warehouse.png";
const HOUSE_ICON = "/assets/house.png";
const DELIVERY_ICON = "/assets/delivery.png";
const containerStyle = { width: "100%", height: "60vh" };

const OrderRouteMap = ({ warehouseMarker, orderMarker, deliveryUserId, initialDeliveryPosition }) => {
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
    libraries: ["places"]
  });

  const [deliveryPosition, setDeliveryPosition] = useState(initialDeliveryPosition);
  const [directions, setDirections] = useState(null);
  const [routeInfo, setRouteInfo] = useState({ distance: "", duration: "" });
  const socketRef = useRef(null);

  useEffect(() => {
  if (!deliveryUserId) return;
  const socket = createGeoSocket();
  socket.emit("subscribe", { deliveryPersonId: deliveryUserId });
  socket.on("locationUpdate", (data) => {
    if (data.coordinate) {
      setDeliveryPosition({
        lat: parseFloat(data.coordinate.latitude),
        lng: parseFloat(data.coordinate.longitude),
      });
    }
  });
  return () => socket.disconnect();
}, [deliveryUserId]);

  useEffect(() => {
    if (isLoaded && warehouseMarker && orderMarker && deliveryPosition) {
      const directionsService = new window.google.maps.DirectionsService();
      directionsService.route(
        {
          origin: deliveryPosition,
          destination: orderMarker,
          travelMode: window.google.maps.TravelMode.DRIVING
        },
        (result, status) => {
          if (status === "OK" && result) {
            setDirections(result);
            const leg = result.routes[0].legs[0];
            setRouteInfo({
              distance: leg.distance.text,
              duration: leg.duration.text,
            });
          }
        }
      );
    }
  }, [isLoaded, warehouseMarker, orderMarker, deliveryPosition]);

  if (!isLoaded) return <div>Cargando mapa...</div>;

  return (
    <div className="order-map-section">
      <h3>Ruta y Seguimiento</h3>
      <div className="map-wrapper">
        <GoogleMap mapContainerStyle={containerStyle} center={deliveryPosition || orderMarker} zoom={13}>
          <Marker position={warehouseMarker} icon={{ url: WAREHOUSE_ICON, scaledSize: { width: 40, height: 40 } }} />
          <Marker position={orderMarker} icon={{ url: HOUSE_ICON, scaledSize: { width: 40, height: 40 } }} />
          {deliveryPosition && (
            <Marker position={deliveryPosition} icon={{ url: DELIVERY_ICON, scaledSize: { width: 40, height: 40 } }} />
          )}
          {directions && (
            <DirectionsRenderer directions={directions} options={{ suppressMarkers: true }} />
          )}
        </GoogleMap>
        <div className="order-route-info">
          <span>Distancia: <b>{routeInfo.distance}</b></span>
          <span style={{ marginLeft: 16 }}>Tiempo estimado: <b>{routeInfo.duration}</b></span>
        </div>
      </div>
    </div>
  );
};

export default OrderRouteMap;
// No hay textos visibles para traducir en el mapa, pero si hay tooltips o mensajes, traducirlos aquí si aparecen en el futuro.
