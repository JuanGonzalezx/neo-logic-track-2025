import React, { useState, useEffect } from "react";
import { Card, Input, Button, Alert, Typography, Spin } from "antd";
import { changeResetPassword } from "../../api/auth";
import { useNavigate, useLocation } from "react-router-dom";
import './Register.css';

const { Title } = Typography;

export default function NewPassword() {
    const navigate = useNavigate();
    const { state } = useLocation();
    const [loading, setLoading] = useState(false);
    const [form, setForm] = useState({
        newPassword: "",
        confirmNewPassword: ""
    });
    const [alert, setAlert] = useState(null);

    useEffect(() => {
        if (!state?.email) {
            navigate("/reset-password");
        }
    }, [navigate, state]);

    const onSubmit = async (e) => {
        e.preventDefault();
        setAlert(null);

        if (form.newPassword !== form.confirmNewPassword) {
            setAlert({ type: "error", message: "Las contraseñas no coinciden" });
            return;
        }

        setLoading(true);
        try {
            const { status, message } = await changeResetPassword(state.email, form);

            setAlert({
                type: status === 200 ? "success" : "error",
                message: message
            });

            if (status === 200) {
                setTimeout(() => navigate("/"), 2000); // Cambiado a /login
            }
        } catch (error) {
            setAlert({
                type: "error",
                message: error.message || "Error al actualizar la contraseña"
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="register-container" style={{ maxWidth: 400, margin: '50px auto' }}>
            <Card>
                <Title level={3} style={{ textAlign: 'center' }}>Restablecer contraseña</Title>

                {alert && (
                    <Alert
                        style={{ marginBottom: 16 }}
                        type={alert.type}
                        message={alert.message}
                        showIcon
                        closable
                        onClose={() => setAlert(null)}
                    />
                )}

                <form onSubmit={onSubmit}>
                    <div className="form-group">
                        <label>Nueva contraseña</label>
                        <Input.Password
                            placeholder="Mínimo 6 caracteres"
                            minLength={6}
                            required
                            value={form.newPassword}
                            onChange={e => setForm(f => ({ ...f, newPassword: e.target.value }))}
                        />
                    </div>

                    <div className="form-group">
                        <label>Confirmar contraseña</label>
                        <Input.Password
                            placeholder="Repite tu contraseña"
                            minLength={6}
                            required
                            value={form.confirmNewPassword}
                            onChange={e => setForm(f => ({ ...f, confirmNewPassword: e.target.value }))}
                        />
                    </div>

                    <Button
                        type="primary"
                        htmlType="submit"
                        block
                        loading={loading}
                        style={{ marginTop: 16 }}
                    >
                        {loading ? <Spin /> : "Establecer nueva contraseña"}
                    </Button>
                </form>
            </Card>
        </div>
    );
}