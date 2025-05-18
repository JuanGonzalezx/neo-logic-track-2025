import { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  Shield,
  Package2,
  Plus,
  ChevronDown
} from 'lucide-react';
import './Sidebar.css';

const Sidebar = ({ collapsed, mobileOpen, closeMobileMenu }) => {
  const location = useLocation();
  const [activeSection, setActiveSection] = useState(null);
  const [permissions, setPermissions] = useState([]);

  useEffect(() => {
    // Load permissions from local storage
    const storedPermissions = JSON.parse(localStorage.getItem('permissions')) || [];
    setPermissions(storedPermissions);
  }, []);

  useEffect(() => {
    if (location.pathname.startsWith('/dashboard/users')) {
      setActiveSection('users');
    } else if (location.pathname.startsWith('/dashboard/roles')) {
      setActiveSection('roles');
    } else if (location.pathname.startsWith('/dashboard/inventory')) {
      setActiveSection('inventory');
    } else if (location.pathname.startsWith('/dashboard/permissions')) {
      setActiveSection('permissions');
    } else {
      setActiveSection(null);
    }
  }, [location.pathname]);

  const toggleSection = (section) => {
    setActiveSection(prev => (prev === section ? null : section));
  };

  const handleNavLinkClick = () => {
    if (window.innerWidth <= 768) {
      closeMobileMenu();
    }
  };

  const linkClass = ({ isActive }) =>
    isActive ? 'sidebar-nav-link active' : 'sidebar-nav-link';

  const hasPermission = (permissionId) => permissions.includes(permissionId);

  return (
    <>
      <aside className={`sidebar ${collapsed ? 'collapsed' : ''} ${mobileOpen ? 'mobile-open' : ''}`}>
        <div className="sidebar-header">
          <h1 className="sidebar-title">
            {collapsed ? "IM" : "Inventory Manager"}
          </h1>
        </div>

        <nav className="sidebar-nav">
          <ul className="sidebar-nav-list">
            <li className="sidebar-nav-item">
              <NavLink
                to="/dashboard"
                end
                className={linkClass}
                onClick={handleNavLinkClick}
              >
                <LayoutDashboard size={20} className="sidebar-icon" />
                {!collapsed && <span>Dashboard</span>}
              </NavLink>
            </li>

            {hasPermission('6814375bfbaec847ba2ecc01') && (
              <li className="sidebar-nav-item">
                <div
                  className={`sidebar-nav-section ${activeSection === 'users' ? 'expanded' : ''}`}
                  onClick={() => toggleSection('users')}
                >
                  <div className="section-content">
                    <Users size={20} className="sidebar-icon" />
                    {!collapsed && <span>Users</span>}
                  </div>
                  {!collapsed && (
                    <ChevronDown
                      size={16}
                      className={`section-arrow ${activeSection === 'users' ? 'expanded' : ''}`}
                    />
                  )}
                </div>
                {(activeSection === 'users' || collapsed) && (
                  <ul className="sidebar-subnav">
                    {hasPermission('6814375bfbaec847ba2ecc01') && (
                      <li className="sidebar-subnav-item">
                        <NavLink
                          to="/dashboard/users"
                          end
                          className={linkClass}
                          onClick={handleNavLinkClick}
                        >
                          {collapsed ? <Users size={20} /> : <span>All Users</span>}
                        </NavLink>
                      </li>
                    )}
                    {hasPermission('681437a9fbaec847ba2ecc03') && (
                      <li className="sidebar-subnav-item">
                        <NavLink
                          to="/dashboard/users/create"
                          end
                          className={linkClass}
                          onClick={handleNavLinkClick}
                        >
                          {collapsed ? <Plus size={20} /> : <span>Add User</span>}
                        </NavLink>
                      </li>
                    )}
                  </ul>
                )}
              </li>
            )}

            {hasPermission('68153b80a860e5411c9f9ae3') && (
              <li className="sidebar-nav-item">
                <div
                  className={`sidebar-nav-section ${activeSection === 'roles' ? 'expanded' : ''}`}
                  onClick={() => toggleSection('roles')}
                >
                  <div className="section-content">
                    <Shield size={20} className="sidebar-icon" />
                    {!collapsed && <span>Roles</span>}
                  </div>
                  {!collapsed && (
                    <ChevronDown
                      size={16}
                      className={`section-arrow ${activeSection === 'roles' ? 'expanded' : ''}`}
                    />
                  )}
                </div>
                {(activeSection === 'roles' || collapsed) && (
                  <ul className="sidebar-subnav">
                    {hasPermission('68153b80a860e5411c9f9ae3') && (
                      <li className="sidebar-subnav-item">
                        <NavLink
                          to="/dashboard/roles"
                          end
                          className={linkClass}
                          onClick={handleNavLinkClick}
                        >
                          {collapsed ? <Shield size={20} /> : <span>All Roles</span>}
                        </NavLink>
                      </li>
                    )}
                    {hasPermission('68143816fbaec847ba2ecc06') && (
                      <li className="sidebar-subnav-item">
                        <NavLink
                          to="/dashboard/roles/create"
                          end
                          className={linkClass}
                          onClick={handleNavLinkClick}
                        >
                          {collapsed ? <Plus size={20} /> : <span>Add Role</span>}
                        </NavLink>
                      </li>
                    )}
                  </ul>
                )}
              </li>
            )}

            {/* Inventory Section */}
            <li className="sidebar-nav-item">
              <div
                className={`sidebar-nav-section ${activeSection === 'inventory' ? 'expanded' : ''}`}
                onClick={() => toggleSection('inventory')}
              >
                <div className="section-content">
                  <Package2 size={20} className="sidebar-icon" />
                  {!collapsed && <span>Inventory</span>}
                </div>
                {!collapsed && (
                  <ChevronDown
                    size={16}
                    className={`section-arrow ${activeSection === 'inventory' ? 'expanded' : ''}`}
                  />
                )}
              </div>
              {(activeSection === 'inventory' || collapsed) && (
                <ul className="sidebar-subnav">
                  <li className="sidebar-subnav-item">
                    <NavLink
                      to="/dashboard/inventory"
                      end
                      className={linkClass}
                      onClick={handleNavLinkClick}
                    >
                      {collapsed ? <Package2 size={20} /> : <span>All Products</span>}
                    </NavLink>
                  </li>
                  <li className="sidebar-subnav-item">
                    <NavLink
                      to="/dashboard/inventory/add"
                      end
                      className={linkClass}
                      onClick={handleNavLinkClick}
                    >
                      {collapsed ? <Plus size={20} /> : <span>Add Product</span>}
                    </NavLink>
                  </li>
                  <li className="sidebar-subnav-item">
                    <NavLink
                      to="/dashboard/inventory/categories"
                      end
                      className={linkClass}
                      onClick={handleNavLinkClick}
                    >
                      {collapsed ? <Plus size={20} /> : <span>All Categories</span>}
                    </NavLink>
                  </li>
                  <li className="sidebar-subnav-item">
                    <NavLink
                      to="/dashboard/inventory/categories/create"
                      end
                      className={linkClass}
                      onClick={handleNavLinkClick}
                    >
                      {collapsed ? <Plus size={20} /> : <span>Add Category</span>}
                    </NavLink>
                  </li>
                  <li className="sidebar-subnav-item">
                    <NavLink
                      to="/dashboard/inventory/warehouses"
                      end
                      className={linkClass}
                      onClick={handleNavLinkClick}
                    >
                      {collapsed ? <Plus size={20} /> : <span>All Warehouses</span>}
                    </NavLink>
                    
                  </li>
                </ul>
              )}
            </li>


            <li className="sidebar-nav-item">
              <div
                className={`sidebar-nav-section ${activeSection === 'permissions' ? 'expanded' : ''}`}
                onClick={() => toggleSection('permissions')}
              >
                <div className="section-content">
                  <Shield size={20} className="sidebar-icon" />
                  {!collapsed && <span>Permissions</span>}
                </div>
                {!collapsed && (
                  <ChevronDown
                    size={16}
                    className={`section-arrow ${activeSection === 'permissions' ? 'expanded' : ''}`}
                  />
                )}
              </div>
              {(activeSection === 'permissions' || collapsed) && (
                <ul className="sidebar-subnav">
                  <li className="sidebar-subnav-item">
                    <NavLink
                      to="/dashboard/permissions"
                      end
                      className={linkClass}
                      onClick={handleNavLinkClick}
                    >
                      {collapsed ? <Shield size={20} /> : <span>All Permissions</span>}
                    </NavLink>
                  </li>
                  <li className="sidebar-subnav-item">
                    <NavLink
                      to="/dashboard/permissions/create"
                      end
                      className={linkClass}
                      onClick={handleNavLinkClick}
                    >
                      {collapsed ? <Plus size={20} /> : <span>Add Permission</span>}
                    </NavLink>
                  </li>
                </ul>
              )}
            </li>


            <li className="sidebar-nav-item">
              <NavLink
                to="/dashboard/inventor"
                end
                className={linkClass}
                onClick={handleNavLinkClick}
              >
                <Package2 size={20} className="sidebar-icon" />
                {!collapsed && <span>Inventory</span>}
              </NavLink>
            </li>
          </ul>
        </nav>

        <div className="sidebar-footer">
          {!collapsed && <p>© 2025 Inventory Manager</p>}
        </div>
      </aside>
      {mobileOpen && <div className="sidebar-backdrop" onClick={closeMobileMenu}></div>}
    </>
  );
};

export default Sidebar;
