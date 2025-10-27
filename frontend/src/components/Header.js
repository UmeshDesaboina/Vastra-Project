import React, { useState } from 'react';
import { Navbar, Nav, Container, NavDropdown, Form, Button, InputGroup } from 'react-bootstrap';
import { LinkContainer } from 'react-router-bootstrap';
import { FaShoppingCart, FaUser, FaHeart } from 'react-icons/fa';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../slices/userSlice';
import { useNavigate, useLocation } from 'react-router-dom';

const Header = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { userInfo } = useSelector((state) => state.user);

  const params = new URLSearchParams(location.search);
  const [keyword, setKeyword] = useState(params.get('keyword') || '');

  const submitHandler = (e) => {
    e.preventDefault();
    const q = keyword.trim();
    if (q) navigate(`/?keyword=${encodeURIComponent(q)}`);
    else navigate('/');
  };

  return (
    <header>
      <Navbar bg="white" expand="lg" collapseOnSelect>
        <Container>
          <LinkContainer to="/">
            <Navbar.Brand>
              <img 
                src="https://iili.io/K4IfuSt.md.png" 
                alt="Vastra" 
                className="d-inline-block align-top me-2" 
                height="56" 
              />
              Vastra ✨
            </Navbar.Brand>
          </LinkContainer>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">
            <Form className="d-flex ms-auto me-3 header-search" onSubmit={submitHandler} role="search">
              <InputGroup className="w-100">
                <Form.Control
                  type="search"
                  placeholder="Search products..."
                  aria-label="Search products"
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                />
                <Button type="submit" variant="primary">Search</Button>
              </InputGroup>
            </Form>
            <Nav className="ms-auto">
              <LinkContainer to="/cart">
                <Nav.Link aria-label="Cart">
                  <FaShoppingCart className="me-1" /> <span className="nav-link-text">Cart</span>
                </Nav.Link>
              </LinkContainer>
              <LinkContainer to="/wishlist">
                <Nav.Link aria-label="Wishlist" className="wishlist-nav-link">
                  <FaHeart className="me-1" /> <span className="nav-link-text">Wishlist</span>
                </Nav.Link>
              </LinkContainer>
              {userInfo && (
                <LinkContainer to="/myorders">
                  <Nav.Link>
                    My Orders
                  </Nav.Link>
                </LinkContainer>
              )}
              {userInfo ? (
                <NavDropdown title={`${userInfo.name}`} id="username">
                  <LinkContainer to="/profile">
                    <NavDropdown.Item>Profile</NavDropdown.Item>
                  </LinkContainer>
                  <NavDropdown.Item onClick={() => dispatch(logout())}>Logout</NavDropdown.Item>
                </NavDropdown>
              ) : (
                <LinkContainer to="/login">
                  <Nav.Link>
                    <FaUser /> Sign In
                  </Nav.Link>
                </LinkContainer>
              )}
              {userInfo && userInfo.isAdmin && (
                <NavDropdown title="Admin" id="adminmenu">
                  <LinkContainer to="/admin/dashboard">
                    <NavDropdown.Item>Dashboard</NavDropdown.Item>
                  </LinkContainer>
                  <LinkContainer to="/admin/productlist">
                    <NavDropdown.Item>Products</NavDropdown.Item>
                  </LinkContainer>
                  <LinkContainer to="/admin/orderlist">
                    <NavDropdown.Item>Orders</NavDropdown.Item>
                  </LinkContainer>
                  <LinkContainer to="/admin/userlist">
                    <NavDropdown.Item>Users</NavDropdown.Item>
                  </LinkContainer>
                  <LinkContainer to="/admin/categorylist">
                    <NavDropdown.Item>Categories</NavDropdown.Item>
                  </LinkContainer>
                  <LinkContainer to="/admin/bannerlist">
                    <NavDropdown.Item>Banners</NavDropdown.Item>
                  </LinkContainer>
                </NavDropdown>
              )}
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>
    </header>
  );
};

export default Header;
