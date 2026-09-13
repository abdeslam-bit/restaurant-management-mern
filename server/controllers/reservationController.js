const Reservation = require('../models/Reservation');

// @desc    Create a reservation (guest)
// @route   POST /api/reservations
// @access  Public
const createReservation = async (req, res, next) => {
  try {
    const reservation = await Reservation.create(req.body);
    res.status(201).json({ success: true, data: reservation });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all reservations (admin)
// @route   GET /api/reservations
// @access  Private/Admin
const getReservations = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 50 } = req.query;
    const filter = {};
    if (status) filter.status = status;

    const reservations = await Reservation.find(filter)
      .sort({ date: 1, time: 1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Reservation.countDocuments(filter);

    res.status(200).json({ success: true, count: reservations.length, total, data: reservations });
  } catch (error) {
    next(error);
  }
};

// @desc    Update reservation status (admin)
// @route   PATCH /api/reservations/:id/status
// @access  Private/Admin
const updateReservationStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const validStatuses = ['Pending', 'Confirmed', 'Rejected', 'Completed'];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status value' });
    }

    const reservation = await Reservation.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    );

    if (!reservation) return res.status(404).json({ success: false, message: 'Reservation not found' });
    res.status(200).json({ success: true, data: reservation });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a reservation
// @route   DELETE /api/reservations/:id
// @access  Private/Admin
const deleteReservation = async (req, res, next) => {
  try {
    const reservation = await Reservation.findByIdAndDelete(req.params.id);
    if (!reservation) return res.status(404).json({ success: false, message: 'Reservation not found' });
    res.status(200).json({ success: true, message: 'Reservation deleted' });
  } catch (error) {
    next(error);
  }
};

module.exports = { createReservation, getReservations, updateReservationStatus, deleteReservation };
