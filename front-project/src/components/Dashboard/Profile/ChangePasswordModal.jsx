import React, { useState } from 'react';
import { X } from 'lucide-react';
import './Profile.css';
import { auth } from '../../../api/auth';

const ChangePasswordModal = ({ onClose, onSubmit }) => {
    const [formData, setFormData] = React.useState({
        currentPassword: "",
        newPassword: "",
        confirmNewPassword: "",
    });

    const [errors, setErrors] = useState({});

    const validateForm = () => {
        const newErrors = {};

        if (!formData.currentPassword) {
            newErrors.currentPassword = "La contraseña actual es obligatoria";
        }

        if (!formData.newPassword) {
            newErrors.newPassword = 'La nueva contraseña es obligatoria';
        } else if (formData.newPassword.length < 6) {
            newErrors.newPassword = 'La contraseña debe tener al menos 6 caracteres';
        } else if (formData.currentPassword == formData.newPassword) {
            newErrors.newPassword = 'La contraseña actual y la nueva son iguales, por favor cámbiala';
        }

        if (!formData.confirmNewPassword) {
            newErrors.confirmNewPassword = 'Por favor confirma tu nueva contraseña';
        } else if (formData.newPassword !== formData.confirmNewPassword) {
            newErrors.confirmNewPassword = 'Las contraseñas no coinciden';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        try {
            const token = localStorage.getItem('token');

            const payloadBase64 = token.split('.')[1];

            const payloadJson = atob(payloadBase64); // el atob decodifica en base 64
            const payload = JSON.parse(payloadJson);

            const userId = payload.id;
            console.log(userId);
            console.log(formData.confirmNewPassword);
            
            const response = await auth.ChangePassword(formData, userId);
            console.log("respuesta del servidor: ", response);
            if (response.message.includes("successfully")) {
                onClose()
            } else {
                return
            }

        } catch (error) {
            console.log("Error on change password", error);
        }

    };

    const handleChange = (e) => {
        // Capturar nombre del input y valor que el usuario esté asignando
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    return (
        <div className="modal-overlay">
            <div className="modal">
                <div className="modal-header">
                    <h3>Cambiar contraseña</h3>
                    <button className="modal-close" onClick={onClose}>
                        <X size={20} />
                    </button>
                </div>
                <div className="modal-body">
                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label htmlFor="currentPassword">Contraseña actual</label>
                            <input
                                type="password"
                                id="currentPassword"
                                name="currentPassword"
                                value={formData.currentPassword}
                                placeholder="Ingresa tu contraseña actual"
                                onChange={handleChange}
                            />
                            {errors.currentPassword && <span className="field-error">{errors.currentPassword}</span>}

                        </div>

                        <div className="form-group">
                            <label htmlFor="newPassword">Nueva contraseña</label>
                            <input
                                type="password"
                                id="newPassword"
                                name="newPassword"
                                value={formData.newPassword}
                                placeholder="Ingresa tu nueva contraseña"
                                onChange={handleChange}
                            />
                            {errors.newPassword && (
                                <span className="field-error">{errors.newPassword}</span>
                            )}
                        </div>

                        <div className="form-group">
                            <label htmlFor="confirmNewPassword">Confirmar nueva contraseña</label>
                            <input
                                type="password"
                                id="confirmNewPassword"
                                name="confirmNewPassword"
                                value={formData.confirmNewPassword}
                                placeholder="Confirma la nueva contraseña"
                                onChange={handleChange}
                            />
                            {errors.confirmNewPassword && (
                                <span className="field-error">{errors.confirmNewPassword}</span>
                            )}
                        </div>

                        <div className="form-actions">
                            <button
                                type="button"
                                className="button button-secondary"
                                onClick={onClose}
                            >
                                Cancelar
                            </button>
                            <button
                                type="submit"
                                className="button button-primary"
                                onClick={validateForm}                            >
                                Actualizar contraseña
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default ChangePasswordModal;