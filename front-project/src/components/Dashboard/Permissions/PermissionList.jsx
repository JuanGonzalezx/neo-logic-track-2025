import './Permission.css';
import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { permissionAPI } from "../../../api/permission";
import {
    Alert,
    Spin,
    Modal,
} from "antd";

const PermissionList = () => {

    const [permissions, setPermissions] = useState([]);
    const [permission, setPermission] = useState([]);
    const [loading, setLoading] = useState(true);
    const [apiResponse, setApiResponse] = useState(null);

    const [searchTerm, setSearchTerm] = useState('');

    const [editingPermission, setEditingPermission] = useState(null);

    const [isDeleteModalVisible, setDeleteModalVisible] = useState(false);
    const [deletingPermissionId, setDeletingPermissionId] = useState(null);
    const [deleting, setDeleting] = useState(false);

    const navigate = useNavigate();

    useEffect(() => {
        fetchPermissions();
    }, []);

    const fetchPermissions = async () => {
        setLoading(true);
        try {
            const { status, data } = await permissionAPI.getAllPermissions();
            if (status === 200) {
                setPermissions(data);
            } else {
                setApiResponse({ type: "error", message: "Error loading permissions" });
            }
        } catch {
            setApiResponse({ type: "error", message: "Network error while loading permissions" });
        } finally {
            setLoading(false);
        }
    };

    const filteredPermissions = permissions.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.url.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.method.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleDeletePermission = async () => {
        setDeleting(true);
        try {
            const { status, message } = await permissionAPI.deletePermission(deletingPermissionId);
            setApiResponse({
                type: status === 200 ? "success" : "error",
                message: message || (status === 200 ? "Permiso eliminado" : "Error al eliminar")
            });

            if (status === 200) {
                await fetchPermissions();
            }
        } catch (error) {
            setApiResponse({
                type: "error",
                message: error.message || "Error de conexión"
            });
        } finally {
            setDeleting(false);
            setDeleteModalVisible(false);
            setDeletingPermissionId(null);
        }
    };

    const handleUpdatePermission = async () => {
        try {
            console.log(permission);
            
            if (editingPermission) {
                navigate(`edit/${permission.id}`, { state: { editMode: true, permissionData: permission } })
            }
        } catch {
            setApiResponse({ type: "error", message: "Error of network to update the permission" });
        }
    }

    if (loading) {
        return <div className="permission-list-container"><Spin /> Cargando permisos...</div>;
    }

    return (
        <div className="permission-list-container">
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
                <h1>Permission Management</h1>
                <Link to="/dashboard/permissions/create" className="button button-primary">
                    <span className="button-icon add"></span>
                    Add Permission
                </Link>
            </div>

            <div className="filter-bar">
                <div className="search-field">
                    <input
                        type="text"
                        placeholder="Search permissions..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <span className="search-icon"></span>
                </div>
            </div>

            <div className="permission-cards">
                {filteredPermissions.length > 0 ? (
                    filteredPermissions.map(permission => (
                        <div key={permission.id} className="permission-card">
                            <div className="permission-card-header">
                                <h3>{permission.name}</h3>
                                <div className="permission-actions">
                                    <button
                                        className="action-button edit"
                                        title="Edit Permission"
                                        onClick={() => {
                                            setEditingPermission(true)
                                            setPermission(permission)
                                            handleUpdatePermission()
                                        }}
                                    >
                                        <span className="action-icon edit-icon"></span>
                                    </button>
                                    <button
                                        className="action-button delete"
                                        title="Delete Permission"
                                        onClick={() => {
                                            setDeletingPermissionId(permission.id);
                                            setDeleteModalVisible(true);
                                        }}
                                    >
                                        <span className="action-icon delete-icon"></span>
                                    </button>
                                </div>
                            </div>

                            <p className="permission-description">{permission.description}</p>

                            <div className="permission-meta">
                                <span className="method">Method: <strong>{permission.method}</strong></span>
                                <span className="url">URL: <strong>{permission.url}</strong></span>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="no-results">No permissions found matching your criteria</div>
                )}
            </div>

            <Modal
                title="Confirmar eliminación"
                open={isDeleteModalVisible}
                onOk={handleDeletePermission}
                onCancel={() => {
                    setDeleteModalVisible(false);
                    setDeletingPermissionId(null);
                }}
                confirmLoading={deleting}
                okText="Eliminar"
                cancelText="Cancelar"
            >
                <p>¿Estás seguro de que quieres eliminar este permiso?</p>
                <p>Esta acción no se puede deshacer.</p>
            </Modal>
        </div>
    );
};

export default PermissionList;
