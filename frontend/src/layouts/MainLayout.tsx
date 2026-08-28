import { Link, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { NotificationBell } from '../components/NotificationBell';
import { Avatar } from '../components/Avatar';

const roleBadgeColor: Record<string, string> = {
  ADMIN: 'bg-red-100 text-red-700',
  AGENT: 'bg-blue-100 text-blue-700',
  CUSTOMER: 'bg-slate-100 text-slate-700',
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
      <header className="bg-white border-b border-slate-200 px-6 py-3 flex items-center justify-between">
        <Link to="/" className="text-lg font-semibold text-slate-800">
          🎫 Ticketing System
        </Link>
        <div className="flex items-center gap-4">
          {user && (
            <>
              <Link to="/tickets/new" className="text-sm text-blue-600 hover:underline">
                + Ticket Baru
              </Link>
              {(user.role === 'ADMIN' || user.role === 'AGENT') && (
                <Link to="/admin/csat" className="text-sm text-slate-500 hover:text-slate-700">
                  CSAT
                </Link>
              )}
              {user.role === 'ADMIN' && (
                <>
                  <Link to="/admin/categories" className="text-sm text-slate-500 hover:text-slate-700">
                    Kategori
                  </Link>
                  <Link to="/admin/users" className="text-sm text-slate-500 hover:text-slate-700">
                    User
                  </Link>
                </>
              )}
              <NotificationBell />
              <Link to="/profile" className="flex items-center gap-2 text-sm text-slate-600 hover:text-blue-600">
              <Avatar name={user.name} avatarUrl={user.avatarUrl} size={28} />
              {user.name}
              </Link>
              <span
                className={`text-xs px-2 py-0.5 rounded-full font-medium ${roleBadgeColor[user.role]}`}
              >
                {user.role}
              </span>
              <button
                onClick={handleLogout}
                className="text-sm text-slate-500 hover:text-red-600"
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
