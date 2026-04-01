import { useContext, useState } from 'react';
import Navbar from '../../components/Navbar';
import api from '../../lib/api';
import { AuthContext } from '../../context/AuthContext';

export default function AddVehiclePage() {
  const { user } = useContext(AuthContext);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState('car');
  const [city, setCity] = useState('');
  const [pricePerDay, setPricePerDay] = useState('');
  const [seats, setSeats] = useState(4);
  const [images, setImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [statusMessage, setStatusMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleFiles = event => {
    const files = Array.from(event.target.files);
    setImages(files);
    setImagePreviews(files.map(file => URL.createObjectURL(file)));
  };

  const convertFilesToDataUrls = files => {
    return Promise.all(
      files.map(file =>
        new Promise(resolve => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result);
          reader.readAsDataURL(file);
        }),
      ),
    );
  };

  const handleSubmit = async event => {
    event.preventDefault();
    setStatusMessage('');
    if (!user) {
      setStatusMessage('You must be logged in as an owner to add a vehicle.');
      return;
    }
    setLoading(true);

    try {
      const imageData = await convertFilesToDataUrls(images);
      await api.post('/vehicles', {
        title,
        description,
        type,
        city,
        pricePerDay: Number(pricePerDay),
        seats: Number(seats),
        images: imageData,
      });
      setStatusMessage('Vehicle submitted successfully. Waiting for admin approval.');
      setTitle('');
      setDescription('');
      setCity('');
      setPricePerDay('');
      setSeats(4);
      setImages([]);
      setImagePreviews([]);
    } catch (err) {
      setStatusMessage(err.response?.data?.message || 'Could not list vehicle');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Navbar />
      <main className="mx-auto max-w-4xl px-4 py-10">
        <div className="rounded-3xl bg-white p-8 shadow-sm">
          <h1 className="text-3xl font-semibold">Add a new vehicle</h1>
          <p className="mt-2 text-sm text-slate-600">List your bus, car or bike and start accepting bookings.</p>

          {!user ? (
            <div className="mt-8 rounded-3xl bg-slate-50 p-6 text-slate-700">Login as an owner to create a listing.</div>
          ) : (
            <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block text-sm font-medium text-slate-700">
                  Title
                  <input value={title} onChange={e => setTitle(e.target.value)} required className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm" />
                </label>
                <label className="block text-sm font-medium text-slate-700">
                  Type
                  <select value={type} onChange={e => setType(e.target.value)} className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm">
                    <option value="bike">Bike</option>
                    <option value="car">Car</option>
                    <option value="bus">Bus</option>
                  </select>
                </label>
              </div>

              <label className="block text-sm font-medium text-slate-700">
                Description
                <textarea value={description} onChange={e => setDescription(e.target.value)} required className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm" rows="4" />
              </label>

              <div className="grid gap-4 sm:grid-cols-3">
                <label className="block text-sm font-medium text-slate-700">
                  City
                  <input value={city} onChange={e => setCity(e.target.value)} required className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm" />
                </label>
                <label className="block text-sm font-medium text-slate-700">
                  Price / day
                  <input type="number" min="0" value={pricePerDay} onChange={e => setPricePerDay(e.target.value)} required className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm" />
                </label>
                <label className="block text-sm font-medium text-slate-700">
                  Seats
                  <input type="number" min="1" value={seats} onChange={e => setSeats(e.target.value)} className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm" />
                </label>
              </div>

              <label className="block text-sm font-medium text-slate-700">
                Vehicle images
                <input type="file" accept="image/*" multiple onChange={handleFiles} className="mt-2 w-full text-sm text-slate-700" />
              </label>
              {imagePreviews.length > 0 && (
                <div className="grid gap-3 sm:grid-cols-3">
                  {imagePreviews.map((src, index) => (
                    <div key={index} className="overflow-hidden rounded-2xl border bg-slate-50">
                      <img src={src} alt={`Preview ${index + 1}`} className="h-32 w-full object-cover" />
                    </div>
                  ))}
                </div>
              )}

              {statusMessage && <p className="text-sm text-slate-700">{statusMessage}</p>}
              <button type="submit" disabled={loading} className="rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white">
                {loading ? 'Submitting...' : 'List vehicle'}
              </button>
            </form>
          )}
        </div>
      </main>
    </div>
  );
}
