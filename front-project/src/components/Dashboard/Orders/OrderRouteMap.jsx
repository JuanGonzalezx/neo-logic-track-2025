import React, { useEffect, useState } from 'react';
import { GoogleMap, Marker, DirectionsRenderer, useJsApiLoader } from "@react-google-maps/api";

const containerStyle = { width: "100%", height: "60vh" };

const WAREHOUSE_ICON = "/assets/warehouse.png";
const HOUSE_ICON = "/assets/house.png";
const DELIVERY_ICON = "/assets/delivery.png";

const OrderRouteMap = ({ warehouseMarker, orderMarker, deliveryPosition }) => {
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
    libraries: ['places']
  });

  const [directions, setDirections] = useState(null);
  const [routeInfo, setRouteInfo] = useState({ distance: "", duration: "" });

  useEffect(() => {
    if (isLoaded && warehouseMarker && orderMarker) {
      const directionsService = new window.google.maps.DirectionsService();
      directionsService.route(
        {
          origin: warehouseMarker,
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
  }, [isLoaded, warehouseMarker, orderMarker]);

  if (!isLoaded) return <div>Cargando mapa...</div>;

  return (
    <div className="order-map-section">
      <h3>Ruta y Seguimiento</h3>
      <div className="map-wrapper">
        <GoogleMap mapContainerStyle={containerStyle} center={orderMarker} zoom={13}>
          {/* Almacén */}
          <Marker
            position={warehouseMarker}
            // label="Almacén"
            icon={{
              url: WAREHOUSE_ICON,
              scaledSize: { width: 40, height: 40 }
            }}
          />
          {/* Destino */}
          <Marker
            position={orderMarker}
            // label="Destino"
            icon={{
              url: HOUSE_ICON,
              scaledSize: { width: 40, height: 40 }
            }}
          />
          {/* Delivery */}
          {deliveryPosition && (
            <Marker
              position={deliveryPosition}
              label="Repartidor"
              icon={{
                url: DELIVERY_ICON,
                scaledSize: { width: 40, height: 40 }
              }}
            />
          )}
          {/* Ruta */}
          {directions && (
            <DirectionsRenderer
              directions={directions}
              options={{ suppressMarkers: true }}
            />
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
