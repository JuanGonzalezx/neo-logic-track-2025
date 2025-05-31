// src/components/Auth/ChangeResetPassword.jsx
import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { changeResetPassword } from '../../api/auth';
import { Input, Button, Card, Alert } from 'antd';
import './ChangeResetPassword.css';

export default function ChangeResetPassword() {
  const { token } = useParams(); // ← obtenemos el token de la URL
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [alert, setAlert] = useState(null);
  const navigate = useNavigate();

 const handleSubmit = async e => {
  e.preventDefault();

  if (!password || password !== confirm) {
    setAlert({ type: 'error', message: 'Contraseñas no concuerdan' });
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
    setAlert({ type: 'error', message: 'Server error' });
  }
};
  return (
    <div className="reset-password-container">
      <Card title="Cambio de contraseña" className="reset-password-card">
        {alert && <Alert style={{ marginBottom: 16 }} type={alert.type} message={alert.message} />}
        <form onSubmit={handleSubmit} className="reset-password-form">
          <Input.Password
            placeholder="Nueva contraseña"
            value={password}
            onChange={e => setPassword(e.target.value)}
            className="reset-password-input"
          />
          <Input.Password
            placeholder="Confirme contraseña"
            value={confirm}
            onChange={e => setConfirm(e.target.value)}
            className="reset-password-input"
          />
          <Button type="primary" block htmlType="submit" className="reset-password-button">
            Cambiar
          </Button>
        </form>
      </Card>
    </div>
  );
}
