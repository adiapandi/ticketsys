import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Ticket,
  Plus,
  FileText,
  FolderKanban,
  Users,
  Building2,
  BarChart3,
  ChevronLeft,
  ChevronRight,
  LogOut,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Logo } from './Logo';
import { Avatar } from './Avatar';

function NavItem({
  to,
  icon: Icon,
  label,
  collapsed,
  end,
}: {
  to: string;
  icon: any;
  label: string;
  collapsed: boolean;
  end?: boolean;
}) {
  return (
    <NavLink
      to={to}
      end={end}
      title={collapsed ? label : undefined}
      className={({ isActive }) =>
        `flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors ${
          isActive
            ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 font-medium'
            : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
        } ${collapsed ? 'justify-center' : ''}`
      }
    >
      <Icon size={18} strokeWidth={1.75} className="shrink-0" />
      {!collapsed && <span className="truncate">{label}</span>}
    </NavLink>
  );
}

function SectionLabel({ children, collapsed }: { children: string; collapsed: boolean }) {
  if (collapsed) return <div className="my-2 border-t border-slate-100 dark:border-slate-700" />;
  return (
    <p className="px-3 mt-4 mb-1 text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wide">
      {children}
    </p>
  );
}

export function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(() => localStorage.getItem('sidebarCollapsed') === 'true');

  function toggleCollapsed() {
    const next = !collapsed;
    setCollapsed(next);
    localStorage.setItem('sidebarCollapsed', String(next));
  }

  function handleLogout() {
    logout();
    navigate('/login');
  }

  if (!user) return null;

  const isAdminLike = user.role === 'SUPER_ADMIN' || user.role === 'ADMIN';
  const isStaff = user.role !== 'CUSTOMER';

  return (
    <aside
      className={`h-screen sticky top-0 flex flex-col bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 transition-all ${
        collapsed ? 'w-16' : 'w-60'
      }`}
    >
      {/* Header: logo + tombol collapse */}
      <div className="flex items-center justify-between px-3 py-4 border-b border-slate-100 dark:border-slate-700">
        {!collapsed && <Logo size={26} />}
        {collapsed && <Logo size={26} showText={false} />}
        <button
          onClick={toggleCollapsed}
          className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 shrink-0"
          aria-label="Toggle sidebar"
        >
          {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </div>

      {/* Navigasi utama */}
      <nav className="flex-1 overflow-y-auto px-2 py-3 space-y-1">
        <NavItem to="/" end icon={LayoutDashboard} label="Dashboard" collapsed={collapsed} />
        <NavItem to="/tickets" icon={Ticket} label="Semua Tiket" collapsed={collapsed} />
        <NavItem to="/tickets/new" icon={Plus} label="Ticket Baru" collapsed={collapsed} />

        {isStaff && (
          <>
            <SectionLabel collapsed={collapsed}>Management</SectionLabel>
            <NavItem to="/admin/canned-responses" icon={FileText} label="Template Balasan" collapsed={collapsed} />
            {isAdminLike && (
              <>
                <NavItem to="/admin/categories" icon={FolderKanban} label="Kategori" collapsed={collapsed} />
                <NavItem to="/admin/users" icon={Users} label="Kelola User" collapsed={collapsed} />
              </>
            )}
            {user.role === 'SUPER_ADMIN' && (
              <NavItem to="/admin/departments" icon={Building2} label="Department" collapsed={collapsed} />
            )}
            <NavItem to="/admin/csat" icon={BarChart3} label="Report" collapsed={collapsed} />
          </>
        )}
      </nav>

      {/* Footer: profile + logout */}
      <div className="border-t border-slate-100 dark:border-slate-700 p-2">
        <NavLink
          to="/profile"
          title={collapsed ? user.name : undefined}
          className={`flex items-center gap-2 px-2 py-2 rounded-md hover:bg-slate-100 dark:hover:bg-slate-700 ${
            collapsed ? 'justify-center' : ''
          }`}
        >
          <Avatar name={user.name} avatarUrl={user.avatarUrl} size={28} />
          {!collapsed && (
            <div className="min-w-0">
              <p className="text-sm text-slate-700 dark:text-slate-200 truncate">{user.name}</p>
              <p className="text-xs text-slate-400 dark:text-slate-500">{user.role}</p>
            </div>
          )}
        </NavLink>
        <button
          onClick={handleLogout}
          title={collapsed ? 'Logout' : undefined}
          className={`w-full flex items-center gap-3 px-3 py-2 mt-1 rounded-md text-sm text-slate-500 dark:text-slate-400 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-400 ${
            collapsed ? 'justify-center' : ''
          }`}
        >
          <LogOut size={18} strokeWidth={1.75} />
          {!collapsed && 'Logout'}
        </button>
      </div>
    </aside>
  );
}
