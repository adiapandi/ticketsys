import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ticketsApi, Ticket } from '../api/tickets';
import { StatusBadge, PriorityBadge, SlaBadge } from '../components/Badges';
import { useAuth } from '../context/AuthContext';

const STATUS_FILTERS: { label: string; value: string }[] = [
  { label: 'All Status', value: '' },
  { label: 'Open', value: 'OPEN' },
  { label: 'In Progress', value: 'IN_PROGRESS' },
  { label: 'Pending', value: 'PENDING' },
  { label: 'Resolved', value: 'RESOLVED' },
  { label: 'Closed', value: 'CLOSED' },
];

export function DashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState<{ open: number; inProgress: number; resolved: number; closed: number; total: number } | null>(null);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  async function loadStats() {
    const { data } = await ticketsApi.stats();
    setStats(data);
  }

  async function loadTickets() {
    setLoading(true);
    const params: Record<string, string> = {};
    if (statusFilter) params.status = statusFilter;
    if (search) params.search = search;
    const { data } = await ticketsApi.list(params);
    setTickets(data);
    setLoading(false);
  }

  useEffect(() => {
    loadStats();
  }, []);

  useEffect(() => {
    loadTickets();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter]);

  function handleSearchSubmit(e: React.FormEvent) {
    e.preventDefault();
    loadTickets();
  }

  const cards = [
    { label: 'Total', value: stats?.total, color: 'text-slate-800', status: '' },
    { label: 'Open', value: stats?.open, color: 'text-yellow-600', status: 'OPEN' },
    { label: 'In Progress', value: stats?.inProgress, color: 'text-blue-600', status: 'IN_PROGRESS' },
    { label: 'Resolved', value: stats?.resolved, color: 'text-green-600', status: 'RESOLVED' },
    { label: 'Closed', value: stats?.closed, color: 'text-slate-500', status: 'CLOSED' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold">Halo, {user?.name} 👋</h1>
        <p className="text-sm text-slate-500">Ringkasan tiket kamu</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {cards.map((c) => (
          <button
            key={c.label}
            onClick={() => setStatusFilter(c.status)}
            className={`text-left bg-white border rounded-lg p-4 transition-colors ${
              statusFilter === c.status
                ? 'border-blue-500 ring-1 ring-blue-500'
                : 'border-slate-200 hover:border-slate-300'
            }`}
          >
            <p className="text-xs text-slate-500">{c.label}</p>
            <p className={`text-2xl font-semibold ${c.color}`}>{c.value ?? '-'}</p>
          </button>
        ))}
      </div>

      <div className="bg-white border border-slate-200 rounded-lg p-4 space-y-3">
        <form onSubmit={handleSearchSubmit} className="flex gap-2">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari berdasarkan judul tiket..."
            className="flex-1 px-3 py-2 border border-slate-300 rounded-md text-sm"
          />
          <button
            type="submit"
            className="bg-blue-600 text-white text-sm px-4 py-2 rounded-md hover:bg-blue-700"
          >
            Cari
          </button>
        </form>

        <div className="flex flex-wrap gap-2">
          {STATUS_FILTERS.map((f) => (
            <button
              key={f.value}
              onClick={() => setStatusFilter(f.value)}
              className={`text-xs px-3 py-1.5 rounded-full font-medium border transition-colors ${
                statusFilter === f.value
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-lg">
        <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-slate-700">
            {statusFilter || search ? 'Hasil Pencarian' : 'Semua Tiket'}
          </h2>
          <Link to="/tickets" className="text-sm text-blue-600 hover:underline">
            Buka tampilan penuh
          </Link>
        </div>
        <div className="divide-y divide-slate-100">
          {loading && <p className="px-4 py-6 text-sm text-slate-400">Memuat...</p>}
          {!loading && tickets.length === 0 && (
            <p className="px-4 py-6 text-sm text-slate-400">Tidak ada tiket yang cocok.</p>
          )}
          {!loading &&
            tickets.map((t) => (
              <Link
                key={t.id}
                to={`/tickets/${t.id}`}
                className="flex items-center justify-between px-4 py-3 hover:bg-slate-50"
              >
                <div>
                  <p className="text-sm font-medium text-slate-800">{t.title}</p>
                  <p className="text-xs text-slate-500">
                    oleh {t.requester.name} · {new Date(t.createdAt).toLocaleDateString('id-ID')}
                  </p>
                </div>
                <div className="flex
