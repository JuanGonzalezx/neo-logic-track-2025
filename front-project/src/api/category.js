import { ENV } from "../utils";
const { INVENTORY_API, API_ROUTES } = ENV;

export class Category {
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

  async createCategory(data) {
    const res = await fetch(`${INVENTORY_API}${API_ROUTES.CATEGORIES}`, {
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

  async updateCategory(id, data) {
    const res = await fetch(`${INVENTORY_API}${API_ROUTES.CATEGORIES}/${id}`, {
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

  async deleteCategory(id) {
    const res = await fetch(`${INVENTORY_API}${API_ROUTES.CATEGORIES}/${id}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });
    const json = await res.json();
    return { status: res.status, data: json, message: json.message };
  }
}

export const categoryApi = new Category();