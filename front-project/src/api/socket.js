// src/api/socket.js
import { io } from "socket.io-client";

export function createGeoSocket() {
  return io(import.meta.env.VITE_DEV_API_GEO_URL, {
    path: "/geo/socket.io",
    transports: ["websocket"],
  });
}
