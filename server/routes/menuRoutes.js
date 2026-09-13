const express = require('express');
const router = express.Router();
const {
  getMenuItems,
  getMenuItem,
  createMenuItem,
  updateMenuItem,
  deleteMenuItem,
  toggleAvailability,
} = require('../controllers/menuController');
const { protect } = require('../middleware/auth');

router.get('/', getMenuItems);
router.get('/:id', getMenuItem);
router.post('/', protect, createMenuItem);
router.put('/:id', protect, updateMenuItem);
router.delete('/:id', protect, deleteMenuItem);
router.patch('/:id/toggle', protect, toggleAvailability);

module.exports = router;
