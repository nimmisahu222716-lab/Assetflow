const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
dotenv.config();

const connectDB = require('./config/db');
const seedDatabase = require('./seed/seedData');

const authRoutes = require('./routes/authRoutes');
const departmentRoutes = require('./routes/departmentRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const userRoutes = require('./routes/userRoutes');
const assetRoutes = require('./routes/assetRoutes');
const allocationRoutes = require('./routes/allocationRoutes');
const transferRoutes = require('./routes/transferRoutes');
const bookingRoutes = require('./routes/bookingRoutes');
const maintenanceRoutes = require('./routes/maintenanceRoutes');
const auditRoutes = require('./routes/auditRoutes');
const reportRoutes = require('./routes/reportRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const auditLogRoutes = require('./routes/auditLogRoutes');

const app = express();

app.use(cors());
app.use(express.json());

// Auto DB Connection & Auto Seed Middleware for serverless functions / Express
app.use(async (req, res, next) => {
  try {
    await connectDB();
    const User = require('./models/User');
    const userCount = await User.countDocuments();
    if (userCount === 0) {
      console.log('Database empty. Running seed setup...');
      await seedDatabase();
    }
  } catch (err) {
    console.error('DB Connection error in middleware:', err);
  }
  next();
});

// Helper router mount function to handle both /api/path and /path in serverless environment
const mountRoute = (path, router) => {
  app.use(`/api${path}`, router);
  app.use(path, router);
};

mountRoute('/auth', authRoutes);
mountRoute('/departments', departmentRoutes);
mountRoute('/categories', categoryRoutes);
mountRoute('/users', userRoutes);
mountRoute('/assets', assetRoutes);
mountRoute('/allocations', allocationRoutes);
mountRoute('/transfers', transferRoutes);
mountRoute('/bookings', bookingRoutes);
mountRoute('/maintenance', maintenanceRoutes);
mountRoute('/audits', auditRoutes);
mountRoute('/reports', reportRoutes);
mountRoute('/notifications', notificationRoutes);
mountRoute('/logs', auditLogRoutes);

app.get(['/api/health', '/health'], (req, res) => {
  res.json({ status: 'ok', system: 'AssetFlow ERP API', timestamp: new Date() });
});

app.get(['/api', '/'], (req, res) => {
  res.json({ status: 'ok', system: 'AssetFlow ERP Backend API' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled Error:', err);
  res.status(err.status || 500).json({
    message: err.message || 'Internal Server Error'
  });
});

module.exports = app;
