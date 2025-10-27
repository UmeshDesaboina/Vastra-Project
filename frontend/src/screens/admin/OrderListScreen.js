import React, { useEffect, useState } from 'react';
import { Table, Button, Row, Col, Form, Spinner, Alert, Badge, Modal } from 'react-bootstrap';
import { FaTimes, FaCheck, FaInfo, FaUndo, FaExchangeAlt } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useSelector } from 'react-redux';

const OrderListScreen = () => {
  const { userInfo } = useSelector((s) => s.user);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [filters, setFilters] = useState({ status: '', paid: '', user: '', q: '', fromDate: '', toDate: '' });
  const [statusCounts, setStatusCounts] = useState({});
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showReturnModal, setShowReturnModal] = useState(false);
  const [showReplacementModal, setShowReplacementModal] = useState(false);
  const [adminNotes, setAdminNotes] = useState('');
  const [courierCompany, setCourierCompany] = useState('');
  const [trackingNumber, setTrackingNumber] = useState('');
  const [expectedPickupDate, setExpectedPickupDate] = useState('');

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError(null);
      const params = { page, limit: 20 };
      if (filters.status) params.status = filters.status;
      if (filters.paid !== '') params.paid = filters.paid;
      if (filters.user) params.user = filters.user;
      if (filters.q) params.q = filters.q;
      if (filters.fromDate) params.dateFrom = filters.fromDate;
      if (filters.toDate) params.dateTo = filters.toDate;
      const { data } = await axios.get('/api/orders', {
        params,
        headers: { Authorization: `Bearer ${userInfo?.token}` },
      });
      setOrders(data.orders);
      setPage(data.page);
      setPages(data.pages);
      setTotal(data.total);
      setStatusCounts(data.statusCounts || {});
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchOrders(); /* eslint-disable-next-line */ }, [page, filters.status, filters.paid, filters.user, filters.q, filters.fromDate, filters.toDate]);

  const downloadCsv = async () => {
    try {
      const { data } = await axios.get('/api/admin/reports/orders.csv', {
        responseType: 'blob',
        headers: { Authorization: `Bearer ${userInfo?.token}` },
      });
      const url = window.URL.createObjectURL(new Blob([data], { type: 'text/csv' }));
      const link = document.createElement('a');
      link.href = url;
      link.download = 'orders-report.csv';
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      alert(err.response?.data?.message || err.message);
    }
  };

  const changeStatus = async (orderId, status) => {
    try {
      let body = { status };
      if (status === 'Shipped') {
        const courierCompany = prompt('Courier Company?');
        const trackingNumber = prompt('Tracking Number?');
        if (!courierCompany || !trackingNumber) return;
        body.courierCompany = courierCompany;
        body.trackingNumber = trackingNumber;
      }
      await axios.put(`/api/orders/${orderId}/status`, body, {
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${userInfo?.token}` },
      });
      fetchOrders();
    } catch (err) {
      alert(err.response?.data?.message || err.message);
    }
  };

  const handleReturnStatusUpdate = async (requestStatus) => {
    try {
      const payload = { status: requestStatus, adminNotes };
      
      // Include courier details when approving
      if (requestStatus === 'Approved') {
        if (!courierCompany || !trackingNumber) {
          alert('Please provide courier company and tracking number when approving');
          return;
        }
        payload.courierCompany = courierCompany;
        payload.trackingNumber = trackingNumber;
        if (expectedPickupDate) payload.expectedPickupDate = expectedPickupDate;
      }
      
      await axios.put(
        `/api/orders/${selectedOrder._id}/return-status`,
        payload,
        { headers: { Authorization: `Bearer ${userInfo?.token}` } }
      );
      setShowReturnModal(false);
      setSelectedOrder(null);
      setAdminNotes('');
      setCourierCompany('');
      setTrackingNumber('');
      setExpectedPickupDate('');
      fetchOrders();
      alert('Return request updated successfully');
    } catch (err) {
      alert(err.response?.data?.message || err.message);
    }
  };

  const handleReplacementStatusUpdate = async (requestStatus) => {
    try {
      const payload = { status: requestStatus, adminNotes };
      
      // Include courier details when approving
      if (requestStatus === 'Approved') {
        if (!courierCompany || !trackingNumber) {
          alert('Please provide courier company and tracking number when approving');
          return;
        }
        payload.courierCompany = courierCompany;
        payload.trackingNumber = trackingNumber;
        if (expectedPickupDate) payload.expectedPickupDate = expectedPickupDate;
      }
      
      await axios.put(
        `/api/orders/${selectedOrder._id}/replacement-status`,
        payload,
        { headers: { Authorization: `Bearer ${userInfo?.token}` } }
      );
      setShowReplacementModal(false);
      setSelectedOrder(null);
      setAdminNotes('');
      setCourierCompany('');
      setTrackingNumber('');
      setExpectedPickupDate('');
      fetchOrders();
      alert('Replacement request updated successfully');
    } catch (err) {
      alert(err.response?.data?.message || err.message);
    }
  };

  return (
    <>
      <h1>Orders</h1>

      <Row className='mb-3'>
        <Col md={2}>
          <Form.Select value={filters.status} onChange={(e) => { setFilters(f => ({ ...f, status: e.target.value })); setPage(1); }}>
            <option value=''>All Status</option>
            <option>Pending</option>
            <option>Shipped</option>
            <option>Delivered</option>
            <option>Cancelled</option>
          </Form.Select>
        </Col>
        <Col md={2}>
          <Form.Select value={filters.paid} onChange={(e) => { setFilters(f => ({ ...f, paid: e.target.value })); setPage(1); }}>
            <option value=''>Paid: Any</option>
            <option value='true'>Paid</option>
            <option value='false'>Unpaid</option>
          </Form.Select>
        </Col>
        <Col md={2}>
          <Form.Control type="date" placeholder='From Date' value={filters.fromDate || ''} onChange={(e) => { setFilters(f => ({ ...f, fromDate: e.target.value })); setPage(1); }} />
        </Col>
        <Col md={2}>
          <Form.Control type="date" placeholder='To Date' value={filters.toDate || ''} onChange={(e) => { setFilters(f => ({ ...f, toDate: e.target.value })); setPage(1); }} />
        </Col>
        <Col md={2}>
          <Form.Control placeholder='Search by order id / status / email' value={filters.q || ''} onChange={(e) => { setFilters(f => ({ ...f, q: e.target.value })); setPage(1); }} />
        </Col>
        <Col className='text-end'>
          {['Pending','Shipped','Delivered','Cancelled'].map(s => (
            <Badge key={s} bg='secondary' className='ms-1'>{s}: {statusCounts[s] || 0}</Badge>
          ))}
          <Button variant='outline-primary' className='ms-2' onClick={downloadCsv}>Download CSV</Button>
        </Col>
      </Row>

      {loading && <Spinner animation='border' />}
      {error && <Alert variant='danger'>{error}</Alert>}

      <Table striped bordered hover responsive className='table-sm'>
        <thead>
          <tr>
            <th>USER</th>
            <th>DATE</th>
            <th>ITEMS</th>
            <th>TOTAL</th>
            <th>PAID</th>
            <th>STATUS</th>
            <th>REQUESTS</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order) => (
            <tr key={order._id}>
              <td>{order.user?.name || '—'}</td>
              <td>{new Date(order.createdAt).toLocaleDateString()}</td>
              <td>
                {order.orderItems?.map((item, idx) => (
                  <div key={idx}>
                    {item.name} {item.size && `(${item.size})`} x{item.qty}
                  </div>
                ))}
              </td>
              <td>₹{order.totalPrice}</td>
              <td>
                {order.isPaid ? (
                  <span className='text-success'><FaCheck /> {order.paidAt && new Date(order.paidAt).toLocaleDateString()}</span>
                ) : (
                  <>
                    <FaTimes className='text-danger' />
                    <Button 
                      variant='outline-success' 
                      size='sm' 
                      className='ms-2'
                      onClick={async () => {
                        if (window.confirm('Mark this order as paid?')) {
                          try {
                            await axios.put(`/api/orders/${order._id}/pay`, {}, {
                              headers: { Authorization: `Bearer ${userInfo?.token}` }
                            });
                            fetchOrders();
                          } catch (err) {
                            alert(err.response?.data?.message || err.message);
                          }
                        }
                      }}
                    >
                      Mark Paid
                    </Button>
                  </>
                )}
              </td>
              <td>
                <Form.Select size='sm' value={order.status} onChange={(e) => changeStatus(order._id, e.target.value)}>
                  {['Pending','Shipped','Delivered','Cancelled'].map(s => <option key={s} value={s}>{s}</option>)}
                </Form.Select>
              </td>
              <td>
                {order.returnRequest?.requested && (
                  <Button
                    variant='outline-warning'
                    size='sm'
                    className='me-1'
                    onClick={() => { setSelectedOrder(order); setShowReturnModal(true); }}
                    title='Return Request'
                  >
                    <FaUndo /> {order.returnRequest.status}
                  </Button>
                )}
                {order.replacementRequest?.requested && (
                  <Button
                    variant='outline-info'
                    size='sm'
                    onClick={() => { setSelectedOrder(order); setShowReplacementModal(true); }}
                    title='Replacement Request'
                  >
                    <FaExchangeAlt /> {order.replacementRequest.status}
                  </Button>
                )}
              </td>
              <td>
                <Link to={`/order/${order._id}`}>
                  <Button variant='light' className='btn-sm'>
                    <FaInfo />
                  </Button>
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      <Row>
        <Col>Showing page {page} of {pages} (total {total})</Col>
        <Col className='text-end'>
          <Button disabled={page<=1} className='me-2' onClick={() => setPage(p => p-1)}>Prev</Button>
          <Button disabled={page>=pages} onClick={() => setPage(p => p+1)}>Next</Button>
        </Col>
      </Row>

      {/* Return Request Modal */}
      <Modal show={showReturnModal} onHide={() => setShowReturnModal(false)} size='lg'>
        <Modal.Header closeButton>
          <Modal.Title>Return Request - Order #{selectedOrder?._id}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p><strong>Customer:</strong> {selectedOrder?.user?.name}</p>
          <p><strong>Reason:</strong> {selectedOrder?.returnRequest?.reason}</p>
          <p><strong>Current Status:</strong> {selectedOrder?.returnRequest?.status}</p>
          <p><strong>Requested At:</strong> {selectedOrder?.returnRequest?.requestedAt && new Date(selectedOrder.returnRequest.requestedAt).toLocaleString()}</p>
          {selectedOrder?.returnRequest?.adminNotes && (
            <p><strong>Previous Admin Notes:</strong> {selectedOrder.returnRequest.adminNotes}</p>
          )}
          <Form.Group className='mt-3'>
            <Form.Label>Admin Notes</Form.Label>
            <Form.Control
              as='textarea'
              rows={3}
              value={adminNotes}
              onChange={(e) => setAdminNotes(e.target.value)}
              placeholder='Add notes for the customer'
            />
          </Form.Group>
          {selectedOrder?.returnRequest?.pickupCourierDetails?.company && (
            <div className='mt-3 alert alert-info'>
              <strong>Pickup Details:</strong>
              <div>Courier: {selectedOrder.returnRequest.pickupCourierDetails.company}</div>
              <div>Tracking: {selectedOrder.returnRequest.pickupCourierDetails.trackingNumber}</div>
              {selectedOrder.returnRequest.pickupCourierDetails.expectedPickupDate && (
                <div>Expected Pickup: {new Date(selectedOrder.returnRequest.pickupCourierDetails.expectedPickupDate).toLocaleDateString()}</div>
              )}
            </div>
          )}
          <hr />
          <h6>Pickup Courier Details (Required for Approval)</h6>
          <Form.Group className='mb-2'>
            <Form.Label>Courier Company</Form.Label>
            <Form.Control
              type='text'
              value={courierCompany}
              onChange={(e) => setCourierCompany(e.target.value)}
              placeholder='e.g., Blue Dart, Delhivery'
            />
          </Form.Group>
          <Form.Group className='mb-2'>
            <Form.Label>Tracking Number</Form.Label>
            <Form.Control
              type='text'
              value={trackingNumber}
              onChange={(e) => setTrackingNumber(e.target.value)}
              placeholder='Tracking number for pickup'
            />
          </Form.Group>
          <Form.Group className='mb-2'>
            <Form.Label>Expected Pickup Date</Form.Label>
            <Form.Control
              type='date'
              value={expectedPickupDate}
              onChange={(e) => setExpectedPickupDate(e.target.value)}
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant='secondary' onClick={() => setShowReturnModal(false)}>Close</Button>
          <Button variant='danger' onClick={() => handleReturnStatusUpdate('Rejected')}>Reject</Button>
          <Button variant='dark' onClick={() => handleReturnStatusUpdate('Cancelled')}>Cancel Request</Button>
          <Button variant='warning' onClick={() => handleReturnStatusUpdate('Approved')}>Approve</Button>
          <Button variant='success' onClick={() => handleReturnStatusUpdate('Completed')}>Mark Completed</Button>
        </Modal.Footer>
      </Modal>

      {/* Replacement Request Modal */}
      <Modal show={showReplacementModal} onHide={() => setShowReplacementModal(false)} size='lg'>
        <Modal.Header closeButton>
          <Modal.Title>Replacement Request - Order #{selectedOrder?._id}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p><strong>Customer:</strong> {selectedOrder?.user?.name}</p>
          <p><strong>Reason:</strong> {selectedOrder?.replacementRequest?.reason}</p>
          <p><strong>Current Status:</strong> {selectedOrder?.replacementRequest?.status}</p>
          <p><strong>Requested At:</strong> {selectedOrder?.replacementRequest?.requestedAt && new Date(selectedOrder.replacementRequest.requestedAt).toLocaleString()}</p>
          {selectedOrder?.replacementRequest?.adminNotes && (
            <p><strong>Previous Admin Notes:</strong> {selectedOrder.replacementRequest.adminNotes}</p>
          )}
          <Form.Group className='mt-3'>
            <Form.Label>Admin Notes</Form.Label>
            <Form.Control
              as='textarea'
              rows={3}
              value={adminNotes}
              onChange={(e) => setAdminNotes(e.target.value)}
              placeholder='Add notes for the customer'
            />
          </Form.Group>
          {selectedOrder?.replacementRequest?.pickupCourierDetails?.company && (
            <div className='mt-3 alert alert-info'>
              <strong>Pickup Details:</strong>
              <div>Courier: {selectedOrder.replacementRequest.pickupCourierDetails.company}</div>
              <div>Tracking: {selectedOrder.replacementRequest.pickupCourierDetails.trackingNumber}</div>
              {selectedOrder.replacementRequest.pickupCourierDetails.expectedPickupDate && (
                <div>Expected Pickup: {new Date(selectedOrder.replacementRequest.pickupCourierDetails.expectedPickupDate).toLocaleDateString()}</div>
              )}
            </div>
          )}
          <hr />
          <h6>Pickup Courier Details (Required for Approval)</h6>
          <Form.Group className='mb-2'>
            <Form.Label>Courier Company</Form.Label>
            <Form.Control
              type='text'
              value={courierCompany}
              onChange={(e) => setCourierCompany(e.target.value)}
              placeholder='e.g., Blue Dart, Delhivery'
            />
          </Form.Group>
          <Form.Group className='mb-2'>
            <Form.Label>Tracking Number</Form.Label>
            <Form.Control
              type='text'
              value={trackingNumber}
              onChange={(e) => setTrackingNumber(e.target.value)}
              placeholder='Tracking number for pickup'
            />
          </Form.Group>
          <Form.Group className='mb-2'>
            <Form.Label>Expected Pickup Date</Form.Label>
            <Form.Control
              type='date'
              value={expectedPickupDate}
              onChange={(e) => setExpectedPickupDate(e.target.value)}
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant='secondary' onClick={() => setShowReplacementModal(false)}>Close</Button>
          <Button variant='danger' onClick={() => handleReplacementStatusUpdate('Rejected')}>Reject</Button>
          <Button variant='dark' onClick={() => handleReplacementStatusUpdate('Cancelled')}>Cancel Request</Button>
          <Button variant='info' onClick={() => handleReplacementStatusUpdate('Approved')}>Approve</Button>
          <Button variant='success' onClick={() => handleReplacementStatusUpdate('Completed')}>Mark Completed</Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default OrderListScreen;
