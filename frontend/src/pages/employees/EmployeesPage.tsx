import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { ColumnDef } from '@tanstack/react-table';
import { setPageTitle } from '@/store/slices/uiSlice';
import { DataTable } from '@/components/common/DataTable';
import { Button } from '@/components/common/Button';
import { Modal } from '@/components/common/Modal';
import { apiService } from '@/services/api.service';
import { Plus, Edit, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { cn } from '@/utils/cn';

interface Employee {
  id: string;
  employee_code: string;
  first_name: string;
  last_name: string;
  email?: string;
  phone: string;
  designation: string;
  department: string;
  employment_type: string;
  basic_salary: number;
  branch_id: string;
  branch?: {
    id: string;
    name: string;
  };
}

interface Branch {
  id: string;
  name: string;
}

const EmployeesPage: React.FC = () => {
  const dispatch = useDispatch();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [formData, setFormData] = useState({
    employee_code: '',
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    designation: '',
    department: '',
    employment_type: 'full_time',
    basic_salary: '',
    branch_id: '',
    date_of_birth: '',
    gender: 'male',
    joining_date: '',
  });

  useEffect(() => {
    dispatch(setPageTitle('Employee Management'));
    fetchEmployees();
    fetchBranches();
  }, [dispatch]);

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const response = await apiService.get('/employees');
      setEmployees(response.data.data || []);
    } catch (error) {
      toast.error('Failed to fetch employees');
    } finally {
      setLoading(false);
    }
  };

  const fetchBranches = async () => {
    try {
      const response = await apiService.get('/branches');
      setBranches(response.data.data || []);
    } catch (error) {
      toast.error('Failed to fetch branches');
    }
  };

  const handleCreate = () => {
    setSelectedEmployee(null);
    setFormData({
      employee_code: '',
      first_name: '',
      last_name: '',
      email: '',
      phone: '',
      designation: '',
      department: '',
      employment_type: 'full_time',
      basic_salary: '',
      branch_id: '',
      date_of_birth: '',
      gender: 'male',
      joining_date: '',
    });
    setShowModal(true);
  };

  const handleEdit = (employee: Employee) => {
    setSelectedEmployee(employee);
    setFormData({
      employee_code: employee.employee_code,
      first_name: employee.first_name,
      last_name: employee.last_name,
      email: employee.email || '',
      phone: employee.phone,
      designation: employee.designation,
      department: employee.department,
      employment_type: employee.employment_type,
      basic_salary: employee.basic_salary.toString(),
      branch_id: employee.branch_id,
      date_of_birth: '',
      gender: 'male',
      joining_date: '',
    });
    setShowModal(true);
  };

  const handleDelete = (employee: Employee) => {
    setSelectedEmployee(employee);
    setShowDeleteModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const submitData = {
        employee_code: formData.employee_code,
        first_name: formData.first_name,
        last_name: formData.last_name,
        email: formData.email || undefined,
        phone: formData.phone,
        date_of_birth: formData.date_of_birth,
        gender: formData.gender,
        designation: formData.designation,
        department: formData.department,
        employment_type: formData.employment_type,
        joining_date: formData.joining_date,
        basic_salary: parseFloat(formData.basic_salary),
        branch_id: formData.branch_id,
      };

      if (selectedEmployee) {
        await apiService.put(`/employees/${selectedEmployee.id}`, submitData);
        toast.success('Employee updated successfully');
      } else {
        await apiService.post('/employees', submitData);
        toast.success('Employee created successfully');
      }
      setShowModal(false);
      fetchEmployees();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Operation failed');
    }
  };

  const confirmDelete = async () => {
    if (!selectedEmployee) return;
    try {
      await apiService.delete(`/employees/${selectedEmployee.id}`);
      toast.success('Employee deleted successfully');
      setShowDeleteModal(false);
      fetchEmployees();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Delete failed');
    }
  };

  const getEmploymentTypeColor = (type: string) => {
    switch (type) {
      case 'full_time':
        return 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400';
      case 'part_time':
        return 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400';
      case 'contract':
        return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400';
      case 'temporary':
        return 'bg-gray-100 dark:bg-gray-900/30 text-gray-600 dark:text-gray-400';
      default:
        return 'bg-gray-100 dark:bg-gray-900/30 text-gray-600 dark:text-gray-400';
    }
  };

  const columns: ColumnDef<Employee>[] = [
    {
      accessorKey: 'employee_code',
      header: 'Code',
      cell: ({ row }) => (
        <span className="font-mono text-sm font-medium">{row.original.employee_code}</span>
      ),
    },
    {
      accessorKey: 'first_name',
      header: 'Name',
      cell: ({ row }) => (
        <div>
          <div className="font-medium text-gray-900 dark:text-gray-100">
            {row.original.first_name} {row.original.last_name}
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            {row.original.phone}
          </div>
        </div>
      ),
    },
    {
      accessorKey: 'email',
      header: 'Email',
      cell: ({ row }) => row.original.email || '-',
    },
    {
      accessorKey: 'designation',
      header: 'Designation',
      cell: ({ row }) => (
        <div>
          <div className="font-medium text-gray-900 dark:text-gray-100">
            {row.original.designation}
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            {row.original.department}
          </div>
        </div>
      ),
    },
    {
      accessorKey: 'branch',
      header: 'Branch',
      cell: ({ row }) => row.original.branch?.name || '-',
    },
    {
      accessorKey: 'employment_type',
      header: 'Type',
      cell: ({ row }) => (
        <span className={cn(
          'px-2 py-1 text-xs font-medium rounded-full capitalize',
          getEmploymentTypeColor(row.original.employment_type)
        )}>
          {row.original.employment_type.replace('_', ' ')}
        </span>
      ),
    },
    {
      accessorKey: 'basic_salary',
      header: 'Salary',
      cell: ({ row }) => (
        <span className="font-medium">${Number(row.original.basic_salary || 0).toFixed(2)}</span>
      ),
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="ghost"
            leftIcon={<Edit className="h-4 w-4" />}
            onClick={() => handleEdit(row.original)}
          >
            Edit
          </Button>
          <Button
            size="sm"
            variant="ghost"
            leftIcon={<Trash2 className="h-4 w-4" />}
            onClick={() => handleDelete(row.original)}
            className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
          >
            Delete
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Employee Management
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Manage staff information and employment details
          </p>
        </div>
        <Button
          leftIcon={<Plus className="h-5 w-5" />}
          onClick={handleCreate}
        >
          Add Employee
        </Button>
      </div>

      {/* Data Table */}
      <DataTable
        columns={columns}
        data={employees}
        loading={loading}
        searchPlaceholder="Search employees..."
        onRefresh={fetchEmployees}
      />

      {/* Create/Edit Modal */}
      <Modal
        open={showModal}
        onClose={() => setShowModal(false)}
        title={selectedEmployee ? 'Edit Employee' : 'Create Employee'}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Employee Code *
              </label>
              <input
                type="text"
                required
                value={formData.employee_code}
                onChange={(e) => setFormData({ ...formData, employee_code: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 font-mono"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Branch *
              </label>
              <select
                required
                value={formData.branch_id}
                onChange={(e) => setFormData({ ...formData, branch_id: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
              >
                <option value="">Select Branch</option>
                {branches.map((branch) => (
                  <option key={branch.id} value={branch.id}>
                    {branch.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                First Name *
              </label>
              <input
                type="text"
                required
                value={formData.first_name}
                onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Last Name *
              </label>
              <input
                type="text"
                required
                value={formData.last_name}
                onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Phone *
              </label>
              <input
                type="tel"
                required
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Email
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Date of Birth *
              </label>
              <input
                type="date"
                required
                value={formData.date_of_birth}
                onChange={(e) => setFormData({ ...formData, date_of_birth: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Gender *
              </label>
              <select
                required
                value={formData.gender}
                onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
              >
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Designation *
              </label>
              <input
                type="text"
                required
                value={formData.designation}
                onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Department *
              </label>
              <input
                type="text"
                required
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Employment Type *
              </label>
              <select
                required
                value={formData.employment_type}
                onChange={(e) => setFormData({ ...formData, employment_type: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
              >
                <option value="full_time">Full Time</option>
                <option value="part_time">Part Time</option>
                <option value="contract">Contract</option>
                <option value="temporary">Temporary</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Joining Date *
              </label>
              <input
                type="date"
                required
                value={formData.joining_date}
                onChange={(e) => setFormData({ ...formData, joining_date: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Basic Salary *
              </label>
              <input
                type="number"
                step="0.01"
                required
                value={formData.basic_salary}
                onChange={(e) => setFormData({ ...formData, basic_salary: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="ghost" onClick={() => setShowModal(false)}>
              Cancel
            </Button>
            <Button type="submit">
              {selectedEmployee ? 'Update' : 'Create'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        open={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Delete Employee"
        size="sm"
      >
        <p className="text-gray-600 dark:text-gray-400">
          Are you sure you want to delete "{selectedEmployee?.first_name} {selectedEmployee?.last_name}"? This action cannot be undone.
        </p>
        <div className="flex justify-end gap-3 mt-6">
          <Button variant="ghost" onClick={() => setShowDeleteModal(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={confirmDelete}>
            Delete
          </Button>
        </div>
      </Modal>
    </div>
  );
};

export default EmployeesPage;
