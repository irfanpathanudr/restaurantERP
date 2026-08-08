/**
 * ESC/POS printer utility for Pegasus PM5822 (58mm Bluetooth thermal printer)
 *
 * Pegasus PM5822 specs:
 *   - Paper width: 58mm
 *   - Print width: 48mm
 *   - Characters per line: 32 (normal font)
 *   - Interface: Bluetooth (BLE / Classic SPP)
 *   - Protocol: ESC/POS
 *   - Service UUID: 0x1812 or generic SPP 00001101-0000-1000-8000-00805F9B34FB
 */

// ─── ESC/POS byte constants ──────────────────────────────────────────────────
const ESC = 0x1b;
const GS  = 0x1d;
const LF  = 0x0a;
const NUL = 0x00;

export const CMD = {
  INIT:            [ESC, 0x40],              // Initialize printer
  ALIGN_LEFT:      [ESC, 0x61, 0x00],        // Left align
  ALIGN_CENTER:    [ESC, 0x61, 0x01],        // Center align
  ALIGN_RIGHT:     [ESC, 0x61, 0x02],        // Right align
  BOLD_ON:         [ESC, 0x45, 0x01],        // Bold on
  BOLD_OFF:        [ESC, 0x45, 0x00],        // Bold off
  DOUBLE_HEIGHT:   [ESC, 0x21, 0x10],        // Double height text
  DOUBLE_BOTH:     [ESC, 0x21, 0x30],        // Double width + height
  NORMAL_SIZE:     [ESC, 0x21, 0x00],        // Normal size
  UNDERLINE_ON:    [ESC, 0x2d, 0x01],        // Underline on
  UNDERLINE_OFF:   [ESC, 0x2d, 0x00],        // Underline off
  FEED_LINE:       [LF],                     // Line feed
  FEED_LINES_3:    [ESC, 0x64, 0x03],        // Feed 3 lines
  CUT_PARTIAL:     [GS, 0x56, 0x01],         // Partial cut
  CUT_FULL:        [GS, 0x56, 0x00],         // Full cut
  OPEN_DRAWER:     [ESC, 0x70, 0x00, 0x19, 0xfa], // Open cash drawer
};

// 58mm printer = 32 chars per line in normal font
export const COLS = 32;

// ─── Bluetooth UUIDs used by most ESC/POS Bluetooth printers ─────────────────
const PRINTER_SERVICE_UUIDS = [
  '000018f0-0000-1000-8000-00805f9b34fb', // Common ESC/POS BLE service
  '00001101-0000-1000-8000-00805f9b34fb', // Serial Port Profile (SPP)
  'e7810a71-73ae-499d-8c15-faa9aef0c3f2', // Xprinter / Pegasus BLE
  '49535343-fe7d-4ae5-8fa9-9fafd205e455', // Another common BLE printer
];

const PRINTER_CHAR_UUIDS = [
  '00002af1-0000-1000-8000-00805f9b34fb',
  '000018f1-0000-1000-8000-00805f9b34fb',
  '49535343-8841-43f4-a8d4-ecbe34729bb3',
  'bef8d6c9-9c21-4c9e-b632-bd58c1009f9f',
];

// ─── Encoder ─────────────────────────────────────────────────────────────────
function encode(text: string): Uint8Array {
  // Simple ASCII / Latin1 encoder — sufficient for receipt text
  const bytes = new Uint8Array(text.length);
  for (let i = 0; i < text.length; i++) {
    bytes[i] = text.charCodeAt(i) & 0xff;
  }
  return bytes;
}

function bytes(...cmds: (number[] | Uint8Array)[]): Uint8Array {
  const all: number[] = [];
  for (const c of cmds) all.push(...c);
  return new Uint8Array(all);
}

// ─── Layout helpers ───────────────────────────────────────────────────────────
export function center(text: string, width = COLS): string {
  if (text.length >= width) return text.substring(0, width);
  const pad = Math.floor((width - text.length) / 2);
  return ' '.repeat(pad) + text;
}

