const Booking = require('../models/Booking');
const Vehicle = require('../models/Vehicle');

const calculateDays = (startDate, endDate) => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diff = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
  return diff > 0 ? diff : 1;
};

exports.createBooking = async (req, res) => {
  const { vehicleId, startDate, endDate } = req.body;
  if (!vehicleId || !startDate || !endDate) {
    return res.status(400).json({ message: 'Vehicle and booking dates are required' });
  }
  const vehicle = await Vehicle.findById(vehicleId);
  if (!vehicle || !vehicle.approved) {
    return res.status(404).json({ message: 'Vehicle not available' });
  }
  const days = calculateDays(startDate, endDate);
  const totalAmount = vehicle.pricePerDay * days;
  const booking = await Booking.create({
    vehicle: vehicle._id,
    user: req.user._id,
    owner: vehicle.owner,
    startDate,
    endDate,
    days,
    totalAmount,
    status: 'pending',
    paymentStatus: 'pending',
  });
  res.status(201).json(booking);
};

exports.getUserBookings = async (req, res) => {
  const bookings = await Booking.find({ user: req.user._id })
    .populate('vehicle', 'title type city pricePerDay images')
    .populate('owner', 'name email');
  res.json(bookings);
};

exports.getOwnerBookings = async (req, res) => {
  const bookings = await Booking.find({ owner: req.user._id })
    .populate('vehicle', 'title type city pricePerDay images')
    .populate('user', 'name email');
  res.json(bookings);
};

exports.getAllBookings = async (req, res) => {
  const bookings = await Booking.find()
    .populate('vehicle', 'title type city pricePerDay')
    .populate('user', 'name email')
    .populate('owner', 'name email');
  res.json(bookings);
};

exports.updateBookingStatus = async (req, res) => {
  const { status } = req.body;
  const booking = await Booking.findById(req.params.id);
  if (!booking) return res.status(404).json({ message: 'Booking not found' });

  if (req.user.role === 'owner' && !booking.owner.equals(req.user._id)) {
    return res.status(403).json({ message: 'Not authorized to modify this booking' });
  }

  booking.status = status || booking.status;
  await booking.save();
  res.json(booking);
};
