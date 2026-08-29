import { useEffect, useState } from 'react';
import { auditLogApi, AuditLogEntry } from '../api/auditLog';

export function AuditLogList({ ticketId }: { ticketId: string }) {
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    auditLogApi.listForTicket(ticketId).then((res) => {
      setLogs(res.data);
      setLoading(false);
    });
  }, [ticketId]);

  if (loading || logs.length === 0) return null;

  return (
    <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg">
      <div className="px-5 py-3 border-b border-slate-100 dark:border-slate-700">
        <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-200">Riwayat Perubahan</h2>
      </div>
      <div className="divide-y divide-slate-100 dark:divide-slate-700">
        {logs.map((log) => (
          <div key={log.id} className="px-5 py-2.5 text-xs text-slate-500 dark:text-slate-400">
            <span className="text-slate-700 dark:text-slate-300 font-medium">{log.userName}</span>: {log.description}{' '}
            <span className="text-slate-400 dark:text-slate-500">
              · {new Date(log.createdAt).toLocaleString('id-ID')}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
