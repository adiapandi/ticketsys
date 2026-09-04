import { useEffect, useState, FormEvent } from 'react';
import { useParams } from 'react-router-dom';
import { ticketsApi, commentsApi, usersApi, Ticket, Comment } from '../api/tickets';
import { StatusBadge, PriorityBadge, SlaBadge } from '../components/Badges';
import { AttachmentSection } from '../components/AttachmentSection';
import { AuditLogList } from '../components/AuditLogList';
import { CsatRating } from '../components/CsatRating';
import { cannedResponsesApi, CannedResponse } from '../api/cannedResponses';
import { useAuth } from '../context/AuthContext';

const STATUS_OPTIONS = ['OPEN', 'IN_PROGRESS', 'PENDING', 'RESOLVED', 'CLOSED'];
const PRIORITY_OPTIONS = ['LOW', 'MEDIUM', 'HIGH', 'URGENT'];

export function TicketDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const isStaff = user?.role === 'SUPER_ADMIN' || user?.role === 'ADMIN' || user?.role === 'AGENT';

  const [ticket, setTicket] = useState<(Ticket & { comments: Comment[] }) | null>(null);
  const [agents, setAgents] = useState<{ id: string; name: string; email: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState('');
  const [isInternal, setIsInternal] = useState(false);
  const [posting, setPosting] = useState(false);
  const [cannedResponses, setCannedResponses] = useState<CannedResponse[]>([]);

  async function load() {
    if (!id) return;
    const { data } = await ticketsApi.get(id);
    setTicket(data);
    setLoading(false);
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  useEffect(() => {
    if (isStaff && ticket) {
      usersApi.agents(ticket.departmentId || undefined).then((res) => setAgents(res.data));
      cannedResponsesApi.list().then((res) => setCannedResponses(res.data));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ticket?.id]);

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

    function handleTemplateSelect(templateId: string) {
    const template = cannedResponses.find((c) => c.id === templateId);
    if (template) {
      setNewComment((prev) => (prev ? `${prev}\n\n${template.body}` : template.body));
    }
  }

  async function handleFieldUpdate(field: string, value: string) {
    if (!id) return;
    await ticketsApi.update(id, { [field]: value });
    await load();
  }

  if (loading) return <p className="text-slate-500 dark:text-slate-400">Memuat...</p>;
  if (!ticket) return <p className="text-red-500 dark:text-red-400">Ticket tidak ditemukan.</p>;

  return (
    <div className="grid md:grid-cols-3 gap-6">
      <div className="md:col-span-2 space-y-4">
        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-5">
          <div className="flex items-start justify-between gap-4">
            <h1 className="text-lg font-semibold text-slate-800 dark:text-slate-100">{ticket.title}</h1>
            <div className="flex gap-2 shrink-0">
              <SlaBadge isOverdue={ticket.isOverdue} resolutionDueAt={ticket.resolutionDueAt} />
              <PriorityBadge priority={ticket.priority} />
              <StatusBadge status={ticket.status} />
            </div>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Dibuat oleh {ticket.requester.name} · {new Date(ticket.createdAt).toLocaleString('id-ID')}
            {ticket.department && ` · ${ticket.department.name}`}
          </p>
          <p className="text-sm text-slate-700 dark:text-slate-200 mt-4 whitespace-pre-wrap">{ticket.description}</p>
        </div>

        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg">
          <div className="px-5 py-3 border-b border-slate-100 dark:border-slate-700">
            <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-200">
              Percakapan ({ticket.comments.length})
            </h2>
          </div>
          <div className="divide-y divide-slate-100 dark:divide-slate-700">
            {ticket.comments.length === 0 && (
              <p className="px-5 py-6 text-sm text-slate-400 dark:text-slate-500">Belum ada komentar.</p>
            )}
            {ticket.comments.map((c) => (
              <div
                key={c.id}
                className={`px-5 py-3 ${c.isInternal ? 'bg-amber-50 dark:bg-amber-900/20' : ''}`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-medium text-slate-800 dark:text-slate-100">{c.author.name}</span>
                  <span className="text-xs text-slate-400 dark:text-slate-500">
                    {new Date(c.createdAt).toLocaleString('id-ID')}
                  </span>
                  {c.isInternal && (
                    <span className="text-xs px-1.5 py-0.5 rounded bg-amber-200 dark:bg-amber-800 text-amber-800 dark:text-amber-200">
                      Internal Note
                    </span>
                  )}
                </div>
                <p className="text-sm text-slate-700 dark:text-slate-200 whitespace-pre-wrap">{c.body}</p>
              </div>
            ))}
          </div>

          <form onSubmit={handleCommentSubmit} className="p-5 border-t border-slate-100 dark:border-slate-700 space-y-2">
            {isStaff && cannedResponses.length > 0 && (
              <select
                onChange={(e) => {
                  handleTemplateSelect(e.target.value);
                  e.target.value = '';
                }}
                defaultValue=""
                className="text-xs px-2 py-1 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-300"
              >
                <option value="" disabled>
                  📋 Pakai Template...
                </option>
                {cannedResponses.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.title}
                  </option>
                ))}
              </select>
            )}
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              rows={3}
              placeholder="Tulis balasan..."
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md text-sm bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100"
            />
            <div className="flex items-center justify-between">
              {isStaff ? (
                <label className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
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

        {!isStaff && ['RESOLVED', 'CLOSED'].includes(ticket.status) && (
          <CsatRating
            ticketId={ticket.id}
            existingRating={ticket.csatRating}
            existingComment={ticket.csatComment}
            onSubmitted={load}
          />
        )}

        {isStaff && ticket.csatRating && (
          <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-5">
            <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2">Rating dari Requester</h2>
            <div className="flex gap-1 text-xl">
              {[1, 2, 3, 4, 5].map((star) => (
                <span
                  key={star}
                  className={star <= (ticket.csatRating || 0) ? 'text-yellow-400' : 'text-slate-200 dark:text-slate-600'}
                >
                  ★
                </span>
              ))}
            </div>
            {ticket.csatComment && (
              <p className="text-sm text-slate-600 dark:text-slate-300 mt-2 italic">"{ticket.csatComment}"</p>
            )}
          </div>
        )}

        {isStaff && <AuditLogList ticketId={ticket.id} />}
      </div>

      {isStaff && (
        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-5 h-fit space-y-4">
          <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-200">Kontrol Tiket</h2>

          <div>
            <label className="text-xs text-slate-500 dark:text-slate-400">Status</label>
            <select
              value={ticket.status}
              onChange={(e) => handleFieldUpdate('status', e.target.value)}
              className="w-full mt-1 px-3 py-1.5 border border-slate-300 dark:border-slate-600 rounded-md text-sm bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100"
            >
              {STATUS_OPTIONS.map((s) => (
                <option key={s} value={s}>
                  {s.replace('_', ' ')}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs text-slate-500 dark:text-slate-400">Priority</label>
            <select
              value={ticket.priority}
              onChange={(e) => handleFieldUpdate('priority', e.target.value)}
              className="w-full mt-1 px-3 py-1.5 border border-slate-300 dark:border-slate-600 rounded-md text-sm bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100"
            >
              {PRIORITY_OPTIONS.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs text-slate-500 dark:text-slate-400">Assign ke</label>
            <select
              value={ticket.assignee?.id || ''}
              onChange={(e) => handleFieldUpdate('assigneeId', e.target.value)}
              className="w-full mt-1 px-3 py-1.5 border border-slate-300 dark:border-slate-600 rounded-md text-sm bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100"
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
            <div className="pt-2 border-t border-slate-100 dark:border-slate-700 space-y-1">
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Target resolusi:{' '}
                <span className={ticket.isOverdue ? 'text-red-600 dark:text-red-400 font-medium' : 'text-slate-700 dark:text-slate-300'}>
                  {new Date(ticket.resolutionDueAt).toLocaleString('id-ID')}
                </span>
              </p>
              {ticket.escalated && (
                <p className="text-xs text-orange-600 dark:text-orange-400">⚠ Ticket ini pernah di-escalate karena SLA breach</p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
