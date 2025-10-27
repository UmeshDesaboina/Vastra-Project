import React, { useState } from 'react';
import { Form, Button, Alert, InputGroup } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import axios from 'axios';
import FormContainer from '../components/FormContainer';

const ForgotPasswordScreen = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const getPasswordStrength = (password) => {
    if (!password) return { strength: '', color: '', text: '' };
    let strength = 0;
    if (password.length >= 8) strength++;
    if (password.length >= 12) strength++;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++;
    if (/\d/.test(password)) strength++;
    if (/[^a-zA-Z\d]/.test(password)) strength++;

    if (strength <= 2) return { strength: 25, color: 'danger', text: 'Weak' };
    if (strength === 3) return { strength: 50, color: 'warning', text: 'Fair' };
    if (strength === 4) return { strength: 75, color: 'info', text: 'Good' };
    return { strength: 100, color: 'success', text: 'Strong' };
  };

  const passwordStrength = getPasswordStrength(password);

  const submitHandler = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    try {
      setLoading(true);
      setError(null);
      const { data } = await axios.post('/api/auth/reset-password', { email, password });
      setMessage(data.message || 'Password updated successfully');
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
        <Form.Group controlId='email' className='my-3'>
          <Form.Label>Email Address</Form.Label>
          <Form.Control type='email' placeholder='Enter email' value={email} onChange={(e)=>setEmail(e.target.value)} required />
        </Form.Group>
        
        <Form.Group controlId='password' className='my-3'>
          <Form.Label>New Password</Form.Label>
          <InputGroup>
            <Form.Control
              type={showPassword ? 'text' : 'password'}
              placeholder='Enter new password'
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <InputGroup.Text
              onClick={() => setShowPassword(!showPassword)}
              style={{ cursor: 'pointer' }}
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </InputGroup.Text>
          </InputGroup>
          {password && (
            <div className='mt-2'>
              <div className='progress' style={{ height: '5px' }}>
                <div
                  className={`progress-bar bg-${passwordStrength.color}`}
                  role='progressbar'
                  style={{ width: `${passwordStrength.strength}%` }}
                />
              </div>
              <small className={`text-${passwordStrength.color}`}>
                Password strength: {passwordStrength.text}
              </small>
            </div>
          )}
        </Form.Group>

        <Form.Group controlId='confirmPassword' className='my-3'>
          <Form.Label>Confirm New Password</Form.Label>
          <InputGroup>
            <Form.Control
              type={showConfirmPassword ? 'text' : 'password'}
              placeholder='Confirm new password'
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
            <InputGroup.Text
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              style={{ cursor: 'pointer' }}
            >
              {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
            </InputGroup.Text>
          </InputGroup>
        </Form.Group>

        <Button type='submit' variant='primary'>Reset Password</Button>
      </Form>
    </FormContainer>
  );
};

export default ForgotPasswordScreen;
