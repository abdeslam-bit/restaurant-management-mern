const express = require('express');
const router = express.Router();
const { createOrder, getOrderById, getOrders, updateOrderStatus, deleteOrder } = require('../controllers/orderController');
const { protect } = require('../middleware/auth');

router.post('/', createOrder);
router.get('/:id', getOrderById);
router.get('/', protect, getOrders);
router.patch('/:id/status', protect, updateOrderStatus);
router.delete('/:id', protect, deleteOrder);

module.exports = router;
