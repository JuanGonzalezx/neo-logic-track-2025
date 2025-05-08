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
            newErrors.currentPassword = "Is required"
        }

        if (!formData.newPassword) {
            newErrors.newPassword = 'New password is required';
        } else if (formData.newPassword.length < 6) {
            newErrors.newPassword = 'Password must be at least 6 characters';
        } else if (formData.currentPassword == formData.newPassword) {
            newErrors.newPassword = 'The current and new password are the same, change please';
        }

        if (!formData.confirmNewPassword) {
            newErrors.confirmNewPassword = 'Please confirm your new password';
        } else if (formData.newPassword !== formData.confirmNewPassword) {
            newErrors.confirmNewPassword = 'Passwords do not match';
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
                    <h3>Change Password</h3>
                    <button className="modal-close" onClick={onClose}>
                        <X size={20} />
                    </button>
                </div>
                <div className="modal-body">
                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label htmlFor="currentPassword">Current Password</label>
                            <input
                                type="currentPassword"
                                id="currentPassword"
                                name="currentPassword"
                                value={formData.currentPassword}
                                placeholder="Enter your actual password"
                                onChange={handleChange}
                            />
                            {errors.currentPassword && <span className="field-error">{errors.currentPassword}</span>}

                        </div>

                        <div className="form-group">
                            <label htmlFor="newPassword">New Password</label>
                            <input
                                type="password"
                                id="newPassword"
                                name="newPassword"
                                value={formData.newPassword}
                                placeholder="Enter your new password"
                                onChange={handleChange}
                            />
                            {errors.newPassword && (
                                <span className="field-error">{errors.newPassword}</span>
                            )}
                        </div>

                        <div className="form-group">
                            <label htmlFor="confirmNewPassword">Confirm New Password</label>
                            <input
                                type="password"
                                id="confirmNewPassword"
                                name="confirmNewPassword"
                                value={formData.confirmNewPassword}
                                placeholder="Confirm the new password"
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
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="button button-primary"
                                onClick={validateForm}                            >
                                Update Password
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default ChangePasswordModal;