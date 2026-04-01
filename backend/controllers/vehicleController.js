const cloudinary = require('../utils/cloudinary');
const Vehicle = require('../models/Vehicle');

const uploadImages = async images => {
  if (!images || !images.length) return [];
  const uploaded = [];
  for (const image of images) {
    if (image.startsWith('data:')) {
      const result = await cloudinary.uploader.upload(image, { folder: 'rental-hub/vehicles' });
      uploaded.push(result.secure_url);
    } else {
      uploaded.push(image);
    }
  }
  return uploaded;
};

exports.createVehicle = async (req, res) => {
  const { title, description, type, city, pricePerDay, seats, images } = req.body;
  if (!title || !description || !type || !city || !pricePerDay) {
    return res.status(400).json({ message: 'All required fields must be provided' });
  }
  const imageUrls = await uploadImages(images || []);
  const vehicle = await Vehicle.create({
    owner: req.user._id,
    title,
    description,
    type,
    city,
    pricePerDay,
    seats: seats || 4,
    images: imageUrls,
    approved: req.user.role === 'admin',
  });
  res.status(201).json(vehicle);
};

exports.getVehicles = async (req, res) => {
  const { city, type } = req.query;
  const filter = { approved: true, available: true };
  if (city) filter.city = new RegExp(city, 'i');
  if (type) filter.type = type;
  const vehicles = await Vehicle.find(filter).populate('owner', 'name city');
  res.json(vehicles);
};

exports.getVehicleById = async (req, res) => {
  const vehicle = await Vehicle.findById(req.params.id).populate('owner', 'name email city');
  if (!vehicle) return res.status(404).json({ message: 'Vehicle not found' });
  res.json(vehicle);
};

exports.getOwnerVehicles = async (req, res) => {
  const vehicles = await Vehicle.find({ owner: req.user._id }).populate('owner', 'name email');
  res.json(vehicles);
};

exports.updateVehicle = async (req, res) => {
  const vehicle = await Vehicle.findById(req.params.id);
  if (!vehicle) return res.status(404).json({ message: 'Vehicle not found' });
  if (!vehicle.owner.equals(req.user._id) && req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Not authorized to update this vehicle' });
  }
  const updatedFields = req.body;
  if (updatedFields.images) {
    updatedFields.images = await uploadImages(updatedFields.images);
  }
  const updated = await Vehicle.findByIdAndUpdate(req.params.id, updatedFields, { new: true });
  res.json(updated);
};

exports.approveVehicle = async (req, res) => {
  const vehicle = await Vehicle.findById(req.params.id);
  if (!vehicle) return res.status(404).json({ message: 'Vehicle not found' });
  vehicle.approved = true;
  await vehicle.save();
  res.json({ message: 'Vehicle approved', vehicle });
};
