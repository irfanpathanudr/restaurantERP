import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/common/Button';
import { Printer, CreatePrinterRequest, UpdatePrinterRequest } from '@/services/printer.service';
import { Branch } from '@/services/branch.service';

interface PrinterFormModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: CreatePrinterRequest | UpdatePrinterRequest) => Promise<void>;
  printer?: Printer | null;
  branches: Branch[];
}

export function PrinterFormModal({ open, onClose, onSubmit, printer, branches }: PrinterFormModalProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    branchId: '',
    printerType: 'receipt' as 'receipt' | 'kitchen' | 'bar' | 'label',
    connectionType: 'network' as 'network' | 'usb' | 'bluetooth',
    ipAddress: '',
    port: 9100,
    usbPath: '',
    bluetoothAddress: '',
    model: '',
    manufacturer: '',
    paperWidth: 80,
    numberOfCopies: 1,
    autoCut: true,
    openCashDrawer: false,
    printHeader: true,
    printFooter: true,
    headerText: '',
    footerText: '',
    characterEncoding: 'utf-8',
    isDefault: false,
    isActive: true,
  });

  useEffect(() => {
    if (printer) {
      setFormData({
        name: printer.name,
        branchId: printer.branch_id,
        printerType: printer.printer_type,
        connectionType: printer.connection_type,
        ipAddress: printer.ip_address || '',
        port: printer.port || 9100,
        usbPath: printer.usb_path || '',
        bluetoothAddress: printer.bluetooth_address || '',
        model: printer.model || '',
        manufacturer: printer.manufacturer || '',
        paperWidth: printer.paper_width,
        numberOfCopies: printer.number_of_copies,
        autoCut: printer.auto_cut,
        openCashDrawer: printer.open_cash_drawer,
        printHeader: printer.print_header,
        printFooter: printer.print_footer,
        headerText: printer.header_text || '',
        footerText: printer.footer_text || '',
        characterEncoding: printer.character_encoding,
        isDefault: printer.is_default,
        isActive: printer.is_active,
      });
    }
  }, [printer]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      await onSubmit(formData);
    } finally {
      setLoading(false);
    }
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-gray-900 rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-gray-900/95 backdrop-blur border-b border-white/10 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-bold">
            {printer ? 'Edit Printer' : 'Add New Printer'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-white/5 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white/90">Basic Information</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Printer Name *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-lg bg-white/5 border border-white/10 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  placeholder="e.g., Main Receipt Printer"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Branch *</label>
                <select
                  required
                  value={formData.branchId}
                  onChange={(e) => setFormData({ ...formData, branchId: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-lg bg-white/5 border border-white/10 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                >
                  <option value="">Select Branch</option>
                  {branches.map((branch) => (
                    <option key={branch.id} value={branch.id}>
                      {branch.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Printer Type *</label>
                <select
                  required
                  value={formData.printerType}
                  onChange={(e) => setFormData({ ...formData, printerType: e.target.value as any })}
                  className="w-full px-4 py-2.5 rounded-lg bg-white/5 border border-white/10 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                >
                  <option value="receipt">Receipt Printer</option>
                  <option value="kitchen">Kitchen Printer</option>
                  <option value="bar">Bar Printer</option>
                  <option value="label">Label Printer</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Connection Type *</label>
                <select
                  required
                  value={formData.connectionType}
                  onChange={(e) => setFormData({ ...formData, connectionType: e.target.value as any })}
                  className="w-full px-4 py-2.5 rounded-lg bg-white/5 border border-white/10 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                >
                  <option value="network">Network (IP)</option>
                  <option value="usb">USB</option>
                  <option value="bluetooth">Bluetooth</option>
                </select>
              </div>
            </div>
          </div>

          {/* Connection Details */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white/90">Connection Details</h3>
            
            {formData.connectionType === 'network' && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">IP Address *</label>
                  <input
                    type="text"
                    required={formData.connectionType === 'network'}
                    value={formData.ipAddress}
                    onChange={(e) => setFormData({ ...formData, ipAddress: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-lg bg-white/5 border border-white/10 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    placeholder="192.168.1.100"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Port *</label>
                  <input
                    type="number"
                    required={formData.connectionType === 'network'}
                    value={formData.port}
                    onChange={(e) => setFormData({ ...formData, port: Number(e.target.value) })}
                    className="w-full px-4 py-2.5 rounded-lg bg-white/5 border border-white/10 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    placeholder="9100"
                    min="1"
                    max="65535"
                  />
                </div>
              </div>
            )}

            {formData.connectionType === 'usb' && (
              <div>
                <label className="block text-sm font-medium mb-2">USB Path</label>
                <input
                  type="text"
                  value={formData.usbPath}
                  onChange={(e) => setFormData({ ...formData, usbPath: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-lg bg-white/5 border border-white/10 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  placeholder="/dev/usb/lp0 or COM3"
                />
              </div>
            )}

            {formData.connectionType === 'bluetooth' && (
              <div>
                <label className="block text-sm font-medium mb-2">Bluetooth Address</label>
                <input
                  type="text"
                  value={formData.bluetoothAddress}
                  onChange={(e) => setFormData({ ...formData, bluetoothAddress: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-lg bg-white/5 border border-white/10 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  placeholder="00:11:22:33:44:55"
                />
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Model</label>
                <input
                  type="text"
                  value={formData.model}
                  onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-lg bg-white/5 border border-white/10 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  placeholder="e.g., Epson TM-T88V"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Manufacturer</label>
                <input
                  type="text"
                  value={formData.manufacturer}
                  onChange={(e) => setFormData({ ...formData, manufacturer: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-lg bg-white/5 border border-white/10 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  placeholder="e.g., Epson"
                />
              </div>
            </div>
          </div>

          {/* Print Settings */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white/90">Print Settings</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Paper Width (mm)</label>
                <select
                  value={formData.paperWidth}
                  onChange={(e) => setFormData({ ...formData, paperWidth: Number(e.target.value) })}
                  className="w-full px-4 py-2.5 rounded-lg bg-white/5 border border-white/10 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                >
                  <option value="58">58mm</option>
                  <option value="80">80mm</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Number of Copies</label>
                <input
                  type="number"
                  value={formData.numberOfCopies}
                  onChange={(e) => setFormData({ ...formData, numberOfCopies: Number(e.target.value) })}
                  className="w-full px-4 py-2.5 rounded-lg bg-white/5 border border-white/10 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  min="1"
                  max="5"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <label className="flex items-center gap-3 p-4 rounded-lg bg-white/5 border border-white/10 cursor-pointer hover:bg-white/10 transition-colors">
                <input
                  type="checkbox"
                  checked={formData.autoCut}
                  onChange={(e) => setFormData({ ...formData, autoCut: e.target.checked })}
                  className="w-5 h-5 rounded border-white/20 bg-white/5 text-blue-500"
                />
                <div>
                  <div className="font-medium">Auto Cut</div>
                  <div className="text-xs text-gray-400">Automatically cut paper after print</div>
                </div>
              </label>

              <label className="flex items-center gap-3 p-4 rounded-lg bg-white/5 border border-white/10 cursor-pointer hover:bg-white/10 transition-colors">
                <input
                  type="checkbox"
                  checked={formData.openCashDrawer}
                  onChange={(e) => setFormData({ ...formData, openCashDrawer: e.target.checked })}
                  className="w-5 h-5 rounded border-white/20 bg-white/5 text-blue-500"
                />
                <div>
                  <div className="font-medium">Open Cash Drawer</div>
                  <div className="text-xs text-gray-400">Trigger cash drawer after print</div>
                </div>
              </label>

              <label className="flex items-center gap-3 p-4 rounded-lg bg-white/5 border border-white/10 cursor-pointer hover:bg-white/10 transition-colors">
                <input
                  type="checkbox"
                  checked={formData.printHeader}
                  onChange={(e) => setFormData({ ...formData, printHeader: e.target.checked })}
                  className="w-5 h-5 rounded border-white/20 bg-white/5 text-blue-500"
                />
                <div>
                  <div className="font-medium">Print Header</div>
                  <div className="text-xs text-gray-400">Include header text</div>
                </div>
              </label>

              <label className="flex items-center gap-3 p-4 rounded-lg bg-white/5 border border-white/10 cursor-pointer hover:bg-white/10 transition-colors">
                <input
                  type="checkbox"
                  checked={formData.printFooter}
                  onChange={(e) => setFormData({ ...formData, printFooter: e.target.checked })}
                  className="w-5 h-5 rounded border-white/20 bg-white/5 text-blue-500"
                />
                <div>
                  <div className="font-medium">Print Footer</div>
                  <div className="text-xs text-gray-400">Include footer text</div>
                </div>
              </label>
            </div>

            {formData.printHeader && (
              <div>
                <label className="block text-sm font-medium mb-2">Header Text</label>
                <textarea
                  value={formData.headerText}
                  onChange={(e) => setFormData({ ...formData, headerText: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-lg bg-white/5 border border-white/10 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  rows={2}
                  placeholder="Thank you for your business!"
                />
              </div>
            )}

            {formData.printFooter && (
              <div>
                <label className="block text-sm font-medium mb-2">Footer Text</label>
                <textarea
                  value={formData.footerText}
                  onChange={(e) => setFormData({ ...formData, footerText: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-lg bg-white/5 border border-white/10 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  rows={2}
                  placeholder="Visit us again!"
                />
              </div>
            )}
          </div>

          {/* Advanced Settings */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white/90">Advanced Settings</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <label className="flex items-center gap-3 p-4 rounded-lg bg-white/5 border border-white/10 cursor-pointer hover:bg-white/10 transition-colors">
                <input
                  type="checkbox"
                  checked={formData.isDefault}
                  onChange={(e) => setFormData({ ...formData, isDefault: e.target.checked })}
                  className="w-5 h-5 rounded border-white/20 bg-white/5 text-blue-500"
                />
                <div>
                  <div className="font-medium">Set as Default</div>
                  <div className="text-xs text-gray-400">Use as default printer for this type</div>
                </div>
              </label>

              {printer && (
                <label className="flex items-center gap-3 p-4 rounded-lg bg-white/5 border border-white/10 cursor-pointer hover:bg-white/10 transition-colors">
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    className="w-5 h-5 rounded border-white/20 bg-white/5 text-blue-500"
                  />
                  <div>
                    <div className="font-medium">Active</div>
                    <div className="text-xs text-gray-400">Enable/disable this printer</div>
                  </div>
                </label>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t border-white/10">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="flex-1"
            >
              {loading ? 'Saving...' : printer ? 'Update Printer' : 'Create Printer'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
