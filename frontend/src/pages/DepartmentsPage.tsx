import { useEffect, useState, FormEvent } from 'react';
import { Navigate } from 'react-router-dom';
import { departmentsApi, Department } from '../api/departments';
import { useAuth } from '../context/AuthContext';

export function DepartmentsPage() {
  const { user } = useAuth();
  const [items, setItems] = useState<Department[]>([]);
  const [newName, setNewName] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  async function load() {
    const { data } = await departmentsApi.list();
    setItems(data);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  if (user?.role !== 'SUPER_ADMIN') {
    return <Navigate to="/" replace />;
  }

  async function handleCreate(e: FormEvent) {
    e.preventDefault();
    if (!newName.trim()) return;
    setError('');
    try {
      await departmentsApi.create(newName.trim());
      setNewName('');
      await load();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Gagal membuat department');
    }
  }

  function startEdit(dept: Department) {
    setEditingId(dept.id);
    setEditingName(dept.name);
  }

  async function handleUpdate(id: string) {
    if (!editingName.trim()) return;
    setError('');
    try {
      await departmentsApi.update(id, editingName.trim());
      setEditingId(null);
      await load();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Gagal update department');
    }
  }

  async function handleDelete(id: string, name: string) {
    if (!window.confirm(`Hapus department "${name}"?`)) return;
    try {
      await departmentsApi.remove(id);
      await load();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Gagal menghapus department');
    }
  }

  return (
    <div className="max-w-lg space-y-4">
      <div>
        <h1 className="text-xl font-semibold text-slate-800 dark:text-slate-100">Kelola Department</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Department menentukan pembagian tim & kategori ticket (misal: IT Support, IT Dev, HRGA).
        </p>
      </div>

      <form onSubmit={handleCreate} className="flex gap-2">
        <input
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          placeholder="Nama department baru"
          className="flex-1 px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md text-sm bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100"
        />
        <button type="submit" className="bg-blue-600 text-white text-sm px-4 py-2 rounded-md hover:bg-blue-700">
          Tambah
        </button>
      </form>

      {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}

      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg divide-y divide-slate-100 dark:divide-slate-700">
        {loading && <p className="px-4 py-6 text-sm text-slate-400 dark:text-slate-500">Memuat...</p>}
        {!loading && items.length === 0 && (
          <p className="px-4 py-6 text-sm text-slate-400 dark:text-slate-500">Belum ada department.</p>
        )}
        {items.map((dept) => (
          <div key={dept.id} className="flex items-center justify-between px-4 py-3">
            {editingId === dept.id ? (
              <div className="flex-1 flex gap-2">
                <input
                  value={editingName}
                  onChange={(e) => setEditingName(e.target.value)}
                  className="flex-1 px-2 py-1 border border-slate-300 dark:border-slate-600 rounded-md text-sm bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100"
                  autoFocus
                />
                <button onClick={() => handleUpdate(dept.id)} className="text-sm text-green-600 dark:text-green-400 hover:underline">
                  Simpan
                </button>
                <button onClick={() => setEditingId(null)} className="text-sm text-slate-400 dark:text-slate-500 hover:underline">
                  Batal
                </button>
              </div>
            ) : (
              <>
                <div>
                  <span className="text-sm text-slate-800 dark:text-slate-100">{dept.name}</span>
                  <span className="text-xs text-slate-400 dark:text-slate-500 ml-2">
                    {dept._count?.users ?? 0} staff · {dept._count?.tickets ?? 0} ticket · {dept._count?.categories ?? 0} kategori
                  </span>
                </div>
                <div className="flex gap-3">
                  <button onClick={() => startEdit(dept)} className="text-xs text-blue-600 dark:text-blue-400 hover:underline">
                    Edit
                  </button>
                  <button onClick={() => handleDelete(dept.id, dept.name)} className="text-xs text-red-600 dark:text-red-400 hover:underline">
                    Hapus
                  </button>
                </div>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
