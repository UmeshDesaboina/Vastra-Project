import React, { useState } from 'react';
import { Form, Button, Col, Row } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import FormContainer from '../components/FormContainer';
import { savePaymentMethod, savePaymentDetails } from '../slices/cartSlice';

const PaymentScreen = () => {
  const savedMethod = useSelector((s) => s.cart.paymentMethod);
  const savedDetails = useSelector((s) => s.cart.paymentDetails);
  const [paymentMethod, setPaymentMethod] = useState(savedMethod || 'COD');

  // card fields (we only persist masked details)
  const [nameOnCard, setNameOnCard] = useState(savedDetails?.nameOnCard || '');
  const [cardNumber, setCardNumber] = useState('');
  const [expiryMonth, setExpiryMonth] = useState(savedDetails?.expiryMonth || '');
  const [expiryYear, setExpiryYear] = useState(savedDetails?.expiryYear || '');
  const [cvv, setCvv] = useState('');
  const [error, setError] = useState('');
  
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const validateCard = () => {
    if (paymentMethod === 'COD') return true;
    const num = cardNumber.replace(/\s+/g, '');
    if (!nameOnCard.trim()) return setError('Name on card is required'), false;
    if (!/^\d{13,19}$/.test(num)) return setError('Card number must be 13–19 digits'), false;
    const m = Number(expiryMonth);
    const y = Number(expiryYear);
    if (!(m >= 1 && m <= 12)) return setError('Expiry month must be 1–12'), false;
    const nowY = new Date().getFullYear();
    if (!(y >= nowY && y <= nowY + 20)) return setError(`Expiry year must be ≥ ${nowY}`), false;
    if (!/^\d{3,4}$/.test(cvv)) return setError('CVV must be 3–4 digits'), false;
    setError('');
    return true;
  };

  const submitHandler = (e) => {
    e.preventDefault();
    if (!validateCard()) return;

    dispatch(savePaymentMethod(paymentMethod));

    if (paymentMethod !== 'COD') {
      const last4 = cardNumber.replace(/\D/g, '').slice(-4);
      dispatch(savePaymentDetails({ nameOnCard: nameOnCard.trim(), last4, expiryMonth, expiryYear }));
    } else {
      dispatch(savePaymentDetails({}));
    }

    navigate('/placeorder');
  };

  const showCardForm = paymentMethod === 'PayPal' || paymentMethod === 'Stripe';

  return (
    <FormContainer>
      <h1>Payment Method</h1>
      <Form onSubmit={submitHandler}>
        <Form.Group>
          <Form.Label as='legend'>Select Method</Form.Label>
          <Col>
            <Form.Check
              type='radio'
              label='PayPal or Credit Card'
              id='PayPal'
              name='paymentMethod'
              value='PayPal'
              checked={paymentMethod === 'PayPal'}
              onChange={(e) => setPaymentMethod(e.target.value)}
            ></Form.Check>
            <Form.Check
              type='radio'
              label='Stripe'
              id='Stripe'
              name='paymentMethod'
              value='Stripe'
              checked={paymentMethod === 'Stripe'}
              onChange={(e) => setPaymentMethod(e.target.value)}
            ></Form.Check>
            <Form.Check
              type='radio'
              label='Cash On Delivery'
              id='COD'
              name='paymentMethod'
              value='COD'
              checked={paymentMethod === 'COD'}
              onChange={(e) => setPaymentMethod(e.target.value)}
            ></Form.Check>
          </Col>
        </Form.Group>

        {showCardForm && (
          <>
            <hr />
            <h3>Card Details</h3>
            {error && <div className='alert alert-danger my-2'>{error}</div>}
            <Form.Group controlId='nameOnCard' className='my-2'>
              <Form.Label>Name on Card</Form.Label>
              <Form.Control
                type='text'
                placeholder='Enter name as on card'
                value={nameOnCard}
                onChange={(e) => setNameOnCard(e.target.value)}
                required
              />
            </Form.Group>
            <Form.Group controlId='cardNumber' className='my-2'>
              <Form.Label>Card Number</Form.Label>
              <Form.Control
                type='tel'
                inputMode='numeric'
                placeholder='1234 5678 9012 3456'
                value={cardNumber}
                onChange={(e) => setCardNumber(e.target.value)}
                required
              />
            </Form.Group>
            <Row>
              <Col md={6}>
                <Form.Group controlId='expiryMonth' className='my-2'>
                  <Form.Label>Expiry Month</Form.Label>
                  <Form.Control
                    type='number'
                    placeholder='MM'
                    value={expiryMonth}
                    onChange={(e) => setExpiryMonth(e.target.value)}
                    min={1}
                    max={12}
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group controlId='expiryYear' className='my-2'>
                  <Form.Label>Expiry Year</Form.Label>
                  <Form.Control
                    type='number'
                    placeholder='YYYY'
                    value={expiryYear}
                    onChange={(e) => setExpiryYear(e.target.value)}
                    min={new Date().getFullYear()}
                    max={new Date().getFullYear() + 20}
                    required
                  />
                </Form.Group>
              </Col>
            </Row>
            <Form.Group controlId='cvv' className='my-2'>
              <Form.Label>CVV</Form.Label>
              <Form.Control
                type='password'
                inputMode='numeric'
                placeholder='123'
                value={cvv}
                onChange={(e) => setCvv(e.target.value)}
                required
              />
            </Form.Group>
          </>
        )}

        <Button type='submit' variant='primary' className='my-3'>
          Continue
        </Button>
      </Form>
    </FormContainer>
  );
};

export default PaymentScreen;
