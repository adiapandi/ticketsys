import { useState, FormEvent } from 'react';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';

export function ProfilePage() {
  const { user } = useAuth();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (newPassword !== confirmPassword) {
      setError('Konfirmasi password baru tidak cocok');
      return;
    }

    setSubmitting(true);
    try {
      await api.post('/auth/change-password', { currentPassword, newPassword });
      setSuccess('Password berhasil diubah');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Gagal mengubah password');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="max-w-md space-y-6">
      <div>
        <h1 className="text-xl font-semibold">Profil Saya</h1>
        <p className="text-sm text-slate-500">Kelola informasi akun kamu.</p>
      </div>

      <div className="bg-white border border-slate-200 rounded-lg p-5 space-y-1">
        <p className="text-sm text-slate-500">Nama</p>
        <p className="text-sm font-medium text-slate-800">{user?.name}</p>
        <p className="text-sm text-slate-500 mt-3">Email</p>
        <p className="text-sm font-medium text-slate-800">{user?.email}</p>
        <p className="text-sm text-slate-500 mt-3">Role</p>
        <p className="text-sm font-medium text-slate-800">{user?.role}</p>
      </div>

      <div className="bg-white border border-slate-200 rounded-lg p-5">
        <h2 className="text-sm font-semibold text-slate-700 mb-3">Ganti Password</h2>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="text-sm text-slate-600">Password Saat Ini</label>
            <input
              type="password"
              required
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="w-full mt-1 px-3 py-2 border border-slate-300 rounded-md text-sm"
            />
          </div>
          <div>
            <label className="text-sm text-slate-600">Password Baru (min. 6 karakter)</label>
            <input
              type="password"
              required
              minLength={6}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full mt-1 px-3 py-2 border border-slate-300 rounded-md text-sm"
            />
          </div>
          <div>
            <label className="text-sm text-slate-600">Konfirmasi Password Baru</label>
            <input
              type="password"
              required
              minLength={6}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full mt-1 px-3 py-2 border border-slate-300 rounded-md text-sm"
            />
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}
          {success && <p className="text-sm text-green-600">{success}</p>}

          <button
            type="submit"
            disabled={submitting}
            className="bg-blue-600 text-white text-sm px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {submitting ? 'Menyimpan...' : 'Ganti Password'}
          </button>
        </form>
      </div>
    </div>
  );
}
