import React from 'react';
import { Carousel, Button, Container } from 'react-bootstrap';

const WelcomeCarousel = ({ banners = [] }) => {
  const showControls = (Array.isArray(banners) ? banners.length : 0) + 1 > 1;
  return (
    <div className="banner-carousel">
      <Carousel interval={10000} controls={showControls} indicators={showControls} fade>
        <Carousel.Item>
          <section className="hero-welcome m-0">
            <Container className="d-flex flex-column align-items-center text-center">
              <h1 className="hero-welcome-title">Welcome to Vastra</h1>
              <p className="hero-welcome-sub">Discover quality wear for street, sports, and daily use. Your style, our passion.</p>
              <div className="d-flex gap-3 flex-wrap justify-content-center">
                <Button size="lg" className="shadow-sm" onClick={()=>{ window.location.href = '/'; }}>Shop Now</Button>
                <Button size="lg" variant="outline-light" className="hero-ghost-btn" onClick={()=>{
                  const el = document.getElementById('categories');
                  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }}>Browse Categories</Button>
              </div>
            </Container>
          </section>
        </Carousel.Item>
        {(Array.isArray(banners) ? banners : []).map((b) => {
          const first = (Array.isArray(b.images) && b.images.length ? b.images[0] : b.image) || '';
          const src = first;
          return (
            <Carousel.Item key={b._id || b.title}>
              <img
                src={src}
                alt={b.title || 'Banner'}
                className="d-block w-100 banner-img"
                referrerPolicy="no-referrer"
              />
              {(b.title || b.description) && (
                <Carousel.Caption className="banner-caption">
                  {b.title && <h3>{b.title}</h3>}
                  {b.description && <p>{b.description}</p>}
                </Carousel.Caption>
              )}
            </Carousel.Item>
          );
        })}
      </Carousel>
    </div>
  );
};

export default WelcomeCarousel;
