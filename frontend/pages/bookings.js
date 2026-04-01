import { useContext, useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import api from '../lib/api';
import { AuthContext } from '../context/AuthContext';

export default function BookingsPage() {
  const { user } = useContext(AuthContext);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchBookings = async () => {
      if (!user) {
        setLoading(false);
        return;
      }
      try {
        const response = await api.get('/bookings/me');
        setBookings(response.data);
      } catch (err) {
        setError('Failed to load bookings');
      } finally {
        setLoading(false);
      }
    };
    fetchBookings();
  }, [user]);

  return (
    <div>
      <Navbar />
      <main className="mx-auto max-w-6xl px-4 py-10">
        <div className="mb-8">
          <h1 className="text-3xl font-semibold">My Bookings</h1>
          <p className="mt-2 text-sm text-slate-600">Review your booking history and payment status.</p>
        </div>

        {!user ? (
          <div className="rounded-3xl bg-white p-8 text-center shadow-sm">
            <p className="text-slate-700">Please log in to see your bookings.</p>
          </div>
        ) : loading ? (
          <div className="text-center text-slate-600">Loading your bookings...</div>
        ) : error ? (
          <div className="text-center text-red-500">{error}</div>
        ) : bookings.length === 0 ? (
          <div className="rounded-3xl bg-white p-8 text-center shadow-sm">No bookings found yet.</div>
        ) : (
          <div className="space-y-6">
            {bookings.map(booking => (
              <div key={booking._id} className="rounded-3xl bg-white p-6 shadow-sm">
                <div className="flex flex-col gap-3 sm:flex-row sm:justify-between sm:items-center">
                  <div>
                    <h2 className="text-lg font-semibold">{booking.vehicle.title}</h2>
                    <p className="text-sm text-slate-500">{booking.vehicle.type} · {booking.vehicle.city}</p>
                  </div>
                  <div className="text-sm text-slate-600">Status: <span className="font-semibold text-slate-900">{booking.status}</span></div>
                </div>
                <div className="mt-4 grid gap-3 sm:grid-cols-3">
                  <div>
                    <p className="text-sm text-slate-500">Rental dates</p>
                    <p className="font-medium">{new Date(booking.startDate).toLocaleDateString()} - {new Date(booking.endDate).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-500">Days</p>
                    <p className="font-medium">{booking.days}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-500">Payment</p>
                    <p className="font-medium">{booking.paymentStatus}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
