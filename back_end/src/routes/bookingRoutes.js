const express = require('express');
const {
  getBookings,
  createBooking,
  getBookingById,
  updateBooking,
  deleteBooking,
  updateBookingStatus,
  addBookingNote,
} = require('../controllers/bookingController');

const router = express.Router();

router.get('/', getBookings);
router.post('/', createBooking);
router.get('/:id', getBookingById);
router.put('/:id', updateBooking);
router.delete('/:id', deleteBooking);
router.patch('/:id/status', updateBookingStatus);
router.post('/:id/notes', addBookingNote);

module.exports = router;