export function leftRight(left: string, right: string, width = COLS): string {
  const gap = width - left.length - right.length;
  if (gap <= 0) return (left + ' ' + right).substring(0, width);
  return left + ' '.repeat(gap) + right;
}

export function divider(char = '-', width = COLS): string {
  return char.repeat(width);
}

// ─── Buffer builder ───────────────────────────────────────────────────────────
export class EscPosBuilder {
  private buf: number[] = [];

  private add(...cmds: (number[] | Uint8Array)[]): this {
    for (const c of cmds) this.buf.push(...c);
    return this;
  }

  init(): this { return this.add(CMD.INIT); }

  text(str: string): this { return this.add(encode(str)); }
  line(str = ''): this { return this.text(str).lf(); }
  lf(): this { return this.add(CMD.FEED_LINE); }

  center(str: string): this { return this.add(CMD.ALIGN_CENTER).line(str).add(CMD.ALIGN_LEFT); }
  right(str: string): this  { return this.add(CMD.ALIGN_RIGHT).line(str).add(CMD.ALIGN_LEFT); }

  bold(str: string): this {
    return this.add(CMD.BOLD_ON).text(str).add(CMD.BOLD_OFF);
  }
  boldLine(str: string): this { return this.bold(str).lf(); }

  doubleHeight(str: string): this {
    return this.add(CMD.DOUBLE_HEIGHT).text(str).add(CMD.NORMAL_SIZE);
  }
  doubleBoth(str: string): this {
    return this.add(CMD.DOUBLE_BOTH).text(str).add(CMD.NORMAL_SIZE);
  }

  divider(char = '-'): this { return this.line(divider(char)); }

  leftRight(l: string, r: string): this { return this.line(leftRight(l, r)); }

  feedLines(n = 3): this {
    for (let i = 0; i < n; i++) this.lf();
    return this;
  }

  cut(): this { return this.add(CMD.CUT_PARTIAL); }

  build(): Uint8Array { return new Uint8Array(this.buf); }
}

// ─── Bluetooth print sender ───────────────────────────────────────────────────
let _cachedDevice: BluetoothDevice | null = null;
let _cachedChar: BluetoothRemoteGATTCharacteristic | null = null;

export async function connectPrinter(): Promise<BluetoothRemoteGATTCharacteristic> {
  if (!navigator.bluetooth) {
    throw new Error(
      'Web Bluetooth is not supported in this browser. Use Chrome on Android/Desktop.'
    );
  }

  // Re-use cached connection if still connected
  if (
    _cachedDevice?.gatt?.connected &&
    _cachedChar
  ) {
    return _cachedChar;
  }

  // Request any Bluetooth device (user picks from OS dialog)
  const device = await navigator.bluetooth.requestDevice({
    acceptAllDevices: true,
    optionalServices: PRINTER_SERVICE_UUIDS,
  });

  _cachedDevice = device;
  device.addEventListener('gattserverdisconnected', () => {
    _cachedDevice = null;
    _cachedChar = null;
  });

  const server = await device.gatt!.connect();

  // Try each known service UUID until one works
  let characteristic: BluetoothRemoteGATTCharacteristic | null = null;

  for (const serviceUuid of PRINTER_SERVICE_UUIDS) {
    try {
      const service = await server.getPrimaryService(serviceUuid);
      for (const charUuid of PRINTER_CHAR_UUIDS) {
        try {
          characteristic = await service.getCharacteristic(charUuid);
          if (characteristic) break;
        } catch { /* try next */ }
      }
      // If no known char UUID, try getting all characteristics
      if (!characteristic) {
        const allChars = await service.getCharacteristics();
        for (const ch of allChars) {
          if (ch.properties.write || ch.properties.writeWithoutResponse) {
            characteristic = ch;
            break;
          }
        }
      }
      if (characteristic) break;
    } catch { /* try next service */ }
  }

  if (!characteristic) {
    throw new Error(
      'Printer found but no writable characteristic detected. ' +
      'Make sure the Pegasus PM5822 is powered on and in pairing mode.'
    );
  }

  _cachedChar = characteristic;
  return characteristic;
}

