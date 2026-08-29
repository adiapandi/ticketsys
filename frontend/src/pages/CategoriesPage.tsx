import { useEffect, useState, FormEvent } from 'react';
import { categoriesApi, Category } from '../api/categories';
import { useAuth } from '../context/AuthContext';
import { Navigate } from 'react-router-dom';

export function CategoriesPage() {
  const { user } = useAuth();
  const [categories, setCategories] = useState<Category[]>([]);
  const [newName, setNewName] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  async function load() {
    const { data } = await categoriesApi.list();
    setCategories(data);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  if (user?.role !== 'ADMIN') {
    return <Navigate to="/" replace />;
  }

  async function handleCreate(e: FormEvent) {
    e.preventDefault();
    if (!newName.trim()) return;
    setError('');
    try {
      await categoriesApi.create(newName.trim());
      setNewName('');
      await load();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Gagal membuat kategori');
    }
  }

  function startEdit(cat: Category) {
    setEditingId(cat.id);
    setEditingName(cat.name);
  }

  async function handleUpdate(id: string) {
    if (!editingName.trim()) return;
    setError('');
    try {
      await categoriesApi.update(id, editingName.trim());
      setEditingId(null);
      await load();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Gagal update kategori');
    }
  }

  async function handleDelete(id: string, name: string, ticketCount: number) {
    const confirmMsg =
      ticketCount > 0
        ? `Kategori "${name}" dipakai di ${ticketCount} ticket. Ticket-ticket itu akan jadi tanpa kategori. Lanjutkan hapus?`
        : `Hapus kategori "${name}"?`;
    if (!window.confirm(confirmMsg)) return;
    await categoriesApi.remove(id);
    await load();
  }

  return (
    <div className="max-w-lg space-y-4">
      <div>
        <h1 className="text-xl font-semibold text-slate-800 dark:text-slate-100">Kelola Kategori</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">Kategori dipakai untuk mengelompokkan ticket.</p>
      </div>

      <form onSubmit={handleCreate} className="flex gap-2">
        <input
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          placeholder="Nama kategori baru"
          className="flex-1 px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md text-sm bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100"
        />
        <button
          type="submit"
          className="bg-blue-600 text-white text-sm px-4 py-2 rounded-md hover:bg-blue-700"
        >
          Tambah
        </button>
      </form>

      {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}

      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg divide-y divide-slate-100 dark:divide-slate-700">
        {loading && <p className="px-4 py-6 text-sm text-slate-400 dark:text-slate-500">Memuat...</p>}
        {!loading && categories.length === 0 && (
          <p className="px-4 py-6 text-sm text-slate-400 dark:text-slate-500">Belum ada kategori.</p>
        )}
        {categories.map((cat) => (
          <div key={cat.id} className="flex items-center justify-between px-4 py-3">
            {editingId === cat.id ? (
              <div className="flex-1 flex gap-2">
                <input
                  value={editingName}
                  onChange={(e) => setEditingName(e.target.value)}
                  className="flex-1 px-2 py-1 border border-slate-300 dark:border-slate-600 rounded-md text-sm bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100"
                  autoFocus
                />
                <button
                  onClick={() => handleUpdate(cat.id)}
                  className="text-sm text-green-600 dark:text-green-400 hover:underline"
                >
                  Simpan
                </button>
                <button
                  onClick={() => setEditingId(null)}
                  className="text-sm text-slate-400 dark:text-slate-500 hover:underline"
                >
                  Batal
                </button>
              </div>
            ) : (
              <>
                <div>
                  <span className="text-sm text-slate-800 dark:text-slate-100">{cat.name}</span>
                  <span className="text-xs text-slate-400 dark:text-slate-500 ml-2">
                    {cat._count?.tickets ?? 0} ticket
                  </span>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => startEdit(cat)}
                    className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(cat.id, cat.name, cat._count?.tickets ?? 0)}
                    className="text-xs text-red-600 dark:text-red-400 hover:underline"
                  >
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
