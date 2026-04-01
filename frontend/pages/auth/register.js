import { useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Navbar from '../../components/Navbar';
import api from '../../lib/api';
import { AuthContext } from '../../context/AuthContext';

export default function Register() {
  const router = useRouter();
  const { user, login } = useContext(AuthContext);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('user');
  const [city, setCity] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (user) {
      router.replace('/');
    }
  }, [user, router]);

  const handleSubmit = async event => {
    event.preventDefault();
    setError('');

    try {
      const response = await api.post('/auth/register', { name, email, password, role, city });
      login(response.data);
      router.push('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    }
  };

  return (
    <div>
      <Navbar />
      <main className="mx-auto max-w-xl px-4 py-12">
        <div className="rounded-3xl bg-white p-8 shadow-sm">
          <h1 className="text-2xl font-semibold">Create your account</h1>
          <p className="mt-2 text-sm text-slate-600">Sign up as a customer or vehicle owner.</p>
          <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
            <label className="block text-sm font-medium text-slate-700">
              Full name
              <input
                value={name}
                onChange={e => setName(e.target.value)}
                required
                className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm"
              />
            </label>
            <label className="block text-sm font-medium text-slate-700">
              Email
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm"
              />
            </label>
            <label className="block text-sm font-medium text-slate-700">
              Password
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm"
              />
            </label>
            <label className="block text-sm font-medium text-slate-700">
              Account type
              <select
                value={role}
                onChange={e => setRole(e.target.value)}
                className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm"
              >
                <option value="user">Customer</option>
                <option value="owner">Vehicle Owner</option>
              </select>
            </label>
            <label className="block text-sm font-medium text-slate-700">
              City
              <input
                value={city}
                onChange={e => setCity(e.target.value)}
                className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm"
              />
            </label>
            {error && <p className="text-sm text-red-500">{error}</p>}
            <button className="w-full rounded-2xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white">Register</button>
          </form>
          <p className="mt-6 text-sm text-slate-600">
            Already have an account? <a href="/auth/login" className="font-semibold text-slate-900">Login here</a>
          </p>
        </div>
      </main>
    </div>
  );
}
