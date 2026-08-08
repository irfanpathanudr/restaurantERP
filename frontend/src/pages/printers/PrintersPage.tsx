import { useState, useEffect } from 'react';
import { Plus, Printer as PrinterIcon, Wifi, WifiOff, AlertCircle, Settings, Trash2, CheckCircle } from 'lucide-react';
import { DataTable } from '@/components/common/DataTable';
import { Button } from '@/components/common/Button';
import { Badge } from '@/components/common/Badge';
import { printerService, Printer, CreatePrinterRequest, UpdatePrinterRequest } from '@/services/printer.service';
import { branchService, Branch } from '@/services/branch.service';
import toast from 'react-hot-toast';
import { PrinterFormModal } from './PrinterFormModal';

const printerTypeColors = {
  receipt: 'bg-blue-500/10 text-blue-500',
  kitchen: 'bg-orange-500/10 text-orange-500',
  bar: 'bg-purple-500/10 text-purple-500',
  label: 'bg-green-500/10 text-green-500',
};

const printerTypeLabels = {
  receipt: 'Receipt',
  kitchen: 'Kitchen',
  bar: 'Bar',
  label: 'Label',
};

const connectionTypeLabels = {
  network: '🌐 Network',
  usb: '🔌 USB',
  bluetooth: '📡 Bluetooth',
};

export function PrintersPage() {
  const [printers, setPrinters] = useState<Printer[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingPrinter, setEditingPrinter] = useState<Printer | null>(null);
  const [testingId, setTestingId] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    try {
      const [printersData, branchesData] = await Promise.all([
        printerService.getAll(),
        branchService.getAll(),
      ]);
      setPrinters(printersData);
      setBranches(branchesData);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to load printers');
    } finally {
      setLoading(false);
    }
  }

  async function handleCreate(data: CreatePrinterRequest) {
    try {
      await printerService.create(data);
      toast.success('Printer created successfully');
      setShowForm(false);
      loadData();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to create printer');
      throw error;
    }
  }

  async function handleUpdate(id: string, data: UpdatePrinterRequest) {
    try {
      await printerService.update(id, data);
      toast.success('Printer updated successfully');
      setShowForm(false);
      setEditingPrinter(null);
      loadData();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update printer');
      throw error;
    }
  }

  async function handleDelete(id: string, name: string) {
    if (!confirm(`Are you sure you want to delete printer "${name}"?`)) return;

    try {
      await printerService.delete(id);
      toast.success('Printer deleted successfully');
      loadData();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to delete printer');
    }
  }

  async function handleTestConnection(id: string, name: string) {
    setTestingId(id);
    try {
      const result = await printerService.testConnection(id);
      if (result.success) {
        toast.success(`${name}: Connection successful!`);
      } else {
        toast.error(`${name}: ${result.message}`);
      }
      loadData(); // Refresh to update status
    } catch (error: any) {
      toast.error(`${name}: Connection test failed`);
    } finally {
      setTestingId(null);
    }
  }

  const columns = [
    {
      header: 'Printer Name',
      accessor: 'name' as const,
      cell: (printer: Printer) => (
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-white/5">
            <PrinterIcon size={20} />
          </div>
          <div>
            <div className="font-medium">{printer.name}</div>
            <div className="text-sm text-gray-400">
              {printer.model || 'Unknown Model'}
            </div>
          </div>
        </div>
      ),
    },
    {
      header: 'Branch',
      accessor: 'branch' as const,
      cell: (printer: Printer) => (
        <span className="text-sm">{printer.branch?.name || 'N/A'}</span>
      ),
    },
    {
      header: 'Type',
      accessor: 'printer_type' as const,
      cell: (printer: Printer) => (
        <Badge className={printerTypeColors[printer.printer_type]}>
          {printerTypeLabels[printer.printer_type]}
        </Badge>
      ),
    },
    {
      header: 'Connection',
      accessor: 'connection_type' as const,
      cell: (printer: Printer) => (
        <div className="space-y-1">
          <div className="text-sm font-medium">
            {connectionTypeLabels[printer.connection_type]}
          </div>
          <div className="text-xs text-gray-400">
            {printer.connection_type === 'network' && printer.ip_address
              ? `${printer.ip_address}:${printer.port || 9100}`
              : printer.connection_type === 'usb' && printer.usb_path
              ? printer.usb_path
              : printer.connection_type === 'bluetooth' && printer.bluetooth_address
              ? printer.bluetooth_address
              : 'Not configured'}
          </div>
        </div>
      ),
    },
    {
      header: 'Status',
      accessor: 'status' as const,
      cell: (printer: Printer) => (
        <div className="flex items-center gap-2">
          {printer.status === 'online' && (
            <>
              <Wifi size={16} className="text-green-500" />
              <span className="text-sm text-green-500">Online</span>
            </>
          )}
          {printer.status === 'offline' && (
            <>
              <WifiOff size={16} className="text-gray-400" />
              <span className="text-sm text-gray-400">Offline</span>
            </>
          )}
          {printer.status === 'error' && (
            <>
              <AlertCircle size={16} className="text-red-500" />
              <span className="text-sm text-red-500">Error</span>
            </>
          )}
        </div>
      ),
    },
    {
      header: 'Default',
      accessor: 'is_default' as const,
      cell: (printer: Printer) =>
        printer.is_default ? (
          <Badge className="bg-green-500/10 text-green-500">
            <CheckCircle size={14} className="mr-1" />
            Default
          </Badge>
        ) : (
          <span className="text-sm text-gray-500">-</span>
        ),
    },
    {
      header: 'Actions',
      accessor: 'id' as const,
      cell: (printer: Printer) => (
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="ghost"
            onClick={() => handleTestConnection(printer.id, printer.name)}
            disabled={testingId === printer.id}
          >
            {testingId === printer.id ? 'Testing...' : 'Test'}
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => {
              setEditingPrinter(printer);
              setShowForm(true);
            }}
          >
            <Settings size={16} />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => handleDelete(printer.id, printer.name)}
            className="text-red-400 hover:text-red-300"
          >
            <Trash2 size={16} />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Printer Management</h1>
          <p className="text-sm text-gray-400 mt-1">
            Configure and manage printers for receipts, kitchen orders, and more
          </p>
        </div>
        <Button
          onClick={() => {
            setEditingPrinter(null);
            setShowForm(true);
          }}
        >
          <Plus size={20} className="mr-2" />
          Add Printer
        </Button>
      </div>

      <DataTable
        data={printers}
        columns={columns}
        loading={loading}
        searchable
        searchPlaceholder="Search printers..."
      />

      {showForm && (
        <PrinterFormModal
          open={showForm}
          onClose={() => {
            setShowForm(false);
            setEditingPrinter(null);
          }}
          onSubmit={editingPrinter
            ? (data) => handleUpdate(editingPrinter.id, data)
            : handleCreate
          }
          printer={editingPrinter}
          branches={branches}
        />
      )}
    </div>
  );
}
