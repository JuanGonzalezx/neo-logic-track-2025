import React from 'react';
import './AboutSection.css';

const AboutSection = () => {
  return (
    <section className="about-section">
      <h2>¿Quiénes Somos?</h2>
      
      <div className="about-content">
        <div className="about-image">
          <img 
            src="https://images.pexels.com/photos/3760067/pexels-photo-3760067.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2" 
            alt="Equipo de NeoLogicTrack" 
          />
        </div>
        
        <div className="about-text">
          <p>
            NeoLogicTrack es una plataforma integral de gestión logística diseñada para optimizar 
            el rastreo de pedidos, control de inventario y geolocalización en tiempo real.
          </p>
          
          <p>
            Nuestro equipo de expertos combina conocimientos en logística y tecnología de vanguardia 
            para ofrecer soluciones que transforman la cadena de suministro de su empresa.
          </p>
          
          <div className="about-features">
            <div className="feature">
              <div className="feature-icon">📍</div>
              <div className="feature-info">
                <h3>Geolocalización Precisa</h3>
                <p>Seguimiento en tiempo real con precisión de metros</p>
              </div>
            </div>
            
            <div className="feature">
              <div className="feature-icon">📦</div>
              <div className="feature-info">
                <h3>Gestión de Inventario</h3>
                <p>Control automático y actualizado de su inventario</p>
              </div>
            </div>
            
            <div className="feature">
              <div className="feature-icon">📊</div>
              <div className="feature-info">
                <h3>Analítica Avanzada</h3>
                <p>Informes detallados y métricas de rendimiento</p>
              </div>
            </div>
          </div>
          
          <a href="#" className="about-cta">Conocer más sobre nosotros</a>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;