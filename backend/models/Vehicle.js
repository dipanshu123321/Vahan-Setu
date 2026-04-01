const mongoose = require('mongoose');

const vehicleSchema = new mongoose.Schema({
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true, trim: true },
  description: { type: String, required: true, trim: true },
  type: { type: String, enum: ['bike', 'car', 'bus'], required: true },
  city: { type: String, required: true, trim: true },
  pricePerDay: { type: Number, required: true },
  images: [{ type: String }],
  seats: { type: Number, default: 4 },
  approved: { type: Boolean, default: false },
  available: { type: Boolean, default: true },
  averageRating: { type: Number, default: 0 },
  totalReviews: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
}, { timestamps: true });

module.exports = mongoose.model('Vehicle', vehicleSchema);
