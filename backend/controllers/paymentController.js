const crypto = require('crypto');
const Booking = require('../models/Booking');
const Payment = require('../models/Payment');
const razorpay = require('../utils/razorpay');

exports.createOrder = async (req, res) => {
  if (!razorpay) {
    return res.status(503).json({ message: 'Payment gateway is not configured' });
  }

  const { bookingId } = req.body;
  if (!bookingId) return res.status(400).json({ message: 'Booking ID required' });

  const booking = await Booking.findById(bookingId).populate('vehicle');
  if (!booking) return res.status(404).json({ message: 'Booking not found' });

  const options = {
    amount: Math.round(booking.totalAmount * 100),
    currency: 'INR',
    receipt: `booking_${booking._id}`,
    payment_capture: 1,
  };

  const order = await razorpay.orders.create(options);
  await Payment.create({
    booking: booking._id,
    user: req.user._id,
    amount: booking.totalAmount,
    razorpayOrderId: order.id,
    status: 'created',
  });

  res.json({ orderId: order.id, amount: order.amount, currency: order.currency });
};

exports.verifyPayment = async (req, res) => {
  if (!process.env.RAZORPAY_KEY_SECRET) {
    return res.status(503).json({ message: 'Payment gateway is not configured' });
  }

  const { razorpayOrderId, razorpayPaymentId, razorpaySignature, bookingId } = req.body;
  const body = razorpayOrderId + '|' + razorpayPaymentId;
  const expectedSignature = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
    .update(body.toString())
    .digest('hex');

  if (expectedSignature !== razorpaySignature) {
    return res.status(400).json({ message: 'Payment verification failed' });
  }

  const payment = await Payment.findOne({ razorpayOrderId });
  if (!payment) return res.status(404).json({ message: 'Payment record not found' });

  payment.razorpayPaymentId = razorpayPaymentId;
  payment.razorpaySignature = razorpaySignature;
  payment.status = 'paid';
  await payment.save();

  const booking = await Booking.findById(bookingId);
  booking.paymentStatus = 'paid';
  booking.status = 'confirmed';
  await booking.save();

  res.json({ message: 'Payment verified successfully', booking, payment });
};
