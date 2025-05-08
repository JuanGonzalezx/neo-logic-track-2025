// src/api/users.js
import { ENV } from "../utils"
const { BASE_PATH, API_ROUTES } = ENV;

export class Role {

    async createRole(data) {
        const res = await fetch(`${ENV.BASE_API}${API_ROUTES.ROLES}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${localStorage.getItem("token")}`,
            },

            body: JSON.stringify(data),
        });
        const json = await res.json();
        return {
            status: res.status,
            message: json.message,
            data: json,
        };
    }

    async getAllRoles() {
        const res = await fetch(`${ENV.BASE_API}${API_ROUTES.ROLES}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${localStorage.getItem("token")}`,
            }
        });
        const json = await res.json();
        return { status: res.status, data: json };
    }

    async updateRole(id, data) {
        const res = await fetch(`${ENV.BASE_API}${API_ROUTES.ROLES}/${id}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
            body: JSON.stringify(data)
        });
        const json = await res.json();
        return { status: res.status, data: json };
    }

    async deleteRole(id) {
        const res = await fetch(`${ENV.BASE_API}${API_ROUTES.ROLES}/${id}`, {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${localStorage.getItem("token")}`,
            }
        });
        const json = await res.json();
        return { status: res.status, message: json.message };
    }

}
export const roleAPI = new Role()