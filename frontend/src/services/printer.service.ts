import { apiService } from './api.service';

export interface Printer {
  id: string;
  name: string;
  branch_id: string;
  branch?: {
    id: string;
    name: string;
  };
  printer_type: 'receipt' | 'kitchen' | 'bar' | 'label';
  connection_type: 'network' | 'usb' | 'bluetooth';
  status: 'online' | 'offline' | 'error';
  ip_address: string | null;
  port: number | null;
  usb_path: string | null;
  bluetooth_address: string | null;
  model: string | null;
  manufacturer: string | null;
  paper_width: number;
  number_of_copies: number;
  auto_cut: boolean;
  open_cash_drawer: boolean;
  print_header: boolean;
  print_footer: boolean;
  header_text: string | null;
  footer_text: string | null;
  character_encoding: string;
  is_default: boolean;
  is_active: boolean;
  last_connected_at: string | null;
  last_error: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreatePrinterRequest {
  name: string;
  branchId: string;
  printerType: 'receipt' | 'kitchen' | 'bar' | 'label';
  connectionType: 'network' | 'usb' | 'bluetooth';
  ipAddress?: string;
  port?: number;
  usbPath?: string;
  bluetoothAddress?: string;
  model?: string;
  manufacturer?: string;
  paperWidth?: number;
  numberOfCopies?: number;
  autoCut?: boolean;
  openCashDrawer?: boolean;
  printHeader?: boolean;
  printFooter?: boolean;
  headerText?: string;
  footerText?: string;
  characterEncoding?: string;
  isDefault?: boolean;
}

export interface UpdatePrinterRequest extends Partial<CreatePrinterRequest> {
  isActive?: boolean;
}

export const printerService = {
  async getAll(params?: {
    branchId?: string;
    printerType?: string;
    status?: string;
    isActive?: boolean;
  }): Promise<Printer[]> {
    const response = await apiService.get('/printers', { params });
    return response.data;
  },

  async getById(id: string): Promise<Printer> {
    const response = await apiService.get(`/printers/${id}`);
    return response.data;
  },

  async getByBranch(branchId: string): Promise<Printer[]> {
    const response = await apiService.get(`/printers/branch/${branchId}`);
    return response.data;
  },

  async getDefault(branchId: string, printerType?: string): Promise<Printer> {
    const response = await apiService.get(`/printers/branch/${branchId}/default`, {
      params: { printerType },
    });
    return response.data;
  },

  async create(data: CreatePrinterRequest): Promise<Printer> {
    const response = await apiService.post('/printers', data);
    return response.data;
  },

  async update(id: string, data: UpdatePrinterRequest): Promise<Printer> {
    const response = await apiService.put(`/printers/${id}`, data);
    return response.data;
  },

  async delete(id: string): Promise<void> {
    await apiService.delete(`/printers/${id}`);
  },

  async testConnection(id: string): Promise<{ success: boolean; message: string }> {
    const response = await apiService.post(`/printers/${id}/test`);
    return response.data;
  },
};
