const Review = require('../models/Review');
const Booking = require('../models/Booking');
const Vehicle = require('../models/Vehicle');

exports.createReview = async (req, res) => {
  const { bookingId, rating, comment } = req.body;
  if (!bookingId || !rating || !comment) {
    return res.status(400).json({ message: 'Booking, rating and comment are required' });
  }

  const booking = await Booking.findById(bookingId);
  if (!booking) {
    return res.status(404).json({ message: 'Booking not found' });
  }
  if (!booking.user.equals(req.user._id)) {
    return res.status(403).json({ message: 'Not authorized to review this booking' });
  }
  if (booking.paymentStatus !== 'paid' && booking.status !== 'completed') {
    return res.status(400).json({ message: 'Review can only be submitted after successful payment' });
  }

  const existingReview = await Review.findOne({ booking: bookingId, user: req.user._id });
  if (existingReview) {
    return res.status(400).json({ message: 'Review already submitted for this booking' });
  }

  const review = await Review.create({
    booking: booking._id,
    vehicle: booking.vehicle,
    user: req.user._id,
    rating,
    comment,
  });

  const vehicle = await Vehicle.findById(booking.vehicle);
  if (vehicle) {
    const reviews = await Review.find({ vehicle: vehicle._id });
    const totalReviews = reviews.length;
    const averageRating = reviews.reduce((sum, item) => sum + item.rating, 0) / totalReviews;
    vehicle.totalReviews = totalReviews;
    vehicle.averageRating = Number(averageRating.toFixed(1));
    await vehicle.save();
  }

  res.status(201).json(review);
};

exports.getVehicleReviews = async (req, res) => {
  const reviews = await Review.find({ vehicle: req.params.vehicleId })
    .populate('user', 'name')
    .sort({ createdAt: -1 });

  res.json(reviews);
};
