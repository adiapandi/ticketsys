import { Link, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { NotificationBell } from '../components/NotificationBell';
import { ThemeToggle } from '../components/ThemeToggle';
import { Avatar } from '../components/Avatar';
import { Logo } from '../components/Logo';
import { SettingsMenu } from '../components/SettingsMenu';
import { ReportsMenu } from '../components/ReportsMenu';
import { Plus } from 'lucide-react';

const roleBadgeColor: Record<string, string> = {
  ADMIN: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300',
  AGENT: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
  CUSTOMER: 'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300',
};

export function MainLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate('/login');
  }

  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 px-6 py-3 flex items-center justify-between transition-colors">
        <Link to="/">
          <Logo size={30} />
        </Link>
        <div className="flex items-center gap-4">
          {user && (
            <>
              <Link
                to="/tickets/new"
                className="flex items-center gap-1.5 text-sm text-blue-600 dark:text-blue-400 hover:underline"
              >
                <Plus size={16} strokeWidth={1.75} />
                Ticket Baru
              </Link>
              {(user.role === 'ADMIN' || user.role === 'AGENT') && (
              <ReportsMenu />
              <SettingsMenu />
              <ThemeToggle />
              <NotificationBell />
              <Link to="/profile" className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400">
                <Avatar name={user.name} avatarUrl={user.avatarUrl} size={28} />
                {user.name}
              </Link>
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${roleBadgeColor[user.role]}`}>
                {user.role}
              </span>
              <button
                onClick={handleLogout}
                className="text-sm text-slate-500 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400"
              >
                Logout
              </button>
            </>
          )}
        </div>
      </header>
      <main className="flex-1 p-6 max-w-6xl w-full mx-auto">
        <Outlet />
      </main>
    </div>
  );
}
