// src/api/ciudad.js
import { ENV } from "../utils";
const { BASE_PATH2, API_ROUTES } = ENV;

export async function getAllCiudades() {
    const res = await fetch(`${ENV.BASE_API2}${API_ROUTES.CITIES}`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
    });
    const json = await res.json();
    return { status: res.status, data: json };
}

export async function getCiudadById(id) {
    const res = await fetch(`${ENV.BASE_API2}${API_ROUTES.CITIES}${id}`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
    });
    const json = await res.json();
    return { status: res.status, data: json };
}
