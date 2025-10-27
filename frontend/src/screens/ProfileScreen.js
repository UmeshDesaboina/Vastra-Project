import React, { useState, useEffect } from 'react';
import { Form, Button, Row, Col, Table, Alert } from 'react-bootstrap';
import { LinkContainer } from 'react-router-bootstrap';
import { useDispatch, useSelector } from 'react-redux';
import axios from 'axios';
import { getUserDetails, updateUserProfile } from '../slices/userSlice';

const ProfileScreen = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [showPasswordFields, setShowPasswordFields] = useState(false);

  const dispatch = useDispatch();

  const userState = useSelector((state) => state.user);
  const { loading, error, userInfo, success } = userState;

  const [orders, setOrders] = useState([]);
  const [orderError, setOrderError] = useState(null);

  useEffect(() => {
    if (!userInfo) return;

    setName(userInfo.name || '');
    setEmail(userInfo.email || '');

    dispatch(getUserDetails('profile'));

    // fetch my orders for profile page
    const fetchMyOrders = async () => {
      try {
        setOrderError(null);
        const { data } = await axios.get('/api/orders/myorders', {
          headers: { Authorization: `Bearer ${userInfo?.token}` },
        });
        setOrders(data);
      } catch (err) {
        setOrderError(err.response?.data?.message || err.message);
      }
    };
    fetchMyOrders();
  }, [dispatch, userInfo]);

  useEffect(() => {
    if (success) {
      setSuccessMessage('Profile Updated Successfully');
      setTimeout(() => setSuccessMessage(null), 3000);
    }
  }, [success]);

  const submitHandler = (e) => {
    e.preventDefault();
    if (showPasswordFields && password !== confirmPassword) {
      setMessage('Passwords do not match');
    } else {
      dispatch(
        updateUserProfile({
          id: userInfo._id,
          name,
          email,
          password: password ? password : undefined,
        })
      );
      setPassword('');
      setConfirmPassword('');
      setShowPasswordFields(false);
    }
  };

  return (
    <Row>
      <Col md={3}>
        <h2>User Profile</h2>
        {message && <div className="alert alert-danger">{message}</div>}
        {error && <div className="alert alert-danger">{error}</div>}
        {successMessage && <div className="alert alert-success">{successMessage}</div>}
        {loading && <div>Loading...</div>}
        <Form onSubmit={submitHandler}>
          <Form.Group controlId='name' className='my-2'>
            <Form.Label>Name</Form.Label>
            <Form.Control
              type='text'
              placeholder='Enter name'
              value={name}
              onChange={(e) => setName(e.target.value)}
            ></Form.Control>
          </Form.Group>

          <Form.Group controlId='email' className='my-2'>
            <Form.Label>Email Address</Form.Label>
            <Form.Control
              type='email'
              placeholder='Enter email'
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            ></Form.Control>
          </Form.Group>

          <div className='my-2'>
            {!showPasswordFields ? (
              <Button variant='outline-secondary' size='sm' onClick={() => setShowPasswordFields(true)}>
                Change Password
              </Button>
            ) : (
              <>
                <Form.Group controlId='password' className='my-2'>
                  <Form.Label>New Password</Form.Label>
                  <Form.Control
                    type='password'
                    placeholder='Enter new password'
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  ></Form.Control>
                </Form.Group>

                <Form.Group controlId='confirmPassword' className='my-2'>
                  <Form.Label>Confirm New Password</Form.Label>
                  <Form.Control
                    type='password'
                    placeholder='Confirm new password'
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  ></Form.Control>
                </Form.Group>
                <Button variant='link' size='sm' onClick={() => { setShowPasswordFields(false); setPassword(''); setConfirmPassword(''); }}>
                  Cancel password change
                </Button>
              </>
            )}
          </div>

          <Button type='submit' variant='primary' className='my-2'>
            Update
          </Button>
        </Form>
      </Col>
      <Col md={9}>
        <h2>My Orders</h2>
        {orderError && <Alert variant='danger'>{orderError}</Alert>}
        {orders.length === 0 ? (
          <div className="alert alert-info">You have no orders</div>
        ) : (
          <Table striped bordered hover responsive className='table-sm'>
            <thead>
              <tr>
                <th>ID</th>
                <th>DATE</th>
                <th>TOTAL</th>
                <th>PAID</th>
                <th>STATUS</th>
                <th>COURIER</th>
                <th>TRACKING</th>
                <th>ETA</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order._id}>
                  <td>{order._id}</td>
                  <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                  <td>₹{order.totalPrice}</td>
                  <td>{order.isPaid ? 'Yes' : 'No'}</td>
                  <td>{order.status}</td>
                  <td>{order.courierDetails?.company || '—'}</td>
                  <td>{order.courierDetails?.trackingNumber || '—'}</td>
                  <td>{order.courierDetails?.estimatedDeliveryDate ? new Date(order.courierDetails.estimatedDeliveryDate).toLocaleDateString() : '—'}</td>
                  <td>
                    <LinkContainer to={`/order/${order._id}`}>
                      <Button className='btn-sm' variant='light'>
                        Details
                      </Button>
                    </LinkContainer>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}
      </Col>
    </Row>
  );
};

export default ProfileScreen;
