import { useContext, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/router';
import Script from 'next/script';
import Navbar from '../../components/Navbar';
import api from '../../lib/api';
import { AuthContext } from '../../context/AuthContext';

export default function VehicleDetailPage() {
  const router = useRouter();
  const { id } = router.query;
  const { user } = useContext(AuthContext);
  const [vehicle, setVehicle] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [booking, setBooking] = useState(null);
  const [statusMessage, setStatusMessage] = useState('');
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [eligibleBookings, setEligibleBookings] = useState([]);
  const [selectedBookingId, setSelectedBookingId] = useState('');
  const [mapUrl, setMapUrl] = useState('');

  const fetchVehicle = async () => {
    if (!id) return;
    try {
      const response = await api.get(`/vehicles/${id}`);
      setVehicle(response.data);
    } catch (err) {
      setStatusMessage('Vehicle not found');
    }
  };

  const fetchReviews = async () => {
    if (!id) return;
    try {
      const response = await api.get(`/reviews/vehicle/${id}`);
      setReviews(response.data);
    } catch (err) {
      setReviews([]);
    }
  };

  useEffect(() => {
    fetchVehicle();
    fetchReviews();
  }, [id]);

  useEffect(() => {
    const loadMap = async city => {
      if (!city) return;
      try {
        const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(city)}`);
        const data = await res.json();
        if (data?.[0]) {
          const lat = parseFloat(data[0].lat);
          const lon = parseFloat(data[0].lon);
          const delta = 0.1;
          const bbox = `${lon - delta},${lat - delta},${lon + delta},${lat + delta}`;
          setMapUrl(`https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=map&marker=${lat},${lon}`);
        }
      } catch (err) {
        setMapUrl('');
      }
    };

    if (vehicle?.city) {
      loadMap(vehicle.city);
    }
  }, [vehicle?.city]);

  useEffect(() => {
    if (!user || !id) return;
    const loadBookings = async () => {
      try {
        const response = await api.get('/bookings/me');
        const paidBookings = response.data.filter(b => b.vehicle?._id === id && b.paymentStatus === 'paid');
        setEligibleBookings(paidBookings);
        if (paidBookings.length > 0) {
          setSelectedBookingId(paidBookings[0]._id);
        }
      } catch (err) {
        setEligibleBookings([]);
      }
    };
    loadBookings();
  }, [user, id]);

  const handleBooking = async event => {
    event.preventDefault();
    setStatusMessage('');
    if (!startDate || !endDate) {
      setStatusMessage('Please select both start and end dates');
      return;
    }
    try {
      const response = await api.post('/bookings', { vehicleId: id, startDate, endDate });
      setBooking(response.data);
      setStatusMessage('Booking created. Please pay to confirm.');
    } catch (err) {
      setStatusMessage(err.response?.data?.message || 'Unable to create booking');
    }
  };

  const handlePayment = async () => {
    if (!booking) return;
    setStatusMessage('Creating payment order...');
    try {
      const orderResponse = await api.post('/payments/order', { bookingId: booking._id });
      const { amount, currency, orderId } = orderResponse.data;
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || '',
        amount,
        currency,
        name: 'Rental Hub',
        description: vehicle?.title || 'Vehicle booking',
        order_id: orderId,
        handler: async response => {
          try {
            await api.post('/payments/verify', {
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
              bookingId: booking._id,
            });
            setBooking({ ...booking, paymentStatus: 'paid', status: 'confirmed' });
            setStatusMessage('Payment verified successfully');
          } catch (paymentError) {
            setStatusMessage(paymentError.response?.data?.message || 'Payment verification failed');
          }
        },
        prefill: {
          name: user?.name,
          email: user?.email,
        },
        theme: { color: '#0f172a' },
      };

      if (typeof window !== 'undefined' && window.Razorpay) {
        const rzp = new window.Razorpay(options);
        rzp.open();
      } else {
        setStatusMessage('Razorpay library did not load correctly.');
      }
    } catch (err) {
      setStatusMessage(err.response?.data?.message || 'Could not create payment order');
    }
  };

  const handleReviewSubmit = async event => {
    event.preventDefault();
    setStatusMessage('');
    if (!selectedBookingId) {
      setStatusMessage('Select a paid booking to submit a review.');
      return;
    }
    try {
      await api.post('/reviews', { bookingId: selectedBookingId, rating: reviewRating, comment: reviewComment });
      setReviewComment('');
      setReviewRating(5);
      setStatusMessage('Review submitted successfully.');
      fetchReviews();
    } catch (err) {
      setStatusMessage(err.response?.data?.message || 'Failed to submit review');
    }
  };

  const averageRating = useMemo(() => vehicle?.averageRating || 0, [vehicle]);

  return (
    <div>
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="afterInteractive" />
      <Navbar />
      <main className="mx-auto max-w-6xl px-4 py-10">
        {!vehicle ? (
          <div className="rounded-3xl bg-white p-8 text-center shadow-sm">Loading vehicle details...</div>
        ) : (
          <div className="space-y-8">
            <section className="rounded-3xl bg-white p-6 shadow-sm">
              <div className="grid gap-8 lg:grid-cols-[2fr_1fr]">
                <div>
                  <h1 className="text-3xl font-semibold">{vehicle.title}</h1>
                  <p className="mt-2 text-sm text-slate-500">{vehicle.type} · {vehicle.city}</p>
                  <p className="mt-4 text-slate-700">{vehicle.description}</p>
                  <div className="mt-4 flex flex-wrap items-center gap-3 text-sm text-slate-600">
                    <span>₹{vehicle.pricePerDay}/day</span>
                    <span>Seats: {vehicle.seats}</span>
                    <span>Rating: {averageRating.toFixed(1)} / 5</span>
                    <span>{vehicle.totalReviews} reviews</span>
                  </div>
                </div>
                <div className="space-y-4 rounded-3xl border border-slate-200 p-6">
                  <h2 className="text-xl font-semibold">Book this vehicle</h2>
                  <form className="space-y-4" onSubmit={handleBooking}>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <label className="block text-sm font-medium text-slate-700">
                        Start date
                        <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} required className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm" />
                      </label>
                      <label className="block text-sm font-medium text-slate-700">
                        End date
                        <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} required className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm" />
                      </label>
                    </div>
                    <button type="submit" className="w-full rounded-2xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white">Create booking</button>
                  </form>
                  {booking && (
                    <div className="rounded-3xl bg-slate-50 p-4 text-sm text-slate-700">
                      <p>Booking created: <span className="font-semibold">{booking._id}</span></p>
                      <p>Amount due: ₹{booking.totalAmount}</p>
                      <p>Status: {booking.paymentStatus}</p>
                      {booking.paymentStatus !== 'paid' && (
                        <button onClick={handlePayment} className="mt-4 w-full rounded-2xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white">Pay now</button>
                      )}
                    </div>
                  )}
                  {statusMessage && <p className="text-sm text-slate-700">{statusMessage}</p>}
                </div>
              </div>
            </section>

            {mapUrl && (
              <section className="rounded-3xl bg-white p-6 shadow-sm">
                <h2 className="text-xl font-semibold">Location map</h2>
                <div className="mt-6 overflow-hidden rounded-3xl border border-slate-200">
                  <iframe
                    title="Vehicle location"
                    src={mapUrl}
                    className="h-80 w-full"
                    loading="lazy"
                  />
                </div>
              </section>
            )}

            <section className="rounded-3xl bg-white p-6 shadow-sm">
              <h2 className="text-xl font-semibold">Reviews</h2>
              <div className="mt-6 space-y-4">
                {reviews.length === 0 ? (
                  <p className="text-sm text-slate-500">No reviews yet.</p>
                ) : (
                  reviews.map(review => (
                    <div key={review._id} className="rounded-3xl border border-slate-200 p-4">
                      <div className="flex items-center justify-between gap-4">
                        <p className="font-semibold">{review.user?.name || 'Guest'}</p>
                        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">{review.rating} / 5</span>
                      </div>
                      <p className="mt-3 text-sm text-slate-600">{review.comment}</p>
                    </div>
                  ))
                )}
              </div>
            </section>

            {user && user.role === 'user' && (
              <section className="rounded-3xl bg-white p-6 shadow-sm">
                <h2 className="text-xl font-semibold">Submit a review</h2>
                {eligibleBookings.length === 0 ? (
                  <p className="mt-4 text-sm text-slate-600">You need a paid booking for this vehicle before writing a review.</p>
                ) : (
                  <form className="mt-6 space-y-4" onSubmit={handleReviewSubmit}>
                    <label className="block text-sm font-medium text-slate-700">
                      Select booking
                      <select value={selectedBookingId} onChange={e => setSelectedBookingId(e.target.value)} className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm">
                        {eligibleBookings.map(current => (
                          <option key={current._id} value={current._id}>{new Date(current.startDate).toLocaleDateString()} - {new Date(current.endDate).toLocaleDateString()}</option>
                        ))}
                      </select>
                    </label>
                    <label className="block text-sm font-medium text-slate-700">
                      Rating
                      <select value={reviewRating} onChange={e => setReviewRating(Number(e.target.value))} className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm">
                        {[5, 4, 3, 2, 1].map(value => (
                          <option key={value} value={value}>{value} star{value > 1 ? 's' : ''}</option>
                        ))}
                      </select>
                    </label>
                    <label className="block text-sm font-medium text-slate-700">
                      Comment
                      <textarea value={reviewComment} onChange={e => setReviewComment(e.target.value)} required className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm" rows="4" />
                    </label>
                    <button className="rounded-2xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white">Submit review</button>
                  </form>
                )}
              </section>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
