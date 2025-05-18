import { ENV } from "../utils";
const { INVENTORY_API, API_ROUTES } = ENV;

export class AlmacenProduct {
  async getStockByWarehouseId(warehouseId) {
    const res = await fetch(`${INVENTORY_API}${API_ROUTES.ALMACEN_PRODUCTO}/almacen/${warehouseId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });
    const json = await res.json();
    return { status: res.status, data: json };
  }

  async addStock(data) {
    const res = await fetch(`${INVENTORY_API}${API_ROUTES.ALMACEN_PRODUCTO}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      body: JSON.stringify(data),
    });
    const json = await res.json();
    return { status: res.status, data: json, message: json.message };
  }

  async updateStock(id, data) {
    const res = await fetch(`${INVENTORY_API}${API_ROUTES.ALMACEN_PRODUCTO}/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      body: JSON.stringify(data),
    });
    const json = await res.json();
    return { status: res.status, data: json, message: json.message };
  }
}

export const almacenProductAPI = new AlmacenProduct();