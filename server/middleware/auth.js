const jwt = require('jsonwebtoken');
const AdminUser = require('../models/AdminUser');

// Protect routes - verify JWT
const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({ success: false, message: 'Not authorized, no token provided' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.admin = await AdminUser.findById(decoded.id).select('-password');

    if (!req.admin) {
      return res.status(401).json({ success: false, message: 'Not authorized, admin not found' });
    }

    next();
  } catch (error) {
    return res.status(401).json({ success: false, message: 'Not authorized, token invalid or expired' });
  }
};

// Admin-level access (admin or superadmin)
const adminOnly = (req, res, next) => {
  if (req.admin && (req.admin.role === 'admin' || req.admin.role === 'superadmin')) {
    next();
  } else {
    res.status(403).json({ success: false, message: 'Access denied. Admin role required.' });
  }
};

// Main Admin (SuperAdmin) only access
const superAdminOnly = (req, res, next) => {
  if (req.admin && req.admin.role === 'superadmin') {
    return next();
  }
  return res.status(403).json({ success: false, message: 'Access denied. Main Admin privileges required.' });
};

module.exports = { protect, adminOnly, superAdminOnly };
