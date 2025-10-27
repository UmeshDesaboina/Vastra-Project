import React, { useEffect, useState } from 'react';
import { Table, Button, Spinner, Alert } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useSelector } from 'react-redux';

const MyOrdersScreen = () => {
  const { userInfo } = useSelector((s) => s.user);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchMyOrders = async () => {
      try {
        setLoading(true);
        setError(null);
        const { data } = await axios.get('/api/orders/myorders', {
          headers: { Authorization: `Bearer ${userInfo?.token}` },
        });
        setOrders(data);
      } catch (err) {
        setError(err.response?.data?.message || err.message);
      } finally {
        setLoading(false);
      }
    };

    if (userInfo) fetchMyOrders();
  }, [userInfo]);

  if (!userInfo) {
    return <Alert variant='warning'>Please sign in to view your orders.</Alert>;
  }

  return (
    <>
      <h1>My Orders</h1>
      {loading && <Spinner animation='border' />}
      {error && <Alert variant='danger'>{error}</Alert>}
      {!loading && !error && (
        orders.length === 0 ? (
          <Alert variant='info'>You have no orders yet.</Alert>
        ) : (
          <Table striped bordered hover responsive className='table-sm'>
            <thead>
              <tr>
                <th>ID</th>
                <th>DATE</th>
                <th>ITEMS</th>
                <th>TOTAL</th>
                <th>PAYMENT</th>
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
                  <td>
                    {order.orderItems?.map((item, idx) => (
                      <div key={idx}>
                        {item.name} {item.size && `(${item.size})`} x{item.qty}
                      </div>
                    ))}
                  </td>
                  <td>₹{order.totalPrice}</td>
                  <td>{order.paymentMethod}</td>
                  <td>
                    {order.isPaid ? (
                      <span className='text-success'>
                        ✓ Payment Successful
                        {order.paidAt && <small className='d-block'>{new Date(order.paidAt).toLocaleDateString()}</small>}
                      </span>
                    ) : (
                      <span className='text-warning'>Pending</span>
                    )}
                  </td>
                  <td>{order.status}</td>
                  <td>{order.courierDetails?.company || '—'}</td>
                  <td>{order.courierDetails?.trackingNumber || '—'}</td>
                  <td>{order.courierDetails?.estimatedDeliveryDate ? new Date(order.courierDetails.estimatedDeliveryDate).toLocaleDateString() : '—'}</td>
                  <td>
                    <Link to={`/order/${order._id}`}>
                      <Button className='btn-sm' variant='light'>Details</Button>
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        )
      )}
    </>
  );
};

export default MyOrdersScreen;
