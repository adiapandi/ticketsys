import { useEffect, useState, FormEvent } from 'react';
import { useParams } from 'react-router-dom';
import { ticketsApi, commentsApi, usersApi, Ticket, Comment } from '../api/tickets';
import { StatusBadge, PriorityBadge, SlaBadge } from '../components/Badges';
import { AttachmentSection } from '../components/AttachmentSection';
import { AuditLogList } from '../components/AuditLogList';
import { useAuth } from '../context/AuthContext';

const STATUS_OPTIONS = ['OPEN', 'IN_PROGRESS', 'PENDING', 'RESOLVED', 'CLOSED'];
const PRIORITY_OPTIONS = ['LOW', 'MEDIUM', 'HIGH', 'URGENT'];

export function TicketDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const isStaff = user?.role === 'ADMIN' || user?.role === 'AGENT';

  const [ticket, setTicket] = useState<(Ticket & { comments: Comment[] }) | null>(null);
  const [agents, setAgents] = useState<{ id: string; name: string; email: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState('');
  const [isInternal, setIsInternal] = useState(false);
  const [posting, setPosting] = useState(false);

  async function load() {
    if (!id) return;
    const { data } = await ticketsApi.get(id);
    setTicket(data);
    setLoading(false);
  }

  useEffect(() => {
    load();
    if (isStaff) {
      usersApi.agents().then((res) => setAgents(res.data));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  async function handleCommentSubmit(e: FormEvent) {
    e.preventDefault();
    if (!id || !newComment.trim()) return;
    setPosting(true);
    try {
      await commentsApi.create(id, { body: newComment, isInternal });
      setNewComment('');
      setIsInternal(false);
      await load();
    } finally {
      setPosting(false);
    }
  }

  async function handleFieldUpdate(field: string, value: string) {
    if (!id) return;
    await ticketsApi.update(id, { [field]: value });
    await load();
  }

  if (loading) return <p className="text-slate-500">Memuat...</p>;
  if (!ticket) return <p className="text-red-500">Ticket tidak ditemukan.</p>;

  return (
    <div className="grid md:grid-cols-3 gap-6">
      <div className="md:col-span-2 space-y-4">
        <div className="bg-white border border-slate-200 rounded-lg p-5">
          <div className="flex items-start justify-between gap-4">
            <h1 className="text-lg font-semibold text-slate-800">{ticket.title}</h1>
            <div className="flex gap-2 shrink-0">
              <SlaBadge isOverdue={ticket.isOverdue} resolutionDueAt={ticket.resolutionDueAt} />
              <PriorityBadge priority={ticket.priority} />
              <StatusBadge status={ticket.status} />
            </div>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Dibuat oleh {ticket.requester.name} · {new Date(ticket.createdAt).toLocaleString('id-ID')}
          </p>
          <p className="text-sm text-slate-700 mt-4 whitespace-pre-wrap">{ticket.description}</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg">
          <div className="px-5 py-3 border-b border-slate-100">
            <h2 className="text-sm font-semibold text-slate-700">
              Percakapan ({ticket.comments.length})
            </h2>
          </div>
          <div className="divide-y divide-slate-100">
            {ticket.comments.length === 0 && (
              <p className="px-5 py-6 text-sm text-slate-400">Belum ada komentar.</p>
            )}
            {ticket.comments.map((c) => (
              <div
                key={c.id}
                className={`px-5 py-3 ${c.isInternal ? 'bg-amber-50' : ''}`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-medium text-slate-800">{c.author.name}</span>
                  <span className="text-xs text-slate-400">
                    {new Date(c.createdAt).toLocaleString('id-ID')}
                  </span>
                  {c.isInternal && (
                    <span className="text-xs px-1.5 py-0.5 rounded bg-amber-200 text-amber-800">
                      Internal Note
                    </span>
                  )}
                </div>
                <p className="text-sm text-slate-700 whitespace-pre-wrap">{c.body}</p>
              </div>
            ))}
          </div>

          <form onSubmit={handleCommentSubmit} className="p-5 border-t border-slate-100 space-y-2">
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              rows={3}
              placeholder="Tulis balasan..."
              className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm"
            />
            <div className="flex items-center justify-between">
              {isStaff ? (
                <label className="flex items-center gap-2 text-xs text-slate-500">
                  <input
                    type="checkbox"
                    checked={isInternal}
                    onChange={(e) => setIsInternal(e.target.checked)}
                  />
                  Internal note (tidak terlihat oleh customer)
                </label>
              ) : (
                <span />
              )}
              <button
                type="submit"
                disabled={posting || !newComment.trim()}
                className="bg-blue-600 text-white text-sm px-4 py-1.5 rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                {posting ? 'Mengirim...' : 'Kirim'}
              </button>
            </div>
          </form>
        </div>

        <AttachmentSection ticketId={ticket.id} canDelete={isStaff} />

        {isStaff && <AuditLogList ticketId={ticket.id} />}
      </div>

      {isStaff && (
        <div className="bg-white border border-slate-200 rounded-lg p-5 h-fit space-y-4">
          <h2 className="text-sm font-semibold text-slate-700">Kontrol Tiket</h2>

          <div>
            <label className="text-xs text-slate-500">Status</label>
            <select
              value={ticket.status}
              onChange={(e) => handleFieldUpdate('status', e.target.value)}
              className="w-full mt-1 px-3 py-1.5 border border-slate-300 rounded-md text-sm"
            >
              {STATUS_OPTIONS.map((s) => (
                <option key={s} value={s}>
                  {s.replace('_', ' ')}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs text-slate-500">Priority</label>
            <select
              value={ticket.priority}
              onChange={(e) => handleFieldUpdate('priority', e.target.value)}
              className="w-full mt-1 px-3 py-1.5 border border-slate-300 rounded-md text-sm"
            >
              {PRIORITY_OPTIONS.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs text-slate-500">Assign ke</label>
            <select
              value={ticket.assignee?.id || ''}
              onChange={(e) => handleFieldUpdate('assigneeId', e.target.value)}
              className="w-full mt-1 px-3 py-1.5 border border-slate-300 rounded-md text-sm"
            >
              <option value="">Belum di-assign</option>
              {agents.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name}
                </option>
              ))}
            </select>
          </div>

          {ticket.resolutionDueAt && (
            <div className="pt-2 border-t border-slate-100 space-y-1">
              <p className="text-xs text-slate-500">
                Target resolusi:{' '}
                <span className={ticket.isOverdue ? 'text-red-600 font-medium' : 'text-slate-700'}>
                  {new Date(ticket.resolutionDueAt).toLocaleString('id-ID')}
                </span>
              </p>
              {ticket.escalated && (
                <p className="text-xs text-orange-600">⚠ Ticket ini pernah di-escalate karena SLA breach</p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
