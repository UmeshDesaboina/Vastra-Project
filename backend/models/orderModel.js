const mongoose = require('mongoose');

const orderSchema = mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User'
  },
  orderItems: [
    {
      name: { type: String, required: true },
      qty: { type: Number, required: true },
      image: { type: String, required: true },
      price: { type: Number, required: true },
      size: { type: String },
      deliveryCharges: { type: Number, default: 0 },
      product: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Product'
      }
    }
  ],
  shippingAddress: {
    name: { type: String, required: true },
    phone: { type: String, required: true },
    address: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    pincode: { type: String, required: true }
  },
  paymentMethod: {
    type: String,
    required: true,
    default: 'Cash on Delivery'
  },
  itemsPrice: {
    type: Number,
    required: true,
    default: 0.0
  },
  shippingPrice: {
    type: Number,
    required: true,
    default: 0.0
  },
  totalPrice: {
    type: Number,
    required: true,
    default: 0.0
  },
  isPaid: {
    type: Boolean,
    required: true,
    default: false
  },
  paidAt: {
    type: Date
  },
  status: {
    type: String,
    required: true,
    enum: ['Pending', 'Shipped', 'Delivered', 'Cancelled'],
    default: 'Pending'
  },
  shippedAt: {
    type: Date
  },
  deliveredAt: {
    type: Date
  },
  courierDetails: {
    company: { type: String },
    trackingNumber: { type: String },
    estimatedDeliveryDate: { type: Date }
  },
  returnRequest: {
    requested: { type: Boolean, default: false },
    reason: { type: String },
    status: {
      type: String,
      enum: ['Pending', 'Approved', 'Rejected', 'Completed', 'Cancelled'],
      default: 'Pending'
    },
    requestedAt: { type: Date },
    processedAt: { type: Date },
    adminNotes: { type: String },
    pickupCourierDetails: {
      company: { type: String },
      trackingNumber: { type: String },
      expectedPickupDate: { type: Date }
    }
  },
  replacementRequest: {
    requested: { type: Boolean, default: false },
    reason: { type: String },
    status: {
      type: String,
      enum: ['Pending', 'Approved', 'Rejected', 'Completed', 'Cancelled'],
      default: 'Pending'
    },
    requestedAt: { type: Date },
    processedAt: { type: Date },
    adminNotes: { type: String },
    pickupCourierDetails: {
      company: { type: String },
      trackingNumber: { type: String },
      expectedPickupDate: { type: Date }
    }
  }
}, {
  timestamps: true
});

const Order = mongoose.model('Order', orderSchema);

module.exports = Order;
