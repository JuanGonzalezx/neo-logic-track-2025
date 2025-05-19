import { ENV } from "../utils";
const { ORDER_API, API_ROUTES } = ENV;

export class Order {
  async getAllOrders() {
    const res = await fetch(`${ORDER_API}${API_ROUTES.ORDERS}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });
    const json = await res.json();
    return { status: res.status, data: json };
  }

  async getOrderById(id) {
    const res = await fetch(`${ORDER_API}${API_ROUTES.ORDERS}/${id}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });
    const json = await res.json();
    return { status: res.status, data: json };
  }

  async getOrdersByAlmacen(almacenId) {
    const res = await fetch(`${ORDER_API}${API_ROUTES.ORDERS}/almacen/${almacenId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });
    const json = await res.json();
    return { status: res.status, data: json };
  }

  async createOrder(data) {
    const res = await fetch(`${ORDER_API}${API_ROUTES.ORDERS}`, {
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

  async updateOrder(id, data) {
    const res = await fetch(`${ORDER_API}${API_ROUTES.ORDERS}/${id}`, {
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

  async deleteOrder(id) {
  const res = await fetch(`${ORDER_API}${API_ROUTES.ORDERS}/${id}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  });
  if (res.status === 204) {
    return { status: res.status, message: "Order deleted successfully" };
  }
  const json = await res.json();  // Esto falla si no hay JSON
  return { status: res.status, message: json.message };
}

}

export const orderAPI = new Order();