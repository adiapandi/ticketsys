import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ticketsApi, Ticket } from '../api/tickets';

export function MergeTicketPanel({ ticket, onMerged }: { ticket: Ticket; onMerged: () => void }) {
  const navigate = useNavigate();
  const [showSearch, setShowSearch] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Ticket[]>([]);
  const [searching, setSearching] = useState(false);
  const [merging, setMerging] = useState(false);
  const [error, setError] = useState('');

  async function handleSearch(q: string) {
    setQuery(q);
    if (!q.trim()) {
      setResults([]);
      return;
    }
    setSearching(true);
    try {
      const { data } = await ticketsApi.list({
        search: q,
        departmentId: ticket.department?.id || '',
        limit: '10',
      });
      setResults(data.data.filter((t) => t.id !== ticket.id && t.status !== 'MERGED'));
    } finally {
      setSearching(false);
    }
  }

  async function handleMerge(targetId: string) {
    if (!window.confirm('Gabungkan ticket ini ke ticket yang dipilih? Comment & attachment akan dipindahkan, dan ticket ini akan ditutup permanen.')) {
      return;
    }
    setMerging(true);
    setError('');
    try {
      await ticketsApi.merge(ticket.id, targetId);
      onMerged();
      navigate(`/tickets/${targetId}`);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Gagal menggabungkan ticket');
    } finally {
      setMerging(false);
    }
  }

  return (
    <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-5">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-200">Gabungkan Ticket</h2>
        <button
          onClick={() => setShowSearch(!showSearch)}
          className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
        >
          {showSearch ? 'Batal' : 'Cari Ticket'}
        </button>
      </div>

      {!showSearch && (
        <p className="text-xs text-slate-400 dark:text-slate-500">
          Kalau ticket ini duplikat dari ticket lain, gabungkan ke ticket utamanya.
        </p>
      )}

      {showSearch && (
        <div className="space-y-2">
          <input
            value={query}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder="Cari judul ticket tujuan..."
            className="w-full px-3 py-1.5 border border-slate-300 dark:border-slate-600 rounded-md text-sm bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100"
          />
          {searching && <p className="text-xs text-slate-400 dark:text-slate-500">Mencari...</p>}
          {error && <p className="text-xs text-red-600 dark:text-red-400">{error}</p>}
          <div className="max-h-48 overflow-y-auto space-y-1">
            {results.map((t) => (
              <button
                key={t.id}
                onClick={() => handleMerge(t.id)}
                disabled={merging}
                className="w-full text-left px-3 py-2 rounded-md border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-50"
              >
                <p className="text-xs font-medium text-slate-700 dark:text-slate-200 truncate">{t.title}</p>
                <p className="text-xs text-slate-400 dark:text-slate-500">{t.status}</p>
              </button>
            ))}
            {query && !searching && results.length === 0 && (
              <p className="text-xs text-slate-400 dark:text-slate-500">Tidak ada ticket ditemukan.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
