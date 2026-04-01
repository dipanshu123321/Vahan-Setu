import { useContext, useEffect, useState } from 'react';
import Navbar from '../../components/Navbar';
import api from '../../lib/api';
import { AuthContext } from '../../context/AuthContext';
import Link from 'next/link';

export default function OwnerDashboard() {
  const { user } = useContext(AuthContext);
  const [vehicles, setVehicles] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadData = async () => {
      if (!user) {
        setLoading(false);
        return;
      }
      try {
        const [vehiclesRes, bookingsRes] = await Promise.all([
          api.get('/vehicles/owner/list'),
          api.get('/bookings/owner'),
        ]);
        setVehicles(vehiclesRes.data);
        setBookings(bookingsRes.data);
      } catch (err) {
        setError('Unable to load owner dashboard');
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [user]);

  return (
    <div>
      <Navbar />
      <main className="mx-auto max-w-6xl px-4 py-10">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-semibold">Owner dashboard</h1>
            <p className="mt-2 text-sm text-slate-600">Manage your vehicle listings and booking requests.</p>
          </div>
          <Link href="/owner/add-vehicle" className="rounded-full bg-slate-900 px-5 py-3 text-sm font-semibold text-white">Add new listing</Link>
        </div>

        {!user ? (
          <div className="rounded-3xl bg-white p-8 text-center shadow-sm">You need to log in as an owner to view this page.</div>
        ) : loading ? (
          <div className="text-center text-slate-600">Loading dashboard...</div>
        ) : error ? (
          <div className="text-center text-red-500">{error}</div>
        ) : (
          <div className="space-y-8">
            <section className="rounded-3xl bg-white p-6 shadow-sm">
              <h2 className="text-xl font-semibold">Your vehicle listings</h2>
              {vehicles.length === 0 ? (
                <p className="mt-4 text-slate-600">No listings yet. Add a vehicle to start earning.</p>
              ) : (
                <div className="mt-6 grid gap-4">
                  {vehicles.map(vehicle => (
                    <div key={vehicle._id} className="rounded-3xl border border-slate-200 p-4">
                      <div className="flex flex-col gap-2 sm:flex-row sm:justify-between sm:items-center">
                        <div>
                          <h3 className="text-lg font-semibold">{vehicle.title}</h3>
                          <p className="text-sm text-slate-500">{vehicle.type} · {vehicle.city}</p>
                        </div>
                        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">{vehicle.approved ? 'Approved' : 'Pending approval'}</span>
                      </div>
                      <p className="mt-3 text-sm text-slate-600">₹{vehicle.pricePerDay}/day · Seats: {vehicle.seats}</p>
                    </div>
                  ))}
                </div>
              )}
            </section>

            <section className="rounded-3xl bg-white p-6 shadow-sm">
              <h2 className="text-xl font-semibold">Booking requests</h2>
              {bookings.length === 0 ? (
                <p className="mt-4 text-slate-600">No booking requests yet.</p>
              ) : (
                <div className="mt-6 space-y-4">
                  {bookings.map(booking => (
                    <div key={booking._id} className="rounded-3xl border border-slate-200 p-4">
                      <div className="flex flex-col gap-3 sm:flex-row sm:justify-between sm:items-center">
                        <div>
                          <h3 className="text-base font-semibold">{booking.vehicle.title}</h3>
                          <p className="text-sm text-slate-500">Customer: {booking.user.name}</p>
                        </div>
                        <span className="text-sm text-slate-700">{booking.paymentStatus} / {booking.status}</span>
                      </div>
                      <div className="mt-3 grid gap-3 sm:grid-cols-3 text-sm text-slate-600">
                        <div>Dates: {new Date(booking.startDate).toLocaleDateString()} - {new Date(booking.endDate).toLocaleDateString()}</div>
                        <div>Days: {booking.days}</div>
                        <div>Total: ₹{booking.totalAmount}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>
        )}
      </main>
    </div>
  );
}
