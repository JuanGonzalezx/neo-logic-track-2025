import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
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
import { getUserFromToken } from '../../../api/auth';

const Sidebar = ({ collapsed, mobileOpen, closeMobileMenu }) => {
  const location = useLocation();
  const [activeSection, setActiveSection] = useState(null);
  const [roleId, setRoleId] = useState(null);
  const permissions = useSelector(state => state.auth?.permissions || []);

  useEffect(() => {
    if (location.pathname.startsWith('/dashboard/users')) {
      setActiveSection('users');
    } else if (location.pathname.startsWith('/dashboard/roles')) {
      setActiveSection('roles');
    } else if (location.pathname.startsWith('/dashboard/inventory/orders')) {
      setActiveSection('orders');
    } else if (location.pathname.startsWith('/dashboard/inventory')) {
      setActiveSection('inventory');
    } else if (location.pathname.startsWith('/dashboard/permissions')) {
      setActiveSection('permissions');
    } else {
      setActiveSection(null);
    }
  }, [location.pathname]);

  useEffect(() => {
    // Obtener el rol del usuario autenticado
    const fetchRole = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const res = await getUserFromToken({ token });
          if (res && res.role && res.role.id) {
            setRoleId(res.role.id);
          }
        } catch {
          // ignorar error
        }
      }
    };
    fetchRole();
  }, []);

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
            {collapsed ? "IM" : "Gestor de Inventario"}
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
                {!collapsed && <span>Panel</span>}
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
                    {!collapsed && <span>Usuarios</span>}
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
                          {collapsed ? <Users size={20} /> : <span>Todos los usuarios</span>}
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
                          {collapsed ? <Plus size={20} /> : <span>Agregar usuario</span>}
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
                          {collapsed ? <Shield size={20} /> : <span>Todos los roles</span>}
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
                          {collapsed ? <Plus size={20} /> : <span>Agregar rol</span>}
                        </NavLink>
                      </li>
                    )}
                  </ul>
                )}
              </li>
            )}

            {hasPermission('681bead67a2c0df928b8b232') && (
            <li className="sidebar-nav-item">
              <div
                className={`sidebar-nav-section ${activeSection === 'permissions' ? 'expanded' : ''}`}
                onClick={() => toggleSection('permissions')}
              >
                <div className="section-content">
                  <Shield size={20} className="sidebar-icon" />
                  {!collapsed && <span>Permisos</span>}
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
                      {collapsed ? <Shield size={20} /> : <span>Todos los permisos</span>}
                    </NavLink>
                  </li>
                  <li className="sidebar-subnav-item">
                    <NavLink
                      to="/dashboard/permissions/create"
                      end
                      className={linkClass}
                      onClick={handleNavLinkClick}
                    >
                      {collapsed ? <Plus size={20} /> : <span>Agregar permiso</span>}
                    </NavLink>
                  </li>
                </ul>
              )}
            </li>
            )}

            {/* Inventory Section */}
            {roleId !== '68146313ef7752d9d59866da' && (
            <li className="sidebar-nav-item">
              <div
                className={`sidebar-nav-section ${activeSection === 'inventory' ? 'expanded' : ''}`}
                onClick={() => toggleSection('inventory')}
              >
                <div className="section-content">
                  <Package2 size={20} className="sidebar-icon" />
                  {!collapsed && <span>Inventario</span>}
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
                      {collapsed ? <Package2 size={20} /> : <span>Todos los productos</span>}
                    </NavLink>
                  </li>
                  <li className="sidebar-subnav-item">
                    <NavLink
                      to="/dashboard/inventory/add"
                      end
                      className={linkClass}
                      onClick={handleNavLinkClick}
                    >
                      {collapsed ? <Plus size={20} /> : <span>Agregar producto</span>}
                    </NavLink>
                  </li>
                  <li className="sidebar-subnav-item">
                    <NavLink
                      to="/dashboard/inventory/categories"
                      end
                      className={linkClass}
                      onClick={handleNavLinkClick}
                    >
                      {collapsed ? <Plus size={20} /> : <span>Todas las categorías</span>}
                    </NavLink>
                  </li>
                  <li className="sidebar-subnav-item">
                    <NavLink
                      to="/dashboard/inventory/categories/add"
                      end
                      className={linkClass}
                      onClick={handleNavLinkClick}
                    >
                      {collapsed ? <Plus size={20} /> : <span>Agregar categoría</span>}
                    </NavLink>
                  </li>
                  <li className="sidebar-subnav-item">
                    <NavLink
                      to="/dashboard/inventory/warehouses"
                      end
                      className={linkClass}
                      onClick={handleNavLinkClick}
                    >
                      {collapsed ? <Plus size={20} /> : <span>Todos los almacenes</span>}
                    </NavLink>
                  </li>
                </ul>
              )}
            </li>
            )}

            {/* Orders Section as separate dropdown */}
            <li className="sidebar-nav-item">
              <div
                className={`sidebar-nav-section ${activeSection === 'orders' ? 'expanded' : ''}`}
                onClick={() => toggleSection('orders')}
              >
                <div className="section-content">
                  <Package2 size={20} className="sidebar-icon" />
                  {!collapsed && <span>Órdenes</span>}
                </div>
                {!collapsed && (
                  <ChevronDown
                    size={16}
                    className={`section-arrow ${activeSection === 'orders' ? 'expanded' : ''}`}
                  />
                )}
              </div>
              {(activeSection === 'orders' || collapsed) && (
                <ul className="sidebar-subnav">
                  <li className="sidebar-subnav-item">
                    <NavLink
                      to="/dashboard/inventory/orders"
                      end
                      className={linkClass}
                      onClick={handleNavLinkClick}
                    >
                      {collapsed ? <Package2 size={20} /> : <span>Todas las órdenes</span>}
                    </NavLink>
                  </li>
                  {/* Ocultar acceso a repartidores si el usuario es repartidor */}
                  {roleId !== '68146313ef7752d9d59866da' && (
                    <li className="sidebar-subnav-item">
                      <NavLink
                        to="/dashboard/repartidores"
                        className={linkClass}
                        onClick={handleNavLinkClick}
                      >
                        {collapsed ? <Users size={20} /> : <span>Listado de repartidores</span>}
                      </NavLink>
                    </li>
                  )}
                </ul>
              )}
            </li>

          </ul>
        </nav>

        <div className="sidebar-footer">
          {!collapsed && <p>© 2025 Gestor de Inventario</p>}
        </div>
      </aside>
      {mobileOpen && <div className="sidebar-backdrop" onClick={closeMobileMenu}></div>}
    </>
  );
};

export default Sidebar;