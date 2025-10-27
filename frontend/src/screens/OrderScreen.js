import React, { useEffect, useState } from 'react';
import { Row, Col, ListGroup, Image, Card, Spinner, Alert, Button, Modal, Form } from 'react-bootstrap';
import { Link, useParams } from 'react-router-dom';
import axios from 'axios';
import { useSelector } from 'react-redux';

const OrderScreen = () => {
  const { id } = useParams();
  const { userInfo } = useSelector((s) => s.user);

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showReturnModal, setShowReturnModal] = useState(false);
  const [showReplacementModal, setShowReplacementModal] = useState(false);
  const [returnReason, setReturnReason] = useState('');
  const [replacementReason, setReplacementReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        setLoading(true);
        setError(null);
        const { data } = await axios.get(`/api/orders/${id}`, {
          headers: { Authorization: `Bearer ${userInfo?.token}` },
        });
        setOrder(data);
      } catch (err) {
        setError(err.response?.data?.message || err.message);
      } finally {
        setLoading(false);
      }
    };
    if (userInfo) fetchOrder();
  }, [id, userInfo]);

  const handleReturnRequest = async () => {
    if (!returnReason.trim()) {
      alert('Please provide a reason for return');
      return;
    }
    try {
      setActionLoading(true);
      const { data } = await axios.post(
        `/api/orders/${id}/return`,
        { reason: returnReason },
        { headers: { Authorization: `Bearer ${userInfo?.token}` } }
      );
      setOrder(data);
      setShowReturnModal(false);
      setReturnReason('');
      alert('Return request submitted successfully');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to submit return request');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReplacementRequest = async () => {
    if (!replacementReason.trim()) {
      alert('Please provide a reason for replacement');
      return;
    }
    try {
      setActionLoading(true);
      const { data } = await axios.post(
        `/api/orders/${id}/replacement`,
        { reason: replacementReason },
        { headers: { Authorization: `Bearer ${userInfo?.token}` } }
      );
      setOrder(data);
      setShowReplacementModal(false);
      setReplacementReason('');
      alert('Replacement request submitted successfully');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to submit replacement request');
    } finally {
      setActionLoading(false);
    }
  };

  if (!userInfo) return <Alert variant='warning'>Please sign in to view the order.</Alert>;
  if (loading) return <Spinner animation='border' />;
  if (error) return <Alert variant='danger'>{error}</Alert>;
  if (!order) return null;

  return (
    <>
      <h1>Order {order._id}</h1>
      <Row>
        <Col md={8}>
          <ListGroup variant='flush'>
            <ListGroup.Item>
              <h2>Shipping</h2>
              <p>
                <strong>Name: </strong> {order.shippingAddress?.name}
              </p>
              <p>
                <strong>Phone: </strong> {order.shippingAddress?.phone}
              </p>
              <p>
                <strong>Address: </strong>
                {order.shippingAddress?.address}, {order.shippingAddress?.city}{' '}
                {order.shippingAddress?.pincode},{' '}
                {order.shippingAddress?.state}
              </p>
              {order.deliveredAt ? (
                <div className='alert alert-success'>
                  Delivered on {new Date(order.deliveredAt).toLocaleString()}
                </div>
              ) : (
                <div className='alert alert-danger'>Not Delivered</div>
              )}
            </ListGroup.Item>

            <ListGroup.Item>
              <h2>Payment Method</h2>
              <p>
                <strong>Method: </strong>
                {order.paymentMethod}
              </p>
              {order.isPaid ? (
                <div className='alert alert-success'>
                  ✓ Payment Successful
                  {order.paidAt && <div><small>Paid on {new Date(order.paidAt).toLocaleString()}</small></div>}
                </div>
              ) : (
                <div className='alert alert-warning'>Payment Pending</div>
              )}
            </ListGroup.Item>

            <ListGroup.Item>
              <h2>Shipping Status</h2>
              <p><strong>Status:</strong> {order.status}</p>
              {order.courierDetails?.company && (
                <>
                  <p><strong>Courier:</strong> {order.courierDetails.company}</p>
                  <p><strong>Tracking #:</strong> {order.courierDetails.trackingNumber}</p>
                  {order.courierDetails.estimatedDeliveryDate && (
                    <p><strong>ETA:</strong> {new Date(order.courierDetails.estimatedDeliveryDate).toLocaleDateString()}</p>
                  )}
                </>
              )}
            </ListGroup.Item>

            <ListGroup.Item>
              <h2>Order Items</h2>
              {(!order.orderItems || order.orderItems.length === 0) ? (
                <p>Order is empty</p>
              ) : (
                <ListGroup variant='flush'>
                  {order.orderItems.map((item, index) => (
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
                          {item.qty} x ₹{item.price} = ₹{item.qty * item.price}
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
                  <Col>₹{order.itemsPrice}</Col>
                </Row>
              </ListGroup.Item>
              <ListGroup.Item>
                <Row>
                  <Col>Shipping</Col>
                  <Col>₹{order.shippingPrice}</Col>
                </Row>
              </ListGroup.Item>
              <ListGroup.Item>
                <Row>
                  <Col>Total</Col>
                  <Col>₹{order.totalPrice}</Col>
                </Row>
              </ListGroup.Item>
              <ListGroup.Item>
                <Row>
                  <Col>Status</Col>
                  <Col>{order.status}</Col>
                </Row>
              </ListGroup.Item>
              
              {/* Return/Replacement Section */}
              {order.status === 'Delivered' && (
                <ListGroup.Item>
                  <h6 className='mb-3'>Order Actions</h6>
                  
                  {/* Return Request */}
                  {order.returnRequest?.requested ? (
                    <Alert variant='info' className='mb-2'>
                      <strong>Return Requested</strong>
                      <div><small>Status: {order.returnRequest.status}</small></div>
                      <div><small>Reason: {order.returnRequest.reason}</small></div>
                      {order.returnRequest.adminNotes && (
                        <div><small>Admin Notes: {order.returnRequest.adminNotes}</small></div>
                      )}
                      {order.returnRequest.pickupCourierDetails?.company && (
                        <div className='mt-2'>
                          <strong>Pickup Details:</strong>
                          <div><small>Courier: {order.returnRequest.pickupCourierDetails.company}</small></div>
                          <div><small>Tracking: {order.returnRequest.pickupCourierDetails.trackingNumber}</small></div>
                          {order.returnRequest.pickupCourierDetails.expectedPickupDate && (
                            <div><small>Expected: {new Date(order.returnRequest.pickupCourierDetails.expectedPickupDate).toLocaleDateString()}</small></div>
                          )}
                        </div>
                      )}
                      {order.returnRequest.status === 'Pending' && (
                        <Button
                          variant='outline-danger'
                          size='sm'
                          className='mt-2'
                          onClick={async () => {
                            if (window.confirm('Cancel return request?')) {
                              try {
                                setActionLoading(true);
                                const { data } = await axios.delete(`/api/orders/${id}/return`, {
                                  headers: { Authorization: `Bearer ${userInfo?.token}` }
                                });
                                setOrder(data);
                                alert('Return request cancelled');
                              } catch (err) {
                                alert(err.response?.data?.message || 'Failed to cancel return request');
                              } finally {
                                setActionLoading(false);
                              }
                            }
                          }}
                          disabled={actionLoading}
                        >
                          Cancel Return Request
                        </Button>
                      )}
                    </Alert>
                  ) : (
                    <Button 
                      variant='outline-warning' 
                      size='sm' 
                      className='mb-2 w-100'
                      onClick={() => setShowReturnModal(true)}
                    >
                      Request Return
                    </Button>
                  )}
                  
                  {/* Replacement Request */}
                  {order.replacementRequest?.requested ? (
                    <Alert variant='info' className='mb-0'>
                      <strong>Replacement Requested</strong>
                      <div><small>Status: {order.replacementRequest.status}</small></div>
                      <div><small>Reason: {order.replacementRequest.reason}</small></div>
                      {order.replacementRequest.adminNotes && (
                        <div><small>Admin Notes: {order.replacementRequest.adminNotes}</small></div>
                      )}
                      {order.replacementRequest.pickupCourierDetails?.company && (
                        <div className='mt-2'>
                          <strong>Pickup Details:</strong>
                          <div><small>Courier: {order.replacementRequest.pickupCourierDetails.company}</small></div>
                          <div><small>Tracking: {order.replacementRequest.pickupCourierDetails.trackingNumber}</small></div>
                          {order.replacementRequest.pickupCourierDetails.expectedPickupDate && (
                            <div><small>Expected: {new Date(order.replacementRequest.pickupCourierDetails.expectedPickupDate).toLocaleDateString()}</small></div>
                          )}
                        </div>
                      )}
                      {order.replacementRequest.status === 'Pending' && (
                        <Button
                          variant='outline-danger'
                          size='sm'
                          className='mt-2'
                          onClick={async () => {
                            if (window.confirm('Cancel replacement request?')) {
                              try {
                                setActionLoading(true);
                                const { data } = await axios.delete(`/api/orders/${id}/replacement`, {
                                  headers: { Authorization: `Bearer ${userInfo?.token}` }
                                });
                                setOrder(data);
                                alert('Replacement request cancelled');
                              } catch (err) {
                                alert(err.response?.data?.message || 'Failed to cancel replacement request');
                              } finally {
                                setActionLoading(false);
                              }
                            }
                          }}
                          disabled={actionLoading}
                        >
                          Cancel Replacement Request
                        </Button>
                      )}
                    </Alert>
                  ) : (
                    <Button 
                      variant='outline-info' 
                      size='sm' 
                      className='w-100'
                      onClick={() => setShowReplacementModal(true)}
                    >
                      Request Replacement
                    </Button>
                  )}
                </ListGroup.Item>
              )}
            </ListGroup>
          </Card>
        </Col>
      </Row>

      {/* Return Request Modal */}
      <Modal show={showReturnModal} onHide={() => setShowReturnModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Request Return</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group>
              <Form.Label>Reason for Return</Form.Label>
              <Form.Control
                as='textarea'
                rows={3}
                value={returnReason}
                onChange={(e) => setReturnReason(e.target.value)}
                placeholder='Please explain why you want to return this order'
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant='secondary' onClick={() => setShowReturnModal(false)}>
            Cancel
          </Button>
          <Button 
            variant='warning' 
            onClick={handleReturnRequest}
            disabled={actionLoading}
          >
            {actionLoading ? 'Submitting...' : 'Submit Return Request'}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Replacement Request Modal */}
      <Modal show={showReplacementModal} onHide={() => setShowReplacementModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Request Replacement</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group>
              <Form.Label>Reason for Replacement</Form.Label>
              <Form.Control
                as='textarea'
                rows={3}
                value={replacementReason}
                onChange={(e) => setReplacementReason(e.target.value)}
                placeholder='Please explain why you want to replace this order'
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant='secondary' onClick={() => setShowReplacementModal(false)}>
            Cancel
          </Button>
          <Button 
            variant='info' 
            onClick={handleReplacementRequest}
            disabled={actionLoading}
          >
            {actionLoading ? 'Submitting...' : 'Submit Replacement Request'}
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default OrderScreen;
