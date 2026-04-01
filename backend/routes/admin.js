const express = require('express');
const router = express.Router();
const {
  getUsers,
  getVehicles,
  getBookings,
  approveVehicle,
  deleteVehicle,
} = require('../controllers/adminController');
const { protect } = require('../middlewares/authMiddleware');
const { authorizeRoles } = require('../middlewares/roleMiddleware');

router.use(protect, authorizeRoles('admin'));
router.get('/users', getUsers);
router.get('/vehicles', getVehicles);
router.get('/bookings', getBookings);
router.put('/vehicles/:id/approve', approveVehicle);
router.delete('/vehicles/:id', deleteVehicle);

module.exports = router;
