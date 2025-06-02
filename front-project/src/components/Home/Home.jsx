import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Login from '../Auth/Login';
import Register from '../Auth/Register';
import HeroCarousel from './HeroCarousel';
import AboutSection from './AboutSection';
import TrackingInput from './TrackingInput';
import Footer from './Footer';
import './Home.css';

const Home = () => {
  const [authMode, setAuthMode] = useState('login');
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const navigate = useNavigate();

  // Handle responsive layout
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // Handle tracking submission
  const handleTrackOrder = (trackingId) => {
    if (trackingId.trim()) {
      navigate(`/track/${trackingId}`);
    }
  };

  // Toggle between login and register forms
  const toggleAuthMode = () => {
    setAuthMode(authMode === 'login' ? 'register' : 'login');
  };

  return (
    <div className="home-container">
      <div className="home-content">
        <div className="home-left-column">
          <HeroCarousel />
          
          <div className="tracking-section">
            <h1>Rastreo de pedidos en tiempo real</h1>
            <p>Monitorea el estado y la ubicación de tus pedidos con tecnología de geolocalización avanzada</p>
            <TrackingInput onSubmit={handleTrackOrder} />
          </div>

          <AboutSection />
        </div>

        {!isMobile && (
          <div className="home-right-column">
            <div className="auth-container">
              <div className="auth-tabs">
                <button 
                  className={`auth-tab ${authMode === 'login' ? 'active' : ''}`}
                  onClick={() => setAuthMode('login')}
                >
                  Iniciar sesión
                </button>
                <button 
                  className={`auth-tab ${authMode === 'register' ? 'active' : ''}`}
                  onClick={() => setAuthMode('register')}
                >
                  Registrarse
                </button>
              </div>
              
              <div className="auth-content">
                {authMode === 'login' ? <Login /> : <Register />}
              </div>
              
              <p className="auth-toggle">
                {authMode === 'login' ? (
                  <>
                    ¿No tienes una cuenta? 
                    <button onClick={toggleAuthMode} className="auth-toggle-btn">
                      Regístrate aquí
                    </button>
                  </>
                ) : (
                  <>
                    ¿Ya tienes una cuenta? 
                    <button onClick={toggleAuthMode} className="auth-toggle-btn">
                      Inicia sesión
                    </button>
                  </>
                )}
              </p>
            </div>
          </div>
        )}

        {isMobile && (
          <div className="mobile-auth-section">
            <div className="auth-container">
              <div className="auth-tabs">
                <button 
                  className={`auth-tab ${authMode === 'login' ? 'active' : ''}`}
                  onClick={() => setAuthMode('login')}
                >
                  Iniciar sesión
                </button>
                <button 
                  className={`auth-tab ${authMode === 'register' ? 'active' : ''}`}
                  onClick={() => setAuthMode('register')}
                >
                  Registrarse
                </button>
              </div>
              
              <div className="auth-content">
                {authMode === 'login' ? <Login /> : <Register />}
              </div>
              
              <p className="auth-toggle">
                {authMode === 'login' ? (
                  <>
                    ¿No tienes una cuenta? 
                    <button onClick={toggleAuthMode} className="auth-toggle-btn">
                      Regístrate aquí
                    </button>
                  </>
                ) : (
                  <>
                    ¿Ya tienes una cuenta? 
                    <button onClick={toggleAuthMode} className="auth-toggle-btn">
                      Inicia sesión
                    </button>
                  </>
                )}
              </p>
            </div>
          </div>
        )}
      </div>
      
      <Footer />
    </div>
  );
};

export default Home;