const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/authMiddleware');
const { authorizeRoles } = require('../middlewares/roleMiddleware');
const { createReview, getVehicleReviews } = require('../controllers/reviewController');

router.get('/vehicle/:vehicleId', getVehicleReviews);
router.post('/', protect, authorizeRoles('user'), createReview);

module.exports = router;
