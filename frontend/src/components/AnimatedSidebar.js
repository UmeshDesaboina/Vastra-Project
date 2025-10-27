import React from 'react';
import { Nav } from 'react-bootstrap';
import { Link } from 'react-router-dom';

const items = [
  { label: 'Men', value: 'Men' },
  { label: 'Women', value: 'Women' },
  { label: 'Premium Sarees', value: 'Premium Sarees' },
  { label: 'Kids', value: 'Kids' },
];

const AnimatedSidebar = () => {
  return (
    <div className="animated-sidebar">
      <div className="sidebar-header">
        <img src="/vastra-logo.svg" alt="Vastra" className="sidebar-logo" />
        <h5 className="mb-0">Browse Categories</h5>
      </div>
      <Nav className="flex-column">
        {items.map((it) => (
          <Nav.Item key={it.value} className="sidebar-item">
            <Link to={`/?category=${encodeURIComponent(it.value)}`} className="sidebar-link">
              {it.label}
            </Link>
          </Nav.Item>
        ))}
      </Nav>
    </div>
  );
};

export default AnimatedSidebar;