/**
 * Thermal Printer Utility
 * Handles printing to ESC/POS thermal printers via Web Bluetooth API or USB
 */

interface PrinterConfig {
  type: 'bluetooth' | 'usb' | 'network';
  characterWidth?: number; // Default 32 or 48 characters
  encoding?: string; // Default 'utf-8'
}

interface OrderPrintData {
  restaurantName: string;
  branchName?: string;
  address?: string;
  phone?: string;
  gstNumber?: string;
  orderNumber: string;
  orderType: string;
  orderDate: string;
  tableName?: string;
  customerName?: string;
  items: Array<{
    name: string;
    quantity: number;
    price: number;
    total: number;
    notes?: string;
  }>;
  subtotal: number;
  tax: number;
  discount: number;
  grandTotal: number;
  paidAmount?: number;
  dueAmount?: number;
  paymentStatus: string;
  payments?: Array<{
    method: string;
    amount: number;
    transactionId?: string;
    date: string;
  }>;
  specialInstructions?: string;
}

// ESC/POS Commands
const ESC = '\x1B';
const GS = '\x1D';

const Commands = {
  INIT: ESC + '@',
  ALIGN_LEFT: ESC + 'a' + '\x00',
  ALIGN_CENTER: ESC + 'a' + '\x01',
  ALIGN_RIGHT: ESC + 'a' + '\x02',
  FONT_SIZE_NORMAL: GS + '!' + '\x00',
  FONT_SIZE_DOUBLE: GS + '!' + '\x11',
  FONT_SIZE_LARGE: GS + '!' + '\x22',
  BOLD_ON: ESC + 'E' + '\x01',
  BOLD_OFF: ESC + 'E' + '\x00',
  UNDERLINE_ON: ESC + '-' + '\x01',
  UNDERLINE_OFF: ESC + '-' + '\x00',
  LINE_FEED: '\n',
  CUT_PAPER: GS + 'V' + '\x41' + '\x00',
  DRAWER_OPEN: ESC + 'p' + '\x00' + '\x19' + '\xFA',
};

class ThermalPrinter {
  private device: BluetoothDevice | null = null;
  private characteristic: BluetoothRemoteGATTCharacteristic | null = null;
  private config: PrinterConfig;
  private encoder: TextEncoder;

  constructor(config: PrinterConfig = { type: 'bluetooth', characterWidth: 32 }) {
    this.config = config;
    this.encoder = new TextEncoder();
  }

  /**
   * Connect to Bluetooth printer
   */
  async connectBluetooth(): Promise<void> {
    try {
      // Request Bluetooth device
      this.device = await navigator.bluetooth.requestDevice({
        filters: [
          { services: ['000018f0-0000-1000-8000-00805f9b34fb'] }, // Common ESC/POS service
        ],
        optionalServices: [
          '000018f0-0000-1000-8000-00805f9b34fb',
          '49535343-fe7d-4ae5-8fa9-9fafd205e455', // Some printers use this
        ],
      });

      if (!this.device.gatt) {
        throw new Error('GATT not available on device');
      }

      const server = await this.device.gatt.connect();
      
      // Try to get the service
      let service;
      try {
        service = await server.getPrimaryService('000018f0-0000-1000-8000-00805f9b34fb');
      } catch {
        service = await server.getPrimaryService('49535343-fe7d-4ae5-8fa9-9fafd205e455');
      }

      // Get characteristic for writing
      const characteristics = await service.getCharacteristics();
      this.characteristic = characteristics.find(c => c.properties.write) || characteristics[0];

      console.log('Bluetooth printer connected successfully');
    } catch (error) {
      console.error('Failed to connect to Bluetooth printer:', error);
      throw new Error('Failed to connect to Bluetooth printer. Make sure Bluetooth is enabled and printer is in pairing mode.');
    }
  }

  /**
   * Connect to USB printer using Web Serial API
   */
  async connectUSB(): Promise<void> {
    try {
      // @ts-ignore - Web Serial API
      if (!navigator.serial) {
        throw new Error('Web Serial API not supported in this browser');
      }

      // @ts-ignore
      const port = await navigator.serial.requestPort();
      // @ts-ignore
      await port.open({ baudRate: 9600 });

      console.log('USB printer connected successfully');
    } catch (error) {
      console.error('Failed to connect to USB printer:', error);
      throw new Error('Failed to connect to USB printer');
    }
  }

  /**
   * Check if printer is connected
   */
  isConnected(): boolean {
    return this.characteristic !== null;
  }

  /**
   * Send raw data to printer
   */
  private async sendData(data: string): Promise<void> {
    if (!this.characteristic) {
      throw new Error('Printer not connected');
    }

    const encoded = this.encoder.encode(data);
    
    // Split into chunks if needed (some printers have buffer limits)
    const chunkSize = 512;
    for (let i = 0; i < encoded.length; i += chunkSize) {
      const chunk = encoded.slice(i, i + chunkSize);
      await this.characteristic.writeValue(chunk);
      // Small delay between chunks
      await new Promise(resolve => setTimeout(resolve, 50));
    }
  }

