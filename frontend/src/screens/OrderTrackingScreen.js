import React from 'react';
import { Row, Col, Card } from 'react-bootstrap';
import { useParams } from 'react-router-dom';

const OrderTrackingScreen = () => {
  const { id } = useParams();

  // Mock tracking data
  const trackingData = {
    orderId: id,
    status: 'In Transit',
    estimatedDelivery: '2023-06-20',
    trackingEvents: [
      { date: '2023-06-15', status: 'Order Placed', location: 'Online' },
      { date: '2023-06-16', status: 'Processing', location: 'Warehouse' },
      { date: '2023-06-17', status: 'Shipped', location: 'Distribution Center' },
      { date: '2023-06-18', status: 'In Transit', location: 'Mumbai Hub' },
    ],
  };

  return (
    <>
      <h1>Track Your Order</h1>
      <Row className="justify-content-center">
        <Col md={8}>
          <Card className="p-4 mb-4">
            <h4>Order #{trackingData.orderId}</h4>
            <p>
              <strong>Status:</strong> {trackingData.status}
            </p>
            <p>
              <strong>Estimated Delivery:</strong> {trackingData.estimatedDelivery}
            </p>
          </Card>

          <Card className="p-4">
            <h4>Tracking History</h4>
            <div className="timeline">
              {trackingData.trackingEvents.map((event, index) => (
                <div key={index} className="timeline-item mb-3">
                  <div className="d-flex">
                    <div className="me-3">
                      <div className="timeline-date">{event.date}</div>
                    </div>
                    <div>
                      <h5 className="mb-1">{event.status}</h5>
                      <p className="text-muted mb-0">{event.location}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </Col>
      </Row>
    </>
  );
};

export default OrderTrackingScreen;