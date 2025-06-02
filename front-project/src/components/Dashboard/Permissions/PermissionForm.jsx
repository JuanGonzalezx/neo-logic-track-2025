import { Spin, Typography, Alert } from "antd";
import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from 'react-router-dom';
import { permissionAPI } from "../../../api/permission";
import "./Permission.css";

const { Title } = Typography;

const PermissionForm = ({ editMode = false, permissionData = null }) => {
    const navigate = useNavigate();


    const [errors, setErrors] = useState({});
    const [apiResponse, setApiResponse] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    const location = useLocation();
    const permission = location.state?.permissionData ?? permissionData;
    const isEdit = location.state?.editMode ?? editMode;


    const [formData, setFormData] = useState({
        id: permission?.id || '',
        name: permission?.name || "",
        url: permission?.url || "",
        method: permission?.url || "GET",
        description: permission?.description || "",
        category: permission?.category || ""
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(f => ({ ...f, [name]: value }));
        if (errors[name]) setErrors(err => ({ ...err, [name]: "" }));
    };

    const validateForm = () => {
        const newErrors = {};
        if (!formData.name.trim()) newErrors.name = "El nombre es obligatorio";
        if (!formData.url.trim()) newErrors.url = "La URL es obligatoria";
        if (!formData.description.trim()) newErrors.method = "La descripción es obligatoria";
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleCancel = () => {
        navigate("/dashboard/permissions")
    }

    const handleSubmit = async e => {
        e.preventDefault();
        try {
            if (validateForm()) {
                const payload = {
                    name: formData.name,
                    url: formData.url,
                    method: formData.method,
                    description: formData.description,
                    category: formData.category
                };


                if (isEdit) {
                    const { status, message } = await permissionAPI.updatePermission(formData.id, payload);
                    setApiResponse({
                        type: status === 200 ? "success" : "error",
                        message: message || (status === 200 ? "Permiso actualizado correctamente" : "Error al actualizar")
                    });
                } else {
                    console.log(payload);
                    const { status, message } = await permissionAPI.createPermission(payload);
                    setApiResponse({
                        type: status === 200 ? "success" : "error",
                        message: message || (status === 200 ? "Permiso creado correctamente" : "Error al crear")
                    });
                }
            }

        } catch (err) {
            setApiResponse({
                type: "error",
                message: err.message || "Error del servidor"
            });
        } finally {
            navigate('/dashboard/permissions');
        }
    };

    return (
        <div className="permission-form-container">
            <Title level={3}>{isEdit ? 'Editar Permiso' : 'Crear Nuevo Permiso'}</Title>

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
                        <label>Nombre del Permiso</label>
                        <input
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            className={errors.name ? "input-error" : ""}
                        />
                        {errors.name && <span className="error-message">{errors.name}</span>}
                    </div>

                    <div className="form-group">
                        <label>URL</label>
                        <input
                            name="url"
                            value={formData.url}
                            onChange={handleChange}
                            className={errors.url ? "input-error" : ""}
                            placeholder="/api/permissions"
                        />
                        {errors.url && <span className="error-message">{errors.url}</span>}
                    </div>

                    <div className="form-group">
                        <label>Método</label>
                        <select
                            name="method"
                            value={formData.method}
                            onChange={handleChange}
                            className={errors.method ? "input-error" : ""}
                        >
                            <option value="GET">GET</option>
                            <option value="POST">POST</option>
                            <option value="PUT">PUT</option>
                            <option value="DELETE">DELETE</option>
                            <option value="PATCH">PATCH</option>
                        </select>
                        {errors.method && <span className="error-message">{errors.method}</span>}
                    </div>

                    <div className="form-group">
                        <label>Descripción</label>
                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            rows={3}
                        />
                    </div>
                </div>

                <div className="form-group">
                    <label>Categoría</label>
                    <input
                        name="category"
                        value={formData.category}
                        onChange={handleChange}
                        className={errors.category ? "input-error" : ""}
                        placeholder="Role Management"
                    />
                    {errors.category && <span className="error-message">{errors.category}</span>}
                </div>

                <div className="form-actions">
                    <button type="button" className="button button-secondary" onClick={handleCancel}>
                        Cancelar
                    </button>
                    <button
                        type="submit"
                        className="button button-primary"
                        disabled={submitting}
                    >
                        {isEdit ? "Actualizar Permiso" : "Crear Permiso"}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default PermissionForm;
