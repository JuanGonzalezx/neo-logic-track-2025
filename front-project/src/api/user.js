// src/api/users.js
import { ENV } from "../utils"
const { BASE_PATH, API_ROUTES } = ENV;

export async function createUser(data) {
    const res = await fetch(`${ENV.BASE_API}${API_ROUTES.USERS}`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
            fullname: data.fullname,
            email: data.email,
            current_password: data.current_password,
            number: data.number,
            role: data.role,
            roleId: data.roleId,
            status: data.status,
        }),
    });
    const json = await res.json();
    return {
        status: res.status,
        message: json.message,
        data: json,
    };
}

export async function getAllUsers() {
    const res = await fetch(`${ENV.BASE_API}${API_ROUTES.USERS}`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
    });
    const json = await res.json();
    return { status: res.status, data: json };
}

export async function updateUser(id, data) {
    const res = await fetch(`${ENV.BASE_API}${API_ROUTES.USERS}/${id}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
            fullname: data.fullname,
            email: data.email,
            current_password: data.current_password,
            number: data.number,
            role: data.role,
            status: data.status,
        }),
    });
    const json = await res.json();
    return { status: res.status, data: json };
}

export async function deleteUser(id) {
    const res = await fetch(`${ENV.BASE_API}${API_ROUTES.USERS}/${id}`, {
        method: "DELETE",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
    });
    const json = await res.json();
    return { status: res.status, message: json.message };
}

export const getAllRoles = async () => {
    try {
        const res = await fetch(`${ENV.BASE_API}/roles`, {
            method:"GET",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${localStorage.getItem("token")}`,
            }
        });

        const data = await res.json();
        return { status: res.status, data };
    } catch (error) {
        return { status: 500, message: "Error de conexión" };
    }
};
