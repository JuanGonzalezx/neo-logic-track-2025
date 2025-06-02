import React, { useState } from 'react';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { Card, Input, Button, Alert, Spin, Typography } from 'antd';
import { useNavigate } from 'react-router-dom';
import { requestPasswordReset } from '../../api/auth'; // solo usamos esta
import './requestReset.css';

const { Title } = Typography;

export default function RequestReset() {
    const [email, setEmail] = useState('');
    const [alert, setAlert] = useState(null);
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();

    const handleSendEmail = async e => {
        e.preventDefault();
        setAlert(null);
        if (!email) {
            setAlert({ type: 'error', message: 'El correo electrónico es obligatorio' });
            return;
        }

        setLoading(true);
        try {
            const { status, message } = await requestPasswordReset({ email });
            setAlert({ type: status === 200 ? 'success' : 'error', message });

            // Si quieres redirigir después de mostrar mensaje:
            // if (status === 200) {
            //     setTimeout(() => navigate('/'), 4000);
            // }

        } catch (err) {
            setAlert({ type: 'error', message: err.message || 'Error de red' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="register-container" style={{ maxWidth: 400, margin: '50px auto' }}>
            <Card>
                <Button 
                    type="link"
                    icon={<ArrowLeftOutlined />} 
                    onClick={() => navigate('/')} 
                    style={{ padding: 0, marginBottom: 16 }}
                >
                  Volver al inicio
                </Button>
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

                <form onSubmit={handleSendEmail}>
                  <div className="form-group">
                    <label>Correo electrónico</label>
                    <Input
                      type="email"
                      placeholder="Ingresa tu correo electrónico"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                    />
                  </div>
                  <Button className="reset-button"
                      block
                      type="primary"
                      htmlType="submit"
                      disabled={loading}
                      style={{ marginTop: 16 }}
                  >
                    {loading ? <Spin /> : 'Enviar enlace de restablecimiento'}
                  </Button>
                </form>
            </Card>
        </div>
    );
}
