const express = require('express');
const router = express.Router();
const {
  createReservation,
  getReservations,
  updateReservationStatus,
  deleteReservation,
} = require('../controllers/reservationController');
const { protect } = require('../middleware/auth');

router.post('/', createReservation);
router.get('/', protect, getReservations);
router.patch('/:id/status', protect, updateReservationStatus);
router.delete('/:id', protect, deleteReservation);

module.exports = router;
