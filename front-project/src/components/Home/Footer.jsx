import React from 'react';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-section company-info">
          <h3>NeoLogicTrack</h3>
          <p>Soluciones avanzadas de rastreo y gestión logística para empresas de todos los tamaños.</p>
        </div>
        
        <div className="footer-section links">
          <h3>Enlaces rápidos</h3>
          <ul>
            <li><a href="#">Inicio</a></li>
            <li><a href="#">Servicios</a></li>
            <li><a href="#">Rastreo de pedidos</a></li>
            <li><a href="#">Sobre nosotros</a></li>
            <li><a href="#">Contacto</a></li>
          </ul>
        </div>
        
        <div className="footer-section contact">
          <h3>Contacto</h3>
          <p><i className="contact-icon">location</i> Av. Tecnológica 1234, Ciudad Tech</p>
          <p><i className="contact-icon">phone</i> +123 456 7890</p>
          <p><i className="contact-icon">email</i> info@neologictrack.com</p>
        </div>
        
        <div className="footer-section newsletter">
          <h3>Boletín informativo</h3>
          <p>Suscríbete para recibir las últimas noticias y actualizaciones.</p>
          <form className="newsletter-form">
            <input type="email" placeholder="Tu correo electrónico" required />
            <button type="submit">Suscribirse</button>
          </form>
        </div>
      </div>
      
      <div className="footer-bottom">
        <div className="footer-bottom-content">
          <p>&copy; {new Date().getFullYear()} NeoLogicTrack. Todos los derechos reservados.</p>
          <div className="legal-links">
            <a href="#">Términos de servicio</a>
            <span className="separator">|</span>
            <a href="#">Política de privacidad</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;