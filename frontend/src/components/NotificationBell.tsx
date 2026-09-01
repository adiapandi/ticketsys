import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell } from 'lucide-react';
import { notificationsApi, AppNotification } from '../api/tickets';

function timeAgo(dateStr: string) {
  const diffMs = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return 'baru saja';
  if (mins < 60) return `${mins}m lalu`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}j lalu`;
  return `${Math.floor(hours / 24)}h lalu`;
}

export function NotificationBell() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  async function loadUnreadCount() {
    const { data } = await notificationsApi.unreadCount();
    setUnreadCount(data);
  }

  async function loadNotifications() {
    const { data } = await notificationsApi.list();
    setNotifications(data);
  }

  useEffect(() => {
    loadUnreadCount();
    const interval = setInterval(loadUnreadCount, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  async function handleToggle() {
    if (!open) await loadNotifications();
    setOpen(!open);
  }

  async function handleNotificationClick(n: AppNotification) {
    if (!n.isRead) {
      await notificationsApi.markRead(n.id);
      setUnreadCount((c) => Math.max(0, c - 1));
    }
    setOpen(false);
    if (n.ticketId) navigate(`/tickets/${n.ticketId}`);
  }

  async function handleMarkAllRead() {
    await notificationsApi.markAllRead();
    setUnreadCount(0);
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  }

  return (
    <div className="relative" ref={containerRef}>
      <button
        onClick={handleToggle}
        className="relative text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 text-lg"
        aria-label="Notifikasi"
      >
        🔔
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] rounded-full w-4 h-4 flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg z-10">
          <div className="flex items-center justify-between px-4 py-2.5 border-b border-slate-100 dark:border-slate-700">
            <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">Notifikasi</span>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllRead}
                className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
              >
                Tandai semua dibaca
              </button>
            )}
          </div>
          <div className="max-h-80 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-700">
            {notifications.length === 0 && (
              <p className="px-4 py-6 text-sm text-slate-400 dark:text-slate-500 text-center">Tidak ada notifikasi.</p>
            )}
            {notifications.map((n) => (
              <button
                key={n.id}
                onClick={() => handleNotificationClick(n)}
                className={`w-full text-left px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-700/50 ${
                  !n.isRead ? 'bg-blue-50/50 dark:bg-blue-900/20' : ''
                }`}
              >
                <p className="text-sm text-slate-700 dark:text-slate-200">{n.message}</p>
                <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">{timeAgo(n.createdAt)}</p>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
