// src/api/users.js
import { ENV } from "../utils"
const { BASE_PATH, API_ROUTES } = ENV;

export class Permission {

    async createPermission(data) {
        const res = await fetch(`${ENV.BASE_API}${API_ROUTES.PERMISSIONS}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
        });
        const json = await res.json();
        return {
            status: res.status,
            message: json.message,
            data: json,
        };
    }

    async getAllPermissions() {
        const res = await fetch(`${ENV.BASE_API}${API_ROUTES.PERMISSIONS}`, {
            method: "GET",
        });
        const json = await res.json();
        return { status: res.status, data: json };
    }

    async updatePermission(id, data) {
        const res = await fetch(`${ENV.BASE_API}${API_ROUTES.PERMISSIONS}/${id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
        });
        const json = await res.json();
        return { status: res.status, data: json };
    }

    async deletePermission(id) {
        const res = await fetch(`${ENV.BASE_API}${API_ROUTES.PERMISSIONS}/${id}`, {
            method: "DELETE",
        });
        const json = await res.json();
        return { status: res.status, message: json.message };
    }

}

export const permissionAPI = new Permission()
