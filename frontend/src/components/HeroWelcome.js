import React from 'react';
import { Container, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';

const HeroWelcome = () => {
  return (
    <section className="hero-welcome">
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
  );
};

export default HeroWelcome;
