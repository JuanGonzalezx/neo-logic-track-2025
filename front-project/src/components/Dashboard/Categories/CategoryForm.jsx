import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { categoryApi } from "../../../api/category"; // Adjust the import path as necessary
import { Alert, Spin } from "antd";
import "./Category.css";

const CategoryForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = !!id;

  const [formData, setFormData] = useState({
    nombre: "",
    descripcion: ""
  });

  const [errors, setErrors] = useState({});
  const [apiResponse, setApiResponse] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(isEditing);

  useEffect(() => {
    const fetchCategory = async () => {
      if (isEditing) {
        try {
          const response = await categoryApi.getCategoryById(id);
          if (response.status === 200) {
            setFormData({
              nombre: response.data.nombre,
              descripcion: response.data.descripcion || ""
            });
          } else {
            setApiResponse({ type: "error", message: "Categoría no encontrada" });
            navigate("/dashboard/inventory/categories");
          }
        } catch (error) {
          setApiResponse({ type: "error", message: "Error de conexión" });
        } finally {
          setLoading(false);
        }
      }
    };

    fetchCategory();
  }, [id, isEditing, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: "" }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.nombre.trim()) {
      newErrors.nombre = "El nombre de la categoría es obligatorio";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiResponse(null);

    if (!validateForm()) return;

    setSubmitting(true);
    try {
      let response;
      if (isEditing) {
        response = await categoryApi.updateCategory(id, formData);
      } else {
        response = await categoryApi.createCategory(formData);
      }

      if (response.status === 200 || response.status === 201) {
        setApiResponse({
          type: "success",
          message: isEditing ? "Categoría actualizada con éxito" : "Categoría creada con éxito"
        });

        setTimeout(() => {
          navigate("/dashboard/inventory/categories");
        }, 1500);
      } else {
        setApiResponse({
          type: "error",
          message: response.message || "Error al guardar la categoría"
        });
      }
    } catch (error) {
      setApiResponse({
        type: "error",
        message: error.message || "Error del servidor"
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="category-form-container">
        <Spin tip="Cargando categoría..." />
      </div>
    );
  }

  return (
    <div className="category-form-container">
      <h1>{isEditing ? "Editar Categoría" : "Crear Nueva Categoría"}</h1>

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
        <div className="form-group">
          <label>Nombre de la Categoría</label>
          <input
            name="nombre"
            value={formData.nombre}
            onChange={handleChange}
            className={errors.nombre ? "input-error" : ""}
          />
          {errors.nombre && <span className="error-message">{errors.nombre}</span>}
        </div>

        <div className="form-group">
          <label>Descripción</label>
          <textarea
            name="descripcion"
            value={formData.descripcion}
            onChange={handleChange}
            rows="4"
          />
        </div>

        <div className="form-actions">
          <button
            type="button"
            className="button button-secondary"
            onClick={() => navigate("/dashboard/inventory/categories")}
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="button button-primary"
            disabled={submitting}
          >
            {submitting ? <Spin /> : (isEditing ? "Actualizar Categoría" : "Crear Categoría")}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CategoryForm;
