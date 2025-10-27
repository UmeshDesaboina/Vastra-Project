import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';

const features = [
  {
    icon: '✨',
    title: 'Premium Quality',
    text: 'Carefully selected materials and expert craftsmanship ensure lasting quality',
  },
  {
    icon: '🚚',
    title: 'Fast Shipping',
    text: 'Quick and reliable delivery to your doorstep with tracking updates',
  },
  {
    icon: '💯',
    title: 'Customer First',
    text: 'Dedicated support team ready to help with any questions or concerns',
  },
  {
    icon: '🔄',
    title: 'Easy Returns',
    text: 'Hassle-free returns and exchanges within 30 days of purchase',
  },
];

const WhyChoose = () => {
  return (
    <section className="features-section py-5">
      <Container>
        <div className="text-center mb-4">
          <h2 className="features-title">Why Choose Vastra?</h2>
          <p className="features-sub">We're committed to providing you with the best shopping experience</p>
        </div>
        <Row>
          {features.map((f) => (
            <Col key={f.title} sm={6} lg={3} className="mb-4">
              <div className="feature-card h-100">
                <div className="feature-icon" aria-hidden>{f.icon}</div>
                <h5 className="feature-title">{f.title}</h5>
                <p className="feature-text mb-0">{f.text}</p>
              </div>
            </Col>
          ))}
        </Row>
      </Container>
    </section>
  );
};

export default WhyChoose;
