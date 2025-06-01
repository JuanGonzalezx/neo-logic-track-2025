// src/api/socket.js
import { io } from "socket.io-client";

export function createGeoSocket() {
  return io(import.meta.env.VITE_GATEWAY_URL || "http://localhost:3003", {
    path: "/geo/socket.io",
    transports: ["websocket"],
  });
}
