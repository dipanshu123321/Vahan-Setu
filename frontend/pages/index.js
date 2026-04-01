import { useEffect, useState } from 'react';
import Link from 'next/link';
import Navbar from '../components/Navbar';
import VehicleCard from '../components/VehicleCard';
import api from '../lib/api';

export default function Home() {
  const [city, setCity] = useState('');
  const [type, setType] = useState('');
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchVehicles = async () => {
    setLoading(true);
    setError('');
    try {
      const params = {};
      if (city) params.city = city;
      if (type) params.type = type;
      const response = await api.get('/vehicles', { params });
      setVehicles(response.data);
    } catch (err) {
      setError('Failed to load vehicles.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVehicles();
  }, []);

  return (
    <div>
      <Navbar />
      <main className="mx-auto max-w-6xl px-4 py-8">
        <section className="rounded-3xl bg-slate-900 px-8 py-14 text-white shadow-xl">
          <div className="max-w-3xl">
            <h1 className="text-4xl font-semibold">Vehicle rentals for every trip.</h1>
            <p className="mt-4 text-slate-300">
              Find bikes, cars and buses from local owners with flexible daily pricing and easy booking.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/owner/add-vehicle" className="rounded-full bg-white px-5 py-3 text-sm font-semibold text-slate-900">List your vehicle</Link>
              <Link href="/vehicles" className="rounded-full border border-white px-5 py-3 text-sm text-white transition hover:bg-white hover:text-slate-900">Browse vehicles</Link>
            </div>
          </div>
        </section>

        <section className="mt-10 rounded-3xl bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold">Search vehicles</h2>
          <form className="mt-4 grid gap-4 sm:grid-cols-3" onSubmit={e => { e.preventDefault(); fetchVehicles(); }}>
            <input
              name="city"
              value={city}
              onChange={e => setCity(e.target.value)}
              placeholder="Search by city"
              className="rounded-2xl border border-slate-200 px-4 py-3 text-sm"
            />
            <select
              value={type}
              onChange={e => setType(e.target.value)}
              className="rounded-2xl border border-slate-200 px-4 py-3 text-sm"
            >
              <option value="">All types</option>
              <option value="bike">Bike</option>
              <option value="car">Car</option>
              <option value="bus">Bus</option>
            </select>
            <button className="rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white">Search</button>
          </form>
        </section>

        <section className="mt-10">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Available vehicles</h2>
            <Link href="/vehicles" className="text-sm text-slate-600 underline">View all</Link>
          </div>

          {loading ? (
            <div className="mt-8 text-center text-slate-600">Loading vehicles...</div>
          ) : error ? (
            <div className="mt-8 text-center text-red-500">{error}</div>
          ) : vehicles.length === 0 ? (
            <div className="mt-8 text-center text-slate-600">No vehicles found.</div>
          ) : (
            <div className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {vehicles.map(vehicle => (
                <VehicleCard key={vehicle._id} vehicle={vehicle} />
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
