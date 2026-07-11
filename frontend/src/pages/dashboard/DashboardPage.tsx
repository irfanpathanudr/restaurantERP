import { useAuth } from '@/hooks/useAuth';
import { TrendingUp, TrendingDown, DollarSign, ShoppingCart, Users, Package } from 'lucide-react';

const DashboardPage = () => {
  const { user } = useAuth();

  const stats = [
    {
      name: 'Total Sales',
      value: '₹45,231',
      change: '+12.5%',
      trend: 'up',
      icon: DollarSign,
      color: 'bg-green-500',
    },
    {
      name: 'Orders Today',
      value: '156',
      change: '+8.2%',
      trend: 'up',
      icon: ShoppingCart,
      color: 'bg-blue-500',
    },
    {
      name: 'Total Customers',
      value: '2,345',
      change: '+3.1%',
      trend: 'up',
      icon: Users,
      color: 'bg-purple-500',
    },
    {
      name: 'Low Stock Items',
      value: '12',
      change: '-2.4%',
      trend: 'down',
      icon: Package,
      color: 'bg-orange-500',
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Dashboard</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Welcome back, {user?.first_name}! Here's what's happening today.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <div key={stat.name} className="card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">{stat.name}</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100 mt-2">
                  {stat.value}
                </p>
                <div className="flex items-center mt-2">
                  {stat.trend === 'up' ? (
                    <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                  ) : (
                    <TrendingDown className="w-4 h-4 text-red-500 mr-1" />
                  )}
                  <span
                    className={`text-sm font-medium ${
                      stat.trend === 'up' ? 'text-green-600' : 'text-red-600'
                    }`}
                  >
                    {stat.change}
                  </span>
                </div>
              </div>
              <div className={`${stat.color} p-3 rounded-lg`}>
                <stat.icon className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
            Recent Orders
          </h2>
          <div className="space-y-4">
            {[1, 2, 3, 4].map((order) => (
              <div
                key={order}
                className="flex items-center justify-between py-3 border-b border-gray-200 dark:border-gray-700 last:border-0"
              >
                <div>
                  <p className="font-medium text-gray-900 dark:text-gray-100">
                    Order #{1000 + order}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Table {order}</p>
                </div>
                <span className="px-3 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400">
                  Completed
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="card p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
            Top Selling Items
          </h2>
          <div className="space-y-4">
            {['Margherita Pizza', 'Chicken Burger', 'Caesar Salad', 'Pasta Carbonara'].map(
              (item, index) => (
                <div
                  key={item}
                  className="flex items-center justify-between py-3 border-b border-gray-200 dark:border-gray-700 last:border-0"
                >
                  <div className="flex items-center">
                    <span className="w-8 h-8 bg-primary-100 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 rounded-full flex items-center justify-center font-medium text-sm mr-3">
                      {index + 1}
                    </span>
                    <p className="font-medium text-gray-900 dark:text-gray-100">{item}</p>
                  </div>
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    {Math.floor(Math.random() * 50) + 10} sold
                  </span>
                </div>
              )
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
