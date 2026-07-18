import { Navigate, Route, Routes } from 'react-router-dom';
import { AppShell } from '@/components/AppShell';
import { useAuth } from '@/hooks/useAuth';
import { LoginPage } from '@/pages/LoginPage';
import { TablesPage } from '@/pages/TablesPage';
import { OrderPage } from '@/pages/OrderPage';
import { KitchenPage } from '@/pages/KitchenPage';
import { BillsPage } from '@/pages/BillsPage';
import { Loader2 } from 'lucide-react';

function Protected({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) {
    return (
      <div className="min-h-dvh flex items-center justify-center text-white/40">
        <Loader2 className="animate-spin" />
      </div>
    );
  }
  if (!user) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

function HomeRedirect() {
  const { role } = useAuth();
  if (role === 'chef') return <Navigate to="/kitchen" replace />;
  return <Navigate to="/tables" replace />;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route
        path="/"
        element={
          <Protected>
            <AppShell />
          </Protected>
        }
      >
        <Route index element={<HomeRedirect />} />
        <Route path="tables" element={<TablesPage />} />
        <Route path="order/:tableId" element={<OrderPage />} />
        <Route path="kitchen" element={<KitchenPage />} />
        <Route path="bills" element={<BillsPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
