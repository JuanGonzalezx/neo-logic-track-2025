// src/components/Auth/RequestReset.jsx

import React, { useState } from 'react';
import { Card, Input, Button, Alert, Spin, Typography } from 'antd';
import { useNavigate } from 'react-router-dom';
import { requestPasswordReset, verifyResetCode } from '../../api/auth'; // importa verifyPassCode
import VerificationModal from './VerificationModal';
import './Register.css';

const { Title } = Typography;

export default function RequestReset() {
    const [email, setEmail] = useState('');
    const [alert, setAlert] = useState(null);
    const [loading, setLoading] = useState(false);
    const [showModal, setShowModal] = useState(false);

    const navigate = useNavigate();

    const handleSendEmail = async e => {
        e.preventDefault();
        setAlert(null);
        if (!email) {
            setAlert({ type: 'error', message: 'Email is required' });
            return;
        }

        setLoading(true);
        try {
            const { status, message } = await requestPasswordReset({ email }); // usa message
            setAlert({ type: status === 200 ? 'success' : 'error', message });
            if (status === 200) {
                setShowModal(true);
            }
        } catch (err) {
            setAlert({ type: 'error', message: err.message || 'Network error' });
        } finally {
            setLoading(false);
        }
    };

    const handleVerificationSuccess = async code => {
        // llamamos directamente verifyPassCode importado
        const { status, message } = await verifyResetCode({ email, code });
        if (status === 200) {
            setShowModal(false);
            navigate('/reset-password/new', { state: { email } });
            return; // sin error
        } else {
            return message || 'Invalid code';
        }
    };

    return (
        <div className="register-container" style={{ maxWidth: 400, margin: '50px auto' }}>
            <Card>
                <Title level={3} style={{ textAlign: 'center' }}>Reset Password</Title>

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
                        <label>Email</label>
                        <Input
                            type="email"
                            placeholder="Enter your email"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                        />
                    </div>
                    <Button
                        block
                        type="primary"
                        htmlType="submit"
                        disabled={loading}
                        style={{ marginTop: 16 }}
                    >
                        {loading ? <Spin /> : 'Send Verification Code'}
                    </Button>
                </form>
            </Card>

            <VerificationModal
                isOpen={showModal}
                onClose={() => setShowModal(false)}
                contactMethod="email"
                email={email}
                onVerificationSuccess={handleVerificationSuccess}
            />
        </div>
    );
}
