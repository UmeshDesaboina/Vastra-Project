const Order = require('../models/orderModel');
const Product = require('../models/productModel');

// Build absolute image URL for client rendering
const toAbsoluteImageUrl = (req, image) => {
  if (!image) return image;
  if (/^https?:\/\//i.test(image)) return image;
  const base = `${req.protocol}://${req.get('host')}`;
  // ensure leading slash and default to /uploads for local stored files
  const normalized = image.startsWith('/') ? image : `/uploads/${image}`;
  return `${base}${normalized}`;
};

// Normalize an order to include absolute image URLs and courier aliases for UI compatibility
const normalizeOrderForClient = (req, orderDoc) => {
  const o = orderDoc.toObject({ virtuals: true });
  if (Array.isArray(o.orderItems)) {
    o.orderItems = o.orderItems.map((it) => ({
      ...it,
      image: toAbsoluteImageUrl(req, it.image)
    }));
  }
  // Expose courier aliases at top-level for older clients, without removing nested object
  if (o.courierDetails) {
    o.courierCompany = o.courierDetails.company || null;
    o.trackingNumber = o.courierDetails.trackingNumber || null;
    o.estimatedDeliveryDate = o.courierDetails.estimatedDeliveryDate || null;
  }
  return o;
};

// @desc    Create new order
// @route   POST /api/orders
// @access  Private
const createOrder = async (req, res) => {
  try {
    const {
      orderItems,
      shippingAddress,
      paymentMethod,
      itemsPrice,
      shippingPrice,
      totalPrice
    } = req.body;

    if (!orderItems || orderItems.length === 0) {
      return res.status(400).json({ message: 'No order items' });
    }

    // All orders start as unpaid until payment is confirmed
    // For COD: marked as paid when delivered
    // For online payments (Stripe, PayPal): should be marked as paid after payment gateway confirmation
    // Since there's no payment gateway integration yet, all orders start as unpaid
    const isPaid = false;

    const order = new Order({
      user: req.user._id,
      orderItems,
      shippingAddress,
      paymentMethod,
      itemsPrice,
      shippingPrice,
      totalPrice,
      isPaid,
      paidAt: isPaid ? new Date() : undefined
    });

    const createdOrder = await order.save();
    res.status(201).json(normalizeOrderForClient(req, createdOrder));
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Get order by ID
// @route   GET /api/orders/:id
// @access  Private (user who owns order or admin)
const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate('user', 'name email');

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Authorization: owner or admin
    if (!req.user.isAdmin && order.user._id.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized to view this order' });
    }

    res.json(normalizeOrderForClient(req, order));
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Get logged in user orders
// @route   GET /api/orders/myorders
// @access  Private
const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json(orders.map((o) => normalizeOrderForClient(req, o)));
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Get all orders (admin) with filters and pagination
// @route   GET /api/orders
// @access  Private/Admin
const getOrders = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      status,
      paid,
      user, // email or id
      dateFrom,
      dateTo,
      sort = 'createdAt',
      sortDir = 'desc',
      q
    } = req.query;

    const pageNum = Math.max(parseInt(page) || 1, 1);
    const pageSize = Math.min(Math.max(parseInt(limit) || 20, 1), 100);

    const filter = {};
    if (status) filter.status = status;
    if (typeof paid !== 'undefined') filter.isPaid = paid === 'true';
    if (dateFrom || dateTo) {
      filter.createdAt = {};
      if (dateFrom) filter.createdAt.$gte = new Date(dateFrom);
      if (dateTo) filter.createdAt.$lte = new Date(dateTo);
    }

    // If user is provided, resolve email -> id if needed
    if (user) {
      if (user.match(/^[0-9a-fA-F]{24}$/)) {
        filter.user = user;
      } else {
        // try by email
        const found = await require('../models/userModel').findOne({ email: user });
        if (found) filter.user = found._id;
        else filter.user = null; // no results
      }
    }

    // q: search by order id, status, user email, or user name
    if (q) {
      const User = require('../models/userModel');
      const searchConditions = [];
      
      // Check if q is a valid ObjectId for order search
      if (String(q).match(/^[0-9a-fA-F]{24}$/)) {
        searchConditions.push({ _id: q });
      }
      
      // Search by status
      searchConditions.push({ status: { $regex: q, $options: 'i' } });
      
      // Search by payment method
      searchConditions.push({ paymentMethod: { $regex: q, $options: 'i' } });
      
      // Search by user email or name
      const foundUsers = await User.find({
        $or: [
          { email: { $regex: q, $options: 'i' } },
          { name: { $regex: q, $options: 'i' } }
        ]
      }).select('_id');
      
      if (foundUsers.length > 0) {
        searchConditions.push({ user: { $in: foundUsers.map(u => u._id) } });
      }
      
      // Apply $or condition if we have search terms
      if (searchConditions.length > 0) {
        filter.$or = searchConditions;
      }
    }

    const sortSpec = { [sort]: sortDir === 'asc' ? 1 : -1 };

    const [total, orders, countsByStatus] = await Promise.all([
      Order.countDocuments(filter),
      Order.find(filter)
        .populate('user', 'name email')
        .sort(sortSpec)
        .limit(pageSize)
        .skip(pageSize * (pageNum - 1)),
      Order.aggregate([
        { $match: filter },
        { $group: { _id: '$status', count: { $sum: 1 } } }
      ])
    ]);

    const pages = Math.ceil(total / pageSize) || 1;
    const statusCounts = countsByStatus.reduce((acc, cur) => {
      acc[cur._id] = cur.count;
      return acc;
    }, { Pending: 0, Shipped: 0, Delivered: 0, Cancelled: 0 });

    res.json({
      orders: orders.map((o) => normalizeOrderForClient(req, o)),
      page: pageNum,
      pages,
      total,
      statusCounts
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Update order status, and set courier details when shipped
// @route   PUT /api/orders/:id/status
// @access  Private/Admin
const updateOrderStatus = async (req, res) => {
  try {
    const { status, courierCompany, trackingNumber, estimatedDeliveryDate } = req.body;

    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Validate status
    const allowed = ['Pending', 'Shipped', 'Delivered', 'Cancelled'];
    if (!allowed.includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    order.status = status;

    if (status === 'Shipped') {
      if (!courierCompany || !trackingNumber) {
        return res.status(400).json({ message: 'Courier company and tracking number are required when shipping' });
      }
      order.courierDetails = {
        company: courierCompany,
        trackingNumber,
        estimatedDeliveryDate: estimatedDeliveryDate ? new Date(estimatedDeliveryDate) : order.courierDetails?.estimatedDeliveryDate
      };
      order.shippedAt = new Date();
    }

    if (status === 'Delivered') {
      order.deliveredAt = new Date();
      // For Cash on Delivery, mark as paid when delivered
      if (!order.isPaid && (order.paymentMethod === 'Cash on Delivery' || order.paymentMethod === 'COD')) {
        order.isPaid = true;
        order.paidAt = new Date();
      }
    }

    const updated = await order.save();
    res.json(normalizeOrderForClient(req, updated));
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Orders stats (admin)
// @route   GET /api/orders/stats
// @access  Private/Admin
const getOrderStats = async (req, res) => {
  try {
    const { dateFrom, dateTo } = req.query;
    const match = {};
    if (dateFrom || dateTo) {
      match.createdAt = {};
      if (dateFrom) match.createdAt.$gte = new Date(dateFrom);
      if (dateTo) match.createdAt.$lte = new Date(dateTo);
    }

    const [statusAgg, revenueAgg, paidAgg] = await Promise.all([
      Order.aggregate([
        { $match: match },
        { $group: { _id: '$status', count: { $sum: 1 } } }
      ]),
      Order.aggregate([
        { $match: { ...match, status: 'Delivered' } },
        { $group: { _id: null, total: { $sum: '$totalPrice' } } }
      ]),
      Order.aggregate([
        { $match: match },
        { $group: { _id: '$isPaid', count: { $sum: 1 } } }
      ])
    ]);

    const statusCounts = statusAgg.reduce((acc, cur) => { acc[cur._id] = cur.count; return acc; }, { Pending: 0, Shipped: 0, Delivered: 0, Cancelled: 0 });
    const paidCounts = paidAgg.reduce((acc, cur) => { acc[cur._id ? 'paid' : 'unpaid'] = cur.count; return acc; }, { paid: 0, unpaid: 0 });
    const revenue = revenueAgg?.[0]?.total || 0;

    res.json({ statusCounts, revenue, paidCounts });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Request return for an order
// @route   POST /api/orders/:id/return
// @access  Private
const requestReturn = async (req, res) => {
  try {
    const { reason } = req.body;
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Authorization: owner only
    if (order.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    // Validate order is delivered
    if (order.status !== 'Delivered') {
      return res.status(400).json({ message: 'Can only return delivered orders' });
    }

    // Check if return already requested
    if (order.returnRequest?.requested) {
      return res.status(400).json({ message: 'Return already requested' });
    }

    if (!reason || reason.trim() === '') {
      return res.status(400).json({ message: 'Return reason is required' });
    }

    order.returnRequest = {
      requested: true,
      reason,
      status: 'Pending',
      requestedAt: new Date()
    };

    const updated = await order.save();
    res.json(normalizeOrderForClient(req, updated));
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Request replacement for an order
// @route   POST /api/orders/:id/replacement
// @access  Private
const requestReplacement = async (req, res) => {
  try {
    const { reason } = req.body;
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Authorization: owner only
    if (order.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    // Validate order is delivered
    if (order.status !== 'Delivered') {
      return res.status(400).json({ message: 'Can only request replacement for delivered orders' });
    }

    // Check if replacement already requested
    if (order.replacementRequest?.requested) {
      return res.status(400).json({ message: 'Replacement already requested' });
    }

    if (!reason || reason.trim() === '') {
      return res.status(400).json({ message: 'Replacement reason is required' });
    }

    order.replacementRequest = {
      requested: true,
      reason,
      status: 'Pending',
      requestedAt: new Date()
    };

    const updated = await order.save();
    res.json(normalizeOrderForClient(req, updated));
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Update return request status (admin)
// @route   PUT /api/orders/:id/return-status
// @access  Private/Admin
const updateReturnStatus = async (req, res) => {
  try {
    const { status, adminNotes, courierCompany, trackingNumber, expectedPickupDate } = req.body;
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    if (!order.returnRequest?.requested) {
      return res.status(400).json({ message: 'No return request found' });
    }

    const allowed = ['Pending', 'Approved', 'Rejected', 'Completed', 'Cancelled'];
    if (!allowed.includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    order.returnRequest.status = status;
    order.returnRequest.processedAt = new Date();
    if (adminNotes) order.returnRequest.adminNotes = adminNotes;

    // Add pickup courier details when approved
    if (status === 'Approved' && (courierCompany || trackingNumber || expectedPickupDate)) {
      order.returnRequest.pickupCourierDetails = {
        company: courierCompany || order.returnRequest.pickupCourierDetails?.company,
        trackingNumber: trackingNumber || order.returnRequest.pickupCourierDetails?.trackingNumber,
        expectedPickupDate: expectedPickupDate ? new Date(expectedPickupDate) : order.returnRequest.pickupCourierDetails?.expectedPickupDate
      };
    }

    const updated = await order.save();
    res.json(normalizeOrderForClient(req, updated));
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Update replacement request status (admin)
// @route   PUT /api/orders/:id/replacement-status
// @access  Private/Admin
const updateReplacementStatus = async (req, res) => {
  try {
    const { status, adminNotes, courierCompany, trackingNumber, expectedPickupDate } = req.body;
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    if (!order.replacementRequest?.requested) {
      return res.status(400).json({ message: 'No replacement request found' });
    }

    const allowed = ['Pending', 'Approved', 'Rejected', 'Completed', 'Cancelled'];
    if (!allowed.includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    order.replacementRequest.status = status;
    order.replacementRequest.processedAt = new Date();
    if (adminNotes) order.replacementRequest.adminNotes = adminNotes;

    // Add pickup courier details when approved
    if (status === 'Approved' && (courierCompany || trackingNumber || expectedPickupDate)) {
      order.replacementRequest.pickupCourierDetails = {
        company: courierCompany || order.replacementRequest.pickupCourierDetails?.company,
        trackingNumber: trackingNumber || order.replacementRequest.pickupCourierDetails?.trackingNumber,
        expectedPickupDate: expectedPickupDate ? new Date(expectedPickupDate) : order.replacementRequest.pickupCourierDetails?.expectedPickupDate
      };
    }

    const updated = await order.save();
    res.json(normalizeOrderForClient(req, updated));
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Mark order as paid (admin)
// @route   PUT /api/orders/:id/pay
// @access  Private/Admin
const markOrderAsPaid = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    order.isPaid = true;
    order.paidAt = new Date();

    const updated = await order.save();
    res.json(normalizeOrderForClient(req, updated));
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Cancel return request (user)
// @route   DELETE /api/orders/:id/return
// @access  Private
const cancelReturn = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Authorization: owner only
    if (order.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    if (!order.returnRequest?.requested) {
      return res.status(400).json({ message: 'No return request found' });
    }

    // Only allow cancellation if status is Pending
    if (order.returnRequest.status !== 'Pending') {
      return res.status(400).json({ message: 'Cannot cancel return request that has been processed' });
    }

    order.returnRequest.status = 'Cancelled';
    order.returnRequest.processedAt = new Date();

    const updated = await order.save();
    res.json(normalizeOrderForClient(req, updated));
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Cancel replacement request (user)
// @route   DELETE /api/orders/:id/replacement
// @access  Private
const cancelReplacement = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Authorization: owner only
    if (order.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    if (!order.replacementRequest?.requested) {
      return res.status(400).json({ message: 'No replacement request found' });
    }

    // Only allow cancellation if status is Pending
    if (order.replacementRequest.status !== 'Pending') {
      return res.status(400).json({ message: 'Cannot cancel replacement request that has been processed' });
    }

    order.replacementRequest.status = 'Cancelled';
    order.replacementRequest.processedAt = new Date();

    const updated = await order.save();
    res.json(normalizeOrderForClient(req, updated));
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

module.exports = {
  createOrder,
  getOrderById,
  getMyOrders,
  getOrders,
  updateOrderStatus,
  getOrderStats,
  requestReturn,
  requestReplacement,
  updateReturnStatus,
  updateReplacementStatus,
  markOrderAsPaid,
  cancelReturn,
  cancelReplacement
};
