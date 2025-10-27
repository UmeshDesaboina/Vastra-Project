import React, { useEffect, useState } from 'react';
import { Table, Button, Row, Col, Form, Spinner, Alert } from 'react-bootstrap';
import { FaCheck, FaTimes } from 'react-icons/fa';
import axios from 'axios';
import { useSelector } from 'react-redux';

const UserListScreen = () => {
  const { userInfo } = useSelector((s) => s.user);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [q, setQ] = useState('');

  const fetchUsers = React.useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const { data } = await axios.get('/api/users', {
        params: { page, limit: 20, q: q || undefined },
        headers: { Authorization: `Bearer ${userInfo?.token}` },
      });
      const usersData = Array.isArray(data) ? data : (data?.users || []);
      setUsers(usersData);
      setPage(Array.isArray(data) ? 1 : (data?.page || 1));
      setPages(Array.isArray(data) ? 1 : (data?.pages || 1));
      setTotal(Array.isArray(data) ? usersData.length : (data?.total ?? usersData.length));
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  }, [page, q, userInfo?.token]);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  return (
    <>
      <h1>Users</h1>

      <Row className='mb-3'>
        <Col md={4}>
          <Form.Control placeholder='Search name/email' value={q} onChange={(e)=>{ setQ(e.target.value); setPage(1); }} />
        </Col>
      </Row>

      {loading && <Spinner animation='border' />}
      {error && <Alert variant='danger'>{error}</Alert>}

      <Table striped bordered hover responsive className='table-sm'>
        <thead>
          <tr>
            <th>NAME</th>
            <th>EMAIL</th>
            <th>ADMIN</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user._id}>
              <td>{user.name}</td>
              <td>
                <a href={`mailto:${user.email}`}>{user.email}</a>
              </td>
              <td>
                {user.isAdmin ? (
                  <FaCheck className='text-success' />
                ) : (
                  <FaTimes className='text-danger' />
                )}
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
    </>
  );
};

export default UserListScreen;