export async function sendRaw(data: Uint8Array): Promise<void> {
  const char = await connectPrinter();

  // BLE has a 512-byte MTU limit per write; chunk larger payloads
  const CHUNK = 512;
  for (let offset = 0; offset < data.length; offset += CHUNK) {
    const chunk = data.slice(offset, offset + CHUNK);
    try {
      await char.writeValueWithoutResponse(chunk);
    } catch {
      // Fallback for older BLE stacks
      await char.writeValue(chunk);
    }
    // Small delay between chunks to avoid buffer overflow on printer
    if (offset + CHUNK < data.length) {
      await new Promise((r) => setTimeout(r, 50));
    }
  }
}

export function disconnectPrinter(): void {
  if (_cachedDevice?.gatt?.connected) {
    _cachedDevice.gatt.disconnect();
  }
  _cachedDevice = null;
  _cachedChar = null;
}

// ─── High-level print functions ───────────────────────────────────────────────

/** Print a KOT ticket to the Pegasus PM5822 via Bluetooth */
export async function printKotBluetooth(payload: {
  kotNumber: string;
  tableNumber: string;
  kitchen: string;
  printCount: number;
  isReprint: boolean;
  specialInstructions?: string | null;
  items: { name: string; quantity: number; specialInstructions?: string | null }[];
}): Promise<void> {
  const b = new EscPosBuilder();

  b.init();
  b.feedLines(1);

  // Header
  b.add(CMD.ALIGN_CENTER);
  b.add(CMD.BOLD_ON);
  b.add(CMD.DOUBLE_BOTH);
  b.text('KOT').lf();
  b.add(CMD.NORMAL_SIZE);
  b.add(CMD.BOLD_OFF);
  b.add(CMD.ALIGN_LEFT);

  b.center('** ' + (payload.isReprint ? 'REPRINT' : 'NEW ORDER') + ' **');
  b.lf();

  // Meta
  b.divider();
  b.leftRight('KOT#:', payload.kotNumber);
  b.leftRight('Table:', payload.tableNumber);
  if (payload.kitchen) b.leftRight('Kitchen:', payload.kitchen);
  b.leftRight('Print#:', String(payload.printCount));
  b.divider();

  // Items
  for (const item of payload.items) {
    const qty = `${item.quantity}x`;
    // Truncate item name to fit: COLS - qty.length - 1
    const maxName = COLS - qty.length - 1;
    const name = item.name.length > maxName
      ? item.name.substring(0, maxName - 1) + '.'
      : item.name;
    b.add(CMD.BOLD_ON);
    b.line(leftRight(qty, name.padEnd(maxName)));
    b.add(CMD.BOLD_OFF);
    if (item.specialInstructions) {
      b.line('  >> ' + item.specialInstructions.substring(0, COLS - 5));
    }
  }

  b.divider();

  if (payload.specialInstructions) {
    b.line('Note: ' + payload.specialInstructions.substring(0, COLS - 6));
    b.divider();
  }

  b.feedLines(4);
  b.cut();

  await sendRaw(b.build());
}

