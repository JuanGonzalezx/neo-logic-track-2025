import { ENV } from "../utils";
const { INVENTORY_API, API_ROUTES } = ENV;

export class MovementInventory {
  async getMovementsByWarehouseId(warehouseId) {
    const res = await fetch(`${INVENTORY_API}${API_ROUTES.MOVEMENTS}/almacen/${warehouseId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });
    const json = await res.json();
    return { status: res.status, data: json };
  }

  async getMovementsByProductId(productId) {
    const res = await fetch(`${INVENTORY_API}${API_ROUTES.MOVEMENTS}/producto/${productId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });
    const json = await res.json();
    return { status: res.status, data: json };
  }

  async getMovementsByWarehouseAndProductId(warehouseId, productId) {
    const res = await fetch(
      `${INVENTORY_API}${API_ROUTES.MOVEMENTS}/almacen/${warehouseId}/producto/${productId}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      }
    );
    const json = await res.json();
    return { status: res.status, data: json };
  }

  async createMovement(data) {
    const res = await fetch(`${INVENTORY_API}${API_ROUTES.MOVEMENTS}`, {
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
}

export const movementInventoryAPI = new MovementInventory();