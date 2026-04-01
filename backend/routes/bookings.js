const express = require('express');
const router = express.Router();
const {
  createBooking,
  getUserBookings,
  getOwnerBookings,
  getAllBookings,
  updateBookingStatus,
} = require('../controllers/bookingController');
const { protect } = require('../middlewares/authMiddleware');
const { authorizeRoles } = require('../middlewares/roleMiddleware');

router.post('/', protect, authorizeRoles('user', 'owner'), createBooking);
router.get('/me', protect, getUserBookings);
router.get('/owner', protect, authorizeRoles('owner'), getOwnerBookings);
router.get('/all', protect, authorizeRoles('admin'), getAllBookings);
router.put('/:id/status', protect, updateBookingStatus);

module.exports = router;
