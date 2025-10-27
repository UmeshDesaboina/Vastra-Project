import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Form, Button, Row, Col, InputGroup } from 'react-bootstrap';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import { useDispatch, useSelector } from 'react-redux';
import { register } from '../slices/userSlice';
import FormContainer from '../components/FormContainer';

const RegisterScreen = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [message, setMessage] = useState(null);

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const { userInfo, loading, error } = useSelector((state) => state.user);

  const redirect = location.search ? location.search.split('=')[1] : '/';

  useEffect(() => {
    if (userInfo) {
      const path = redirect.startsWith('/') ? redirect : `/${redirect}`;
      navigate(path);
    }
  }, [navigate, userInfo, redirect]);

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

  const submitHandler = (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setMessage('Passwords do not match');
    } else {
      dispatch(register({ name, email, password }));
    }
  };

  return (
    <FormContainer>
      <div className="text-center mb-4">
        <img 
          src="https://iili.io/K4IfuSt.md.png" 
          alt="Vastra" 
          style={{ height: '120px', marginBottom: '15px' }} 
        />
        <h1>Sign Up ✍️</h1>
      </div>
      {message && <div className="alert alert-danger">{message}</div>}
      {error && <div className="alert alert-danger">{error}</div>}
      {loading && <div>Loading...</div>}
      <Form onSubmit={submitHandler}>
        <Form.Group controlId='name' className='my-3'>
          <Form.Label>Name</Form.Label>
          <Form.Control
            type='text'
            placeholder='Enter name'
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          ></Form.Control>
        </Form.Group>

        <Form.Group controlId='email' className='my-3'>
          <Form.Label>Email Address</Form.Label>
          <Form.Control
            type='email'
            placeholder='Enter email'
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          ></Form.Control>
        </Form.Group>

        <Form.Group controlId='password' className='my-3'>
          <Form.Label>Password</Form.Label>
          <InputGroup>
            <Form.Control
              type={showPassword ? 'text' : 'password'}
              placeholder='Enter password'
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
          <Form.Label>Confirm Password</Form.Label>
          <InputGroup>
            <Form.Control
              type={showConfirmPassword ? 'text' : 'password'}
              placeholder='Confirm password'
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

        <Button type='submit' variant='primary' className='my-3'>
          Register
        </Button>
      </Form>

      <Row className='py-3'>
        <Col>
          Have an Account?{' '}
          <Link to={redirect ? `/login?redirect=${redirect}` : '/login'}>
            Login
          </Link>
        </Col>
      </Row>
    </FormContainer>
  );
};

export default RegisterScreen;