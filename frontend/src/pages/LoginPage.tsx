import { useState, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ThemeToggle } from '../components/ThemeToggle';
import { Logo } from '../components/Logo';
import { LiveClock } from '../components/LiveClock';
import { VersionWatermark } from '../components/VersionWatermark';
import { LoginBackground } from '../components/LoginBackground';

export function LoginPage() {
  const { login, isLoading } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    try {
      await login(email, password);
      navigate('/');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Login gagal');
    }
  }

  return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900 relative transition-colors overflow-hidden">
        <LoginBackground />
        <div className="absolute top-4 right-4 flex items-center gap-3">
        <LiveClock />
        <ThemeToggle />
      </div>
      <div className="bg-white dark:bg-slate-800 p-8 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 w-full max-w-sm">
        <div className="flex justify-center mb-2">
          <Logo size={40} />
        </div>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-6 text-center">IT Ticketing System</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm text-slate-600 dark:text-slate-300">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full mt-1 px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md text-sm bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="[email protected]"
            />
          </div>
          <div>
            <label className="text-sm text-slate-600 dark:text-slate-300">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full mt-1 px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md text-sm bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="••••••••"
            />
          </div>

          {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-blue-600 text-white py-2 rounded-md text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
          >
            {isLoading ? 'Memproses...' : 'Masuk'}
          </button>
        </form>
      </div>
      <div className="absolute bottom-4">
        <VersionWatermark />
      </div>
    </div>
  );
}
