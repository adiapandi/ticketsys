import { useState } from 'react';
import { ticketsApi } from '../api/tickets';
import { Avatar } from './Avatar';

export function WatchersPanel({
  ticketId,
  watchers,
  candidates,
  onChange,
}: {
  ticketId: string;
  watchers: { id: string; name: string; email: string }[];
  candidates: { id: string; name: string; email: string }[];
  onChange: () => void;
}) {
  const [showAdd, setShowAdd] = useState(false);
  const watcherIds = new Set(watchers.map((w) => w.id));
  const available = candidates.filter((c) => !watcherIds.has(c.id));

  async function handleAdd(userId: string) {
    await ticketsApi.addWatcher(ticketId, userId);
    setShowAdd(false);
    onChange();
  }

  async function handleRemove(userId: string) {
    await ticketsApi.removeWatcher(ticketId, userId);
    onChange();
  }

  return (
    <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-5">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-200">
          Watcher ({watchers.length})
        </h2>
        <div className="relative">
          <button
            onClick={() => setShowAdd(!showAdd)}
            className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
          >
            + Tambah
          </button>
          {showAdd && (
            <div className="absolute right-0 mt-1 w-48 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md shadow-lg z-10 py-1 max-h-48 overflow-y-auto">
              {available.length === 0 && (
                <p className="px-3 py-2 text-xs text-slate-400 dark:text-slate-500">Tidak ada kandidat</p>
              )}
              {available.map((c) => (
                <button
                  key={c.id}
                  onClick={() => handleAdd(c.id)}
                  className="w-full text-left px-3 py-1.5 text-xs text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700"
                >
                  {c.name}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {watchers.length === 0 ? (
        <p className="text-xs text-slate-400 dark:text-slate-500">
          Belum ada watcher. Watcher otomatis dapat notif tiap ada update di ticket ini.
        </p>
      ) : (
        <div className="space-y-2">
          {watchers.map((w) => (
            <div key={w.id} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Avatar name={w.name} size={22} />
                <span className="text-xs text-slate-600 dark:text-slate-300">{w.name}</span>
              </div>
              <button
                onClick={() => handleRemove(w.id)}
                className="text-xs text-slate-400 dark:text-slate-500 hover:text-red-600 dark:hover:text-red-400"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
