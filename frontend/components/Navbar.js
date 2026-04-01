import Link from 'next/link';
import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useContext(AuthContext);
  return (
    <header className="border-b bg-white shadow-sm">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
        <Link href="/" className="text-xl font-semibold text-slate-900">
          Rental Hub
        </Link>
        <nav className="flex items-center gap-4 text-sm text-slate-700">
          <Link href="/">Home</Link>
          <Link href="/bookings">My Bookings</Link>
          {user?.role === 'owner' && <Link href="/owner/dashboard">Owner</Link>}
          {user?.role === 'admin' && <Link href="/admin/dashboard">Admin</Link>}
          {user ? (
            <button onClick={logout} className="rounded-md bg-slate-900 px-3 py-2 text-white">
              Logout
            </button>
          ) : (
            <>
              <Link href="/auth/login">Login</Link>
              <Link href="/auth/register">Register</Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
