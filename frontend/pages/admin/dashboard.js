import { useContext, useEffect, useState } from 'react';
import Navbar from '../../components/Navbar';
import api from '../../lib/api';
import { AuthContext } from '../../context/AuthContext';

export default function AdminDashboard() {
  const { user } = useContext(AuthContext);
  const [users, setUsers] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadAdminData = async () => {
    if (!user) {
      setLoading(false);
      return;
    }
    try {
      const [usersRes, vehiclesRes, bookingsRes] = await Promise.all([
        api.get('/admin/users'),
        api.get('/admin/vehicles'),
        api.get('/admin/bookings'),
      ]);
      setUsers(usersRes.data);
      setVehicles(vehiclesRes.data);
      setBookings(bookingsRes.data);
    } catch (err) {
      setError('Unable to load admin data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAdminData();
  }, [user]);

  const refresh = () => loadAdminData();

  const handleApprove = async id => {
    await api.put(`/admin/vehicles/${id}/approve`);
    refresh();
  };

  const handleDelete = async id => {
    await api.delete(`/admin/vehicles/${id}`);
    refresh();
  };

  return (
    <div>
      <Navbar />
      <main className="mx-auto max-w-6xl px-4 py-10">
        <div className="mb-8">
          <h1 className="text-3xl font-semibold">Admin Panel</h1>
          <p className="mt-2 text-sm text-slate-600">Manage users, vehicles and bookings from a single dashboard.</p>
        </div>

        {!user ? (
          <div className="rounded-3xl bg-white p-8 text-center shadow-sm">Sign in as an admin to view this page.</div>
        ) : loading ? (
          <div className="text-center text-slate-600">Loading admin panel...</div>
        ) : error ? (
          <div className="text-center text-red-500">{error}</div>
        ) : (
          <div className="space-y-8">
            <section className="grid gap-4 sm:grid-cols-3">
              <div className="rounded-3xl bg-white p-6 shadow-sm">
                <p className="text-sm text-slate-500">Users</p>
                <p className="mt-3 text-3xl font-semibold text-slate-900">{users.length}</p>
              </div>
              <div className="rounded-3xl bg-white p-6 shadow-sm">
                <p className="text-sm text-slate-500">Vehicles</p>
                <p className="mt-3 text-3xl font-semibold text-slate-900">{vehicles.length}</p>
              </div>
              <div className="rounded-3xl bg-white p-6 shadow-sm">
                <p className="text-sm text-slate-500">Bookings</p>
                <p className="mt-3 text-3xl font-semibold text-slate-900">{bookings.length}</p>
              </div>
            </section>

            <section className="rounded-3xl bg-white p-6 shadow-sm">
              <h2 className="text-xl font-semibold">Vehicle listings</h2>
              <div className="mt-6 space-y-4">
                {vehicles.map(vehicle => (
                  <div key={vehicle._id} className="rounded-3xl border border-slate-200 p-4">
                    <div className="flex flex-col gap-3 sm:flex-row sm:justify-between sm:items-center">
                      <div>
                        <h3 className="text-lg font-semibold">{vehicle.title}</h3>
                        <p className="text-sm text-slate-500">{vehicle.type} · {vehicle.city} · Owner: {vehicle.owner?.name}</p>
                      </div>
                      <div className="flex gap-2">
                        {!vehicle.approved && (
                          <button onClick={() => handleApprove(vehicle._id)} className="rounded-2xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white">Approve</button>
                        )}
                        <button onClick={() => handleDelete(vehicle._id)} className="rounded-2xl bg-red-600 px-4 py-2 text-sm font-semibold text-white">Delete</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section className="rounded-3xl bg-white p-6 shadow-sm">
              <h2 className="text-xl font-semibold">Recent bookings</h2>
              <div className="mt-6 space-y-4">
                {bookings.map(booking => (
                  <div key={booking._id} className="rounded-3xl border border-slate-200 p-4">
                    <div className="flex flex-col gap-2 sm:flex-row sm:justify-between sm:items-center">
                      <div>
                        <p className="text-sm text-slate-500">Vehicle: {booking.vehicle.title}</p>
                        <p className="text-sm text-slate-500">Customer: {booking.user.name}</p>
                      </div>
                      <span className="text-sm font-semibold text-slate-700">{booking.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>
        )}
      </main>
    </div>
  );
}
