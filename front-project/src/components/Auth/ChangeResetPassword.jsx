// src/components/Auth/ChangeResetPassword.jsx
import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { changeResetPassword } from '../../api/auth';
import { Input, Button, Card, Alert } from 'antd';

export default function ChangeResetPassword() {
  const { token } = useParams(); // ← obtenemos el token de la URL
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [alert, setAlert] = useState(null);
  const navigate = useNavigate();

 const handleSubmit = async e => {
  e.preventDefault();

  if (!password || password !== confirm) {
    setAlert({ type: 'error', message: 'Las contraseñas no coinciden' });
    return;
  }

  try {
    const res = await changeResetPassword({
      token, // viene de useParams
      newPassword: password,
      confirmNewPassword: confirm,
    });

    setAlert({ type: res.status === 200 ? 'success' : 'error', message: res.message });

    if (res.status === 200) {
      setTimeout(() => navigate('/'), 3000);
    }
  } catch (err) {
    setAlert({ type: 'error', message: 'Error en el servidor' });
  }
};
  return (
    <div style={{ maxWidth: 400, margin: '50px auto' }}>
      <Card title="Cambiar contraseña">
        {alert && <Alert style={{ marginBottom: 16 }} type={alert.type} message={alert.message} />}
        <form onSubmit={handleSubmit}>
          <Input.Password
            placeholder="Nueva contraseña"
            value={password}
            onChange={e => setPassword(e.target.value)}
            style={{ marginBottom: 16 }}
          />
          <Input.Password
            placeholder="Confirmar nueva contraseña"
            value={confirm}
            onChange={e => setConfirm(e.target.value)}
            style={{ marginBottom: 16 }}
          />
          <Button type="primary" block htmlType="submit">
            Cambiar contraseña
          </Button>
        </form>
      </Card>
    </div>
  );
}
