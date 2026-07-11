import React from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';

interface PermissionGuardProps {
  permission: string | string[];
  requireAll?: boolean; // If true, requires all permissions. If false, requires any permission
  fallback?: React.ReactNode;
  children: React.ReactNode;
}

export const PermissionGuard: React.FC<PermissionGuardProps> = ({
  permission,
  requireAll = false,
  fallback = null,
  children,
}) => {
  const user = useSelector((state: RootState) => state.auth.user);

  const hasPermission = () => {
    if (!user || !user.role) {
      return false;
    }

    // Super Admin has all permissions
    if (user.role.code === 'SUPER_ADMIN') {
      return true;
    }

    const userPermissions = user.role.permissions?.map(p => p.code) || [];

    if (typeof permission === 'string') {
      return userPermissions.includes(permission);
    }

    if (Array.isArray(permission)) {
      if (requireAll) {
        return permission.every(p => userPermissions.includes(p));
      } else {
        return permission.some(p => userPermissions.includes(p));
      }
    }

    return false;
  };

  if (!hasPermission()) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
};
