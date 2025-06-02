import React, { useState, useEffect } from 'react';
import './HeroCarousel.css';

const HeroCarousel = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  
  // Imágenes del carrusel relacionadas con logística, entregas y rastreo
  const carouselImages = [
    {
      url: 'https://images.pexels.com/photos/1427541/pexels-photo-1427541.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
      alt: 'Almacén logístico con paquetes',
      title: 'Gestión logística inteligente',
      subtitle: 'Optimiza tus operaciones de almacén con geolocalización avanzada'
    },
    {
      url: 'https://images.pexels.com/photos/7706458/pexels-photo-7706458.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
      alt: 'Repartidor con paquete',
      title: 'Entregas eficientes',
      subtitle: 'Seguimiento en tiempo real para cada paquete'
    },
    {
      url: 'https://images.pexels.com/photos/3183183/pexels-photo-3183183.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
      alt: 'Equipo trabajando con tecnología logística',
      title: 'Soluciones empresariales',
      subtitle: 'Tecnología avanzada para tus necesidades logísticas'
    }
  ];

  // Avance automático del carrusel
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % carouselImages.length);
    }, 5000);
    
    return () => clearInterval(interval);
  }, [carouselImages.length]);

  // Navegación manual
  const goToSlide = (index) => {
    setCurrentSlide(index);
  };

  const goToPrevSlide = () => {
    setCurrentSlide((prev) => (prev === 0 ? carouselImages.length - 1 : prev - 1));
  };

  const goToNextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % carouselImages.length);
  };

  return (
    <div className="hero-carousel">
      <div className="carousel-container">
        {carouselImages.map((image, index) => (
          <div 
            key={index} 
            className={`carousel-slide ${index === currentSlide ? 'active' : ''}`}
            style={{ transform: `translateX(${(index - currentSlide) * 100}%)` }}
          >
            <img src={image.url} alt={image.alt} />
            <div className="carousel-caption">
              <h2>{image.title}</h2>
              <p>{image.subtitle}</p>
            </div>
          </div>
        ))}
      </div>
      
      <button className="carousel-control prev" onClick={goToPrevSlide} aria-label="Anterior">
        <span>&#10094;</span>
      </button>
      
      <button className="carousel-control next" onClick={goToNextSlide} aria-label="Siguiente">
        <span>&#10095;</span>
      </button>
      
      <div className="carousel-indicators">
        {carouselImages.map((_, index) => (
          <button 
            key={index} 
            className={`indicator ${index === currentSlide ? 'active' : ''}`}
            onClick={() => goToSlide(index)}
            aria-label={`Diapositiva ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
};

export default HeroCarousel;