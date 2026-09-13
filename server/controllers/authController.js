const jwt = require('jsonwebtoken');
const AdminUser = require('../models/AdminUser');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '7d' });
};

// @desc    Login admin
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required' });
    }

    const admin = await AdminUser.findOne({ email }).select('+password');

    if (!admin || !(await admin.comparePassword(password))) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    const token = generateToken(admin._id);

    res.status(200).json({
      success: true,
      token,
      admin: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get current admin profile
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res, next) => {
  try {
    res.status(200).json({ success: true, admin: req.admin });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all admin & staff accounts (Main Admin only)
// @route   GET /api/auth/users
// @access  Private/SuperAdmin
const getUsers = async (req, res, next) => {
  try {
    const users = await AdminUser.find().select('-password').sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: users.length, data: users });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a new admin/staff account (Main Admin only)
// @route   POST /api/auth/users
// @access  Private/SuperAdmin
const createUser = async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Name, email, and password are required' });
    }

    const existingUser = await AdminUser.findOne({ email: email.toLowerCase().trim() });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'An account with this email already exists' });
    }

    const validRoles = ['superadmin', 'admin', 'staff'];
    const userRole = validRoles.includes(role) ? role : 'staff';

    const newUser = await AdminUser.create({
      name,
      email: email.toLowerCase().trim(),
      password,
      role: userRole,
    });

    res.status(201).json({
      success: true,
      data: {
        _id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        createdAt: newUser.createdAt,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete an admin/staff account (Main Admin only)
// @route   DELETE /api/auth/users/:id
// @access  Private/SuperAdmin
const deleteUser = async (req, res, next) => {
  try {
    if (req.admin._id.toString() === req.params.id) {
      return res.status(400).json({ success: false, message: 'You cannot delete your own account' });
    }

    const user = await AdminUser.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'Account not found' });
    }

    res.status(200).json({ success: true, message: 'Account removed successfully' });
  } catch (error) {
    next(error);
  }
};

// @desc    Update an admin/staff account (Main Admin only)
// @route   PUT /api/auth/users/:id
// @access  Private/SuperAdmin
const updateUser = async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;
    const user = await AdminUser.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ success: false, message: 'Account not found' });
    }

    // Check email uniqueness if email is changing
    if (email && email.toLowerCase().trim() !== user.email) {
      const existingUser = await AdminUser.findOne({ email: email.toLowerCase().trim() });
      if (existingUser) {
        return res.status(400).json({ success: false, message: 'An account with this email already exists' });
      }
      user.email = email.toLowerCase().trim();
    }

    if (name) user.name = name;

    const validRoles = ['superadmin', 'admin', 'staff'];
    if (role && validRoles.includes(role)) {
      if (req.admin._id.toString() === req.params.id && role !== 'superadmin') {
        return res.status(400).json({ success: false, message: 'You cannot remove your own Main Admin role' });
      }
      user.role = role;
    }

    // Update password if provided
    if (password && password.trim().length >= 6) {
      user.password = password.trim();
    }

    await user.save();

    res.status(200).json({
      success: true,
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { login, getMe, getUsers, createUser, updateUser, deleteUser };
