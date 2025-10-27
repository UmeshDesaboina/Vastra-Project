const User = require('../models/userModel');
const Order = require('../models/orderModel');
const Product = require('../models/productModel');

// @desc    Get admin dashboard stats (totals + recent + breakdown)
// @route   GET /api/admin/dashboard/stats
// @access  Private/Admin
const getDashboardStats = async (req, res) => {
  try {
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const [
      totalUsers,
      totalOrders,
      totalProducts,
      totalSalesAgg,
      pendingOrders,
      statusBreakdownAgg,
      salesTodayAgg,
      salesMonthAgg,
      recentOrders,
      lowStock
    ] = await Promise.all([
      User.countDocuments(),
      Order.countDocuments(),
      Product.countDocuments(),
      Order.aggregate([
        { $match: { status: 'Delivered' } },
        { $group: { _id: null, total: { $sum: '$totalPrice' } } }
      ]),
      Order.countDocuments({ status: 'Pending' }),
      Order.aggregate([
        { $group: { _id: '$status', count: { $sum: 1 } } }
      ]),
      Order.aggregate([
        { $match: { status: 'Delivered', deliveredAt: { $gte: startOfDay } } },
        { $group: { _id: null, total: { $sum: '$totalPrice' } } }
      ]),
      Order.aggregate([
        { $match: { status: 'Delivered', deliveredAt: { $gte: startOfMonth } } },
        { $group: { _id: null, total: { $sum: '$totalPrice' } } }
      ]),
      Order.find({}).sort({ createdAt: -1 }).limit(10).populate('user', 'name email'),
      Product.find({ countInStock: { $lte: 5 } }).sort({ countInStock: 1 }).limit(10)
    ]);

    const totalSales = totalSalesAgg?.[0]?.total || 0;
    const salesToday = salesTodayAgg?.[0]?.total || 0;
    const salesThisMonth = salesMonthAgg?.[0]?.total || 0;
    const statusCounts = statusBreakdownAgg.reduce((acc, cur) => {
      acc[cur._id] = cur.count; return acc;
    }, { Pending: 0, Shipped: 0, Delivered: 0, Cancelled: 0 });

    res.json({
      totals: { totalUsers, totalOrders, totalProducts, totalSales },
      statusCounts,
      sales: { today: salesToday, month: salesThisMonth },
      recentOrders,
      lowStock
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Download orders CSV report
// @route   GET /api/admin/reports/orders.csv
// @access  Private/Admin
const downloadOrdersCsv = async (req, res) => {
  try {
    const orders = await Order.find({})
      .sort({ createdAt: -1 })
      .populate('user', 'name email');

    const header = ['OrderID','Date','UserName','UserEmail','Status','Paid','ItemsCount','TotalPrice'];
    const rows = orders.map(o => [
      o._id,
      new Date(o.createdAt).toISOString(),
      (o.user?.name || ''),
      (o.user?.email || ''),
      (o.status || ''),
      o.isPaid ? 'Yes' : 'No',
      (Array.isArray(o.orderItems) ? o.orderItems.reduce((a,i)=>a+Number(i.qty||0),0) : 0),
      Number(o.totalPrice || 0)
    ]);

    const csv = [header, ...rows]
      .map(r => r.map(v => String(v).replace(/"/g,'""')).map(v => (/[,\n]/.test(v)?`"${v}"`:v)).join(','))
      .join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="orders-report.csv"');
    res.status(200).send(csv);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

module.exports = { getDashboardStats, downloadOrdersCsv };
