import { useSelector } from 'react-redux';
import { RootState } from '@/store';

export const useAuth = () => {
  const { user, isAuthenticated, loading } = useSelector((state: RootState) => state.auth);

  const hasPermission = (permissionCode: string): boolean => {
    if (!user || !user.role) return false;
    
    return user.role.permissions.some((permission) => permission.code === permissionCode);
  };

  const hasRole = (roleCode: string): boolean => {
    if (!user || !user.role) return false;
    
    return user.role.code === roleCode;
  };

  const hasAnyRole = (roleCodes: string[]): boolean => {
    if (!user || !user.role) return false;
    
    return roleCodes.includes(user.role.code);
  };

  return {
    user,
    isAuthenticated,
    loading,
    hasPermission,
    hasRole,
    hasAnyRole,
  };
};
