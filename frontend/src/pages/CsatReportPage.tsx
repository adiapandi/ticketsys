import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ticketsApi } from '../api/tickets';

interface CsatStats {
  total: number;
  average: number;
  distribution: { star: number; count: number }[];
  recent: {
    id: string;
    title: string;
    csatRating: number;
    csatComment: string | null;
    csatSubmittedAt: string;
    requester: { name: string };
  }[];
}

export function CsatReportPage() {
  const [stats, setStats] = useState<CsatStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    ticketsApi.csatStats().then((res: any) => {
      setStats(res.data);
      setLoading(false);
    });
  }, []);

  if (loading) return <p className="text-slate-500">Memuat...</p>;
  if (!stats || stats.total === 0) {
    return (
      <div className="space-y-2">
        <h1 className="text-xl font-semibold">Laporan Kepuasan (CSAT)</h1>
        <p className="text-sm text-slate-400">Belum ada rating yang masuk.</p>
      </div>
    );
  }

  const maxCount = Math.max(...stats.distribution.map((d) => d.count), 1);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold">Laporan Kepuasan (CSAT)</h1>
        <p className="text-sm text-slate-500">Rating dari user setelah ticket selesai.</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white border border-slate-200 rounded-lg p-5">
          <p className="text-xs text-slate-500">Rata-rata Rating</p>
          <p className="text-3xl font-semibold text-slate-800 mt-1">
            {stats.average} <span className="text-lg text-yellow-400">★</span>
          </p>
          <p className="text-xs text-slate-400 mt-1">dari {stats.total} rating</p>
        </div>
        <div className="bg-white border border-slate-200 rounded-lg p-5">
          <p className="text-xs text-slate-500 mb-2">Distribusi Bintang</p>
          <div className="space-y-1">
            {stats.distribution
              .slice()
              .reverse()
              .map((d) => (
                <div key={d.star} className="flex items-center gap-2 text-xs">
                  <span className="w-8 text-slate-500">{d.star}★</span>
                  <div className="flex-1 bg-slate-100 rounded-full h-2">
                    <div
                      className="bg-yellow-400 h-2 rounded-full"
                      style={{ width: `${(d.count / maxCount) * 100}%` }}
                    />
                  </div>
                  <span className="w-6 text-right text-slate-500">{d.count}</span>
                </div>
              ))}
          </div>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-lg">
        <div className="px-4 py-3 border-b border-slate-100">
          <h2 className="text-sm font-semibold text-slate-700">Rating Terbaru</h2>
        </div>
        <div className="divide-y divide-slate-100">
          {stats.recent.map((r) => (
            <Link
              key={r.id}
              to={`/tickets/${r.id}`}
              className="block px-4 py-3 hover:bg-slate-50"
            >
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-slate-800">{r.title}</p>
                <div className="flex gap-0.5 text-sm shrink-0">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <span key={star} className={star <= r.csatRating ? 'text-yellow-400' : 'text-slate-200'}>
                      ★
                    </span>
                  ))}
                </div>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                {r.requester.name} · {new Date(r.csatSubmittedAt).toLocaleDateString('id-ID')}
              </p>
              {r.csatComment && (
                <p className="text-xs text-slate-600 mt-1 italic">"{r.csatComment}"</p>
              )}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
