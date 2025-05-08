import { useState, useRef, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Menu, Search, Bell, User, Settings, LogOut } from 'lucide-react';
import './Header.css';
import { useNavigate } from "react-router-dom"; // Importamos useNavigate


const Header = ({ toggleSidebar, toggleMobileMenu, onLogout }) => {
  const [profileOpen, setProfileOpen] = useState(false);
  const [searchActive, setSearchActive] = useState(false);
  const profileRef = useRef(null);
  const { currentUser } = useSelector((state) => state.auth);

  const navigate = useNavigate();
  
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setProfileOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleMyProfile = (e) => {
    navigate("/dashboard/profile");
  }

  return (
    <header className="dashboard-header">
      <div className="header-left">
        <button className="mobile-menu-btn" onClick={toggleMobileMenu}>
          <Menu size={24} />
        </button>
        
        <button className="sidebar-toggle" onClick={toggleSidebar}>
          <Menu size={24} />
        </button>
        
        <div className={`search-container ${searchActive ? 'active' : ''}`}>
          <input 
            type="text" 
            className="search-input" 
            placeholder="Search..." 
            onFocus={() => setSearchActive(true)}
            onBlur={() => setSearchActive(false)}
          />
          <button className="search-button">
            <Search size={16} />
          </button>
        </div>
      </div>

      <div className="header-right">
        <button className="notification-button">
          <Bell size={20} />
          <span className="notification-badge">3</span>
        </button>

        <div className="profile-dropdown" ref={profileRef}>
          <button 
            className="profile-button" 
            onClick={() => setProfileOpen(!profileOpen)}
          >
            <div className="profile-avatar">
              {currentUser?.username?.[0] || 'U'}
            </div>
            <span className="profile-name">{currentUser?.username || 'User'}</span>
            <span className={`dropdown-arrow ${profileOpen ? 'open' : ''}`}></span>
          </button>
          
          {profileOpen && (
            <div className="profile-menu">
              <ul>
                <li>
                  <button 
                  className="profile-menu-item"
                  onClick={handleMyProfile}
                  >
                    <User size={20} className="profile-menu-icon" />
                    <span>My Profile</span>
                  </button>
                </li>
                <li>
                  <button className="profile-menu-item">
                    <Settings size={20} className="profile-menu-icon" />
                    <span>Settings</span>
                  </button>
                </li>
                <li className="divider"></li>
                <li>
                  <button className="profile-menu-item logout" onClick={onLogout}>
                    <LogOut size={20} className="profile-menu-icon" />
                    <span>Logout</span>
                  </button>
                </li>
              </ul>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;