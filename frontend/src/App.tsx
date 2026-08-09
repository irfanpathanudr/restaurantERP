import { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { setUser, setLoading } from './store/slices/authSlice';
import { setTheme } from './store/slices/uiSlice';
import { authService } from './services/auth.service';
import { useAuth } from './hooks/useAuth';
import { apiService } from './services/api.service';
import { clearAuthStorage, getAccessToken, isTokenExpired } from './utils/session';

// Layouts
import AuthLayout from './layouts/AuthLayout';
import DashboardLayout from './layouts/DashboardLayout';

// Auth Pages
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage';

// Dashboard Pages
import DashboardPage from './pages/dashboard/DashboardPage';
import VendorsPage from './pages/vendors/VendorsPage';
import OrdersPage from './pages/orders/OrdersPage';
import KOTPage from './pages/kot/KOTPage';
import TablesPage from './pages/tables/TablesPage';
import MenuPage from './pages/menu/MenuPage';
import CategoryPage from './pages/menu/CategoryPage';
import CustomersPage from './pages/customers/CustomersPage';
import InventoryPage from './pages/inventory/InventoryPage';
import EmployeesPage from './pages/employees/EmployeesPage';
import ReportsPage from './pages/reports/ReportsPage';
import SettingsPage from './pages/settings/SettingsPage';
import RecipesPage from './pages/recipes/RecipesPage';
import ReservationsPage from './pages/reservations/ReservationsPage';
import PurchaseOrdersPage from './pages/purchase-orders/PurchaseOrdersPage';
import ExpensesPage from './pages/expenses/ExpensesPage';
import PaymentsPage from './pages/payments/PaymentsPage';
import RestaurantsPage from './pages/restaurants/RestaurantsPage';
import BranchesPage from './pages/branches/BranchesPage';
import KitchensPage from './pages/kitchens/KitchensPage';
import AuditLogsPage from './pages/audit-logs/AuditLogsPage';
import UsersPage from './pages/users/UsersPage';
import RolesPage from './pages/roles/RolesPage';
import PermissionsPage from './pages/permissions/PermissionsPage';
import { PrintersPage } from './pages/printers/PrintersPage';

// Placeholder component for pages under development
const ComingSoon = ({ pageName }: { pageName: string }): JSX.Element => {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
          {pageName}
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          This page is under development
        </p>
      </div>
    </div>
  );
};

// Protected Route Component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

function App() {
  const dispatch = useDispatch();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    // Initialize theme
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | 'system' | null;
    if (savedTheme) {
      dispatch(setTheme(savedTheme as any));
    } else {
      // Apply initial theme
      const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      if (isDark) {
        document.documentElement.classList.add('dark');
      }
    }

    // Check authentication on mount and restore user state
    const initAuth = async () => {
      dispatch(setLoading(true));
      try {
        const token = getAccessToken();

        if (!token || isTokenExpired(token)) {
          clearAuthStorage();
          dispatch(setUser(null));
          return;
        }

        // Try to fetch fresh user data from the API
        try {
          const user = await authService.getCurrentUser();
          dispatch(setUser(user));
          apiService.resetSessionState();
        } catch (apiError: any) {
          const status = apiError?.response?.status;

          if (status === 401) {
            clearAuthStorage();
            dispatch(setUser(null));
          } else {
            const cached = localStorage.getItem('user');
            if (cached && !isTokenExpired(token)) {
              try {
                dispatch(setUser(JSON.parse(cached)));
              } catch {
                dispatch(setUser(null));
              }
            } else {
              clearAuthStorage();
              dispatch(setUser(null));
            }
          }
        }
      } finally {
        dispatch(setLoading(false));
      }
    };

    initAuth();
  }, [dispatch]);

  return (
    <Routes>
      {/* Auth Routes */}
      <Route element={<AuthLayout />}>
        <Route
          path="/login"
          element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <LoginPage />}
        />
        <Route
          path="/register"
          element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <RegisterPage />}
        />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      </Route>

      {/* Protected Routes */}
      <Route
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/orders" element={<OrdersPage />} />
        <Route path="/kot" element={<KOTPage />} />
        <Route path="/tables" element={<TablesPage />} />
        <Route path="/menu" element={<MenuPage />} />
        <Route path="/categories" element={<CategoryPage />} />
        <Route path="/recipes" element={<RecipesPage />} />
        <Route path="/customers" element={<CustomersPage />} />
        <Route path="/reservations" element={<ReservationsPage />} />
        <Route path="/inventory" element={<InventoryPage />} />
        <Route path="/vendors" element={<VendorsPage />} />
        <Route path="/purchase-orders" element={<PurchaseOrdersPage />} />
        <Route path="/expenses" element={<ExpensesPage />} />
        <Route path="/payments" element={<PaymentsPage />} />
        <Route path="/employees" element={<EmployeesPage />} />
        <Route path="/restaurants" element={<RestaurantsPage />} />
        <Route path="/branches" element={<BranchesPage />} />
        <Route path="/kitchens" element={<KitchensPage />} />
        <Route path="/reports" element={<ReportsPage />} />
        <Route path="/audit-logs" element={<AuditLogsPage />} />
        <Route path="/users" element={<UsersPage />} />
        <Route path="/roles" element={<RolesPage />} />
        <Route path="/permissions" element={<PermissionsPage />} />
        <Route path="/printers" element={<PrintersPage />} />
        <Route path="/settings" element={<SettingsPage />} />
      </Route>

      {/* Default Route */}
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

export default App;
