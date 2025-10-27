import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Form, Button, Alert } from 'react-bootstrap';
import axios from 'axios';
import FormContainer from '../components/FormContainer';

const ResetPasswordScreen = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const submitHandler = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    try {
      setLoading(true);
      setError(null);
      const { data } = await axios.post(`/api/auth/reset/${token}`, { password });
      setMessage(data.message || 'Password reset successful');
      setTimeout(() => navigate('/login'), 1500);
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <FormContainer>
      <h1>Reset Password</h1>
      {message && <Alert variant='success'>{message}</Alert>}
      {error && <Alert variant='danger'>{error}</Alert>}
      {loading && <div>Loading...</div>}
      <Form onSubmit={submitHandler}>
        <Form.Group controlId='password' className='my-3'>
          <Form.Label>New Password</Form.Label>
          <Form.Control type='password' placeholder='Enter new password' value={password} onChange={(e)=>setPassword(e.target.value)} required />
        </Form.Group>
        <Form.Group controlId='confirmPassword' className='my-3'>
          <Form.Label>Confirm New Password</Form.Label>
          <Form.Control type='password' placeholder='Confirm new password' value={confirmPassword} onChange={(e)=>setConfirmPassword(e.target.value)} required />
        </Form.Group>
        <Button type='submit' variant='primary'>Reset Password</Button>
      </Form>
    </FormContainer>
  );
};

export default ResetPasswordScreen;