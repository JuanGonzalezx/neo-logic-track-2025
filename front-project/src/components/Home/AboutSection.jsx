import React from 'react';
import './AboutSection.css';

const AboutSection = () => {
  return (
    <section className="about-section">
      <h2>¿Quiénes somos?</h2>
      
      <div className="about-content">
        <div className="about-image">
          <img 
            src="https://images.pexels.com/photos/3760067/pexels-photo-3760067.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2" 
            alt="Equipo de NeoLogicTrack" 
          />
        </div>
        
        <div className="about-text">
          <p>
            NeoLogicTrack es una plataforma integral de gestión logística diseñada para optimizar el rastreo de pedidos, el control de inventario y la geolocalización en tiempo real.
          </p>
          
          <p>
            Nuestro equipo de expertos combina conocimientos en logística y tecnología de vanguardia para ofrecer soluciones que transforman la cadena de suministro de tu empresa.
          </p>
          
          <div className="about-features">
            <div className="feature">
              <div className="feature-icon">📍</div>
              <div className="feature-info">
                <h3>Geolocalización precisa</h3>
                <p>Seguimiento en tiempo real con precisión de metros</p>
              </div>
            </div>
            
            <div className="feature">
              <div className="feature-icon">📦</div>
              <div className="feature-info">
                <h3>Gestión de inventario</h3>
                <p>Control automático y actualizado de tu inventario</p>
              </div>
            </div>
            
            <div className="feature">
              <div className="feature-icon">📊</div>
              <div className="feature-info">
                <h3>Analítica avanzada</h3>
                <p>Informes detallados y métricas de rendimiento</p>
              </div>
            </div>
          </div>
          
          <a href="#" className="about-cta">Conoce más sobre nosotros</a>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;