  /**
   * Format text to fit printer width
   */
  private formatLine(left: string, right: string = '', width: number = 32): string {
    const totalLen = left.length + right.length;
    if (totalLen >= width) {
      return left.substring(0, width - right.length - 1) + ' ' + right;
    }
    const spaces = width - totalLen;
    return left + ' '.repeat(spaces) + right;
  }

  /**
   * Create separator line
   */
  private separator(char: string = '-', width: number = 32): string {
    return char.repeat(width) + Commands.LINE_FEED;
  }

  /**
   * Print order receipt
   */
  async printOrder(data: OrderPrintData): Promise<void> {
    if (!this.isConnected()) {
      throw new Error('Printer not connected. Please connect to printer first.');
    }

    const width = this.config.characterWidth || 32;
    let receipt = '';

    // Initialize printer
    receipt += Commands.INIT;

    // Header - Restaurant Name
    receipt += Commands.ALIGN_CENTER;
    receipt += Commands.FONT_SIZE_LARGE;
    receipt += Commands.BOLD_ON;
    receipt += data.restaurantName + Commands.LINE_FEED;
    receipt += Commands.FONT_SIZE_NORMAL;
    receipt += Commands.BOLD_OFF;

    if (data.branchName) {
      receipt += data.branchName + Commands.LINE_FEED;
    }

    if (data.address) {
      receipt += data.address + Commands.LINE_FEED;
    }

    if (data.phone) {
      receipt += 'Ph: ' + data.phone + Commands.LINE_FEED;
    }

    if (data.gstNumber) {
      receipt += 'GST: ' + data.gstNumber + Commands.LINE_FEED;
    }

    receipt += this.separator('=', width);

    // Order Info
    receipt += Commands.ALIGN_LEFT;
    receipt += Commands.BOLD_ON;
    receipt += this.formatLine('Order#:', data.orderNumber, width) + Commands.LINE_FEED;
    receipt += Commands.BOLD_OFF;
    receipt += this.formatLine('Date:', data.orderDate, width) + Commands.LINE_FEED;
    receipt += this.formatLine('Type:', data.orderType, width) + Commands.LINE_FEED;

    if (data.tableName) {
      receipt += this.formatLine('Table:', data.tableName, width) + Commands.LINE_FEED;
    }

    if (data.customerName) {
      receipt += this.formatLine('Customer:', data.customerName, width) + Commands.LINE_FEED;
    }

    receipt += this.separator('-', width);

    // Special Instructions
    if (data.specialInstructions) {
      receipt += Commands.BOLD_ON;
      receipt += 'NOTES:' + Commands.LINE_FEED;
      receipt += Commands.BOLD_OFF;
      receipt += data.specialInstructions + Commands.LINE_FEED;
      receipt += this.separator('-', width);
    }

    // Items Header
    receipt += Commands.BOLD_ON;
    receipt += 'ITEMS' + Commands.LINE_FEED;
    receipt += Commands.BOLD_OFF;
    receipt += this.separator('-', width);

    // Items
    data.items.forEach(item => {
      const itemLine = `${item.name}`;
      receipt += itemLine + Commands.LINE_FEED;
      
      const qtyPrice = this.formatLine(
        `  ${item.quantity} x Rs.${item.price.toFixed(2)}`,
        `Rs.${item.total.toFixed(2)}`,
        width
      );
      receipt += qtyPrice + Commands.LINE_FEED;

      if (item.notes) {
        receipt += `  Note: ${item.notes}` + Commands.LINE_FEED;
      }
    });

    receipt += this.separator('-', width);

    // Totals
    receipt += this.formatLine('Subtotal:', `Rs.${data.subtotal.toFixed(2)}`, width) + Commands.LINE_FEED;
    
    if (data.tax > 0) {
      receipt += this.formatLine('Tax:', `Rs.${data.tax.toFixed(2)}`, width) + Commands.LINE_FEED;
    }

    if (data.discount > 0) {
      receipt += this.formatLine('Discount:', `-Rs.${data.discount.toFixed(2)}`, width) + Commands.LINE_FEED;
    }

    receipt += this.separator('-', width);

    receipt += Commands.FONT_SIZE_DOUBLE;
    receipt += Commands.BOLD_ON;
    receipt += this.formatLine('TOTAL:', `Rs.${data.grandTotal.toFixed(2)}`, width / 2) + Commands.LINE_FEED;
    receipt += Commands.FONT_SIZE_NORMAL;
    receipt += Commands.BOLD_OFF;

    receipt += this.separator('=', width);

    // Payment Details
    receipt += Commands.BOLD_ON;
    receipt += 'PAYMENT DETAILS' + Commands.LINE_FEED;
    receipt += Commands.BOLD_OFF;
    receipt += this.formatLine('Status:', data.paymentStatus.toUpperCase(), width) + Commands.LINE_FEED;

    if (data.paidAmount !== undefined && data.paidAmount > 0) {
      receipt += this.formatLine('Paid:', `Rs.${data.paidAmount.toFixed(2)}`, width) + Commands.LINE_FEED;
    }

    if (data.dueAmount !== undefined && data.dueAmount > 0) {
      receipt += Commands.BOLD_ON;
      receipt += this.formatLine('DUE:', `Rs.${data.dueAmount.toFixed(2)}`, width) + Commands.LINE_FEED;
      receipt += Commands.BOLD_OFF;
    }

    // Payment transactions
    if (data.payments && data.payments.length > 0) {
      receipt += this.separator('-', width);
      data.payments.forEach((payment, idx) => {
        receipt += `Payment #${idx + 1}` + Commands.LINE_FEED;
        receipt += this.formatLine(`  ${payment.method}`, `Rs.${payment.amount.toFixed(2)}`, width) + Commands.LINE_FEED;
        if (payment.transactionId) {
          receipt += `  Txn: ${payment.transactionId}` + Commands.LINE_FEED;
        }
      });
    }

    receipt += this.separator('=', width);

    // Footer
    receipt += Commands.ALIGN_CENTER;
    receipt += Commands.LINE_FEED;
    receipt += 'Thank you for dining with us!' + Commands.LINE_FEED;
    receipt += 'Please visit again' + Commands.LINE_FEED;
    receipt += Commands.LINE_FEED;
    receipt += new Date().toLocaleString('en-IN') + Commands.LINE_FEED;
    receipt += Commands.LINE_FEED;
    receipt += Commands.LINE_FEED;
    receipt += Commands.LINE_FEED;

    // Cut paper
    receipt += Commands.CUT_PAPER;

    // Send to printer
    await this.sendData(receipt);
  }

