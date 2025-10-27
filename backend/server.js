const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');

// Ensure environment variables are loaded from backend/.env regardless of CWD
dotenv.config({ path: path.join(__dirname, '.env'), override: true });

// Routes
const productRoutes = require('./routes/productRoutes');
const userRoutes = require('./routes/userRoutes');
const orderRoutes = require('./routes/orderRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const bannerRoutes = require('./routes/bannerRoutes');
const authRoutes = require('./routes/authRoutes');
const adminRoutes = require('./routes/adminRoutes');

const app = express();

// CORS Configuration
const corsOptions = {
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
  optionsSuccessStatus: 200
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json());
// ensure uploads directory exists
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}
app.use('/uploads', express.static(uploadsDir));

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    const dbName = mongoose.connection?.name || mongoose.connection?.db?.databaseName;
    console.log('MongoDB Connected', dbName ? `(${dbName})` : '');
  })
  .catch(err => console.log('MongoDB Connection Error:', err));

// Routes
app.use('/api/products', productRoutes);
app.use('/api/users', userRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/banners', bannerRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);

// Debug DB route (development only)
if (process.env.NODE_ENV !== 'production') {
  app.get('/api/_debug/db', (req, res) => {
    const conn = mongoose.connection;
    res.json({
      name: conn?.name,
      host: conn?.host,
      port: conn?.port,
      readyState: conn?.readyState,
      uriSource: process.env.MONGODB_URI ? 'env' : 'none'
    });
  });
  
  app.get('/api/_debug/products', async (req, res) => {
    try {
      const Product = require('./models/productModel');
      const count = await Product.countDocuments({});
      const products = await Product.find({}).limit(3).select('name price');
      const dbName = mongoose.connection.name;
      const collectionName = Product.collection.name;
      res.json({ dbName, collectionName, count, sampleProducts: products });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
}

// Root route
app.get('/', (req, res) => {
  res.send('Vastra Store API is running');
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});