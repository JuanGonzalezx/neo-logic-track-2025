import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getAllUsers, updateUser, deleteUser } from "../../../api/user";
import { getAllRoles } from "../../../api/user";
import {
  Alert,
  Spin,
  Modal,
  Input,
  Select,
  Button
} from "antd";
import { EditOutlined, DeleteOutlined } from "@ant-design/icons";
import "./User.css";

const { Option } = Select;

const UserList = () => {
  const [users, setUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [apiResponse, setApiResponse] = useState(null);
  const [roles, setRoles] = useState([]);
  const [loadingRoles, setLoadingRoles] = useState(true);
  const [permissions, setPermissions] = useState([]);

  // Estados para filtros y paginación
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRole, setFilterRole] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 5;

  // Estados para edición
  const [isEditModalVisible, setEditModalVisible] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [editErrors, setEditErrors] = useState({});
  const [savingEdit, setSavingEdit] = useState(false);

  // Estados para eliminación
  const [isDeleteModalVisible, setDeleteModalVisible] = useState(false);
  const [deletingUserId, setDeletingUserId] = useState(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Obtener roles
        const rolesResponse = await getAllRoles();
        if (rolesResponse.status !== 200) {
          setApiResponse({ type: "error", message: "Error cargando roles" });
          return;
        }
        setRoles(rolesResponse.data);

        // Obtener usuarios
        const usersResponse = await getAllUsers();
        if (usersResponse.status === 200) {
          const processedUsers = usersResponse.data.map(u => ({
            ...u,
            name: u.fullname || 'Nombre no disponible',
            role: getRoleName(u.roleId, rolesResponse.data),
            status: u.status,
          }));
          setUsers(processedUsers);
        } else {
          setApiResponse({ type: "error", message: "Error cargando usuarios" });
        }
      } catch (error) {
        setApiResponse({ type: "error", message: "Error de conexión" });
      } finally {
        setLoadingUsers(false);
        setLoadingRoles(false);
      }
    };

    fetchData();

    // Load permissions from local storage
    const storedPermissions = JSON.parse(localStorage.getItem('permissions')) || [];
    setPermissions(storedPermissions);
  }, []);

  const processUsers = (users, roles) => {
    return users.map(u => ({
      ...u,
      name: u.fullname || 'Nombre no disponible',
      role: getRoleName(u.roleId, roles),
      status: u.status,
    }));
  };

  const getRoleName = (roleId, roles) => {
    const role = roles.find(r => r.id === roleId);
    return role ? role.name : 'Sin rol';
  };

  const hasPermission = (permissionId) => permissions.includes(permissionId);

  const handleDeleteUser = async () => {
    setDeleting(true);
    try {
      const { status, message } = await deleteUser(deletingUserId);
      setApiResponse({
        type: status === 200 ? "success" : "error",
        message: message || (status === 200 ? "Usuario eliminado" : "Error al eliminar")
      });

      if (status === 200) {
        const newUsers = users.filter(u => u.id !== deletingUserId);
        setUsers(newUsers);
      }
    } catch (error) {
      setApiResponse({ type: "error", message: "Error de conexión" });
    } finally {
      setDeleting(false);
      setDeleteModalVisible(false);
    }
  };

  const openEditModal = (user) => {
    setEditingUser(user);
    setEditForm({
      fullname: user.fullname,
      email: user.email,
      current_password: "",
      number: user.number,
      roleId: user.roleId,
      status: user.status,
    });
    setEditModalVisible(true);
  };

  const validateEdit = () => {
    const errs = {};
    if (!editForm.fullname.trim()) errs.fullname = "Nombre es requerido";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(editForm.email)) errs.email = "Email inválido";
    if (editForm.current_password && editForm.current_password.length < 6)
      errs.current_password = "Mínimo 6 caracteres";
    if (!/^(\+?57)?3\d{9}$/.test(editForm.number)) errs.number = "Formato de teléfono inválido";
    setEditErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleEditSave = async () => {
    if (!validateEdit()) return;
    setSavingEdit(true);
    try {
      const payload = {
        fullname: editForm.fullname,
        email: editForm.email,
        number: editForm.number,
        roleId: editForm.roleId,
        status: editForm.status,
      };

      if (editForm.current_password) {
        payload.current_password = editForm.current_password;
      }

      const { status, data } = await updateUser(editingUser.id, payload);
      if (status === 200) {
        setApiResponse({ type: "success", message: "Usuario actualizado" });
        const updatedUsers = users.map(u =>
          u.id === editingUser.id ? { ...u, ...payload, role: getRoleName(payload.roleId, roles) } : u
        );
        setUsers(updatedUsers);
        setEditModalVisible(false);
      } else {
        setApiResponse({ type: "error", message: data?.message || "Error al guardar" });
      }
    } catch (error) {
      setApiResponse({ type: "error", message: "Error de servidor" });
    } finally {
      setSavingEdit(false);
    }
  };

  // Filtrado y paginación
  const filteredUsers = users.filter(u => {
    const searchMatch = [u.name, u.email].some(field =>
      field.toLowerCase().includes(searchTerm.toLowerCase())
    );
    const roleMatch = !filterRole || getRoleName(u.roleId, roles) === filterRole;
    const statusMatch = !filterStatus || u.status === filterStatus;
    return searchMatch && roleMatch && statusMatch;
  });

  const totalPages = Math.ceil(filteredUsers.length / pageSize);
  const paginatedUsers = filteredUsers.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  if (loadingUsers || loadingRoles) {
    return (
      <div className="user-list-container">
        <Spin tip="Cargando datos..." />
      </div>
    );
  }

  return (
    <div className="user-list-container">
      {apiResponse && (
        <Alert
          type={apiResponse.type}
          message={apiResponse.message}
          showIcon
          closable
          onClose={() => setApiResponse(null)}
        />
      )}

      <div className="page-header">
        <h1>Administración de Usuarios</h1>
        <Link
          to="/dashboard/users/create"
          className={`button button-primary ${!hasPermission('681437a9fbaec847ba2ecc03') ? 'disabled' : ''}`}
          style={{ pointerEvents: hasPermission('681437a9fbaec847ba2ecc03') ? 'auto' : 'none' }}
        >
          <span className="button-icon add" /> Nuevo Usuario
        </Link>
      </div>

      <div className="filter-bar">
        <Input.Search
          placeholder="Buscar usuarios..."
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setCurrentPage(1);
          }}
          style={{ width: 250 }}
        />
        <Select
          placeholder="Todos los roles"
          onChange={(value) => {
            setFilterRole(value);
            setCurrentPage(1);
          }}
          style={{ width: 200 }}
        >
          <Option value="">Todos los roles</Option>
          {roles.map(role => (
            <Option key={role.id} value={role.name}>
              {role.name}
            </Option>
          ))}
        </Select>
        <Select
          placeholder="Todos los estados"
          onChange={(value) => {
            setFilterStatus(value);
            setCurrentPage(1);
          }}
          style={{ width: 200 }}
        >
          <Option value="">Todos los estados</Option>
          <Option value="ACTIVE">Activo</Option>
          <Option value="INACTIVE">Inactivo</Option>
          <Option value="PENDING">Pendiente</Option>
        </Select>
      </div>

      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Email</th>
              <th>Rol</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {paginatedUsers.map(user => (
              <tr key={user.id}>
                <td>{user.name}</td>
                <td>{user.email}</td>
                <td>{user.role}</td>
                <td>
                  <span className={`status-badge ${user.status.toLowerCase()}`}>
                    {user.status === 'ACTIVE' && 'Activo'}
                    {user.status === 'INACTIVE' && 'Inactivo'}
                    {user.status === 'PENDING' && 'Pendiente'}
                  </span>
                </td>
                <td>
                  <div className="table-actions">
                    <Button
                      icon={<EditOutlined />}
                      onClick={() => openEditModal(user)}
                      disabled={!hasPermission('68143793fbaec847ba2ecc02')}
                      className={!hasPermission('68143793fbaec847ba2ecc02') ? 'disabled' : ''}
                    />
                    <Button
                      danger
                      icon={<DeleteOutlined />}
                      onClick={() => {
                        setDeletingUserId(user.id);
                        setDeleteModalVisible(true);
                      }}
                      disabled={!hasPermission('681437c0fbaec847ba2ecc04')}
                      className={!hasPermission('681437c0fbaec847ba2ecc04') ? 'disabled' : ''}
                    />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="pagination">
        <Button
          disabled={currentPage === 1}
          onClick={() => setCurrentPage(currentPage - 1)}
        >
          Anterior
        </Button>
        <span>
          Página {currentPage} de {totalPages}
        </span>
        <Button
          disabled={currentPage === totalPages}
          onClick={() => setCurrentPage(currentPage + 1)}
        >
          Siguiente
        </Button>
      </div>

      {/* Modal de Edición */}
      <Modal
        title={`Editar ${editingUser?.name}`}
        open={isEditModalVisible}
        onCancel={() => setEditModalVisible(false)}
        onOk={handleEditSave}
        confirmLoading={savingEdit}
        destroyOnClose
      >
        <div className="form-group">
          <label>Nombre Completo</label>
          <Input
            value={editForm.fullname}
            onChange={(e) => setEditForm({ ...editForm, fullname: e.target.value })}
          />
          {editErrors.fullname && (
            <div className="error-text">{editErrors.fullname}</div>
          )}
        </div>

        <div className="form-group">
          <label>Email</label>
          <Input
            value={editForm.email}
            onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
          />
          {editErrors.email && (
            <div className="error-text">{editErrors.email}</div>
          )}
        </div>

        <div className="form-group">
          <label>Nueva Contraseña</label>
          <Input.Password
            value={editForm.current_password}
            onChange={(e) => setEditForm({ ...editForm, current_password: e.target.value })}
          />
          {editErrors.current_password && (
            <div className="error-text">{editErrors.current_password}</div>
          )}
        </div>

        <div className="form-group">
          <label>Teléfono</label>
          <Input
            value={editForm.number}
            onChange={(e) => setEditForm({ ...editForm, number: e.target.value })}
          />
          {editErrors.number && (
            <div className="error-text">{editErrors.number}</div>
          )}
        </div>

        <div className="form-group">
          <label>Rol</label>
          <Select
            value={editForm.roleId}
            onChange={(value) => setEditForm({ ...editForm, roleId: value })}
            options={roles.map(role => ({
              value: role.id,
              label: role.name
            }))}
          />
        </div>

        <div className="form-group">
          <label>Estado</label>
          <Select
            value={editForm.status}
            onChange={(value) => setEditForm({ ...editForm, status: value })}
            options={[
              { value: 'ACTIVE', label: 'Activo' },
              { value: 'INACTIVE', label: 'Inactivo' },
              { value: 'PENDING', label: 'Pendiente' }
            ]}
          />
        </div>
      </Modal>

      {/* Modal de Eliminación */}
      <Modal
        title="Confirmar Eliminación"
        open={isDeleteModalVisible}
        onOk={handleDeleteUser}
        onCancel={() => setDeleteModalVisible(false)}
        okText="Eliminar"
        cancelText="Cancelar"
        confirmLoading={deleting}
      >
        <p>¿Está seguro que desea eliminar este usuario permanentemente?</p>
        <p>Esta acción no puede deshacerse.</p>
      </Modal>
    </div>
  );
};

export default UserList;