// src/api/geoService.js
import axios from 'axios';
import { ENV } from "../utils";
const { GEO_API, API_ROUTES } = ENV;

// =================== REST ENDPOINTS ===================

// Obtener usuario (para saber el rol)
// export async function getUserFromToken(token) {
//   // Asume que tienes endpoint para obtener usuario por id extraído del token
//   // El id estará en el payload JWT, decodifica antes de llamar a esta función
//   const res = await axios.get(`${API_URL}/users/me`, {
//     headers: {
//       Authorization: `Bearer ${token}`
//     }
//   });
//   return res.data; // Asegúrate que retorna el usuario con el campo "rol"
// }

// Actualizar o crear la coordenada del repartidor (POST o PUT)
export async function updateDeliveryLocation({ userId, latitude, longitude, cityId, street }) {
  // Puedes adaptar el body si tu backend lo requiere diferente
  const token = localStorage.getItem('token');
  return axios.post(
    `${GEO_API}/${API_ROUTES.COORDINATES}`,
    { user_id: userId, latitude, longitude, cityId, street },
    { headers: { Authorization: `Bearer ${token}` } }
  );
}

// Obtener la última coordenada de un usuario
export async function getLastCoordinateByUserId(userId) {
  const token = localStorage.getItem('token');
  const res = await axios.get(`${API_URL}/coordinatesUser/user/${userId}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return res.data; // Aquí retorna la relación con el objeto "coordinate"
}