  /**
   * Print KOT (Kitchen Order Ticket)
   */
  async printKOT(data: {
    orderNumber: string;
    tableName: string;
    items: Array<{ name: string; quantity: number; notes?: string }>;
    time: string;
  }): Promise<void> {
    if (!this.isConnected()) {
      throw new Error('Printer not connected');
    }

    const width = this.config.characterWidth || 32;
    let receipt = Commands.INIT;

    receipt += Commands.ALIGN_CENTER;
    receipt += Commands.FONT_SIZE_LARGE;
    receipt += Commands.BOLD_ON;
    receipt += 'KITCHEN ORDER' + Commands.LINE_FEED;
    receipt += Commands.FONT_SIZE_NORMAL;
    receipt += Commands.BOLD_OFF;
    receipt += this.separator('=', width);

    receipt += Commands.ALIGN_LEFT;
    receipt += Commands.FONT_SIZE_DOUBLE;
    receipt += `Table: ${data.tableName}` + Commands.LINE_FEED;
    receipt += Commands.FONT_SIZE_NORMAL;
    receipt += `Order: ${data.orderNumber}` + Commands.LINE_FEED;
    receipt += `Time: ${data.time}` + Commands.LINE_FEED;
    receipt += this.separator('-', width);

    data.items.forEach(item => {
      receipt += Commands.FONT_SIZE_DOUBLE;
      receipt += Commands.BOLD_ON;
      receipt += `${item.quantity}x ${item.name}` + Commands.LINE_FEED;
      receipt += Commands.FONT_SIZE_NORMAL;
      receipt += Commands.BOLD_OFF;
      if (item.notes) {
        receipt += `   >>> ${item.notes}` + Commands.LINE_FEED;
      }
      receipt += Commands.LINE_FEED;
    });

    receipt += Commands.LINE_FEED;
    receipt += Commands.LINE_FEED;
    receipt += Commands.CUT_PAPER;

    await this.sendData(receipt);
  }

  /**
   * Test print
   */
  async testPrint(): Promise<void> {
    if (!this.isConnected()) {
      throw new Error('Printer not connected');
    }

    let receipt = Commands.INIT;
    receipt += Commands.ALIGN_CENTER;
    receipt += Commands.FONT_SIZE_DOUBLE;
    receipt += Commands.BOLD_ON;
    receipt += 'TEST PRINT' + Commands.LINE_FEED;
    receipt += Commands.FONT_SIZE_NORMAL;
    receipt += Commands.BOLD_OFF;
    receipt += Commands.LINE_FEED;
    receipt += 'Printer is working correctly!' + Commands.LINE_FEED;
    receipt += Commands.LINE_FEED;
    receipt += new Date().toLocaleString() + Commands.LINE_FEED;
    receipt += Commands.LINE_FEED;
    receipt += Commands.LINE_FEED;
    receipt += Commands.CUT_PAPER;

    await this.sendData(receipt);
  }

  /**
   * Disconnect printer
   */
  async disconnect(): Promise<void> {
    if (this.device?.gatt?.connected) {
      await this.device.gatt.disconnect();
    }
    this.device = null;
    this.characteristic = null;
  }
}

// Singleton instance
let printerInstance: ThermalPrinter | null = null;

export const getThermalPrinter = (config?: PrinterConfig): ThermalPrinter => {
  if (!printerInstance) {
    printerInstance = new ThermalPrinter(config);
  }
  return printerInstance;
};

export { ThermalPrinter, type OrderPrintData, type PrinterConfig };
