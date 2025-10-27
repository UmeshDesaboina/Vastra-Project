import React from 'react';
import { Row, Col, ListGroup, Button, Image } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { FaTrash } from 'react-icons/fa';
import { useDispatch, useSelector } from 'react-redux';
import { removeFromWishlist } from '../slices/wishlistSlice';
import { addToCart } from '../slices/cartSlice';
import { useNavigate } from 'react-router-dom';

const WishlistScreen = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const wishlist = useSelector((state) => state.wishlist);
  const { wishlistItems } = wishlist;

  const removeFromWishlistHandler = (id) => {
    dispatch(removeFromWishlist(id));
  };

  const moveToCartHandler = (item) => {
    dispatch(
      addToCart({
        product: item.product,
        name: item.name,
        image: item.image,
        price: item.price,
        countInStock: 10, // Default value
        qty: 1,
        size: 'M', // Default size
      })
    );
    dispatch(removeFromWishlist(item.product));
    navigate('/cart');
  };

  return (
    <>
      <h1>My Wishlist</h1>
      {wishlistItems.length === 0 ? (
        <div className='text-center py-3'>
          <h2>Your wishlist is empty</h2>
          <Link to='/' className='btn btn-primary mt-3'>
            Go Shopping
          </Link>
        </div>
      ) : (
        <ListGroup variant='flush'>
          {wishlistItems.map((item) => (
            <ListGroup.Item key={item._id}>
              <Row className='align-items-center'>
                <Col md={2}>
                  <Image src={item.image} alt={item.name} fluid rounded />
                </Col>
                <Col md={3}>
                  <Link to={`/product/${item._id}`}>{item.name}</Link>
                </Col>
                <Col md={2}>₹{item.price}</Col>
                <Col md={2}>
                  {item.countInStock > 0 ? 'In Stock' : 'Out Of Stock'}
                </Col>
                <Col md={2}>
                  <Button
                  type='button'
                  variant='light'
                  onClick={() => removeFromWishlistHandler(item.product)}
                >
                  <FaTrash />
                </Button>
              </Col>
              <Col md={2}>
                <Button
                  type='button'
                  className="btn-block"
                  onClick={() => moveToCartHandler(item)}
                >
                  Move to Cart
                </Button>
              </Col>
              </Row>
            </ListGroup.Item>
          ))}
        </ListGroup>
      )}
    </>
  );
};

export default WishlistScreen;