import { Outlet } from 'react-router-dom';

const AuthLayout = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-primary-600 dark:text-primary-400 mb-2">
            Restaurant ERP
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Complete Management Solution
          </p>
        </div>
        <Outlet />
      </div>
    </div>
  );
};

export default AuthLayout;
