import { ENV } from "../utils";
const { BASE_PATH, API_ROUTES } = ENV;

export class FileAPI {
  async uploadFile(file, token) {
    const formData = new FormData();
    // Usamos 'csvfile' como nombre del campo según se ve en Postman
    formData.append('csvfile', file);

    try {
      const response = await fetch(`${ENV.BASE_API}${API_ROUTES.UPLOAD_FILE}`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`
        },
        // No establecemos Content-Type, FormData lo hace automáticamente
        body: formData
      });

      if (!response.ok) {
        throw new Error(`Error en la carga: ${response.statusText}`);
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error("Error al subir el archivo:", error);
      throw error;
    }
  }
}

export const fileAPI = new FileAPI();