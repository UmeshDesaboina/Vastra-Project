import React from 'react';
import { Card, Button, Badge } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { FaHeart } from 'react-icons/fa';
import { useDispatch } from 'react-redux';
import { addToCart } from '../slices/cartSlice';
import { addToWishlist } from '../slices/wishlistSlice';
import { normalizeImageUrl } from '../utils/imageUrl';

const firstImage = (p) => {
  const url = p?.images && p.images.length > 0 ? p.images[0] : '';
  return url ? normalizeImageUrl(url) : '/vastra-logo.svg';
};

const ProductCard = ({ product }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleAddToCart = () => {
    const price = product.discountPrice > 0 ? product.discountPrice : product.price;
    dispatch(
      addToCart({
        product: product._id,
        name: product.name,
        image: firstImage(product),
        price,
        countInStock: product.stock || product.countInStock || 10,
        qty: 1,
        size: product.sizes && product.sizes.length === 1 ? product.sizes[0] : undefined,
      })
    );
    navigate('/cart');
  };

  const handleAddToWishlist = () => {
    const price = product.discountPrice > 0 ? product.discountPrice : product.price;
    dispatch(
      addToWishlist({
        product: product._id,
        name: product.name,
        image: firstImage(product),
        price,
      })
    );
    if (typeof window !== 'undefined') alert('Added to wishlist');
  };

  const inStock = (product.stock || product.countInStock || 0) > 0;

  return (
    <Card className="product-card">
      <div className="position-relative">
        <Link to={`/product/${product._id}`}>
          <Card.Img 
            variant="top" 
            src={firstImage(product)} 
            className="product-img"
            referrerPolicy="no-referrer"
            onError={(e)=>{ e.currentTarget.src = '/vastra-logo.svg'; }}
            style={!inStock ? { opacity: 0.6 } : {}}
          />
        </Link>
        {!inStock && (
          <Badge bg="danger" className="position-absolute top-0 start-0 m-2 out-of-stock-badge">
            Out of Stock
          </Badge>
        )}
      </div>
      <Card.Body>
        <Link to={`/product/${product._id}`} className="text-decoration-none">
          <Card.Title className="product-title">{product.name}</Card.Title>
        </Link>
        <div className="d-flex align-items-center mb-2">
          {product.discountPrice > 0 && (
            <span className="discount-price">₹{product.price}</span>
          )}
          <span className="product-price">₹{product.discountPrice > 0 ? product.discountPrice : product.price}</span>
        </div>
        <div className="d-flex justify-content-between gap-2">
          <Button 
            variant="primary" 
            size="sm" 
            onClick={handleAddToCart} 
            className="flex-grow-1"
            disabled={!inStock}
          >
            {inStock ? 'Add to Cart' : 'Out of Stock'}
          </Button>
          <Button 
            variant="outline-primary" 
            size="sm" 
            onClick={handleAddToWishlist} 
            aria-label="Add to wishlist" 
            className="wishlist-btn"
            disabled={!inStock}
          >
            <FaHeart className="me-1" /> <span className="wishlist-btn-text">Wishlist ❤️</span>
          </Button>
        </div>
      </Card.Body>
    </Card>
  );
};

export default ProductCard;
