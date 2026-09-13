const express = require('express');
const router = express.Router();
const path = require('path');
const upload = require('../middleware/upload');
const { protect } = require('../middleware/auth');

// @desc    Upload an image file
// @route   POST /api/upload
// @access  Private/Admin
router.post('/', protect, upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: 'No file uploaded' });
  }

  const fileUrl = `/uploads/${req.file.filename}`;

  res.status(201).json({
    success: true,
    url: fileUrl,
    filename: req.file.filename,
    size: req.file.size,
  });
});

module.exports = router;
