import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ticketsApi, Ticket } from '../api/tickets';
import { StatusBadge, PriorityBadge, SlaBadge } from '../components/Badges';

const STATUS_OPTIONS = ['', 'OPEN', 'IN_PROGRESS', 'PENDING', 'RESOLVED', 'CLOSED'];
const PRIORITY_OPTIONS = ['', 'LOW', 'MEDIUM', 'HIGH', 'URGENT'];
const SORT_OPTIONS = [
  { label: 'Terbaru dibuat', sortBy: 'createdAt', order: 'desc' },
  { label: 'Terlama dibuat', sortBy: 'createdAt', order: 'asc' },
  { label: 'Terakhir diupdate', sortBy: 'updatedAt', order: 'desc' },
  { label: 'SLA due date terdekat', sortBy: 'resolutionDueAt', order: 'asc' },
  { label: 'Judul A-Z', sortBy: 'title', order: 'asc' },
];
const PAGE_SIZE = 15;

export function TicketListPage() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('');
  const [priority, setPriority] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [sortIndex, setSortIndex] = useState(0);

  async function load() {
    setLoading(true);
    const sort = SORT_OPTIONS[sortIndex];
    const params: Record<string, string> = {
      page: String(page),
      limit: String(PAGE_SIZE),
      sortBy: sort.sortBy,
      order: sort.order,
    };
    if (status) params.status = status;
    if (priority) params.priority = priority;
    if (search) params.search = search;
    const { data } = await ticketsApi.list(params);
    setTickets(data.data);
    setTotal(data.total);
    setTotalPages(data.totalPages);
    setLoading(false);
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, priority, page, sortIndex]);

  function handleSearchSubmit(e: React.FormEvent) {
    e.preventDefault();
    setPage(1);
  }

  function handleFilterChange(setter: (v: string) => void, value: string) {
    setter(value);
    setPage(1);
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-slate-800 dark:text-slate-100">Semua Tiket</h1>
        <Link
          to="/tickets/new"
          className="bg-blue-600 text-white text-sm px-4 py-2 rounded-md hover:bg-blue-700"
        >
          + Ticket Baru
        </Link>
      </div>

      <div className="flex flex-wrap gap-3 items-end bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-4">
        <form onSubmit={handleSearchSubmit} className="flex-1 min-w-[200px]">
          <label className="text-xs text-slate-500 dark:text-slate-400">Cari</label>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari judul/deskripsi..."
            className="w-full mt-1 px-3 py-1.5 border border-slate-300 dark:border-slate-600 rounded-md text-sm bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100"
          />
        </form>
        <div>
          <label className="text-xs text-slate-500 dark:text-slate-400">Status</label>
          <select
            value={status}
            onChange={(e) => handleFilterChange(setStatus, e.target.value)}
            className="block mt-1 px-3 py-1.5 border border-slate-300 dark:border-slate-600 rounded-md text-sm bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100"
          >
            {STATUS_OPTIONS.map((s) => (
              <option key={s} value={s}>
                {s || 'Semua'}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-xs text-slate-500 dark:text-slate-400">Priority</label>
          <select
            value={priority}
            onChange={(e) => handleFilterChange(setPriority, e.target.value)}
            className="block mt-1 px-3 py-1.5 border border-slate-300 dark:border-slate-600 rounded-md text-sm bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100"
          >
            {PRIORITY_OPTIONS.map((p) => (
              <option key={p} value={p}>
                {p || 'Semua'}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-xs text-slate-500 dark:text-slate-400">Urutkan</label>
          <select
            value={sortIndex}
            onChange={(e) => {
              setSortIndex(Number(e.target.value));
              setPage(1);
            }}
            className="block mt-1 px-3 py-1.5 border border-slate-300 dark:border-slate-600 rounded-md text-sm bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100"
          >
            {SORT_OPTIONS.map((s, i) => (
              <option key={s.label} value={i}>
                {s.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg divide-y divide-slate-100 dark:divide-slate-700">
        {loading && <p className="px-4 py-6 text-sm text-slate-400 dark:text-slate-500">Memuat...</p>}
        {!loading && tickets.length === 0 && (
          <p className="px-4 py-6 text-sm text-slate-400 dark:text-slate-500">Tidak ada tiket yang cocok.</p>
        )}
        {tickets.map((t) => (
          <Link
            key={t.id}
            to={`/tickets/${t.id}`}
            className="flex items-center justify-between px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-700/50"
          >
            <div>
              <p className="text-sm font-medium text-slate-800 dark:text-slate-100">{t.title}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {t.requester.name} · {t.category?.name || 'Tanpa kategori'} ·{' '}
                {t.assignee ? `Ditangani oleh ${t.assignee.name}` : 'Belum di-assign'}
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <SlaBadge isOverdue={t.isOverdue} resolutionDueAt={t.resolutionDueAt} />
              <PriorityBadge priority={t.priority} />
              <StatusBadge status={t.status} />
            </div>
          </Link>
        ))}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between text-sm text-slate-500 dark:text-slate-400">
          <p>
            Halaman {page} dari {totalPages} · {total} ticket total
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-3 py-1.5 border border-slate-300 dark:border-slate-600 rounded-md disabled:opacity-40 hover:bg-slate-50 dark:hover:bg-slate-700"
            >
              ← Sebelumnya
            </button>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="px-3 py-1.5 border border-slate-300 dark:border-slate-600 rounded-md disabled:opacity-40 hover:bg-slate-50 dark:hover:bg-slate-700"
            >
              Selanjutnya →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
