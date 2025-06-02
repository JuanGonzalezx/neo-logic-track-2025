import { useState, useEffect } from 'react';
import { getAllUsers, getAllRoles } from '../../../api/user';
import { Spin, Alert } from 'antd';
import './DashboardHome.css';

const DashboardHome = () => {
  const [activeTab, setActiveTab] = useState('users');
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [apiResponse, setApiResponse] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const rolesResponse = await getAllRoles();
        const usersResponse = await getAllUsers();

        if (usersResponse.status === 200 && rolesResponse.status === 200) {
          setRoles(rolesResponse.data);
          setUsers(processUsers(usersResponse.data, rolesResponse.data));
        } else {
          setApiResponse({
            type: "error",
            message: "Error cargando datos"
          });
        }
      } catch (error) {
        setApiResponse({
          type: "error",
          message: "Error de conexión"
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const processUsers = (users, roles) => {
    return users.map(u => ({
      ...u,
      role: getRoleName(u.roleId, roles),
      createdAt: new Date(u.createdAt).toLocaleDateString()
    }));
  };

  const getRoleName = (roleId, roles) => {
    const role = roles.find(r => r.id === roleId);
    return role ? role.name : 'Sin rol';
  };

  const stats = [
    { label: 'Total de usuarios', value: users.length, icon: 'users', trend: '+12%', trendDirection: 'up' },
    { label: 'Roles', value: roles.length, icon: 'roles', trend: '+2', trendDirection: 'up' },
    { label: 'Usuarios activos', value: users.filter(u => u.status === 'ACTIVE').length, icon: 'active', trend: '85%', trendDirection: 'neutral' },
  ];

  return (
    <div className="dashboard-home">
      <h1 className="dashboard-title">Panel de control</h1>

      {apiResponse && (
        <Alert
          message={apiResponse.message}
          type={apiResponse.type}
          showIcon
          closable
          style={{ marginBottom: 20 }}
        />
      )}

      <div className="stats-grid">
        {stats.map((stat, index) => (
          <div key={index} className="stat-card">
            <div className={`stat-icon ${stat.icon}`}></div>
            <div className="stat-info">
              <h3 className="stat-value">{stat.value}</h3>
              <p className="stat-label">{stat.label}</p>
            </div>
            <div className={`stat-trend ${stat.trendDirection}`}>
              {stat.trend}
            </div>
          </div>
        ))}
      </div>

      <div className="dashboard-row">
        <div className="dashboard-card user-activity">
          <div className="card-header">
            <h2>Acceso rápido</h2>
          </div>
          <div className="tabs">
            <button
              className={`tab ${activeTab === 'users' ? 'active' : ''}`}
              onClick={() => setActiveTab('users')}
            >
              Usuarios
            </button>
            <button
              className={`tab ${activeTab === 'roles' ? 'active' : ''}`}
              onClick={() => setActiveTab('roles')}
            >
              Roles
            </button>
          </div>

          <div className="tab-content">
            {loading ? (
              <div className="loading-container">
                <Spin tip="Cargando datos..." />
              </div>
            ) : (
              <>
                {activeTab === 'users' && (
                  <div className="recent-users">
                    <table className="activity-table">
                      <thead>
                        <tr>
                          <th>Nombre</th>
                          <th>Email</th>
                          <th>Rol</th>
                          <th>Fecha de registro</th>
                        </tr>
                      </thead>
                      <tbody>
                        {users.slice(0, 5).map(user => (
                          <tr key={user.id}>
                            <td>{user.fullname}</td>
                            <td>{user.email}</td>
                            <td>{user.role}</td>
                            <td>{user.createdAt}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {activeTab === 'roles' && (
                  <div className="role-summary">
                    <table className="activity-table">
                      <thead>
                        <tr>
                          <th>Nombre</th>
                          <th>Descripción</th>
                          <th>Usuarios asignados</th>
                        </tr>
                      </thead>
                      <tbody>
                        {roles.slice(0, 5).map(role => (
                          <tr key={role.id}>
                            <td>{role.name}</td>
                            <td>{role.description || 'Sin descripción'}</td>
                            <td>{users.filter(u => u.roleId === role.id).length}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        <div className="dashboard-card system-info">
          <div className="card-header">
            <h2>Estado del sistema</h2>
          </div>
          <div className="info-list">
            <div className="info-item">
              <span className="info-label">Versión del sistema</span>
              <span className="info-value">1.0.0</span>
            </div>
            <div className="info-item">
              <span className="info-label">Última actualización</span>
              <span className="info-value">{new Date().toLocaleDateString()}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Estado de la base de datos</span>
              <span className="info-value">
                <span className="status-indicator online"></span>
                Conectado
              </span>
            </div>
            <div className="info-item">
              <span className="info-label">Usuarios registrados</span>
              <span className="info-value">{users.length}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardHome;