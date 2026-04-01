import { useEffect, useState } from 'react';
import Link from 'next/link';
import Navbar from '../../components/Navbar';
import VehicleCard from '../../components/VehicleCard';
import api from '../../lib/api';

export default function VehiclesPage() {
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
      setError('Could not load vehicles');
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
      <main className="mx-auto max-w-6xl px-4 py-10">
        <header className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-semibold">Browse vehicles</h1>
            <p className="mt-2 text-sm text-slate-600">Search by city or vehicle type.</p>
          </div>
          <Link href="/owner/add-vehicle" className="rounded-full bg-slate-900 px-5 py-3 text-sm font-semibold text-white">List a vehicle</Link>
              placeholder="City"
              value={city}
              onChange={e => setCity(e.target.value)}
              className="rounded-2xl border border-slate-200 px-4 py-3 text-sm"
            />
            <select
              value={type}
              onChange={e => setType(e.target.value)}
              className="rounded-2xl border border-slate-200 px-4 py-3 text-sm"
            >
              <option value="">All vehicle types</option>
              <option value="bike">Bike</option>
              <option value="car">Car</option>
              <option value="bus">Bus</option>
            </select>
            <button className="rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white">Search</button>
          </form>
        </section>

        <section className="mt-8">
          {loading ? (
            <div className="text-center text-slate-600">Loading vehicles...</div>
          ) : error ? (
            <div className="text-center text-red-500">{error}</div>
          ) : vehicles.length === 0 ? (
            <div className="text-center text-slate-600">No vehicles match your search.</div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
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
