import React from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '@/utils/cn';
import { PermissionGuard } from './PermissionGuard';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'success' | 'warning' | 'ghost' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  permission?: string | string[];
  requireAllPermissions?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = 'primary',
      size = 'md',
      loading = false,
      leftIcon,
      rightIcon,
      permission,
      requireAllPermissions = false,
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    const variantClasses = {
      primary:
        'bg-primary-600 hover:bg-primary-700 text-white border-transparent shadow-sm hover:shadow',
      secondary:
        'bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-900 dark:text-gray-100 border-transparent',
      danger:
        'bg-red-600 hover:bg-red-700 text-white border-transparent shadow-sm hover:shadow',
      success:
        'bg-green-600 hover:bg-green-700 text-white border-transparent shadow-sm hover:shadow',
      warning:
        'bg-yellow-600 hover:bg-yellow-700 text-white border-transparent shadow-sm hover:shadow',
      ghost:
        'bg-transparent hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 border-transparent',
      outline:
        'bg-transparent hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600',
    };

    const sizeClasses = {
      sm: 'px-3 py-1.5 text-sm',
      md: 'px-4 py-2 text-sm',
      lg: 'px-6 py-3 text-base',
    };

    const button = (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={cn(
          'inline-flex items-center justify-center gap-2 font-medium rounded-lg border transition-all focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed',
          variantClasses[variant],
          sizeClasses[size],
          className
        )}
        {...props}
      >
        {loading && <Loader2 className="h-4 w-4 animate-spin" />}
        {!loading && leftIcon && <span>{leftIcon}</span>}
        {children}
        {!loading && rightIcon && <span>{rightIcon}</span>}
      </button>
    );

    if (permission) {
      return (
        <PermissionGuard permission={permission} requireAll={requireAllPermissions}>
          {button}
        </PermissionGuard>
      );
    }

    return button;
  }
);

Button.displayName = 'Button';
