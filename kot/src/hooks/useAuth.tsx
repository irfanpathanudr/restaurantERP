import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { getMe, login as loginApi } from '@/services/kotApi';
import type { AppRole, User } from '@/types';

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  role: AppRole;
  branchId: string | null;
  setBranchId: (id: string) => void;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  hasPermission: (code: string) => boolean;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function roleCodes(user: User | null): string[] {
  if (!user) return [];
  const codes: string[] = [];
  if (user.role?.code) codes.push(user.role.code.toLowerCase());
  (user.roles || []).forEach((r) => {
    if (r.code) codes.push(r.code.toLowerCase());
  });
  return codes;
}

function permissionCodes(user: User | null): string[] {
  if (!user) return [];
  const fromArray = user.permissions || [];
  const fromRole =
    user.role?.permissions?.map((p) => (typeof p === 'string' ? p : p.code)) || [];
  return [...fromArray, ...fromRole];
}

function detectRole(user: User | null): AppRole {
  const codes = roleCodes(user);
  const perms = permissionCodes(user);
  if (codes.some((c) => c === 'super_admin' || c === 'restaurant_manager')) return 'manager';
  if (codes.some((c) => c === 'cashier')) return 'cashier';
  if (codes.some((c) => c === 'chef')) return 'chef';
  if (codes.some((c) => c === 'waiter')) return 'waiter';
  if (perms.includes('kot.update') && !perms.includes('orders.create')) return 'chef';
  if (perms.includes('invoices.create')) return 'manager';
  if (perms.includes('orders.create')) return 'waiter';
  return 'waiter';
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    try {
      const raw = localStorage.getItem('kot_user');
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState(true);
  const [branchId, setBranchIdState] = useState<string | null>(
    () => localStorage.getItem('kot_branchId')
  );

  const setBranchId = useCallback((id: string) => {
    localStorage.setItem('kot_branchId', id);
    setBranchIdState(id);
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('kot_accessToken');
    if (!token) {
      setLoading(false);
      return;
    }
    getMe()
      .then((me) => {
        setUser(me);
        localStorage.setItem('kot_user', JSON.stringify(me));
        const bid = me.branch_id || me.branchId;
        if (bid && !localStorage.getItem('kot_branchId')) setBranchId(bid);
      })
      .catch(() => {
        localStorage.removeItem('kot_accessToken');
        localStorage.removeItem('kot_user');
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, [setBranchId]);

  const login = useCallback(
    async (email: string, password: string) => {
      const data = await loginApi(email, password);
      localStorage.setItem('kot_accessToken', data.accessToken);
      localStorage.setItem('kot_refreshToken', data.refreshToken);
      localStorage.setItem('kot_user', JSON.stringify(data.user));
      setUser(data.user);
      const bid = data.user.branch_id || data.user.branchId;
      if (bid) setBranchId(bid);
    },
    [setBranchId]
  );

  const logout = useCallback(() => {
    localStorage.removeItem('kot_accessToken');
    localStorage.removeItem('kot_refreshToken');
    localStorage.removeItem('kot_user');
    setUser(null);
  }, []);

  const hasPermission = useCallback(
    (code: string) => {
      const perms = permissionCodes(user);
      // Super admin or manager bypass
      const codes = roleCodes(user);
      if (codes.some((c) => c === 'super_admin' || c === 'SUPER_ADMIN')) return true;
      // If no permissions defined, deny access
      if (perms.length === 0) return false;
      return perms.includes(code);
    },
    [user]
  );

  const value = useMemo(
    () => ({
      user,
      loading,
      role: detectRole(user),
      branchId,
      setBranchId,
      login,
      logout,
      hasPermission,
    }),
    [user, loading, branchId, setBranchId, login, logout, hasPermission]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
