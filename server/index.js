require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const morgan = require('morgan');
const helmet = require('helmet');
const path = require('path');

const authRoutes = require('./routes/authRoutes');
const menuRoutes = require('./routes/menuRoutes');
const orderRoutes = require('./routes/orderRoutes');
const reservationRoutes = require('./routes/reservationRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');
const uploadRoutes = require('./routes/uploadRoutes');
const errorHandler = require('./middleware/errorHandler');
const AdminUser = require('./models/AdminUser');

const app = express();

// Security headers — allow image src from same origin for uploaded files
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  })
);

// Serve uploaded images as static files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// CORS
// app.use(
//   cors({
//     origin: process.env.CLIENT_URL || 'http://localhost:5173',
//     credentials: true,
//   })
// );
// to try with phone
app.use(cors({
  origin: '*', // يسمح للطلبات القادمة من الـ IP الخاص بالهاتف
  credentials: true
}));

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Logging (dev only)
if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
}

// ─── Routes ──────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/menu', menuRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/reservations', reservationRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/upload', uploadRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.status(200).json({ success: true, message: 'Server is running', timestamp: new Date() });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found` });
});

// Global error handler
app.use(errorHandler);

// ─── DB Connect & Auto-Seed Admin ────────────────────────
const connectDB = async () => {
  if (!process.env.MONGO_URI) {
    console.warn('\n⚠️   MONGO_URI is not set. Please update your .env file.');
    console.warn('    Server will start but database features will be unavailable.\n');
    return;
  }

  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('\n✅  MongoDB connected\n');

    // Auto-create default admin if none exists, or upgrade default admin to superadmin
    const defaultEmail = process.env.ADMIN_DEFAULT_EMAIL || 'admin@restaurant.com';
    let defaultAdmin = await AdminUser.findOne({ email: defaultEmail });
    if (!defaultAdmin) {
      defaultAdmin = await AdminUser.create({
        name: process.env.ADMIN_DEFAULT_NAME || 'Main Admin',
        email: defaultEmail,
        password: process.env.ADMIN_DEFAULT_PASSWORD || 'Admin@123456',
        role: 'superadmin',
      });
      console.log('👤  Main Admin auto-created:');
      console.log('    ┌─────────────────────────────────────────┐');
      console.log(`    │  Email:    ${defaultEmail.padEnd(29)}│`);
      console.log(`    │  Password: ${(process.env.ADMIN_DEFAULT_PASSWORD || 'Admin@123456').padEnd(29)}│`);
      console.log('    └─────────────────────────────────────────┘\n');
    } else if (defaultAdmin.role !== 'superadmin') {
      defaultAdmin.role = 'superadmin';
      await defaultAdmin.save();
    }
  } catch (error) {
    console.error('❌  MongoDB connection failed:', error.message);
    process.exit(1);
  }
};

// ─── Start Server ─────────────────────────────────────────
const PORT = process.env.PORT || 5000;
const startServer = async () => {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`🚀  Server running on http://localhost:${PORT}`);
    console.log(`🌱  Environment: ${process.env.NODE_ENV || 'development'}\n`);
  });
};

startServer();
