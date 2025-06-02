import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from 'react-router-dom';
import { permissionAPI } from "../../../api/permission";

import './Role.css';
import { roleAPI } from "../../../api/role";

const RoleForm = ({ editMode = false, roleData = null }) => {
  const navigate = useNavigate();
  const [apiResponse, setApiResponse] = useState(null);
  const [errors, setErrors] = useState({});
  const [permissionsData, setPermissions] = useState([]);

  const location = useLocation();
  const role = location.state?.roleData ?? roleData;
  const isEdit = location.state?.editMode ?? editMode;

  useEffect(() => {
    fetchPermissions()
  }, []); // Dependencia para reaccionar a cambios


  const groupPermissionsByCategory = (permissions) => {
    return permissions.reduce((acc, perm) => {
      const category = perm.category === "Role Managament"
        ? "Role Management"
        : perm.category || 'Uncategorized';

      if (!acc[category]) acc[category] = [];

      acc[category].push({
        id: perm.id,
        perm: `${perm.method}${perm.url}`,
        name: perm.name
      });

      return acc;
    }, {});
  };


  async function fetchPermissions() {
    try {
      const { status, data } = await permissionAPI.getAllPermissions();
      if (status === 200) {
        const groupedPermissions = groupPermissionsByCategory(data);
        setPermissions(
          groupedPermissions
        );

        // Si estamos en modo edición y hay datos del rol
        if (isEdit && role) {
          setFormData(prev => ({
            ...prev,
            permissions: role.permissions?.map(p => p.id) || []
          }));
        }
      } else {
        setApiResponse({ type: "error", message: "Error cargando usuarios" });
      }
    } catch {
      setApiResponse({ type: "error", message: "Error de red al cargar usuarios" });
    }
  }

  // Initialize form data
  const [formData, setFormData] = useState({
    id: role?.id || '',
    name: role?.name || '',
    description: role?.description || '',
    permissions: []
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });

    // Clear error when field is edited
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: ''
      });
    }
  };

  const handlePermissionChange = (e) => {
    const { value, checked } = e.target;

    if (checked) {
      setFormData({
        ...formData,
        permissions: [...formData.permissions, value]
      });
    } else {
      setFormData({
        ...formData,
        permissions: formData.permissions.filter(p => p !== value)
      });
    }
  };

  const handleSelectAll = (category) => {
    const categoryPermissionIds = permissionsData[category].map(p => p.id);
    const allSelected = categoryPermissionIds.every(id => formData.permissions.includes(id));

    if (allSelected) {
      // Deselect all in this category
      setFormData({
        ...formData,
        permissions: formData.permissions.filter(p => !categoryPermissionIds.includes(p))
      });
    } else {
      // Select all in this category
      const newPermissions = [
        ...formData.permissions,
        ...categoryPermissionIds.filter(id => !formData.permissions.includes(id))
      ];
      setFormData({
        ...formData,
        permissions: newPermissions
      });
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'El nombre del rol es obligatorio';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'La descripción es obligatoria';
    }

    if (formData.permissions.length === 0) {
      newErrors.permissions = 'Debes seleccionar al menos un permiso';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (validateForm()) {
        const payload = {
          name: formData.name,
          description: formData.description,
          permissionIds: formData.permissions
        };
        if (isEdit) {
          const { status, message } = await roleAPI.updateRole(formData.id, payload);
          setApiResponse({
            type: status === 200 ? "success" : "error",
            message: message || (status === 200 ? "Role successfully updated" : "Error to update")
          });

          if (status === 200) {
            await fetchRoles();
          }
        } else {
          const { status, message } = await roleAPI.createRole(payload);
          setApiResponse({
            type: status === 200 ? "success" : "error",
            message: message || (status === 200 ? "Role successfully created" : "Error to create")
          });

          if (status === 200) {
            await fetchRoles();
          }
        }

      }
    } catch (error) {
      setApiResponse({
        type: "error",
        message: error.message || "Error de conexión"
      });
    } finally {
      navigate('/dashboard/roles');
    }
  }



  const handleCancel = () => {
    navigate('/dashboard/roles');
  };

  return (
    <div className="role-form-container">
      <div className="page-header">
        <h1>{isEdit ? 'Editar rol' : 'Crear nuevo rol'}</h1>
      </div>

      <form className="form" onSubmit={handleSubmit}>
        <div className="form-section">
          <h2 className="form-section-title">Información del rol</h2>

          <div className="form-group">
            <label htmlFor="name">Nombre del rol</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className={errors.name ? 'input-error' : ''}
            />
            {errors.name && <span className="error-message">{errors.name}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="description">Descripción</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows="3"
              className={errors.description ? 'input-error' : ''}
            ></textarea>
            {errors.description && <span className="error-message">{errors.description}</span>}
          </div>
        </div>

        <div className="form-section">
          <h2 className="form-section-title">Permisos</h2>
          {errors.permissions && <span className="error-message">{errors.permissions}</span>}

          <div className="permissions-container">
            {Object.entries(permissionsData).map(([category, permissions]) => (
              <div key={category} className="permission-category">
                <div className="category-header">
                  <h3>{category}</h3>
                  <button
                    type="button"
                    className="select-all-button"
                    onClick={() => handleSelectAll(category)}
                  >
                    {permissions.every(p => formData.permissions.includes(p.id))
                      ? 'Deseleccionar todo'
                      : 'Seleccionar todo'}
                  </button>
                </div>

                <div className="permission-options">
                  {permissions.map(permission => (
                    <div key={permission.id} className="permission-option">
                      <input
                        type="checkbox"
                        id={permission.id}
                        value={permission.id}
                        checked={formData.permissions.includes(permission.id)}
                        onChange={handlePermissionChange}
                      />
                      <label htmlFor={permission.id}>{permission.name}</label>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="form-actions">
          <button type="button" className="button button-secondary" onClick={handleCancel}>
            Cancelar
          </button>
          <button type="submit" className="button button-primary">
            {isEdit ? 'Actualizar rol' : 'Crear rol'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default RoleForm;