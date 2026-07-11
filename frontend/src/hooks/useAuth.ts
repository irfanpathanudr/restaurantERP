import { useSelector } from 'react-redux';
import { RootState } from '@/store';

export const useAuth = () => {
  const { user, isAuthenticated, loading } = useSelector((state: RootState) => state.auth);

  const hasPermission = (permissionName: string): boolean => {
    if (!user || !user.role || !user.role.permissions) return false;
    
    // Check if user has the permission in their role
    return user.role.permissions.some((permission: any) => 
      permission.name === permissionName
    );
  };

  const hasRole = (roleName: string): boolean => {
    if (!user || !user.role) return false;
    
    return user.role.name === roleName;
  };

  const hasAnyRole = (roleNames: string[]): boolean => {
    if (!user || !user.role) return false;
    
    return roleNames.includes(user.role.name);
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
