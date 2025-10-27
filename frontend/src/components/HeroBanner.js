import React, { useEffect, useMemo, useState } from 'react';
import { Container, Row, Col, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { normalizeImageUrl } from '../utils/imageUrl';

const HeroBanner = ({ banner }) => {
  const fallback = {
    title: 'Festive Collection 2025',
    description: 'Discover our exclusive range of ethnic wear for the festive season',
    link: '/?featured=1',
    images: [],
  };

  const data = banner || fallback;
  const images = useMemo(() => {
    const arr = Array.isArray(data.images) && data.images.length ? data.images : (data.image ? [data.image] : []);
    return arr.map(normalizeImageUrl);
  }, [data]);
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    if (images.length <= 1) return;
    const t = setInterval(() => setIdx(i => (i + 1) % images.length), 10000);
    return () => clearInterval(t);
  }, [images.length]);

  const bgImage = images[idx] || null;
  const { title, description, link } = data;

  return (
    <div className="hero-section">
      {bgImage && (
        <img
          src={bgImage}
          alt={title}
          className="hero-bg-img"
          referrerPolicy="no-referrer"
        />
      )}
      <div className={bgImage ? 'hero-overlay' : ''}>
        <Container>
          <Row>
            <Col md={7} className="hero-content">
              <h1 className="hero-title">{title}</h1>
              <p className="hero-subtitle">{description}</p>
              <Link to={link}>
                <Button variant="primary" size="lg">Shop Now</Button>
              </Link>
            </Col>
          </Row>
        </Container>
      </div>
    </div>
  );
};

export default HeroBanner;
