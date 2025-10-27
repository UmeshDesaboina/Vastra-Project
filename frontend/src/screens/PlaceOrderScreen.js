import React, { useState } from 'react';
import { Button, Row, Col, ListGroup, Image, Card } from 'react-bootstrap';
import { useNavigate, Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import axios from 'axios';
import { clearCartItems } from '../slices/cartSlice';

const PlaceOrderScreen = () => {
  const cart = useSelector((state) => state.cart);
  const { userInfo } = useSelector((s) => s.user);
  const navigate = useNavigate();

  const addDecimals = (num) => (Math.round(num * 100) / 100).toFixed(2);

  const itemsPrice = Number(
    addDecimals(cart.cartItems.reduce((acc, item) => acc + item.price * item.qty, 0))
  );
  const totalDeliveryCharges = Number(
    addDecimals(cart.cartItems.reduce((acc, item) => acc + (item.deliveryCharges || 0) * item.qty, 0))
  );
  const shippingPrice = Number(addDecimals(itemsPrice > 100 ? 0 : 10));
  const taxPrice = Number(addDecimals(Number((0.15 * itemsPrice).toFixed(2))));
  const totalPrice = Number(addDecimals(itemsPrice + shippingPrice + taxPrice + totalDeliveryCharges));

  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);

  const placeOrderHandler = async () => {
    try {
      setLoading(true);
      const { data } = await axios.post('/api/orders', {
        orderItems: cart.cartItems.map(i => ({
          name: i.name,
          qty: i.qty,
          image: i.image,
          price: i.price,
          size: i.size,
          deliveryCharges: i.deliveryCharges || 0,
          product: i.product,
        })),
        shippingAddress: {
          name: cart.shippingAddress.name || userInfo?.name || 'Customer',
          phone: cart.shippingAddress.phone || '0000000000',
          address: cart.shippingAddress.address,
          city: cart.shippingAddress.city,
          state: cart.shippingAddress.state || cart.shippingAddress.country || '',
          pincode: cart.shippingAddress.pincode || cart.shippingAddress.postalCode,
        },
        paymentMethod: cart.paymentMethod || 'COD',
        paymentDetails: cart.paymentDetails || undefined,
        itemsPrice,
        shippingPrice,
        totalPrice,
      }, {
        headers: { Authorization: `Bearer ${userInfo?.token}` }
      });

      dispatch(clearCartItems());
      navigate(`/order/${data._id}`);
    } catch (err) {
      alert(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <h1>Place Order</h1>
      <Row>
        <Col md={8}>
          <ListGroup variant='flush'>
            <ListGroup.Item>
              <h2>Shipping</h2>
              <p>
                <strong>Name:</strong> {cart.shippingAddress.name || userInfo?.name}<br/>
                <strong>Phone:</strong> {cart.shippingAddress.phone}<br/>
                <strong>Address:</strong> {cart.shippingAddress.address}, {cart.shippingAddress.city} {cart.shippingAddress.pincode}
              </p>
            </ListGroup.Item>

            <ListGroup.Item>
              <h2>Payment Method</h2>
              <strong>Method: </strong>
              {cart.paymentMethod}
              {(cart.paymentMethod === 'PayPal' || cart.paymentMethod === 'Stripe') && cart.paymentDetails?.last4 && (
                <p className='mb-0'>Card ending ****{cart.paymentDetails.last4}, exp {cart.paymentDetails.expiryMonth}/{cart.paymentDetails.expiryYear}</p>
              )}
            </ListGroup.Item>

            <ListGroup.Item>
              <h2>Order Items</h2>
              {cart.cartItems.length === 0 ? (
                <p>Your cart is empty</p>
              ) : (
                <ListGroup variant='flush'>
                  {cart.cartItems.map((item, index) => (
                    <ListGroup.Item key={index}>
                      <Row>
                        <Col md={1}>
                          <Image
                            src={item.image}
                            alt={item.name}
                            fluid
                            rounded
                            onError={(e)=>{ e.currentTarget.src = '/vastra-logo.svg'; }}
                          />
                        </Col>
                        <Col>
                          <Link to={`/product/${item.product}`}>
                            {item.name}
                          </Link>
                          {item.size && <div><small className="text-muted">Size: {item.size}</small></div>}
                        </Col>
                        <Col md={4}>
                          {item.qty} x ₹{item.price} = ₹{(item.qty * item.price).toFixed(2)}
                          {item.deliveryCharges > 0 && <div><small className="text-muted">+ ₹{(item.deliveryCharges * item.qty).toFixed(2)} delivery</small></div>}
                        </Col>
                      </Row>
                    </ListGroup.Item>
                  ))}
                </ListGroup>
              )}
            </ListGroup.Item>
          </ListGroup>
        </Col>
        <Col md={4}>
          <Card>
            <ListGroup variant='flush'>
              <ListGroup.Item>
                <h2>Order Summary</h2>
              </ListGroup.Item>
              <ListGroup.Item>
                <Row>
                  <Col>Items</Col>
                  <Col>₹{itemsPrice.toFixed(2)}</Col>
                </Row>
              </ListGroup.Item>
              <ListGroup.Item>
                <Row>
                  <Col>Shipping</Col>
                  <Col>₹{shippingPrice.toFixed(2)}</Col>
                </Row>
              </ListGroup.Item>
              {totalDeliveryCharges > 0 && (
                <ListGroup.Item>
                  <Row>
                    <Col>Delivery Charges</Col>
                    <Col>₹{totalDeliveryCharges.toFixed(2)}</Col>
                  </Row>
                </ListGroup.Item>
              )}
              <ListGroup.Item>
                <Row>
                  <Col>Tax</Col>
                  <Col>₹{taxPrice.toFixed(2)}</Col>
                </Row>
              </ListGroup.Item>
              <ListGroup.Item>
                <Row>
                  <Col>Total</Col>
                  <Col>₹{totalPrice.toFixed(2)}</Col>
                </Row>
              </ListGroup.Item>
              <ListGroup.Item>
                <Button
                  type='button'
                  className='btn-block w-100'
                  disabled={cart.cartItems.length === 0 || loading}
                  onClick={placeOrderHandler}
                >
                  {loading ? 'Processing...' : 'Place Order 📦'}
                </Button>
              </ListGroup.Item>
            </ListGroup>
          </Card>
        </Col>
      </Row>
    </>
  );
};

export default PlaceOrderScreen;
