import { useNavigate } from "react-router-dom";

const RedirectByRole = () => {
    const navigate = useNavigate();
    const role = localStorage.getItem("role");

    switch (role) {
        case "admin":
            navigate("/admin");
            break;
        case "gerente":
            navigate("/gerente");
            break;
        case "despachador":
            navigate("/despachador");
            break;
        case "repartidor":
            navigate("/repartidor");
            break;
        default:
            navigate("/unauthorized");
    }
}


export default RedirectByRole;