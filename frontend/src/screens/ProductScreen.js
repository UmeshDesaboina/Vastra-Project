import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Row, Col, Image, ListGroup, Card, Button, Form, Spinner, Alert } from 'react-bootstrap';
import { FaHeart, FaStar, FaStarHalfAlt, FaRegStar, FaEdit, FaTrash } from 'react-icons/fa';
import { useDispatch, useSelector } from 'react-redux';
import axios from 'axios';
import { addToCart } from '../slices/cartSlice';
import { addToWishlist } from '../slices/wishlistSlice';
import { normalizeImageUrl } from '../utils/imageUrl';

// Review Item Component with Edit/Delete
const ReviewItem = ({ review, productId, onReviewUpdated }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [rating, setRating] = useState(review.rating);
  const [comment, setComment] = useState(review.comment);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState(null);
  const { userInfo } = useSelector((state) => state.user);

  const RatingStars = ({ value = 0 }) => {
    return (
      <div className='rating'>
        {[1, 2, 3, 4, 5].map((star) => (
          <span key={star}>
            {value >= star ? (
              <FaStar />
            ) : value >= star - 0.5 ? (
              <FaStarHalfAlt />
            ) : (
              <FaRegStar />
            )}
          </span>
        ))}
      </div>
    );
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      setMessage(null);
      await axios.put(
        `/api/products/${productId}/reviews/${review._id}`,
        { rating, comment },
        {
          headers: {
            Authorization: `Bearer ${userInfo.token}`,
          },
        }
      );
      setMessage({ type: 'success', text: 'Review updated successfully!' });
      setTimeout(() => {
        setIsEditing(false);
        if (onReviewUpdated) onReviewUpdated();
      }, 1000);
    } catch (err) {
      setMessage({
        type: 'danger',
        text: err.response?.data?.message || 'Failed to update review',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this review?')) return;
    try {
      setSubmitting(true);
      await axios.delete(`/api/products/${productId}/reviews/${review._id}`, {
        headers: {
          Authorization: `Bearer ${userInfo.token}`,
        },
      });
      if (onReviewUpdated) onReviewUpdated();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete review');
      setSubmitting(false);
    }
  };

  const canEdit = userInfo && (userInfo._id === review.user || userInfo.isAdmin);

  return (
    <ListGroup.Item>
      {message && <Alert variant={message.type}>{message.text}</Alert>}
      <div className="d-flex justify-content-between align-items-start">
        <div className="flex-grow-1">
          <strong>{review.name}</strong>
          {!isEditing && (
            <>
              <RatingStars value={review.rating} />
              <p className="text-muted mb-1">{new Date(review.createdAt).toLocaleDateString()}</p>
              <p>{review.comment}</p>
            </>
          )}
          {isEditing && (
            <Form onSubmit={handleUpdate} className="mt-2">
              <Form.Group controlId='editRating' className='mb-2'>
                <Form.Label>Rating</Form.Label>
                <Form.Control
                  as='select'
                  value={rating}
                  onChange={(e) => setRating(Number(e.target.value))}
                  size='sm'
                >
                  <option value='1'>1 - Poor</option>
                  <option value='2'>2 - Fair</option>
                  <option value='3'>3 - Good</option>
                  <option value='4'>4 - Very Good</option>
                  <option value='5'>5 - Excellent</option>
                </Form.Control>
              </Form.Group>
              <Form.Group controlId='editComment' className='mb-2'>
                <Form.Label>Comment</Form.Label>
                <Form.Control
                  as='textarea'
                  rows='2'
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  required
                  size='sm'
                ></Form.Control>
              </Form.Group>
              <Button type='submit' variant='primary' size='sm' disabled={submitting} className='me-2'>
                {submitting ? 'Saving...' : 'Save'}
              </Button>
              <Button variant='secondary' size='sm' onClick={() => setIsEditing(false)}>
                Cancel
              </Button>
            </Form>
          )}
        </div>
        {canEdit && !isEditing && (
          <div className="ms-3">
            <Button
              variant="outline-primary"
              size="sm"
              onClick={() => setIsEditing(true)}
              className="me-2"
              disabled={submitting}
            >
              <FaEdit />
            </Button>
            <Button
              variant="outline-danger"
              size="sm"
              onClick={handleDelete}
              disabled={submitting}
            >
              <FaTrash />
            </Button>
          </div>
        )}
      </div>
    </ListGroup.Item>
  );
};

// Review Form Component
const ReviewForm = ({ productId, onReviewAdded }) => {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState(null);
  const { userInfo } = useSelector((state) => state.user);

  const submitHandler = async (e) => {
    e.preventDefault();
    if (!userInfo) {
      setMessage({ type: 'danger', text: 'Please login to write a review' });
      return;
    }
    try {
      setSubmitting(true);
      setMessage(null);
      console.log('Submitting review:', { productId, rating, comment });
      console.log('User token:', userInfo.token ? 'Token exists' : 'No token');
      
      const response = await axios.post(
        `/api/products/${productId}/reviews`,
        { rating, comment },
        {
          headers: {
            Authorization: `Bearer ${userInfo.token}`,
          },
        }
      );
      console.log('Review response:', response.data);
      setMessage({ type: 'success', text: 'Review submitted successfully!' });
      setRating(5);
      setComment('');
      setTimeout(() => {
        if (onReviewAdded) onReviewAdded();
      }, 1000);
    } catch (err) {
      console.error('Review submission error:', err);
      console.error('Error response:', err.response);
      const errorMsg = err.response?.data?.message || err.message || 'Failed to submit review';
      setMessage({
        type: 'danger',
        text: errorMsg,
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mt-4">
      <h4>Write a Review</h4>
      {message && <Alert variant={message.type}>{message.text}</Alert>}
      <Form onSubmit={submitHandler}>
        <Form.Group controlId='rating' className='mb-3'>
          <Form.Label>Rating</Form.Label>
          <Form.Control
            as='select'
            value={rating}
            onChange={(e) => setRating(Number(e.target.value))}
          >
            <option value='1'>1 - Poor</option>
            <option value='2'>2 - Fair</option>
            <option value='3'>3 - Good</option>
            <option value='4'>4 - Very Good</option>
            <option value='5'>5 - Excellent</option>
          </Form.Control>
        </Form.Group>
        <Form.Group controlId='comment' className='mb-3'>
          <Form.Label>Comment</Form.Label>
          <Form.Control
            as='textarea'
            rows='3'
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            required
          ></Form.Control>
        </Form.Group>
        <Button type='submit' variant='primary' disabled={submitting}>
          {submitting ? 'Submitting...' : 'Submit Review'}
        </Button>
      </Form>
    </div>
  );
};

const ProductScreen = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [qty, setQty] = useState(1);
  const [selectedSize, setSelectedSize] = useState('');
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [imgIdx, setImgIdx] = useState(0);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError(null);
        const { data } = await axios.get(`/api/products/${id}`);
        setProduct(data);
      } catch (err) {
        setError(err.response?.data?.message || err.message);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  // Rating stars component
  const RatingStars = ({ value = 0, text }) => {
    return (
      <div className='rating'>
        {[1, 2, 3, 4, 5].map((star) => (
          <span key={star}>
            {value >= star ? (
              <FaStar />
            ) : value >= star - 0.5 ? (
              <FaStarHalfAlt />
            ) : (
              <FaRegStar />
            )}
          </span>
        ))}
        <span className='rating-text'>{text && text}</span>
      </div>
    );
  };

  const addToCartHandler = () => {
    if (!selectedSize && (product?.sizes?.length || 0) > 0) {
      alert('Please select a size');
      return;
    }
    const image = product?.images?.[0] ? normalizeImageUrl(product.images[0]) : '/vastra-logo.svg';
    dispatch(
      addToCart({
        product: product?._id || id,
        name: product?.name,
        image,
        price: (product?.discountPrice > 0 ? product.discountPrice : product?.price) || 0,
        countInStock: product?.countInStock || product?.stock || 0,
        qty,
        size: selectedSize || (product?.sizes?.length === 1 ? product.sizes[0] : undefined),
        deliveryCharges: product?.deliveryCharges || 0,
      })
    );
    navigate('/cart');
  };

  const addToWishlistHandler = () => {
    const image = product?.images?.[0] ? normalizeImageUrl(product.images[0]) : 'https://via.placeholder.com/600x600?text=Product+Image';
    dispatch(
      addToWishlist({
        product: product?._id || id,
        name: product?.name,
        image,
        price: (product?.discountPrice > 0 ? product.discountPrice : product?.price) || 0,
      })
    );
    alert('Product added to wishlist!');
  };

  if (loading) {
    return (
      <div className="product-screen py-3">
        <Link className='btn btn-light my-3' to='/'>Back to Products</Link>
        <Spinner animation='border' />
      </div>
    );
  }
  if (error) {
    return (
      <div className="product-screen py-3">
        <Link className='btn btn-light my-3' to='/'>Back to Products</Link>
        <Alert variant='danger'>{error}</Alert>
      </div>
    );
  }
  if (!product) return null;

  return (
    <div className="product-screen py-3">
      <Link className='btn btn-light my-3' to='/'>
        Back to Products
      </Link>
      <Row>
        <Col md={5}>
          <div className='position-relative'>
            <Image src={product.images?.[imgIdx] ? normalizeImageUrl(product.images[imgIdx]) : '/vastra-logo.svg'} alt={product.name} fluid className="product-detail-image" referrerPolicy='no-referrer' onError={(e)=>{ e.currentTarget.src = '/vastra-logo.svg'; }} />
            {product.images?.length > 1 && (
              <div className='d-flex justify-content-between mt-2'>
                {product.images.map((img, i) => (
                  <Image key={img} src={normalizeImageUrl(img)} onClick={()=>setImgIdx(i)} alt='' thumbnail style={{width: 64, height: 64, objectFit: 'cover', cursor:'pointer', border: i===imgIdx? '2px solid #6c63ff':'1px solid #ddd'}} />
                ))}
              </div>
            )}
          </div>
        </Col>
        <Col md={4}>
          <ListGroup variant='flush'>
            <ListGroup.Item>
              <h3>{product.name}</h3>
            </ListGroup.Item>
            <ListGroup.Item>
              <RatingStars value={product.rating} text={`${product.numReviews} reviews`} />
            </ListGroup.Item>
            <ListGroup.Item>
              <div className="d-flex align-items-center">
                {product.discountPrice > 0 && (
                  <span className="discount-price me-2">₹{product.price}</span>
                )}
                <span className="product-price">₹{product.discountPrice > 0 ? product.discountPrice : product.price}</span>
              </div>
            </ListGroup.Item>
            {product.fabric && (
              <ListGroup.Item>
                <strong>Fabric:</strong> {product.fabric}
              </ListGroup.Item>
            )}
            <ListGroup.Item>
              <p>{product.description}</p>
            </ListGroup.Item>
          </ListGroup>
        </Col>
        <Col md={3}>
          <Card>
            <ListGroup variant='flush'>
              <ListGroup.Item>
                <Row>
                  <Col>Status:</Col>
                  <Col>
                    {(product.countInStock || product.stock || 0) > 0 ? 'In Stock' : 'Out Of Stock'}
                  </Col>
                </Row>
              </ListGroup.Item>

              {(product.countInStock || product.stock || 0) > 0 && (
                <>
                  {(() => {
                    const catName = product.category?.name?.toLowerCase?.() || '';
                    const askSize = product.sizes?.length > 0 && !/(saree|sari|women)/.test(catName);
                    if (!askSize) return null;
                    return (
                      <ListGroup.Item>
                        <Row>
                          <Col>Size:</Col>
                          <Col>
                            <Form.Control
                              as='select'
                              value={selectedSize}
                              onChange={(e) => setSelectedSize(e.target.value)}
                            >
                              <option value=''>Select Size</option>
                              {product.sizes.map((size) => (
                                <option key={size} value={size}>
                                  {size}
                                </option>
                              ))}
                            </Form.Control>
                          </Col>
                        </Row>
                      </ListGroup.Item>
                    );
                  })()}
                  <ListGroup.Item>
                    <Row>
                      <Col>Qty:</Col>
                      <Col>
                        <Form.Control
                          as='select'
                          value={qty}
                          onChange={(e) => setQty(Number(e.target.value))}
                        >
                          {[...Array(Math.min(10, product.countInStock || product.stock || 0)).keys()].map((x) => (
                            <option key={x + 1} value={x + 1}>
                              {x + 1}
                            </option>
                          ))}
                        </Form.Control>
                      </Col>
                    </Row>
                  </ListGroup.Item>
                </>
              )}

              <ListGroup.Item>
                <Button
                  onClick={addToCartHandler}
                  className='btn-block w-100 mb-2'
                  type='button'
                  disabled={(product.countInStock || product.stock || 0) === 0}
                >
                  Add To Cart
                </Button>
                <Button
                  onClick={() => {
                    if (!selectedSize && (product?.sizes?.length || 0) > 0) {
                      alert('Please select a size');
                      return;
                    }
                    const image = product?.images?.[0] ? normalizeImageUrl(product.images[0]) : 'https://via.placeholder.com/600x600?text=Product+Image';
                    dispatch(
                      addToCart({
                        product: product?._id || id,
                        name: product?.name,
                        image,
                        price: (product?.discountPrice > 0 ? product.discountPrice : product?.price) || 0,
                        countInStock: product?.countInStock || product?.stock || 0,
                        qty,
                        size: selectedSize || (product?.sizes?.length === 1 ? product.sizes[0] : undefined),
                        deliveryCharges: product?.deliveryCharges || 0,
                      })
                    );
                    navigate('/shipping');
                  }}
                  className='btn-block w-100 btn-primary'
                  type='button'
                  disabled={(product.countInStock || product.stock || 0) === 0}
                >
                  Buy Now
                </Button>
              </ListGroup.Item>
              <ListGroup.Item>
                <Button
                  onClick={addToWishlistHandler}
                  className='btn-block btn-outline-primary w-100'
                  type='button'
                >
                  <FaHeart className="me-2" /> Add To Wishlist
                </Button>
              </ListGroup.Item>
            </ListGroup>
          </Card>
        </Col>
      </Row>
      <Row className="mt-4">
        <Col md={8}>
          <h2>Reviews</h2>
          {product.reviews?.length ? (
            <ListGroup variant='flush'>
              {product.reviews.map((review) => (
                <ReviewItem 
                  key={review._id} 
                  review={review} 
                  productId={id} 
                  onReviewUpdated={() => window.location.reload()} 
                />
              ))}
            </ListGroup>
          ) : (
            <p>No Reviews</p>
          )}
          
          <ReviewForm productId={id} onReviewAdded={() => window.location.reload()} />
        </Col>
      </Row>
    </div>
  );
};

export default ProductScreen;
