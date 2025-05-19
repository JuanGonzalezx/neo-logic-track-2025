// src/components/Auth/Login.jsx

import { Spin, Typography, Alert } from "antd";
import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { auth } from "../../api/auth";
import { setLoading, setUser } from "../../redux/authSlice";
import VerificationModal from "./VerificationModal";
import "./Login.css";

import { useNavigate } from "react-router-dom";
import SecondFA from "./SecondFA";

const { Title } = Typography;

const Login = () => {
  const [formData, setFormData] = useState({
    email: "",
    current_password: "",
    methodContact: "sms"
  });

  const [showModal, setShowModal] = useState(false);
  const [emailToVerify, setEmailToVerify] = useState("");
  const [errors, setErrors] = useState({});
  const [apiResponse, setApiResponse] = useState(null);

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, isAuthenticated } = useSelector((state) => state.auth);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      dispatch(setUser({ token, isAuthenticated: true }));
    }
    console.log("isAuthenticated", isAuthenticated);
    if (isAuthenticated) navigate("/dashboard");
  }, [isAuthenticated, navigate, dispatch]);

  const validateForm = () => {
    const newErrors = {};
    if (!formData.email) newErrors.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email))
      newErrors.email = "Invalid email format";

    if (!formData.current_password)
      newErrors.current_password = "Password is required";
    else if (formData.current_password.length < 6)
      newErrors.current_password = "Password must be at least 6 characters";

    if (!formData.methodContact) {
      newErrors.methodContact = "The method contact is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiResponse(null);
    if (!validateForm()) return;

    console.log(formData);

    dispatch(setLoading(true));
    try {
      // recibimos { status, data }
      const response = await auth.signIn(formData);
      console.log("Respuesta del servidor:", response);

      if (response.status === 200) {

        // alerta verde
        setApiResponse({ type: "success", message: response.message });

        // segundo factor vía SMS?
        if (response.message.includes("SMS") || response.message.includes("email")) {
          setEmailToVerify(formData.email);
          setShowModal(true);
        }
        // acceso directo con token
        else if (response.token) {
          dispatch(setUser({
            user: response.user, // <-- add this!
            token: response.token,
            isAuthenticated: true,
            role: response.role,
            permissions: response.permissions
          }));
          localStorage.setItem("token", response.token);
          navigate("/dashboard");
        }
      } else if (response.status === 400) {
        // alerta roja
        setApiResponse({ type: "error", message: response.message });
      } else {
        setApiResponse({ type: "error", message: response.message });
      }
    } catch (err) {
      console.error("Error en el login:", err);
      setApiResponse({
        type: "error",
        message: err.message || "Ha ocurrido un error. Intenta de nuevo.",
      });
    } finally {
      dispatch(setLoading(false));
    }
  };

  const handleVerificationSuccess = async (code) => {
    try {
      const response = await auth.AuthenticationCode({ email: emailToVerify, code });
      if (response.token) {
        dispatch(setUser({
          user: response.user, // <-- Ensure user object is included
          token: response.token,
          isAuthenticated: true,
          role: response.role,
          permissions: response.permissions
        }));
        localStorage.setItem("token", response.token);
        setShowModal(false);
        navigate("/dashboard");
      } else {
        setApiResponse({ type: "error", message: "Verificación fallida. Intenta nuevamente." });
      }
    } catch (err) {
      console.error("Error en verificación:", err);
      setApiResponse({ type: "error", message: "Código inválido o expirado." });
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((p) => ({ ...p, [name]: value }));
  };

  const handleSignUp = () => {
    navigate("/signUp");
  };

  const handleForgot = () => {
    navigate("/reset-password");
  };

  return (
    <>
      <div
        className="login-container"
        style={{ maxWith: 400, margin: "0 auto", marginTop: 50 }}
      >
        <Title level={2} style={{ textAlign: "center" }}>
          Login
        </Title>
        <form onSubmit={handleSubmit}>
          {/* Input de email */}
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              name="email"
              value={formData.email}
              placeholder="Enter your email"
              onChange={handleChange}
            />
            {errors.email && <span className="field-error">{errors.email}</span>}
          </div>
          {/* input de password */}
          <div className="form-group">
            <label htmlFor="current_password">Password</label>
            <input
              type="password"
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
            <label htmlFor="methodContact">Método de envío</label>
            <select
              name="methodContact"
              className="input-field"
              value={formData.methodContact}
              onChange={handleChange}
            >
              <option value="sms">SMS</option>
              <option value="email">Email</option>
            </select>
            {errors.methodContact && (
              <span className="field-error">{errors.methodContact}</span>
            )}
          </div>

          <button type="submit" className="login-button" disabled={loading}>
            {loading ? <Spin /> : "Login"}
          </button>
        </form>

        {/* Forgot Password Button */}
        <div style={{ marginTop: 16, textAlign: "center" }}>
          <button onClick={handleForgot} className="verification-resend-link">
            Forgot Password?
          </button>
        </div>

        <SecondFA
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          contactMethod={formData.methodContact}
          onVerificationSuccess={handleVerificationSuccess}
          id={0}
        />

        <div className="verification-resend-text">
          ¿Not registered?{' '}
          <button onClick={handleSignUp} className="verification-resend-link">
            Sign Up
          </button>
        </div>
      </div>
    </>
  );
};

export default Login;
