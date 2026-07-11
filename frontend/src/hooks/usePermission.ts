import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import { Permission } from '@/types/entities.types';

/**
 * Hook to check if the current user has a specific permission
 * Super Admin users have all permissions by default
 */
export const usePermission = () => {
  const user = useSelector((state: RootState) => state.auth.user);
  
  const hasPermission = (permissionCode: string): boolean => {
    if (!user || !user.role) {
      return false;
    }

    // Super Admin has all permissions
    if (user.role.code === 'SUPER_ADMIN') {
      return true;
    }

    // Check if the user's role has the specific permission
    const userPermissions = user.role.permissions || [];
    return userPermissions.some((p: Permission) => p.code === permissionCode);
  };

  const hasAnyPermission = (permissionCodes: string[]): boolean => {
    if (!permissionCodes || permissionCodes.length === 0) {
      return true;
    }
    return permissionCodes.some(code => hasPermission(code));
  };

  const hasAllPermissions = (permissionCodes: string[]): boolean => {
    if (!permissionCodes || permissionCodes.length === 0) {
      return true;
    }
    return permissionCodes.every(code => hasPermission(code));
  };

  const isSuperAdmin = (): boolean => {
    return user?.role?.code === 'SUPER_ADMIN';
  };

  return {
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    isSuperAdmin,
    permissions: user?.role?.permissions || [],
  };
};
