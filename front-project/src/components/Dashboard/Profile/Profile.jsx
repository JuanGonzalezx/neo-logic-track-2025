import React, { useState } from 'react';
import { KeyRound } from 'lucide-react';
import ChangePasswordModal from './ChangePasswordModal';
import './Profile.css';



const Profile = () => {
    const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);

    // Get user initials for avatar
    const getUserInitials = (name) => {
        return name
            .split(' ')
            .map((part) => part[0])
            .join('')
            .toUpperCase();
    };

    return (
        <div className="profile-container">
            <div className="page-header">
                <h1>User Profile</h1>
                <button
                    className="button button-primary"
                    onClick={() => setIsPasswordModalOpen(true)}
                >
                    <KeyRound size={16} className="mr-2" />
                     Change Password
                </button>
            </div>

            <div className="profile-card">
                <div className="profile-header">
                    <div className="profile-avatar-init">
                        {getUserInitials("Juan Dario")}
                    </div>
                    <div className="profile-title">
                        {/* <h2>{user.name}</h2> */}
                        <h2>Darío</h2>
                        <span className={`status-badge active`}>
                            Active
                        </span>
                        {/* <span className={`status-badge ${user.status}`}>
                            {user.status === 'active' ? 'Active' : 'Inactive'}
                        </span> */}
                    </div>
                </div>

                <div className="info-section">
                    <h3>Personal Information</h3>
                    <div className="info-grid">
                        <div className="info-item">
                            <div className="info-label">Name</div>
                            <div>Juan Dario</div>
                            {/* <div className="info-value">{user.name}</div> */}
                        </div>
                        <div className="info-item">
                            <div className="info-label">Email</div>
                            <div>juandario@gmail.com</div>
                            {/* <div className="info-value">{user.email}</div> */}
                        </div>
                        <div className="info-item">
                            <div className="info-label">Phone</div>
                            <div>3136381995</div>
                            {/* <div className="info-value">{user.phone}</div> */}
                        </div>
                        <div className="info-item">
                            <div className="info-label">Role</div>
                            <div>Celador</div>
                            {/* <div className="info-value">{user.role}</div> */}
                        </div>
                        <div className="info-item">
                            <div className="info-label">Status</div>
                            <div className="info-value">
                                <div>Active</div>
                                {/* <span className={`status-badge ${user.status}`}>
                                    {/* {user.status === 'active' ? 'Active' : 'Inactive'} */}
                                {/* </span> */}
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