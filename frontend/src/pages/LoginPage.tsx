import { useState, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ThemeToggle } from '../components/ThemeToggle';
import { Logo } from '../components/Logo';
import { LiveClock } from '../components/LiveClock';
import { VersionWatermark } from '../components/VersionWatermark';
import { LoginIllustration } from '../components/LoginIllustration';

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
    <div className="min-h-screen flex bg-white dark:bg-slate-900 transition-colors">
      {/* Kolom kiri: form */}
      <div className="w-full lg:w-1/2 flex flex-col justify-between p-8">
        <div className="flex items-center justify-between">
          <Logo size={32} />
          <div className="flex items-center gap-3">
            <LiveClock />
            <ThemeToggle />
          </div>
        </div>

        <div className="flex-1 flex items-center justify-center">
          <div className="w-full max-w-sm">
            <h1 className="text-2xl font-semibold mb-1 text-slate-800 dark:text-slate-100">Masuk</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-8">
              Masuk ke akun kamu untuk mengelola tiket IT support.
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-sm text-slate-600 dark:text-slate-300">Email</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full mt-1 px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md text-sm bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                  className="w-full mt-1 px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md text-sm bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
        </div>

        <div className="flex justify-center">
          <VersionWatermark />
        </div>
      </div>

      {/* Kolom kanan: ilustrasi (disembunyikan di layar kecil) */}
      <div className="hidden lg:flex w-1/2 items-center justify-center bg-slate-50 dark:bg-slate-800/50 p-12">
        <LoginIllustration />
      </div>
    </div>
  );
}
