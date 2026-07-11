import { Plus } from 'lucide-react';

const CustomersPage = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Customers</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">Manage customer information</p>
        </div>
        <button className="btn-primary">
          <Plus className="w-5 h-5 mr-2 inline" />
          Add Customer
        </button>
      </div>

      <div className="card p-6">
        <p className="text-center text-gray-500 dark:text-gray-400">
          Customer management module coming soon...
        </p>
      </div>
    </div>
  );
};

export default CustomersPage;
