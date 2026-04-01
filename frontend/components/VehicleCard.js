import Link from 'next/link';

export default function VehicleCard({ vehicle }) {
  return (
    <div className="overflow-hidden rounded-2xl border bg-white shadow-sm">
      <div className="h-52 bg-slate-100">
        {vehicle.images?.[0] ? (
          <img src={vehicle.images[0]} alt={vehicle.title} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-slate-500">No image</div>
        )}
      </div>
      <div className="p-4">
        <h3 className="text-lg font-semibold text-slate-900">{vehicle.title}</h3>
        <p className="mt-1 text-sm text-slate-600">{vehicle.type} · {vehicle.city}</p>
        <p className="mt-3 text-sm text-slate-700 line-clamp-2">{vehicle.description}</p>
        <div className="mt-4 flex items-center justify-between">
          <span className="font-semibold text-slate-900">₹{vehicle.pricePerDay}/day</span>
          <Link href={`/vehicles/${vehicle._id}`} className="rounded-md bg-slate-900 px-3 py-2 text-xs font-medium text-white">
            View
          </Link>
        </div>
      </div>
    </div>
  );
}
