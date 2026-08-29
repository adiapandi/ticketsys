const statusColor: Record<string, string> = {
  OPEN: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300',
  IN_PROGRESS: 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300',
  PENDING: 'bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300',
  RESOLVED: 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300',
  CLOSED: 'bg-slate-200 text-slate-600 dark:bg-slate-700 dark:text-slate-300',
};

const priorityColor: Record<string, string> = {
  LOW: 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300',
  MEDIUM: 'bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-300',
  HIGH: 'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300',
  URGENT: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300',
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
      <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300">
        ⚠ SLA Overdue
      </span>
    );
  }

  const dueDate = new Date(resolutionDueAt);
  const hoursLeft = (dueDate.getTime() - Date.now()) / (1000 * 60 * 60);

  if (hoursLeft < 4) {
    return (
      <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300">
        Due soon
      </span>
    );
  }

  return (
    <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-slate-100 text-slate-500 dark:bg-slate-700 dark:text-slate-400">
      Due {dueDate.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
    </span>
  );
}
