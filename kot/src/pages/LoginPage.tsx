import { useState, type FormEvent } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { Loader2, UtensilsCrossed } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '@/hooks/useAuth';

export function LoginPage() {
  const { user, loading, login, role } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!loading && user) {
    const dest = role === 'chef' ? '/kitchen' : '/tables';
    return <Navigate to={dest} replace />;
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      await login(email.trim(), password);
      toast.success('Welcome back');
      navigate('/');
    } catch {
      /* toast from interceptor */
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-dvh flex flex-col justify-center px-5 bg-[radial-gradient(ellipse_at_top,_#2a1a0f_0%,_#0f1419_55%)]">
      <div className="mx-auto w-full max-w-sm">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 h-14 w-14 rounded-2xl bg-brand-500 text-white flex items-center justify-center shadow-lg shadow-brand-500/30">
            <UtensilsCrossed size={28} />
          </div>
          <h1 className="font-display text-3xl font-extrabold tracking-tight">KOT Floor</h1>
          <p className="mt-2 text-sm text-white/55">Waiter · Chef · Billing — mobile ready</p>
        </div>

        <form onSubmit={onSubmit} className="space-y-4 rounded-2xl bg-surface-card p-5 border border-white/10">
          <div>
            <label className="text-xs text-white/50 mb-1.5 block">Email</label>
            <input
              type="email"
              required
              autoComplete="username"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-xl bg-surface-elevated border border-white/10 px-3.5 py-3 text-sm outline-none focus:border-brand-500"
              placeholder="waiter@restaurant.com"
            />
          </div>
          <div>
            <label className="text-xs text-white/50 mb-1.5 block">Password</label>
            <input
              type="password"
              required
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-xl bg-surface-elevated border border-white/10 px-3.5 py-3 text-sm outline-none focus:border-brand-500"
              placeholder="••••••••"
            />
          </div>
          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-xl bg-brand-500 hover:bg-brand-600 disabled:opacity-60 py-3.5 font-semibold text-sm flex items-center justify-center gap-2"
          >
            {submitting && <Loader2 className="animate-spin" size={16} />}
            Sign in
          </button>
        </form>

        <div className="mt-5 rounded-xl border border-white/10 bg-black/20 p-3 text-[11px] text-white/55 space-y-1.5">
          <p className="font-semibold text-white/70 mb-1">Demo logins</p>
          <button type="button" className="block w-full text-left hover:text-brand-300" onClick={() => { setEmail('waiter@restaurant.com'); setPassword('Waiter@123'); }}>
            Waiter — waiter@restaurant.com / Waiter@123
          </button>
          <button type="button" className="block w-full text-left hover:text-brand-300" onClick={() => { setEmail('chef@restaurant.com'); setPassword('Chef@123'); }}>
            Chef — chef@restaurant.com / Chef@123
          </button>
          <button type="button" className="block w-full text-left hover:text-brand-300" onClick={() => { setEmail('cashier@restaurant.com'); setPassword('Cashier@123'); }}>
            Cashier — cashier@restaurant.com / Cashier@123
          </button>
          <button type="button" className="block w-full text-left hover:text-brand-300" onClick={() => { setEmail('manager@restaurant.com'); setPassword('Manager@123'); }}>
            Manager — manager@restaurant.com / Manager@123
          </button>
        </div>
      </div>
    </div>
  );
}
