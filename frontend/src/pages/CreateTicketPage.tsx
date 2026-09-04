import { useState, useEffect, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { ticketsApi, attachmentsApi, usersApi } from '../api/tickets';
import { categoriesApi, Category } from '../api/categories';
import { departmentsApi, Department } from '../api/departments';
import { usersManagementApi, AppUser } from '../api/users';
import { useAuth } from '../context/AuthContext';

export function CreateTicketPage() {
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  const isStaff = currentUser?.role === 'SUPER_ADMIN' || currentUser?.role === 'ADMIN' || currentUser?.role === 'AGENT';

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('MEDIUM');
  const [departmentId, setDepartmentId] = useState('');
  const [departments, setDepartments] = useState<Department[]>([]);
  const [categoryId, setCategoryId] = useState('');
  const [categories, setCategories] = useState<Category[]>([]);
  const [files, setFiles] = useState<File[]>([]);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const [allUsers, setAllUsers] = useState<AppUser[]>([]);
  const [agents, setAgents] = useState<{ id: string; name: string; email: string }[]>([]);
  const [requestedForUserId, setRequestedForUserId] = useState('');
  const [assigneeId, setAssigneeId] = useState('');

  // Load department sekali di awal. Staff dept-scoped otomatis default ke department-nya sendiri.
  useEffect(() => {
    departmentsApi.list().then((res) => {
      setDepartments(res.data);
      if (currentUser?.departmentId) {
        setDepartmentId(currentUser.departmentId);
      } else if (res.data.length === 1) {
        setDepartmentId(res.data[0].id);
      }
    });
    if (isStaff) {
      usersManagementApi.list().then((res) => setAllUsers(res.data));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Reload kategori & daftar agent tiap kali department yang dipilih berubah
  useEffect(() => {
    if (!departmentId) {
      setCategories([]);
      setAgents([]);
      return;
    }
    categoriesApi.list(departmentId).then((res) => setCategories(res.data));
    setCategoryId('');
    if (isStaff) {
      usersApi.agents(departmentId).then((res) => {
        setAgents(res.data);
        if (currentUser && res.data.some((a) => a.id === currentUser.id)) {
          setAssigneeId(currentUser.id);
        } else {
          setAssigneeId('');
        }
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [departmentId]);

  function handleFilesChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.files) setFiles(Array.from(e.target.files));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!departmentId) {
      setError('Pilih department dulu ya');
      return;
    }
    setError('');
    setSubmitting(true);
    try {
      const { data } = await ticketsApi.create({
        title,
        description,
        priority,
        categoryId: categoryId || undefined,
        departmentId,
        ...(isStaff && {
          requestedForUserId: requestedForUserId || undefined,
          assigneeId: assigneeId || undefined,
        }),
      });
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
      <h1 className="text-xl font-semibold mb-4 text-slate-800 dark:text-slate-100">Buat Tiket Baru</h1>
      <form
        onSubmit={handleSubmit}
        className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-6 space-y-4"
      >
        <div>
          <label className="text-sm text-slate-600 dark:text-slate-300">Tiket ditujukan ke</label>
          <select
            required
            value={departmentId}
            onChange={(e) => setDepartmentId(e.target.value)}
            className="w-full mt-1 px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md text-sm bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100"
          >
            <option value="">Pilih department...</option>
            {departments.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-sm text-slate-600 dark:text-slate-300">Judul</label>
          <input
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Ringkasan singkat masalah"
            className="w-full mt-1 px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md text-sm bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100"
          />
        </div>
        <div>
          <label className="text-sm text-slate-600 dark:text-slate-300">Deskripsi</label>
          <textarea
            required
            rows={5}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Jelaskan detail masalahnya..."
            className="w-full mt-1 px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md text-sm bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100"
          />
        </div>
        <div>
          <label className="text-sm text-slate-600 dark:text-slate-300">Priority</label>
          <select
            value={priority}
            onChange={(e) => setPriority(e.target.value)}
            className="w-full mt-1 px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md text-sm bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100"
          >
            <option value="LOW">Low</option>
            <option value="MEDIUM">Medium</option>
            <option value="HIGH">High</option>
            <option value="URGENT">Urgent</option>
          </select>
        </div>

        {isStaff && departmentId && (
          <div className="border border-dashed border-slate-300 dark:border-slate-600 rounded-md p-3 space-y-3 bg-slate-50/50 dark:bg-slate-700/30">
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              Opsi staff — buat ticket atas nama user lain / kerjaan yang udah selesai duluan
            </p>
            <div>
              <label className="text-sm text-slate-600 dark:text-slate-300">Dikerjakan untuk (User)</label>
              <select
                value={requestedForUserId}
                onChange={(e) => setRequestedForUserId(e.target.value)}
                className="w-full mt-1 px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md text-sm bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100"
              >
                <option value="">Diri sendiri ({currentUser?.name})</option>
                {allUsers
                  .filter((u) => u.id !== currentUser?.id)
                  .map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.name} ({u.email})
                    </option>
                  ))}
              </select>
            </div>
            <div>
              <label className="text-sm text-slate-600 dark:text-slate-300">Assign ke</label>
              <select
                value={assigneeId}
                onChange={(e) => setAssigneeId(e.target.value)}
                className="w-full mt-1 px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md text-sm bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100"
              >
                <option value="">Belum di-assign</option>
                {agents.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.name} {a.id === currentUser?.id ? '(kamu)' : ''}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}

        <div>
          <label className="text-sm text-slate-600 dark:text-slate-300">Kategori (opsional)</label>
          <select
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            disabled={!departmentId}
            className="w-full mt-1 px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md text-sm bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 disabled:opacity-50"
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
          <label className="text-sm text-slate-600 dark:text-slate-300">Lampiran (opsional)</label>
          <input
            type="file"
            multiple
            onChange={handleFilesChange}
            className="w-full mt-1 text-sm text-slate-600 dark:text-slate-300"
          />
          {files.length > 0 && (
            <ul className="mt-1 text-xs text-slate-500 dark:text-slate-400 list-disc list-inside">
              {files.map((f) => (
                <li key={f.name}>{f.name}</li>
              ))}
            </ul>
          )}
        </div>

        {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}

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
