import React, { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { setPageTitle } from '@/store/slices/uiSlice';
import {
  TrendingUp,
  ShoppingCart,
  Users,
  DollarSign,
  Package,
  AlertTriangle,
} from 'lucide-react';

const DashboardPage: React.FC = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(setPageTitle('Dashboard'));
  }, [dispatch]);

  const stats = [
    {
      name: 'Total Revenue',
      value: '$45,231.89',
      change: '+20.1%',
      changeType: 'positive',
      icon: DollarSign,
      color: 'bg-green-500',
    },
    {
      name: 'Orders Today',
      value: '156',
      change: '+12.5%',
      changeType: 'positive',
      icon: ShoppingCart,
      color: 'bg-blue-500',
    },
    {
      name: 'Total Customers',
      value: '2,345',
      change: '+8.2%',
      changeType: 'positive',
      icon: Users,
      color: 'bg-purple-500',
    },
    {
      name: 'Low Stock Items',
      value: '12',
      change: 'Attention needed',
      changeType: 'negative',
      icon: AlertTriangle,
      color: 'bg-orange-500',
    },
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.name}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6"
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    {stat.name}
                  </p>
                  <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-gray-100">
                    {stat.value}
                  </p>
                  <p
                    className={`mt-2 text-sm ${
                      stat.changeType === 'positive'
                        ? 'text-green-600 dark:text-green-400'
                        : 'text-orange-600 dark:text-orange-400'
                    }`}
                  >
                    {stat.change}
                  </p>
                </div>
                <div
                  className={`${stat.color} p-3 rounded-lg text-white`}
                >
                  <Icon className="h-6 w-6" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
            Recent Orders
          </h3>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="flex items-center justify-between py-3 border-b border-gray-200 dark:border-gray-700 last:border-0"
              >
                <div>
                  <p className="font-medium text-gray-900 dark:text-gray-100">
                    Order #{1000 + i}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Table {i}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-medium text-gray-900 dark:text-gray-100">
                    ${(45 + i * 10).toFixed(2)}
                  </p>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400">
                    Completed
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
            Top Selling Items
          </h3>
          <div className="space-y-4">
            {[
              { name: 'Margherita Pizza', sold: 45 },
              { name: 'Caesar Salad', sold: 38 },
              { name: 'Pasta Carbonara', sold: 32 },
            ].map((item, i) => (
              <div
                key={i}
                className="flex items-center justify-between py-3 border-b border-gray-200 dark:border-gray-700 last:border-0"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                    <Package className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-gray-100">
                      {item.name}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {item.sold} sold today
                    </p>
                  </div>
                </div>
                <TrendingUp className="h-5 w-5 text-green-500" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