/** Print a bill/receipt to the Pegasus PM5822 via Bluetooth */
export async function printBillBluetooth(order: {
  order_number: string;
  restaurant_name?: string;
  branch_name?: string;
  table?: { table_number: string } | null;
  order_items?: {
    item_name: string;
    quantity: number;
    unit_price?: number | string;
    total: number | string;
  }[];
  subtotal: number | string;
  tax_amount: number | string;
  discount_amount?: number | string;
  grand_total: number | string;
  payment_method?: string;
}): Promise<void> {
  const fmt = (n: number | string | undefined | null) =>
    'Rs.' + (Number(n) || 0).toFixed(2);

  const b = new EscPosBuilder();

  b.init();
  b.feedLines(1);

  // Restaurant name header
  b.add(CMD.ALIGN_CENTER);
  b.add(CMD.BOLD_ON);
  b.add(CMD.DOUBLE_HEIGHT);
  b.text((order.restaurant_name || 'Restaurant').substring(0, COLS)).lf();
  b.add(CMD.NORMAL_SIZE);
  b.add(CMD.BOLD_OFF);

  if (order.branch_name) {
    b.center(order.branch_name.substring(0, COLS));
  }
  b.add(CMD.ALIGN_LEFT);
  b.lf();

  // Bill info
  b.divider('=');
  b.center('RECEIPT / BILL');
  b.divider('=');

  b.leftRight('Order:', order.order_number);
  b.leftRight('Table:', order.table?.table_number || 'N/A');
  b.leftRight('Date:', new Date().toLocaleDateString('en-IN'));
  b.leftRight('Time:', new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }));
  b.divider();

  // Column header
  b.line(
    'Item'.padEnd(COLS - 10) +
    'Qty'.padStart(4) +
    'Amt'.padStart(6)
  );
  b.divider();

  // Items
  for (const item of order.order_items || []) {
    const name = item.item_name.substring(0, COLS - 12);
    const qty  = String(item.quantity).padStart(4);
    const amt  = fmt(item.total).padStart(6);
    b.line((name + qty + amt).substring(0, COLS));
  }

  b.divider();

  // Totals
  b.leftRight('Subtotal:', fmt(order.subtotal));
  if (Number(order.discount_amount) > 0) {
    b.leftRight('Discount:', '-' + fmt(order.discount_amount));
  }
  b.leftRight('Tax:', fmt(order.tax_amount));
  b.divider('=');

  b.add(CMD.BOLD_ON);
  b.add(CMD.DOUBLE_HEIGHT);
  b.leftRight('TOTAL:', fmt(order.grand_total));
  b.add(CMD.NORMAL_SIZE);
  b.add(CMD.BOLD_OFF);

  b.divider('=');

  if (order.payment_method) {
    b.center('Paid by: ' + order.payment_method.toUpperCase());
    b.lf();
  }

  // Footer
  b.lf();
  b.center('Thank you for your visit!');
  b.center('Please come again');
  b.feedLines(4);
  b.cut();

  await sendRaw(b.build());
}

// ─── Fallback: browser print (non-Bluetooth environments) ────────────────────
export function printKotFallback(payload: Parameters<typeof printKotBluetooth>[0]): void {
  const win = window.open('', '_blank', 'width=320,height=600');
  if (!win) return;

  const rows = payload.items
    .map(
      (i) =>
        `<tr>
          <td style="padding:3px 6px 3px 0;font-weight:bold">${i.quantity}x</td>
          <td style="padding:3px 0">${i.name}${
            i.specialInstructions
              ? `<br/><span style="color:#b45309;font-size:11px">&raquo; ${i.specialInstructions}</span>`
              : ''
          }</td>
        </tr>`
    )
    .join('');

  win.document.write(`<!DOCTYPE html><html><head>
    <meta charset="utf-8"/>
    <title>KOT ${payload.kotNumber}</title>
    <style>
      *{box-sizing:border-box}
      body{font-family:'Courier New',monospace;font-size:12px;width:58mm;padding:4mm;margin:0}
      h1{font-size:15px;text-align:center;margin:0 0 4px}
      .sub{text-align:center;font-size:11px;margin-bottom:6px}
      table{width:100%;border-collapse:collapse}
      .div{border-top:1px dashed #000;margin:6px 0}
      .row{display:flex;justify-content:space-between}
      @media print{
        @page{size:58mm auto;margin:0}
        body{width:58mm}
      }
    </style>
  </head><body>
    <h1>KOT ${payload.kotNumber}</h1>
    <div class="sub">${payload.isReprint ? '** REPRINT **' : '** NEW ORDER **'}</div>
    <div class="div"></div>
    <div class="row"><span>Table:</span><span><b>${payload.tableNumber}</b></span></div>
    ${payload.kitchen ? `<div class="row"><span>Kitchen:</span><span>${payload.kitchen}</span></div>` : ''}
    <div class="row"><span>Print#:</span><span>${payload.printCount}</span></div>
    <div class="div"></div>
    <table>${rows}</table>
    ${payload.specialInstructions ? `<div class="div"></div><div>Note: ${payload.specialInstructions}</div>` : ''}
    <div class="div"></div>
    <script>window.onload=()=>{window.print();setTimeout(()=>window.close(),600)}</script>
  </body></html>`);
  win.document.close();
}

