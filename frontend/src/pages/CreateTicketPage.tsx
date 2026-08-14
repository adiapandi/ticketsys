import { useState, useEffect, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { ticketsApi, attachmentsApi } from '../api/tickets';
import { categoriesApi, Category } from '../api/categories';

export function CreateTicketPage() {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('MEDIUM');
  const [categoryId, setCategoryId] = useState('');
  const [categories, setCategories] = useState<Category[]>([]);
  const [files, setFiles] = useState<File[]>([]);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    categoriesApi.list().then((res) => setCategories(res.data));
  }, []);

  function handleFilesChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.files) setFiles(Array.from(e.target.files));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const { data } = await ticketsApi.create({
        title,
        description,
        priority,
        categoryId: categoryId || undefined,
      });
      // Upload lampiran satu-satu setelah ticket berhasil dibuat
      for (const file of files) {
        await attachmentsApi.upload(data.id, file);
      }
      navigate(`/tickets/${data.id}`);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Gagal membuat tiket');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="max-w-xl">
      <h1 className="text-xl font-semibold mb-4">Buat Tiket Baru</h1>
      <form
        onSubmit={handleSubmit}
        className="bg-white border border-slate-200 rounded-lg p-6 space-y-4"
      >
        <div>
          <label className="text-sm text-slate-600">Judul</label>
          <input
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Ringkasan singkat masalah"
            className="w-full mt-1 px-3 py-2 border border-slate-300 rounded-md text-sm"
          />
        </div>
        <div>
          <label className="text-sm text-slate-600">Deskripsi</label>
          <textarea
            required
            rows={5}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Jelaskan detail masalahnya..."
            className="w-full mt-1 px-3 py-2 border border-slate-300 rounded-md text-sm"
          />
        </div>
        <div>
          <label className="text-sm text-slate-600">Priority</label>
          <select
            value={priority}
            onChange={(e) => setPriority(e.target.value)}
            className="w-full mt-1 px-3 py-2 border border-slate-300 rounded-md text-sm"
          >
            <option value="LOW">Low</option>
            <option value="MEDIUM">Medium</option>
            <option value="HIGH">High</option>
            <option value="URGENT">Urgent</option>
          </select>
        </div>

        <div>
          <label className="text-sm text-slate-600">Kategori (opsional)</label>
          <select
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            className="w-full mt-1 px-3 py-2 border border-slate-300 rounded-md text-sm"
          >
            <option value="">Tanpa kategori</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-sm text-slate-600">Lampiran (opsional)</label>
          <input
            type="file"
            multiple
            onChange={handleFilesChange}
            className="w-full mt-1 text-sm"
          />
          {files.length > 0 && (
            <ul className="mt-1 text-xs text-slate-500 list-disc list-inside">
              {files.map((f) => (
                <li key={f.name}>{f.name}</li>
              ))}
            </ul>
          )}
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <button
          type="submit"
          disabled={submitting}
          className="bg-blue-600 text-white text-sm px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
        >
          {submitting ? 'Mengirim...' : 'Kirim Tiket'}
        </button>
      </form>
    </div>
  );
}
