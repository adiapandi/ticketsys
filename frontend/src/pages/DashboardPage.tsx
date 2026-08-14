import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ticketsApi, Ticket } from '../api/tickets';
import { StatusBadge, PriorityBadge } from '../components/Badges';
import { useAuth } from '../context/AuthContext';

export function DashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState<{ open: number; inProgress: number; resolved: number; closed: number; total: number } | null>(null);
  const [recentTickets, setRecentTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const [statsRes, ticketsRes] = await Promise.all([
        ticketsApi.stats(),
        ticketsApi.list(),
      ]);
      setStats(statsRes.data);
      setRecentTickets(ticketsRes.data.slice(0, 8));
      setLoading(false);
    }
    load();
  }, []);

  if (loading) return <p className="text-slate-500">Memuat...</p>;

  const cards = [
    { label: 'Open', value: stats?.open, color: 'text-yellow-600' },
    { label: 'In Progress', value: stats?.inProgress, color: 'text-blue-600' },
    { label: 'Resolved', value: stats?.resolved, color: 'text-green-600' },
    { label: 'Closed', value: stats?.closed, color: 'text-slate-500' },
    { label: 'Total', value: stats?.total, color: 'text-slate-800' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold">Halo, {user?.name} 👋</h1>
        <p className="text-sm text-slate-500">Ringkasan tiket kamu</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {cards.map((c) => (
          <div key={c.label} className="bg-white border border-slate-200 rounded-lg p-4">
            <p className="text-xs text-slate-500">{c.label}</p>
            <p className={`text-2xl font-semibold ${c.color}`}>{c.value ?? '-'}</p>
          </div>
        ))}
      </div>

      <div className="bg-white border border-slate-200 rounded-lg">
        <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-slate-700">Tiket Terbaru</h2>
          <Link to="/tickets" className="text-sm text-blue-600 hover:underline">
            Lihat semua
          </Link>
        </div>
        <div className="divide-y divide-slate-100">
          {recentTickets.length === 0 && (
            <p className="px-4 py-6 text-sm text-slate-400">Belum ada tiket.</p>
          )}
          {recentTickets.map((t) => (
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
              <div className="flex items-center gap-2">
                <PriorityBadge priority={t.priority} />
                <StatusBadge status={t.status} />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
