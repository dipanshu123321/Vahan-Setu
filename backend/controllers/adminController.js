const User = require('../models/User');
const Vehicle = require('../models/Vehicle');
const Booking = require('../models/Booking');

exports.getUsers = async (req, res) => {
  const users = await User.find().select('-password');
  res.json(users);
};

exports.getVehicles = async (req, res) => {
  const vehicles = await Vehicle.find().populate('owner', 'name email');
  res.json(vehicles);
};

exports.getBookings = async (req, res) => {
  const bookings = await Booking.find()
    .populate('user', 'name email')
    .populate('owner', 'name email')
    .populate('vehicle', 'title type');
  res.json(bookings);
};

exports.approveVehicle = async (req, res) => {
  const vehicle = await Vehicle.findById(req.params.id);
  if (!vehicle) return res.status(404).json({ message: 'Vehicle not found' });
  vehicle.approved = true;
  await vehicle.save();
  res.json({ message: 'Vehicle approved', vehicle });
};

exports.deleteVehicle = async (req, res) => {
  await Vehicle.findByIdAndDelete(req.params.id);
  res.json({ message: 'Vehicle deleted' });
};
