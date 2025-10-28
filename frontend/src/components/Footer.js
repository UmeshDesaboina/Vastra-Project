import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer>
      <Container>
        <Row>
          <Col md={3} sm={6}>
            <h3 className="footer-title">Vastra Store</h3>
            <p>Premium wear for street, sports and daily use. Your style, our passion.</p>
          </Col>
          <Col md={3} sm={6}>
            <h3 className="footer-title">About Us</h3>
            <p style={{opacity:.9}}>At Vastra, we put customers first with premium quality, fast shipping and easy returns. Shop confidently with our dedicated support.</p>
          </Col>
          <Col md={3} sm={6}>
            <h3 className="footer-title">Quick Links</h3>
            <Link to="/" className="footer-link">Home</Link>
            <Link to="/cart" className="footer-link">Cart</Link>
            <Link to="/wishlist" className="footer-link">Wishlist</Link>
          </Col>
          <Col md={3} sm={6}>
            <h3 className="footer-title">Contact Us</h3>
            <p>Email: Vastrafamilyshoppy@gmail.com</p>
            <p>Phone: +91 7997909061</p>
          </Col>
        </Row>
        <Row>
          <Col className="text-center py-3">
            <p>&copy; {new Date().getFullYear()} Vastra Store. All Rights Reserved.</p>
          </Col>
        </Row>
      </Container>
    </footer>
  );
};

export default Footer;
