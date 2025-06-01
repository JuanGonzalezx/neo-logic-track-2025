import { ENV } from "../utils"
const { BASE_PATH, API_ROUTES } = ENV;

export class Auth {

  async signUp(data) {
    const response = await fetch(`${ENV.BASE_API}${API_ROUTES.SIGNUP}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    const result = await response.json();
    console.log(result); // sigue viendo { message: "...", token: "..." }

    // devolvemos status + todo lo que venga en el body
    return {
      status: response.status,
      ...result,
    };
  }

  async resend(data) {
    const response = await fetch(`${ENV.BASE_API}${API_ROUTES.RESEND}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(data)
    })
    const result = await response.json();
    console.log(result);

    return result;
  };

  async verifyCode(data) {
    const response = await fetch(`${ENV.BASE_API}${API_ROUTES.VERIFY_CODE}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });
    const result = await response.json();
    return result;
  }


  async signIn(data) {
    const response = await fetch(`${ENV.BASE_API}${API_ROUTES.SIGNIN}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const result = await response.json();
    console.log(result);  // { message: "...", token: "..." }
    return {
      status: response.status,
      ...result
    };
  }

  async AuthenticationCode(data) {
    const response = await fetch(`${ENV.BASE_API}${API_ROUTES.SECONDFA}/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });
    const result = await response.json();
    return result;
  }

  async ChangePassword(data, id) {
    const response = await fetch(`${ENV.BASE_API}${API_ROUTES.CHANGE_PASSWORD}/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });
    const result = await response.json();
    return result;
  }

}
export async function requestPasswordReset({ email }) {
  const res = await fetch(`${ENV.BASE_API}${API_ROUTES.RESET_PASSWORD}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  });
  const json = await res.json();
  return { status: res.status, message: json.message };
}

export async function verifyResetCode({ email, code }) {
  const res = await fetch(`${ENV.BASE_API}${API_ROUTES.VERIFY_PASS_CODE}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, code }),
  });
  const json = await res.json();
  return { status: res.status, message: json.message };
}

export async function changeResetPassword(payload) {
  try {
    const res = await fetch(`${ENV.BASE_API}${API_ROUTES.CHANGE_RESET_PASSWORD}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload), // envía token, newPassword, confirmNewPassword
    });

    const data = await res.json();

    return {
      status: res.status,
      message: data.message || (res.ok ? "Contraseña actualizada" : "Error desconocido")
    };

  } catch (error) {
    return {
      status: 500,
      message: "Error de conexión con el servidor"
    };
  }
}

export async function getUserFromToken({ token }) {
  console.log("Token recibido:", token);

  
  const res = await fetch(`${ENV.BASE_API}${API_ROUTES.GET_USER_FROM_TOKEN}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ token }),
  });
  const json = await res.json();
  console.log("Respuesta del servidor:", json);
  return { status: res.status, ...json };
}


export const auth = new Auth()