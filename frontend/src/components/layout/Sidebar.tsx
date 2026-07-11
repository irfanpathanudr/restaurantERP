import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/store';
import {
  toggleSidebar,
  setSidebarOpen,
  selectSidebarOpen,
  selectSidebarCollapsed,
  toggleSidebarCollapse,
} from '@/store/slices/uiSlice';
import {
  LayoutDashboard,
  Users,
  ShoppingCart,
  Package,
  Utensils,
  FileText,
  Settings,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  X,
  Receipt,
  ClipboardList,
  CreditCard,
  TrendingUp,
  Store,
  Building2,
  FolderTree,
  ChefHat,
  CalendarCheck,
  UserCog,
  Truck,
  DollarSign,
  BookOpen,
  Activity,
  Shield,
  Key,
} from 'lucide-react';
import { cn } from '@/utils/cn';

interface MenuItem {
  name: string;
  path: string;
  icon: React.ReactNode;
  permission?: string | string[];
  badge?: string | number;
}

interface MenuGroup {
  name: string;
  icon: React.ReactNode;
  items: MenuItem[];
}

const menuGroups: MenuGroup[] = [
  {
    name: 'Dashboard',
    icon: <LayoutDashboard className="h-5 w-5" />,
    items: [
      {
        name: 'Overview',
        path: '/dashboard',
        icon: <LayoutDashboard className="h-5 w-5" />,
      },
    ],
  },
  {
    name: 'Operations',
    icon: <ShoppingCart className="h-5 w-5" />,
    items: [
      {
        name: 'Orders',
        path: '/orders',
        icon: <ShoppingCart className="h-5 w-5" />,
      },
      {
        name: 'KOT',
        path: '/kot',
        icon: <ClipboardList className="h-5 w-5" />,
      },
      {
        name: 'Tables',
        path: '/tables',
        icon: <Store className="h-5 w-5" />,
      },
      {
        name: 'Reservations',
        path: '/reservations',
        icon: <CalendarCheck className="h-5 w-5" />,
      },
    ],
  },
  {
    name: 'Menu',
    icon: <Utensils className="h-5 w-5" />,
    items: [
      {
        name: 'Menu Items',
        path: '/menu',
        icon: <Utensils className="h-5 w-5" />,
      },
      {
        name: 'Recipes',
        path: '/recipes',
        icon: <BookOpen className="h-5 w-5" />,
      },
    ],
  },
  {
    name: 'Customers',
    icon: <Users className="h-5 w-5" />,
    items: [
      {
        name: 'Customer List',
        path: '/customers',
        icon: <Users className="h-5 w-5" />,
      },
    ],
  },
  {
    name: 'Inventory',
    icon: <Package className="h-5 w-5" />,
    items: [
      {
        name: 'Stock',
        path: '/inventory',
        icon: <Package className="h-5 w-5" />,
      },
      {
        name: 'Vendors',
        path: '/vendors',
        icon: <Truck className="h-5 w-5" />,
      },
      {
        name: 'Purchase Orders',
        path: '/purchase-orders',
        icon: <Receipt className="h-5 w-5" />,
      },
    ],
  },
  {
    name: 'Finance',
    icon: <DollarSign className="h-5 w-5" />,
    items: [
      {
        name: 'Expenses',
        path: '/expenses',
        icon: <DollarSign className="h-5 w-5" />,
      },
      {
        name: 'Payments',
        path: '/payments',
        icon: <CreditCard className="h-5 w-5" />,
      },
    ],
  },
  {
    name: 'Organization',
    icon: <Building2 className="h-5 w-5" />,
    items: [
      {
        name: 'Restaurants',
        path: '/restaurants',
        icon: <Building2 className="h-5 w-5" />,
      },
      {
        name: 'Branches',
        path: '/branches',
        icon: <FolderTree className="h-5 w-5" />,
      },
      {
        name: 'Kitchens',
        path: '/kitchens',
        icon: <ChefHat className="h-5 w-5" />,
      },
    ],
  },
  {
    name: 'User Management',
    icon: <Shield className="h-5 w-5" />,
    items: [
      {
        name: 'Employees',
        path: '/employees',
        icon: <UserCog className="h-5 w-5" />,
      },
      {
        name: 'Users',
        path: '/users',
        icon: <Users className="h-5 w-5" />,
      },
      {
        name: 'Roles',
        path: '/roles',
        icon: <Shield className="h-5 w-5" />,
      },
      {
        name: 'Permissions',
        path: '/permissions',
        icon: <Key className="h-5 w-5" />,
      },
    ],
  },
  {
    name: 'Reports & Logs',
    icon: <TrendingUp className="h-5 w-5" />,
    items: [
      {
        name: 'Reports',
        path: '/reports',
        icon: <TrendingUp className="h-5 w-5" />,
      },
      {
        name: 'Audit Logs',
        path: '/audit-logs',
        icon: <Activity className="h-5 w-5" />,
      },
    ],
  },
  {
    name: 'Settings',
    icon: <Settings className="h-5 w-5" />,
    items: [
      {
        name: 'System Settings',
        path: '/settings',
        icon: <Settings className="h-5 w-5" />,
      },
    ],
  },
];

