import { useEffect, useState, FormEvent } from 'react';
import { Navigate } from 'react-router-dom';
import { usersManagementApi, AppUser } from '../api/users';
import { useAuth } from '../context/AuthContext';

const roleBadgeColor: Record<string, string> = {
  ADMIN: 'bg-red-100 text-red-700',
  AGENT: 'bg-blue-100 text-blue-700',
  CUSTOMER: 'bg-slate-100 text-slate-700',
};

export function UsersPage() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<AppUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [showForm, setShowForm] = useState(false);
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newRole, setNewRole] = useState('CUSTOMER');
  const [creating, setCreating] = useState(false);

  async function load() {
    const { data } = await usersManagementApi.list();
    setUsers(data);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  if (currentUser?.role !== 'ADMIN') {
    return <Navigate to="/" replace />;
  }

  async function handleCreate(e: FormEvent) {
    e.preventDefault();
    setError('');
    setCreating(true);
    try {
      await usersManagementApi.create({
        name: newName,
        email: newEmail,
        password: newPassword,
        role: newRole,
      });
      setNewName('');
      setNewEmail('');
      setNewPassword('');
      setNewRole('CUSTOMER');
      setShowForm(false);
      await load();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Gagal membuat user');
    } finally {
      setCreating(false);
    }
  }

  async function handleRoleChange(id: string, role: string) {
    setError('');
    try {
      await usersManagementApi.updateRole(id, role as any);
      await load();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Gagal mengubah role');
    }
  }

  async function handleDelete(id: string, name: string) {
    if (!window.confirm(`Hapus user "${name}"? Ticket yang di-assign ke dia akan dilepas.`)) return;
    setError('');
    try {
      await usersManagementApi.remove(id);
      await load();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Gagal menghapus user');
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">Kelola User</h1>
          <p className="text-sm text-slate-500">Atur role dan akses tiap user.</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-blue-600 text-white text-sm px-4 py-2 rounded-md hover:bg-blue-700"
        >
          {showForm ? 'Batal' : '+ Tambah User'}
        </button>
      </div>

      {showForm && (
        <form
          onSubmit={handleCreate}
          className="bg-white border border-slate-200 rounded-lg p-4 space-y-3"
        >
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-slate-500">Nama</label>
              <input
                required
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className="w-full mt-1 px-3 py-1.5 border border-slate-300 rounded-md text-sm"
              />
            </div>
            <div>
              <label className="text-xs text-slate-500">Email</label>
              <input
                type="email"
                required
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                className="w-full mt-1 px-3 py-1.5 border border-slate-300 rounded-md text-sm"
              />
            </div>
            <div>
              <label className="text-xs text-slate-500">Password (min. 6 karakter)</label>
              <input
                type="password"
                required
                minLength={6}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full mt-1 px-3 py-1.5 border border-slate-300 rounded-md text-sm"
              />
            </div>
            <div>
              <label className="text-xs text-slate-500">Role</label>
              <select
                value={newRole}
                onChange={(e) => setNewRole(e.target.value)}
                className="w-full mt-1 px-3 py-1.5 border border-slate-300 rounded-md text-sm"
              >
                <option value="CUSTOMER">CUSTOMER</option>
                <option value="AGENT">AGENT</option>
                <option value="ADMIN">ADMIN</option>
              </select>
            </div>
          </div>
          <button
            type="submit"
            disabled={creating}
            className="bg-blue-600 text-white text-sm px-4 py-1.5 rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {creating ? 'Membuat...' : 'Buat User'}
          </button>
        </form>
      )}

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-left text-xs text-slate-500 uppercase">
            <tr>
              <th className="px-4 py-2.5">Nama</th>
              <th className="px-4 py-2.5">Email</th>
              <th className="px-4 py-2.5">Role</th>
              <th className="px-4 py-2.5">Ticket Dibuat</th>
              <th className="px-4 py-2.5">Ticket Ditangani</th>
              <th className="px-4 py-2.5"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading && (
              <tr>
                <td colSpan={6} className="px-4 py-6 text-center text-slate-400">
                  Memuat...
                </td>
              </tr>
            )}
            {!loading && users.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-6 text-center text-slate-400">
                  Tidak ada user.
                </td>
              </tr>
            )}
            {users.map((u) => (
              <tr key={u.id}>
                <td className="px-4 py-2.5 font-medium text-slate-800">
                  {u.name}
                  {u.id === currentUser?.id && (
                    <span className="ml-1.5 text-xs text-slate-400">(kamu)</span>
                  )}
                </td>
                <td className="px-4 py-2.5 text-slate-500">{u.email}</td>
                <td className="px-4 py-2.5">
                  {u.id === currentUser?.id ? (
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full font-medium ${roleBadgeColor[u.role]}`}
                    >
                      {u.role}
                    </span>
                  ) : (
                    <select
                      value={u.role}
                      onChange={(e) => handleRoleChange(u.id, e.target.value)}
                      className="text-xs border border-slate-300 rounded-md px-2 py-1"
                    >
                      <option value="CUSTOMER">CUSTOMER</option>
                      <option value="AGENT">AGENT</option>
                      <option value="ADMIN">ADMIN</option>
                    </select>
                  )}
                </td>
                <td className="px-4 py-2.5 text-slate-500">{u._count?.ticketsCreated ?? 0}</td>
                <td className="px-4 py-2.5 text-slate-500">{u._count?.ticketsAssigned ?? 0}</td>
                <td className="px-4 py-2.5 text-right">
                  {u.id !== currentUser?.id && (
                    <button
                      onClick={() => handleDelete(u.id, u.name)}
                      className="text-xs text-red-600 hover:underline"
                    >
                      Hapus
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
