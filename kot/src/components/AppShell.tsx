import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { ChefHat, LayoutGrid, LogOut, Receipt, UtensilsCrossed } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/utils/helpers';

export function AppShell() {
  const { user, role, logout, hasPermission } = useAuth();
  const navigate = useNavigate();

  const name =
    user?.first_name ||
    user?.firstName ||
    user?.email?.split('@')[0] ||
    'Staff';

  const tabs = [
    { 
      to: '/tables', 
      label: 'Tables', 
      icon: LayoutGrid, 
      show: role !== 'chef' && hasPermission('tables.read')
    },
    { 
      to: '/kitchen', 
      label: 'Kitchen', 
      icon: ChefHat, 
      show: (role === 'chef' || role === 'manager' || role === 'admin') && hasPermission('kot.read')
    },
    { 
      to: '/bills', 
      label: 'Bills', 
      icon: Receipt, 
      show: (role === 'manager' || role === 'cashier' || role === 'admin') && hasPermission('invoices.create')
    },
  ].filter((t) => t.show);

  return (
    <div className="min-h-dvh flex flex-col bg-surface">
      <header className="sticky top-0 z-30 border-b border-white/10 bg-surface/95 backdrop-blur px-4 py-3 flex items-center justify-between safe-top">
        <div className="flex items-center gap-2">
          <div className="h-9 w-9 rounded-xl bg-brand-500/20 text-brand-400 flex items-center justify-center">
            <UtensilsCrossed size={18} />
          </div>
          <div>
            <p className="font-display font-bold text-sm leading-tight">KOT Floor</p>
            <p className="text-[11px] text-white/50 capitalize">{role} · {name}</p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => {
            logout();
            navigate('/login');
          }}
          className="p-2 rounded-lg text-white/60 hover:bg-white/5 hover:text-white"
          aria-label="Logout"
        >
          <LogOut size={18} />
        </button>
      </header>

      <main className="flex-1 overflow-y-auto pb-24">
        <Outlet />
      </main>

      <nav className="fixed bottom-0 inset-x-0 z-30 border-t border-white/10 bg-surface-card/95 backdrop-blur safe-bottom">
        <div className="mx-auto max-w-lg grid grid-flow-col auto-cols-fr">
          {tabs.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                cn(
                  'flex flex-col items-center gap-1 py-3 text-[11px] font-medium',
                  isActive ? 'text-brand-400' : 'text-white/45'
                )
              }
            >
              <Icon size={20} />
              {label}
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  );
}
