import { Spin, Typography, Alert } from "antd";
import React, { useState, useEffect } from "react";
import { createUser, getAllRoles } from "../../../api/user";
import "./User.css";

const { Title } = Typography;

const UserForm = () => {
  const [formData, setFormData] = useState({
    fullname: "",
    email: "",
    current_password: "",
    confirmPassword: "",
    number: "",
    roleId: "",
    status: "PENDING",
  });

  const [errors, setErrors] = useState({});
  const [apiResponse, setApiResponse] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [roles, setRoles] = useState([]);
  const [loadingRoles, setLoadingRoles] = useState(true);

  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const response = await getAllRoles();
        if (response.status === 200 && response.data.length > 0) {
          setRoles(response.data);
          setFormData(f => ({ ...f, roleId: response.data[0].id }));
        }
      } catch (error) {
        setApiResponse({
          type: "error",
          message: "Error cargando roles"
        });
      } finally {
        setLoadingRoles(false);
      }
    };
    fetchRoles();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(f => ({ ...f, [name]: value }));
    if (errors[name]) setErrors(err => ({ ...err, [name]: "" }));
  };

  const validateForm = () => {
    const newErrors = {};
    // Validación de campos existentes
    if (!formData.fullname.trim()) newErrors.fullname = "Nombre completo requerido";
    if (!formData.email.trim()) newErrors.email = "Email requerido";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) 
      newErrors.email = "Formato de email inválido";
    
    if (!formData.current_password) newErrors.current_password = "Contraseña requerida";
    else if (formData.current_password.length < 6)
      newErrors.current_password = "Mínimo 6 caracteres";
    
    if (formData.current_password !== formData.confirmPassword)
      newErrors.confirmPassword = "Las contraseñas no coinciden";
    
    if (!formData.number.trim()) newErrors.number = "Teléfono requerido";
    else if (!/^(\+?57)?3\d{9}$/.test(formData.number))
      newErrors.number = "Formato inválido (ej: 3001234567)";
    
    // Nueva validación para rol
    if (!formData.roleId) newErrors.roleId = "Selecciona un rol";
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setApiResponse(null);
    if (!validateForm()) return;

    setSubmitting(true);
    try {
      const payload = {
        fullname: formData.fullname,
        email: formData.email,
        current_password: formData.current_password,
        number: formData.number,
        roleId: formData.roleId,
        status: formData.status,
      };

console.log(payload);


      const { status, message } = await createUser(payload);

      setApiResponse({
        type: status === 201 ? "success" : "error",
        message
      });

      if (status === 201) {
        setFormData({
          fullname: "",
          email: "",
          current_password: "",
          confirmPassword: "",
          number: "",
          roleId: roles[0]?.id || "",
          status: "PENDING",
        });
      }
    } catch (err) {
      setApiResponse({
        type: "error",
        message: err.message || "Error del servidor"
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="user-form-container">
      <Title level={3}>Crear Nuevo Usuario</Title>

      {apiResponse && (
        <Alert
          message={apiResponse.message}
          type={apiResponse.type}
          showIcon
          closable
          onClose={() => setApiResponse(null)}
          style={{ marginBottom: 20 }}
        />
      )}

      <form className="form" onSubmit={handleSubmit}>
        <div className="form-row">
          <div className="form-group">
            <label>Nombre Completo</label>
            <input
              name="fullname"
              value={formData.fullname}
              onChange={handleChange}
              className={errors.fullname ? "input-error" : ""}
            />
            {errors.fullname && <span className="error-message">{errors.fullname}</span>}
          </div>

          <div className="form-group">
            <label>Email</label>
            <input
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              className={errors.email ? "input-error" : ""}
            />
            {errors.email && <span className="error-message">{errors.email}</span>}
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Contraseña</label>
            <input
              name="current_password"
              type="password"
              value={formData.current_password}
              onChange={handleChange}
              className={errors.current_password ? "input-error" : ""}
            />
            {errors.current_password && (
              <span className="error-message">{errors.current_password}</span>
            )}
          </div>

          <div className="form-group">
            <label>Confirmar Contraseña</label>
            <input
              name="confirmPassword"
              type="password"
              value={formData.confirmPassword}
              onChange={handleChange}
              className={errors.confirmPassword ? "input-error" : ""}
            />
            {errors.confirmPassword && (
              <span className="error-message">{errors.confirmPassword}</span>
            )}
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Teléfono</label>
            <input
              name="number"
              value={formData.number}
              onChange={handleChange}
              className={errors.number ? "input-error" : ""}
              placeholder="Ej: 3001234567"
            />
            {errors.number && <span className="error-message">{errors.number}</span>}
          </div>

          <div className="form-group">
            <label>Rol</label>
            {loadingRoles ? (
              <Spin />
            ) : (
              <select
                name="roleId"
                value={formData.roleId}
                onChange={handleChange}
                className={errors.roleId ? "input-error" : ""}
              >
                {roles.map(role => (
                  <option key={role.id} value={role.id}>
                    {role.name}
                  </option>
                ))}
              </select>
            )}
            {errors.roleId && <span className="error-message">{errors.roleId}</span>}
          </div>

          <div className="form-group">
            <label>Estado</label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
            >
              <option value="PENDING">Pendiente</option>
              <option value="ACTIVE">Activo</option>
              <option value="INACTIVE">Inactivo</option>
            </select>
          </div>
        </div>

        <div className="form-actions">
          <button
            type="submit"
            className="button button-primary"
            disabled={submitting || roles.length === 0}
          >
            {submitting ? <Spin /> : "Crear Usuario"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default UserForm;