export const Sidebar: React.FC = () => {
  const dispatch = useDispatch();
  const location = useLocation();
  const sidebarOpen = useSelector(selectSidebarOpen);
  const sidebarCollapsed = useSelector(selectSidebarCollapsed);
  const user = useSelector((state: RootState) => state.auth.user);
  
  const [expandedGroups, setExpandedGroups] = useState<string[]>(['Dashboard']);
  
  const isSuperAdmin = user?.role?.code === 'SUPER_ADMIN';

  const hasPermission = (permission?: string | string[]) => {
    if (!permission || isSuperAdmin) return true;
    if (!user || !user.role) return false;

    const userPermissions = user.role.permissions?.map(p => p.code) || [];
    
    if (typeof permission === 'string') {
      return userPermissions.includes(permission);
    }
    
    if (Array.isArray(permission)) {
      return permission.some(p => userPermissions.includes(p));
    }
    
    return false;
  };

  const toggleGroup = (groupName: string) => {
    setExpandedGroups(prev =>
      prev.includes(groupName)
        ? prev.filter(name => name !== groupName)
        : [...prev, groupName]
    );
  };

  const isGroupExpanded = (groupName: string) => {
    return expandedGroups.includes(groupName);
  };

  const isGroupActive = (group: MenuGroup) => {
    return group.items.some(item => location.pathname === item.path);
  };

  const handleCloseSidebar = () => {
    if (window.innerWidth < 1024) {
      dispatch(setSidebarOpen(false));
    }
  };

  const handleToggleCollapse = () => {
    dispatch(toggleSidebarCollapse());
  };

  return (
    <>
      {/* Backdrop for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => dispatch(setSidebarOpen(false))}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed top-0 left-0 h-full bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 z-50 transition-all duration-300',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0',
          sidebarCollapsed ? 'w-20' : 'w-64'
        )}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-800">
            {!sidebarCollapsed && (
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-primary-500 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-lg">R</span>
                </div>
                <span className="font-bold text-lg text-gray-900 dark:text-gray-100">
                  Restaurant ERP
                </span>
              </div>
            )}

            <div className="flex items-center gap-1">
              {/* Collapse button (desktop only) */}
              <button
                onClick={handleToggleCollapse}
                className="hidden lg:flex p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                title={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
              >
                {sidebarCollapsed ? (
                  <ChevronRight className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                ) : (
                  <ChevronLeft className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                )}
              </button>

              {/* Close button (mobile only) */}
              <button
                onClick={() => dispatch(setSidebarOpen(false))}
                className="lg:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                title="Close sidebar"
              >
                <X className="h-5 w-5 text-gray-600 dark:text-gray-400" />
              </button>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-1">
            {menuGroups.map((group) => {
              // Filter items based on permissions
              const visibleItems = group.items.filter(item => hasPermission(item.permission));
              
              // Don't show group if no items are visible
              if (visibleItems.length === 0) {
                return null;
              }

              const isExpanded = isGroupExpanded(group.name);
              const isActive = isGroupActive(group);
              const hasSingleItem = visibleItems.length === 1;

              // If group has only one item and sidebar is not collapsed, go directly to that page
              if (hasSingleItem && !sidebarCollapsed) {
                const singleItem = visibleItems[0];
                return (
                  <NavLink
                    key={group.name}
                    to={singleItem.path}
                    onClick={handleCloseSidebar}
                    className={({ isActive }) =>
                      cn(
                        'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all group',
                        isActive
                          ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400'
                          : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                      )
                    }
                  >
                    <span>{group.icon}</span>
                    <span className="flex-1 font-medium">{group.name}</span>
                  </NavLink>
                );
              }

              return (
                <div key={group.name}>
                  {/* Group Header */}
                  <button
                    onClick={() => !sidebarCollapsed && toggleGroup(group.name)}
                    className={cn(
                      'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all group',
                      isActive
                        ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800',
                      sidebarCollapsed && 'justify-center'
                    )}
                    title={sidebarCollapsed ? group.name : undefined}
                  >
                    <span>{group.icon}</span>
                    {!sidebarCollapsed && (
                      <>
                        <span className="flex-1 text-left font-medium">{group.name}</span>
                        <ChevronDown
                          className={cn(
                            'h-4 w-4 transition-transform',
                            isExpanded && 'transform rotate-180'
                          )}
                        />
                      </>
                    )}
                  </button>

                  {/* Submenu Items */}
                  {!sidebarCollapsed && isExpanded && (
                    <div className="ml-6 mt-1 space-y-1">
                      {visibleItems.map((item) => (
                        <NavLink
                          key={item.path}
                          to={item.path}
                          onClick={handleCloseSidebar}
                          className={({ isActive }) =>
                            cn(
                              'flex items-center gap-3 px-3 py-2 rounded-lg transition-all text-sm',
                              isActive
                                ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 font-medium'
                                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-200'
                            )
                          }
                        >
                          <span className="text-xs">{item.icon}</span>
                          <span>{item.name}</span>
                          {item.badge && (
                            <span className="ml-auto px-2 py-0.5 text-xs font-semibold bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 rounded-full">
                              {item.badge}
                            </span>
                          )}
                        </NavLink>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-gray-200 dark:border-gray-800">
            <div className={cn('text-xs text-gray-500 dark:text-gray-400', sidebarCollapsed && 'text-center')}>
              {sidebarCollapsed ? 'v1.0' : 'Restaurant ERP v1.0.0'}
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};
