import { useEffect, useState, FormEvent } from 'react';
import { Navigate } from 'react-router-dom';
import { cannedResponsesApi, CannedResponse } from '../api/cannedResponses';
import { useAuth } from '../context/AuthContext';

export function CannedResponsesPage() {
  const { user } = useAuth();
  const isStaff = user?.role === 'ADMIN' || user?.role === 'AGENT';

  const [items, setItems] = useState<CannedResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function load() {
    const { data } = await cannedResponsesApi.list();
    setItems(data);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  if (!isStaff) {
    return <Navigate to="/" replace />;
  }

  function resetForm() {
    setTitle('');
    setBody('');
    setEditingId(null);
    setShowForm(false);
  }

  function startEdit(item: CannedResponse) {
    setEditingId(item.id);
    setTitle(item.title);
    setBody(item.body);
    setShowForm(true);
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
      if (editingId) {
        await cannedResponsesApi.update(editingId, { title, body });
      } else {
        await cannedResponsesApi.create({ title, body });
      }
      resetForm();
      await load();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Gagal menyimpan template');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string, title: string) {
    if (!window.confirm(`Hapus template "${title}"?`)) return;
    await cannedResponsesApi.remove(id);
    await load();
  }

  return (
    <div className="max-w-2xl space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-slate-800 dark:text-slate-100">Template Balasan</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Template ini bisa dipakai semua agent/admin saat membalas ticket.
          </p>
        </div>
        <button
          onClick={() => (showForm ? resetForm() : setShowForm(true))}
          className="bg-blue-600 text-white text-sm px-4 py-2 rounded-md hover:bg-blue-700"
        >
          {showForm ? 'Batal' : '+ Tambah Template'}
        </button>
      </div>

      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-4 space-y-3"
        >
          <div>
            <label className="text-xs text-slate-500 dark:text-slate-400">Judul Template</label>
            <input
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Misal: Minta info tambahan"
              className="w-full mt-1 px-3 py-1.5 border border-slate-300 dark:border-slate-600 rounded-md text-sm bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100"
            />
          </div>
          <div>
            <label className="text-xs text-slate-500 dark:text-slate-400">Isi Balasan</label>
            <textarea
              required
              rows={4}
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Halo, bisa tolong kirimkan screenshot error-nya..."
              className="w-full mt-1 px-3 py-1.5 border border-slate-300 dark:border-slate-600 rounded-md text-sm bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100"
            />
          </div>

          {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}

          <button
            type="submit"
            disabled={saving}
            className="bg-blue-600 text-white text-sm px-4 py-1.5 rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {saving ? 'Menyimpan...' : editingId ? 'Simpan Perubahan' : 'Buat Template'}
          </button>
        </form>
      )}

      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg divide-y divide-slate-100 dark:divide-slate-700">
        {loading && <p className="px-4 py-6 text-sm text-slate-400 dark:text-slate-500">Memuat...</p>}
        {!loading && items.length === 0 && (
          <p className="px-4 py-6 text-sm text-slate-400 dark:text-slate-500">Belum ada template.</p>
        )}
        {items.map((item) => (
          <div key={item.id} className="px-4 py-3">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-slate-800 dark:text-slate-100">{item.title}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 whitespace-pre-wrap line-clamp-2">
                  {item.body}
                </p>
              </div>
              <div className="flex gap-3 shrink-0">
                <button
                  onClick={() => startEdit(item)}
                  className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(item.id, item.title)}
                  className="text-xs text-red-600 dark:text-red-400 hover:underline"
                >
                  Hapus
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
