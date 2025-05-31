// src/components/Auth/Register.jsx

import { Card, Spin, Typography, Alert, Select } from "antd";
import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { auth } from "../../api/auth";
import { getAllCiudades } from "../../api/ciudad";
import { setLoading, setUser } from "../../redux/authSlice";
import VerificationModal from "./VerificationModal";
import "./Register.css";
import { X } from "lucide-react";
import { useNavigate } from "react-router-dom";

const { Title } = Typography;

const Register = ({ isOpen, onClose }) => {
    const [formData, setFormData] = useState({
        fullname: "",
        email: "",
        current_password: "",
        number: "",
        ciudadId: "", // <-- nuevo campo
    });

    const [showModal, setShowModal] = useState(false);
    const [emailToVerify, setEmailToVerify] = useState("");
    const [errors, setErrors] = useState({});
    const [apiResponse, setApiResponse] = useState(null); // { type: "success"|"error", message: string }
    const [ciudades, setCiudades] = useState([]);
    const [loadingCiudades, setLoadingCiudades] = useState(true);

    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { loading, isVerified } = useSelector((state) => state.auth);

    useEffect(() => {
        if (isVerified) {
            navigate("/");
        }

        // Obtener ciudades
        const fetchCiudades = async () => {
            try {
                setLoadingCiudades(true);
                const res = await getAllCiudades();
                if (res.status === 200) {
                    setCiudades(res.data);
                }
            } catch (err) {
                setApiResponse({ type: "error", message: "Error cargando ciudades" });
            } finally {
                setLoadingCiudades(false);
            }
        };
        fetchCiudades();
    }, [isVerified, navigate]);

    const validateForm = () => {
        const newErrors = {};
        if (!formData.fullname) newErrors.fullname = "Fullname is required";
        else if (formData.fullname.length < 3)
            newErrors.fullname = "Fullname must be at least 3 characters";

        if (!formData.email) newErrors.email = "Email is required";
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email))
            newErrors.email = "Invalid email format";

        if (!formData.current_password) newErrors.current_password = "Password is required";
        else if (formData.current_password.length < 6)
            newErrors.current_password = "Password must be at least 6 characters";

        if (!formData.number) newErrors.number = "Number is required";
        else if (formData.number.length < 10)
            newErrors.number = "Number must be at least 10 characters";

        if (!formData.ciudadId) newErrors.ciudadId = "Debes seleccionar una ciudad";

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setApiResponse(null);

        if (!validateForm()) return;

        dispatch(setLoading(true));
        try {
            // Aquí hacemos la llamada y recibimos status + data
            const response = await auth.signUp(formData);
            console.log("Respuesta del servidor:", response);

            // Verificamos el status para colorear la alerta
            if (response.status === 201) {
                setApiResponse({
                    type: "success",
                    message: response?.message || "¡Registro exitoso!",
                });
            } else if (response.status === 400) {
                setApiResponse({
                    type: "error",
                    message: response?.message || "Datos inválidos.",
                });
            }

            // Si es 200 y pide verificación, abrimos modal
            if (response.status === 201 && response.message?.includes("verification")) {
                setEmailToVerify(formData.email);
                setShowModal(true);
            }
            // Si es 200 y viene token, guardamos y redirigimos
            else if (response.status === 201 && response.data?.token) {
                dispatch(setUser({ token: response.data.token, isVerified: true }));
                localStorage.setItem("token", response.data.token);
            }
        } catch (err) {
            console.error("Error en el registro:", err);
            // En caso de error de red u otro, mostramos alerta roja
            setApiResponse({
                type: "error",
                message:
                    err.response?.data?.message ||
                    err.message ||
                    "Ha ocurrido un error. Intenta de nuevo.",
            });
        } finally {
            dispatch(setLoading(false));
        }
    };

    const handleVerificationSuccess = async (code) => {
        try {
            const response = await auth.verifyCode({ email: emailToVerify, code });
            if (response.token) {
                dispatch(setUser({ token: response.token, isVerified: true, role: response.role, permissions: response.permissions }));
                setShowModal(false);
                navigate("/dashboard");
            } else {
                setApiResponse({
                    type: "error",
                    message: "Verificación fallida. Intenta nuevamente.",
                });
            }
        } catch (err) {
            console.error("Error en verificación:", err);
            setApiResponse({
                type: "error",
                message: "Código inválido o expirado.",
            });
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    // Manejar cambio de ciudad
    const handleCiudadChange = (value) => {
        setFormData((prev) => ({ ...prev, ciudadId: value }));
        if (errors.ciudadId) setErrors((prev) => ({ ...prev, ciudadId: "" }));
    };

    const handleLogin = () => {
        navigate("/");
    };

    return (
        <div className="register-container" style={{ maxWidth: 400, margin: "50px auto" }}>
            <button onClick={onClose} className="verification-close-button">
                <X size={24} />
            </button>
{/* 
            <Title level={2} style={{ textAlign: "center" }}>
                Sign Up
            </Title> */}

            {/* Mostramos la alerta justo antes del form */}
            {apiResponse && (
                <Alert
                    style={{ marginBottom: 20 }}
                    message={apiResponse.message}
                    type={apiResponse.type}
                    showIcon
                    closable
                    onClose={() => setApiResponse(null)}
                />
            )}

            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label htmlFor="fullname">Fullname</label>
                    <input
                        type="text"
                        id="fullname"
                        name="fullname"
                        value={formData.fullname}
                        placeholder="Enter your fullname"
                        onChange={handleChange}
                    />
                    {errors.fullname && <span className="field-error">{errors.fullname}</span>}
                </div>

                <div className="form-group">
                    <label htmlFor="email">Email</label>
                    <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        placeholder="Enter your email"
                        onChange={handleChange}
                    />
                    {errors.email && <span className="field-error">{errors.email}</span>}
                </div>

                <div className="form-group">
                    <label htmlFor="current_password">Password</label>
                    <input
                        type="password"
                        id="current_password"
                        name="current_password"
                        value={formData.current_password}
                        placeholder="Enter your password"
                        onChange={handleChange}
                    />
                    {errors.current_password && (
                        <span className="field-error">{errors.current_password}</span>
                    )}
                </div>

                <div className="form-group">
                    <label htmlFor="number">Number</label>
                    <input
                        type="text"
                        id="number"
                        name="number"
                        value={formData.number}
                        placeholder="Enter your number"
                        onChange={handleChange}
                    />
                    {errors.number && <span className="field-error">{errors.number}</span>}
                </div>

                <div className="form-group">
                    <label htmlFor="ciudadId">Ciudad</label>
                    <Select
                        showSearch
                        id="ciudadId"
                        value={formData.ciudadId || undefined}
                        placeholder={loadingCiudades ? "Cargando ciudades..." : "Selecciona una ciudad"}
                        loading={loadingCiudades}
                        onChange={handleCiudadChange}
                        filterOption={(input, option) =>
                            String(option?.children || "").toLowerCase().includes(input.toLowerCase())
                        }
                        style={{ width: "100%" }}
                        optionFilterProp="children"
                    >
                        {ciudades.map((ciudad) => (
                            <Select.Option key={ciudad.id} value={ciudad.id}>
                                {ciudad.nombre}
                            </Select.Option>
                        ))}
                    </Select>
                    {errors.ciudadId && <span className="field-error">{errors.ciudadId}</span>}
                </div>

                <button type="submit" className="login-button" disabled={loading}>
                    {loading ? <Spin /> : "Create"}
                </button>
            </form>
{/* 
            <div className="verification-resend-text">
                ¿registered?{" "}
                <button onClick={handleLogin} className="verification-resend-link">
                    Login
                </button>
            </div> */}

            <VerificationModal
                isOpen={showModal}
                onClose={() => setShowModal(false)}
                contactMethod="email"
                onVerificationSuccess={handleVerificationSuccess}
                email={{ email: emailToVerify }}
            />
        </div>
    );
};

export default Register;
