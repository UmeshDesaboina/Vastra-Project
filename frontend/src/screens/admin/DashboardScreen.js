import React, { useEffect, useState } from 'react';
import { Row, Col, Card, Spinner, Alert, Table, Badge } from 'react-bootstrap';
import axios from 'axios';
import { useSelector } from 'react-redux';

const DashboardScreen = () => {
  const { userInfo } = useSelector((s) => s.user);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        setError(null);
        const { data } = await axios.get('/api/admin/dashboard/stats', {
          headers: { Authorization: `Bearer ${userInfo?.token}` },
        });
        setStats(data);
      } catch (err) {
        setError(err.response?.data?.message || err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, [userInfo]);

  if (loading) return <Spinner animation='border' />;
  if (error) return <Alert variant='danger'>{error}</Alert>;
  if (!stats) return null;

  return (
    <>
      <h1>Dashboard</h1>
      <Row>
        <Col md={3}>
          <Card className="bg-primary text-white mb-4">
            <Card.Body>
              <Card.Title>₹{Number(stats.totals.totalSales || 0).toLocaleString()}</Card.Title>
              <Card.Text>Total Sales</Card.Text>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="bg-success text-white mb-4">
            <Card.Body>
              <Card.Title>{stats.totals.totalOrders}</Card.Title>
              <Card.Text>Total Orders</Card.Text>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="bg-warning text-white mb-4">
            <Card.Body>
              <Card.Title>{stats.totals.totalUsers}</Card.Title>
              <Card.Text>Total Users</Card.Text>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="bg-danger text-white mb-4">
            <Card.Body>
              <Card.Title>{stats.totals.totalProducts}</Card.Title>
              <Card.Text>Total Products</Card.Text>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row className='mb-4'>
        <Col md={4}>
          <Card>
            <Card.Body>
              <Card.Title>Sales</Card.Title>
              <div>Today: ₹{Number(stats.sales.today || 0).toLocaleString()}</div>
              <div>This month: ₹{Number(stats.sales.month || 0).toLocaleString()}</div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={8}>
          <Card>
            <Card.Body>
              <Card.Title>Status Breakdown</Card.Title>
              {['Pending','Shipped','Delivered','Cancelled'].map(s => (
                <Badge key={s} bg='secondary' className='me-2'>
                  {s}: {stats.statusCounts[s] || 0}
                </Badge>
              ))}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Card>
        <Card.Body>
          <Card.Title>Recent Orders</Card.Title>
          <Table striped bordered hover responsive className='table-sm'>
            <thead>
              <tr>
                <th>USER</th>
                <th>TOTAL</th>
                <th>STATUS</th>
                <th>DATE</th>
              </tr>
            </thead>
            <tbody>
              {stats.recentOrders.map(o => (
                <tr key={o._id}>
                  <td>{o.user?.name || '—'}</td>
                  <td>₹{o.totalPrice}</td>
                  <td>{o.status}</td>
                  <td>{new Date(o.createdAt).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Card.Body>
      </Card>
    </>
  );
};

export default DashboardScreen;
