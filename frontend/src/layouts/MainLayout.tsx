import { Outlet } from 'react-router-dom';
import { Sidebar } from '../components/Sidebar';
import { NotificationBell } from '../components/NotificationBell';
import { ThemeToggle } from '../components/ThemeToggle';

export function MainLayout() {
  return (
    <div className="min-h-screen flex bg-slate-50 dark:bg-slate-900">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <header className="flex items-center justify-end gap-4 px-6 py-3 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
          <ThemeToggle />
          <NotificationBell />
        </header>
        <main className="flex-1 p-6 max-w-6xl w-full mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