export function printBillFallback(order: Parameters<typeof printBillBluetooth>[0]): void {
  const fmt = (n: number | string | undefined | null) =>
    'Rs.' + (Number(n) || 0).toFixed(2);

  const win = window.open('', '_blank', 'width=320,height=700');
  if (!win) return;

  const rows = (order.order_items || [])
    .map(
      (i) =>
        `<tr>
          <td style="padding:3px 0">${i.item_name}</td>
          <td style="text-align:center;padding:3px 4px">${i.quantity}</td>
          <td style="text-align:right;padding:3px 0">${fmt(i.total)}</td>
        </tr>`
    )
    .join('');

  win.document.write(`<!DOCTYPE html><html><head>
    <meta charset="utf-8"/>
    <title>Bill ${order.order_number}</title>
    <style>
      *{box-sizing:border-box}
      body{font-family:'Courier New',monospace;font-size:12px;width:58mm;padding:4mm;margin:0}
      h1{font-size:15px;text-align:center;margin:0 0 2px}
      .sub{text-align:center;font-size:11px}
      table{width:100%;border-collapse:collapse}
      th{text-align:left;font-size:11px;border-bottom:1px solid #000;padding:3px 0}
      th:last-child,td:last-child{text-align:right}
      th:nth-child(2),td:nth-child(2){text-align:center}
      .div{border-top:1px dashed #000;margin:5px 0}
      .row{display:flex;justify-content:space-between;padding:2px 0}
      .total{font-size:14px;font-weight:bold}
      .footer{text-align:center;font-size:10px;margin-top:6px}
      @media print{
        @page{size:58mm auto;margin:0}
        body{width:58mm}
      }
    </style>
  </head><body>
    <h1>${order.restaurant_name || 'Restaurant'}</h1>
    ${order.branch_name ? `<div class="sub">${order.branch_name}</div>` : ''}
    <div class="div"></div>
    <div class="sub"><b>RECEIPT / BILL</b></div>
    <div class="div"></div>
    <div class="row"><span>Order:</span><span>${order.order_number}</span></div>
    <div class="row"><span>Table:</span><span>${order.table?.table_number || 'N/A'}</span></div>
    <div class="row"><span>Date:</span><span>${new Date().toLocaleDateString('en-IN')}</span></div>
    <div class="div"></div>
    <table>
      <thead><tr><th>Item</th><th>Qty</th><th>Amt</th></tr></thead>
      <tbody>${rows}</tbody>
    </table>
    <div class="div"></div>
    <div class="row"><span>Subtotal:</span><span>${fmt(order.subtotal)}</span></div>
    ${Number(order.discount_amount) > 0 ? `<div class="row"><span>Discount:</span><span>-${fmt(order.discount_amount)}</span></div>` : ''}
    <div class="row"><span>Tax:</span><span>${fmt(order.tax_amount)}</span></div>
    <div class="div"></div>
    <div class="row total"><span>TOTAL:</span><span>${fmt(order.grand_total)}</span></div>
    ${order.payment_method ? `<div class="row"><span>Payment:</span><span>${order.payment_method.toUpperCase()}</span></div>` : ''}
    <div class="div"></div>
    <div class="footer">Thank you for your visit!<br/>Please come again</div>
    <script>window.onload=()=>{window.print();setTimeout(()=>window.close(),600)}</script>
  </body></html>`);
  win.document.close();
}
