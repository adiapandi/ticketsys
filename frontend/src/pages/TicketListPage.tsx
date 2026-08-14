import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ticketsApi, Ticket } from '../api/tickets';
import { StatusBadge, PriorityBadge, SlaBadge } from '../components/Badges';

const STATUS_OPTIONS = ['', 'OPEN', 'IN_PROGRESS', 'PENDING', 'RESOLVED', 'CLOSED'];
const PRIORITY_OPTIONS = ['', 'LOW', 'MEDIUM', 'HIGH', 'URGENT'];

export function TicketListPage() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('');
  const [priority, setPriority] = useState('');
  const [search, setSearch] = useState('');

  async function load() {
    setLoading(true);
    const params: Record<string, string> = {};
    if (status) params.status = status;
    if (priority) params.priority = priority;
    if (search) params.search = search;
    const { data } = await ticketsApi.list(params);
    setTickets(data);
    setLoading(false);
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, priority]);

  function handleSearchSubmit(e: React.FormEvent) {
    e.preventDefault();
    load();
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Semua Tiket</h1>
        <Link
          to="/tickets/new"
          className="bg-blue-600 text-white text-sm px-4 py-2 rounded-md hover:bg-blue-700"
        >
          + Ticket Baru
        </Link>
      </div>

      <div className="flex flex-wrap gap-3 items-end bg-white border border-slate-200 rounded-lg p-4">
        <form onSubmit={handleSearchSubmit} className="flex-1 min-w-[200px]">
          <label className="text-xs text-slate-500">Cari</label>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari judul/deskripsi..."
            className="w-full mt-1 px-3 py-1.5 border border-slate-300 rounded-md text-sm"
          />
        </form>
        <div>
          <label className="text-xs text-slate-500">Status</label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="block mt-1 px-3 py-1.5 border border-slate-300 rounded-md text-sm"
          >
            {STATUS_OPTIONS.map((s) => (
              <option key={s} value={s}>
                {s || 'Semua'}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-xs text-slate-500">Priority</label>
          <select
            value={priority}
            onChange={(e) => setPriority(e.target.value)}
            className="block mt-1 px-3 py-1.5 border border-slate-300 rounded-md text-sm"
          >
            {PRIORITY_OPTIONS.map((p) => (
              <option key={p} value={p}>
                {p || 'Semua'}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-lg divide-y divide-slate-100">
        {loading && <p className="px-4 py-6 text-sm text-slate-400">Memuat...</p>}
        {!loading && tickets.length === 0 && (
          <p className="px-4 py-6 text-sm text-slate-400">Tidak ada tiket yang cocok.</p>
        )}
        {tickets.map((t) => (
          <Link
            key={t.id}
            to={`/tickets/${t.id}`}
            className="flex items-center justify-between px-4 py-3 hover:bg-slate-50"
          >
            <div>
              <p className="text-sm font-medium text-slate-800">{t.title}</p>
              <p className="text-xs text-slate-500">
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
    </div>
  );
}
