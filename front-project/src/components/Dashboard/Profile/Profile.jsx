import React, { useState, useEffect } from 'react';
import { KeyRound } from 'lucide-react';
import ChangePasswordModal from './ChangePasswordModal';
import { getUserFromToken } from "../../../api/auth";
import './Profile.css';

const Profile = () => {
    const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchUser = async () => {
            const token = localStorage.getItem('token');
            if (!token) return setLoading(false);
            const response = await getUserFromToken({ token });
            if (response && response.status === 201) {
                setUser(response);
            }
            setLoading(false);
        };
        fetchUser();
    }, []);

    // Get user initials for avatar
    const getUserInitials = (name) => {
        if (!name) return '';
        return name
            .split(' ')
            .map((part) => part[0])
            .join('')
            .toUpperCase();
    };

    if (loading) return <div>Cargando...</div>;
    if (!user) return <div>No se encontraron datos de usuario.</div>;

    return (
        <div className="profile-container">
            <div className="page-header">
                <h1>Perfil de usuario</h1>
                <button
                    className="button button-primary"
                    onClick={() => setIsPasswordModalOpen(true)}
                >
                    <KeyRound size={16} className="mr-2" />
                    Cambiar contraseña
                </button>
            </div>

            <div className="profile-card">
                <div className="profile-header">
                    <div className="profile-avatar-init">
                        {getUserInitials(user.fullname)}
                    </div>
                    <div className="profile-title">
                        <h2>{user.fullname}</h2>
                        <span className={`status-badge active`}>
                            Activo
                        </span>
                    </div>
                </div>

                <div className="info-section">
                    <h3>Información personal</h3>
                    <div className="info-grid">
                        <div className="info-item">
                            <div className="info-label">Nombre</div>
                            <div>{user.fullname}</div>
                        </div>
                        <div className="info-item">
                            <div className="info-label">Correo electrónico</div>
                            <div>{user.email}</div>
                        </div>
                        <div className="info-item">
                            <div className="info-label">Teléfono</div>
                            <div>{user.telefono}</div>
                        </div>
                        <div className="info-item">
                            <div className="info-label">Rol</div>
                            <div>{user.role?.name}</div>
                        </div>
                        <div className="info-item">
                            <div className="info-label">Estado</div>
                            <div className="info-value">
                                <div>Activo</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {isPasswordModalOpen && (
                <ChangePasswordModal
                    onClose={() => setIsPasswordModalOpen(false)}
                    onSubmit={(oldPassword, newPassword) => {
                        console.log('Password change requested', { oldPassword, newPassword });
                        setIsPasswordModalOpen(false);
                    }}
                />
            )}
        </div>
    );
};

export default Profile;