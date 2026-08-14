const statusColor: Record<string, string> = {
  OPEN: 'bg-yellow-100 text-yellow-800',
  IN_PROGRESS: 'bg-blue-100 text-blue-800',
  PENDING: 'bg-purple-100 text-purple-800',
  RESOLVED: 'bg-green-100 text-green-800',
  CLOSED: 'bg-slate-200 text-slate-600',
};

const priorityColor: Record<string, string> = {
  LOW: 'bg-slate-100 text-slate-600',
  MEDIUM: 'bg-blue-50 text-blue-600',
  HIGH: 'bg-orange-100 text-orange-700',
  URGENT: 'bg-red-100 text-red-700',
};

export function StatusBadge({ status }: { status: string }) {
  return (
    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColor[status] || ''}`}>
      {status.replace('_', ' ')}
    </span>
  );
}

export function PriorityBadge({ priority }: { priority: string }) {
  return (
    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${priorityColor[priority] || ''}`}>
      {priority}
    </span>
  );
}

export function SlaBadge({ isOverdue, resolutionDueAt }: { isOverdue?: boolean; resolutionDueAt?: string | null }) {
  if (!resolutionDueAt) return null;

  if (isOverdue) {
    return (
      <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-red-100 text-red-700">
        ⚠ SLA Overdue
      </span>
    );
  }

  const dueDate = new Date(resolutionDueAt);
  const hoursLeft = (dueDate.getTime() - Date.now()) / (1000 * 60 * 60);

  if (hoursLeft < 4) {
    return (
      <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-orange-100 text-orange-700">
        Due soon
      </span>
    );
  }

  return (
    <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-slate-100 text-slate-500">
      Due {dueDate.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
    </span>
  );
}
