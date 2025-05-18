const SERVER_IP = import.meta.env.VITE_DEV_API_URL;
const SERVER_IP2 = import.meta.env.VITE_DEV_API_URL2;
const SERVER_IP_INVENTORY = import.meta.env.VITE_DEV_API_INVENTORY_URL;
const API_VERSION = import.meta.env.VITE_API_VERSION;

export const ENV ={
    BASE_PATH: SERVER_IP,
    BASE_PATH2: SERVER_IP2,
    BASE_API: `${SERVER_IP}/${API_VERSION}`,
    INVENTORY_API: `${SERVER_IP_INVENTORY}/${API_VERSION}`,
    BASE_API2: `${SERVER_IP2}/${API_VERSION}`,
    API_ROUTES:{
        SIGNUP:"/auth/signup",
        RESEND:'auth/resend',
        VERIFY_CODE: "/auth/verify",
        SIGNIN: "/auth/signin",
        SECONDFA:"/auth/2fa",
        CHANGE_PASSWORD:"/auth/changepassword",
        RESET_PASSWORD:"/auth/resetPassword",
        VERIFY_PASS_CODE:"/auth/verifyPassCode",
        CHANGE_RESET_PASSWORD:"/auth/ChangeResetPassword", 
        USERS:      "/users",
        ROLES:      "/roles",
        PERMISSIONS:"/permissions",
        UPLOAD_FILE: "upload",  // Este coincide con la ruta en Postman
        CITIES: "/ciudades",
        PRODUCTS: "/productos",
        CATEGORIES: "/categorias",
        PROVIDERS: "/proveedores",
        ALMACENES: "/almacenes",
        INVENTARIO: "/inventario",
    }
}