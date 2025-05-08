import './Role.css';
import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { roleAPI } from "../../../api/role";
import {
  Alert,
  Spin,
  Modal,
  Input,
  Select,
  Button
} from "antd";
import { EditOutlined, DeleteOutlined } from "@ant-design/icons";

const RoleList = () => {

  const [loadingRoles, setLoadingRoles] = useState(true);
  const [apiResponse, setApiResponse] = useState(null);

  const [roles, setRoles] = useState([]);
  const [role, setRole] = useState([]);

  const [searchTerm, setSearchTerm] = useState('');
  const [expandedRole, setExpandedRole] = useState(null);

  const [editingRole, setEditingRole] = useState(null);

  const [isDeleteModalVisible, setDeleteModalVisible] = useState(false);
  const [deletingRoleId, setDeletingRoleId] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    fetchRoles();
  }, []);

  async function fetchRoles() {
    setLoadingRoles(true);
    try {
      const { status, data } = await roleAPI.getAllRoles();
      if (status === 200) {
        console.log(data);

        setRoles(
          data.map(u => ({
            ...u,
            name: u.name,
            description: u.description,
            permissions: u.permissions
          }))
        );
        console.log(roles);

      } else {
        setApiResponse({ type: "error", message: "Error loading roles" });
      }
    } catch {
      setApiResponse({ type: "error", message: "Error of network to loading roles" });
    }
    finally {
      setLoadingRoles(false);
    }
  }

  // Filtering logic
  const filteredRoles = roles.filter(role =>
    role.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    role.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Toggle role details
  const toggleRoleDetails = (roleId) => {
    setExpandedRole(expandedRole === roleId ? null : roleId);
  };

  if (loadingRoles) {
    return <div className="role-list-container"><Spin /> Loading roles...</div>;
  }


  const handleDeleteRole = async () => {
    setDeleting(true);
    try {
      const { status, message } = await roleAPI.deleteRole(deletingRoleId);
      setApiResponse({
        type: status === 200 ? "success" : "error",
        message: message || (status === 200 ? "Rol eliminado" : "Error al eliminar")
      });

      if (status === 200) {
        await fetchRoles();
      }
    } catch (error) {
      setApiResponse({
        type: "error",
        message: error.message || "Error de conexión"
      });
    } finally {
      setDeleting(false);
      setDeleteModalVisible(false);
      setDeletingRoleId(null);
    }
  };

  const handleUpdateRole = async () => {
    try {
      if (editingRole) {                
        navigate(`edit/${role.id}`, { state: { editMode: true, roleData: role  } })
      }
    } catch {
      setApiResponse({ type: "error", message: "Error of network to update the role" });
    }
  }

  return (
    <div className="role-list-container">
      {apiResponse && (
        <Alert
          style={{ marginBottom: 16 }}
          message={apiResponse.message}
          type={apiResponse.type}
          showIcon
          closable
          onClose={() => setApiResponse(null)}
        />
      )}
      <div className="page-header">
        <h1>Role Management</h1>
        <Link to="/dashboard/roles/create" className="button button-primary">
          <span className="button-icon add"></span>
          Add Role
        </Link>
      </div>

      <div className="filter-bar">
        <div className="search-field">
          <input
            type="text"
            placeholder="Search roles..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <span className="search-icon"></span>
        </div>
      </div>

      <div className="role-cards">
        {filteredRoles.length > 0 ? (
          filteredRoles.map(role => (
            <div key={role.id} className="role-card">
              <div className="role-card-header">
                <h3>{role.name}</h3>
                <div className="role-actions">
                  <button
                    className="action-button edit"
                    title="Edit Role"
                    onClick={() => {
                      setEditingRole(true)
                      setRole(role)
                      handleUpdateRole()
                    }}
                  >
                    <span className="action-icon edit-icon"></span>
                  </button>
                  <button
                    className="action-button delete"
                    title="Delete Role"
                    onClick={() => {
                      setDeletingRoleId(role.id);
                      setDeleteModalVisible(true)
                    }}
                  >
                    <span className="action-icon delete-icon"></span>
                  </button>
                </div>
              </div>

              <p className="role-description">{role.description}</p>

              <div className="role-meta">
                <span className="users-count">
                  <span className="users-icon"></span>
                  {role.usersCount} Users
                </span>
                <span className="permissions-count">
                  <span className="permissions-icon"></span>
                  {role.permissions.length} Permissions
                </span>
              </div>

              <button
                className={`toggle-details ${expandedRole === role.id ? 'active' : ''}`}
                onClick={() => toggleRoleDetails(role.id)}
              >
                {expandedRole === role.id ? 'Hide Details' : 'View Details'}
                <span className="toggle-arrow"></span>
              </button>

              {expandedRole === role.id && (
                <div className="role-details">
                  <h4>Permissions</h4>
                  <ul className="permission-list">
                    {role.permissions.map((permission, index) => (
                      <li key={index} className="permission-item">
                        <span className="permission-icon check"></span>
                        {permission.name}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="no-results">No roles found matching your criteria</div>
        )}
      </div>
      <Modal
        title="Confirmar eliminación"
        open={isDeleteModalVisible}
        onOk={handleDeleteRole}
        onCancel={() => {
          setDeleteModalVisible(false);
          setDeletingRoleId(null);
        }}
        confirmLoading={deleting}
        okText="Eliminar"
        cancelText="Cancelar"
      >
        <p>¿Estás seguro de que quieres eliminar este rol?</p>
        <p>Esta acción no se puede deshacer.</p>
      </Modal>
    </div>
  );
};

export default RoleList;