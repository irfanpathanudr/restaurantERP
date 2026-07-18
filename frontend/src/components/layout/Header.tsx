import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { toggleSidebar, selectSidebarOpen, selectPageTitle } from '@/store/slices/uiSlice';
import { selectUser, logout as logoutAction } from '@/store/slices/authSlice';
import { ThemeController } from '@/components/common/ThemeController';
import { authService } from '@/services/auth.service';
import {
  Menu,
  Bell,
  User,
  LogOut,
  Settings,
  ChevronDown,
  Building2,
} from 'lucide-react';
import { cn } from '@/utils/cn';
import toast from 'react-hot-toast';

export const Header: React.FC = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const sidebarOpen = useSelector(selectSidebarOpen);
  const pageTitle = useSelector(selectPageTitle);
  const user = useSelector(selectUser);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  const handleLogout = async () => {
    try {
      await authService.logout();
      dispatch(logoutAction()); // Clear Redux state
      toast.success('Logged out successfully');
      navigate('/login', { replace: true });
    } catch (error) {
      console.error('Logout error:', error);
      // Still logout locally even if API call fails
      dispatch(logoutAction());
      navigate('/login', { replace: true });
    }
  };

  return (
    <header className="sticky top-0 z-30 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
      <div className="flex items-center justify-between px-4 py-3 gap-4">
        {/* Left Section */}
        <div className="flex items-center gap-4">
          {/* Burger Menu */}
          <button
            onClick={() => dispatch(toggleSidebar())}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors lg:hidden"
            aria-label="Toggle sidebar"
          >
            <Menu className="h-6 w-6 text-gray-600 dark:text-gray-400" />
          </button>

          {/* Page Title */}
          <div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">
              {pageTitle}
            </h1>
          </div>
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-3">
          {/* Theme Controller */}
          <ThemeController />

          {/* Notifications */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              aria-label="Notifications"
            >
              <Bell className="h-5 w-5 text-gray-600 dark:text-gray-400" />
              {/* Notification Badge */}
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
            </button>

            {showNotifications && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setShowNotifications(false)}
                />
                <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50">
                  <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                      Notifications
                    </h3>
                  </div>
                  <div className="max-h-96 overflow-y-auto">
                    <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                      No new notifications
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* User Menu */}
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              <div className="w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center">
                <User className="h-5 w-5 text-white" />
              </div>
              <div className="hidden md:block text-left">
                <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  {user?.first_name} {user?.last_name}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  {user?.role?.name || 'User'}
                </div>
              </div>
              <ChevronDown className="h-4 w-4 text-gray-600 dark:text-gray-400" />
            </button>

            {showUserMenu && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setShowUserMenu(false)}
                />
                <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-2 z-50">
                  <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                    <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      {user?.first_name} {user?.last_name}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {user?.email}
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      navigate('/profile');
                      setShowUserMenu(false);
                    }}
                    className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  >
                    <User className="h-4 w-4" />
                    <span>Profile</span>
                  </button>

                  <button
                    onClick={() => {
                      navigate('/settings');
                      setShowUserMenu(false);
                    }}
                    className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  >
                    <Settings className="h-4 w-4" />
                    <span>Settings</span>
                  </button>

                  {user?.branch && (
                    <button
                      className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    >
                      <Building2 className="h-4 w-4" />
                      <span>{user.branch.name}</span>
                    </button>
                  )}

                  <hr className="my-2 border-gray-200 dark:border-gray-700" />

                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>Logout</span>
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
