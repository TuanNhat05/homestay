import {
  BedDouble,
  CalendarDays,
  Gauge,
  Menu,
  NotebookTabs,
  Users,
  X,
  Sparkles,
} from 'lucide-react';
import { useState } from 'react';
import { NavLink, Outlet } from 'react-router-dom';

const navItems = [
  { to: '/', label: 'Dashboard', icon: Gauge },
  { to: '/rooms', label: 'Phòng', icon: BedDouble },
  { to: '/customers', label: 'Khách hàng', icon: Users },
  { to: '/bookings', label: 'Booking', icon: NotebookTabs },
  { to: '/calendar', label: 'Lịch phòng', icon: CalendarDays },
];

const Layout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const sidebar = (
    <aside className="flex h-full w-72 flex-col bg-gradient-sidebar border-r border-surface-border">
      {/* Brand */}
      <div className="flex h-16 items-center justify-between border-b border-surface-border px-5">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-pine shadow-glow">
            <Sparkles size={16} className="text-surface" />
          </div>
          <div>
            <div className="text-sm font-bold text-ink">Sun HomeStay</div>
            <div className="text-[10px] font-medium uppercase tracking-widest text-ink-dim">Manager</div>
          </div>
        </div>
        <button
          className="icon-btn lg:hidden !h-8 !w-8"
          onClick={() => setSidebarOpen(false)}
          aria-label="Đóng menu"
        >
          <X size={16} />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-3 py-4">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) =>
                `group flex h-11 items-center gap-3 rounded-xl px-3 text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-pine/15 text-pine shadow-glow/50'
                    : 'text-ink-muted hover:bg-surface-hover hover:text-ink'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <div
                    className={`flex h-8 w-8 items-center justify-center rounded-lg transition-all duration-200 ${
                      isActive
                        ? 'bg-gradient-pine text-surface shadow-glow'
                        : 'bg-surface-hover text-ink-dim group-hover:text-ink'
                    }`}
                  >
                    <Icon size={16} />
                  </div>
                  {item.label}
                </>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="border-t border-surface-border p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-violet text-white text-sm font-bold">
            S
          </div>
          <div className="min-w-0 flex-1">
            <div className="truncate text-sm font-semibold text-ink">Sun HomeStay</div>
            <div className="text-[10px] font-medium uppercase tracking-widest text-ink-dim">
              Quản lý
            </div>
          </div>
        </div>
      </div>
    </aside>
  );

  return (
    <div className="min-h-screen bg-surface text-ink">
      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:left-0 lg:z-50 lg:block">{sidebar}</div>

      {/* Mobile overlay */}
      {sidebarOpen ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setSidebarOpen(false)}
            aria-label="Đóng lớp phủ menu"
          />
          <div className="relative h-full animate-slideIn">{sidebar}</div>
        </div>
      ) : null}

      {/* Main content */}
      <div className="lg:pl-72">
        <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-surface-border bg-surface/80 px-4 backdrop-blur-xl lg:px-6">
          <button
            className="icon-btn !h-9 !w-9 lg:hidden"
            onClick={() => setSidebarOpen(true)}
            aria-label="Mở menu"
          >
            <Menu size={18} />
          </button>
          <div className="hidden text-sm text-ink-dim lg:block">
            Sun HomeStay — Quản lý đặt phòng theo giờ
          </div>
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-pine animate-pulse-dot" />
            <span className="text-sm font-medium text-ink-muted">Online</span>
          </div>
        </header>
        <main className="mx-auto w-full max-w-7xl px-4 py-6 lg:px-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;

