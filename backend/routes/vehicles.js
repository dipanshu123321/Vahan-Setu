const express = require('express');
const router = express.Router();
const {
  createVehicle,
  getVehicles,
  getVehicleById,
  getOwnerVehicles,
  updateVehicle,
  approveVehicle,
} = require('../controllers/vehicleController');
const { protect } = require('../middlewares/authMiddleware');
const { authorizeRoles } = require('../middlewares/roleMiddleware');

router.get('/', getVehicles);
router.get('/owner/list', protect, authorizeRoles('owner'), getOwnerVehicles);
router.get('/:id', getVehicleById);
router.post('/', protect, authorizeRoles('owner', 'admin'), createVehicle);
router.put('/approve/:id', protect, authorizeRoles('admin'), approveVehicle);
router.put('/:id', protect, updateVehicle);

module.exports = router;
