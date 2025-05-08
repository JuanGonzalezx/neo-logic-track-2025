import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { Outlet, useNavigate } from 'react-router-dom';
import { logOutUser } from '../../redux/authSlice';
import Sidebar from './Sidebar/Sidebar';
import Header from './Header/Header';
import Breadcrumb from './Breadcrumb/Breadcrumb';
import './Dashboard.css';

const Dashboard = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const handleLogout = () => {
    dispatch(logOutUser());
    navigate('/');
  };

  return (
    <div className={`dashboard ${sidebarCollapsed ? 'sidebar-collapsed' : ''} ${mobileMenuOpen ? 'mobile-menu-open' : ''}`}>
      <Sidebar
        collapsed={sidebarCollapsed}
        mobileOpen={mobileMenuOpen}
        closeMobileMenu={() => setMobileMenuOpen(false)}
      />

      <div className="dashboard-content">
        <Header
          toggleSidebar={toggleSidebar}
          toggleMobileMenu={toggleMobileMenu}
          onLogout={handleLogout}
        />

        <main className="dashboard-main">
          <Breadcrumb />
          <div className="dashboard-container">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;