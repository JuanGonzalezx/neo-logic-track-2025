// src/api/product.js
import { ENV } from "../utils";
const { INVENTORY_API, API_ROUTES } = ENV;

export class Product {
  async getAllProducts() {
    const res = await fetch(`${INVENTORY_API}${API_ROUTES.PRODUCTS}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });
    const json = await res.json();
    return { status: res.status, data: json };
  }

  async getProductById(id) {
    const res = await fetch(`${INVENTORY_API}${API_ROUTES.PRODUCTS}/${id}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });
    const json = await res.json();
    return { status: res.status, data: json };
  }

  async createProduct(data) {
    const res = await fetch(`${INVENTORY_API}${API_ROUTES.PRODUCTS}/createSimple`, {
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

  async asignProductToWarehouse(data) {
    const res = await fetch(`${INVENTORY_API}${API_ROUTES.PRODUCTS}/`, {
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

  async updateProduct(id, data) {
    const res = await fetch(`${INVENTORY_API}${API_ROUTES.PRODUCTS}/${id}`, {
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

  async deleteProduct(id) {
    const res = await fetch(`${INVENTORY_API}${API_ROUTES.PRODUCTS}/${id}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });

    // Si el status es 204 No Content, no intentes parsear JSON
    if (res.status === 204) {
      return { status: res.status, message: "Product Inactive" };
    }

    // Para otros status, intenta parsear JSON si hay contenido
    let json = {};
    try {
      json = await res.json();
    } catch (error) {
      // No hay JSON, puedes ignorar o manejar el error
    }

    return { status: res.status, message: json.message };
  }

  async getAllCategories() {
    const res = await fetch(`${INVENTORY_API}${API_ROUTES.CATEGORIES}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });
    const json = await res.json();
    return { status: res.status, data: json };
  }

  async getCategoryById(id) {
    const res = await fetch(`${INVENTORY_API}${API_ROUTES.CATEGORIES}/${id}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });
    const json = await res.json();
    return { status: res.status, data: json };
  }

  async getAllProviders() {
    const res = await fetch(`${INVENTORY_API}${API_ROUTES.PROVIDERS}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });
    const json = await res.json();
    return { status: res.status, data: json };
  }

  async getAllAlmacenes() {
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

export const productAPI = new Product();
