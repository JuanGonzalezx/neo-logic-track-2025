import { ENV } from "../utils";
const { INVENTORY_API, API_ROUTES } = ENV;

export class Warehouse {
  async getAllWarehouses() {
    const res = await fetch(`${INVENTORY_API}${API_ROUTES.ALMACENES}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });
    const json = await res.json();
    return { status: res.status, data: json };
  } 
}

export const warehouseAPI = new Warehouse();