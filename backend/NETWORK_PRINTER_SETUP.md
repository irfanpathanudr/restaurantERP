# Network Printer Setup for KOT Printing

## Current Issue
The system currently only generates print payloads on the backend but doesn't actually print to physical printers. Printing happens on the client device through Bluetooth or browser print dialog.

## Solution: Add Server-Side Network Printing

### Option 1: Use node-thermal-printer (Recommended)

Install the package:
```bash
cd backend
npm install node-thermal-printer
```

### Option 2: Use CUPS (Linux) or Windows Printer Drivers

For network ESC/POS printers, you can send raw ESC/POS commands via TCP/IP.

## Implementation Steps

### 1. Update Printer Entity Configuration

Add these fields to the printer configuration:
- `use_server_side_printing`: boolean (whether to print from server or client)
- `network_protocol`: 'tcp' | 'usb' | 'bluetooth'
- `ip_address`: string (for TCP/network printers)
- `port`: number (default 9100 for ESC/POS printers)

### 2. Create Printer Driver Service

Create `backend/src/services/printer-driver.service.ts`:

```typescript
import net from 'net';
import { Printer } from '../database/entities/Printer.entity';
import logger from '../config/logger';

export class PrinterDriverService {
  /**
   * Send raw ESC/POS data to network printer
   */
  async sendToNetworkPrinter(printer: Printer, data: Buffer): Promise<void> {
    if (!printer.ip_address || !printer.port) {
      throw new Error('Printer IP address and port are required');
    }

    return new Promise((resolve, reject) => {
      const client = new net.Socket();
      
      client.connect(printer.port, printer.ip_address, () => {
        logger.info(`Connected to printer ${printer.name} at ${printer.ip_address}:${printer.port}`);
        client.write(data);
        client.end();
      });

      client.on('close', () => {
        logger.info(`Printer connection closed: ${printer.name}`);
        resolve();
      });

      client.on('error', (err) => {
        logger.error(`Printer error for ${printer.name}:`, err);
        reject(new Error(`Failed to print: ${err.message}`));
      });

      // Timeout after 10 seconds
      client.setTimeout(10000, () => {
        client.destroy();
        reject(new Error('Printer connection timeout'));
      });
    });
  }
}
```

### 3. Update KOT Service to Support Server-Side Printing

Modify `backend/src/services/kot.service.ts` to optionally print from server:

```typescript
import { PrinterDriverService } from './printer-driver.service';
import { generateKotEscPos } from '../utils/escpos-generator';

async printKOT(id: string, printFromServer = false): Promise<{ kot: KOT; printPayload: Record<string, unknown> }> {
  const kot = await this.findById(id);
  if (!kot) throw new Error('KOT not found');

  kot.print_count = (kot.print_count || 0) + 1;
  await this.kotRepository.save(kot);

  const printPayload = {
    // ... existing payload generation ...
  };

  // If server-side printing is enabled and printer is configured
  if (printFromServer && kot.kitchen?.printer_id) {
    const printerService = new PrinterService();
    const printer = await printerService.findById(kot.kitchen.printer_id);
    
    if (printer && printer.use_server_side_printing && printer.connection_type === 'network') {
      try {
        const escPosData = generateKotEscPos(printPayload);
        const driverService = new PrinterDriverService();
        await driverService.sendToNetworkPrinter(printer, escPosData);
        logger.info(`Server-side print successful for KOT ${id}`);
      } catch (error) {
        logger.error(`Server-side print failed for KOT ${id}:`, error);
        // Still return payload for client-side fallback
      }
    }
  }

  return { kot: (await this.findById(id)) as KOT, printPayload };
}
```

### 4. Add ESC/POS Generator Utility

Create `backend/src/utils/escpos-generator.ts`:

```typescript
// ESC/POS command bytes
const ESC = 0x1b;
const GS = 0x1d;
const LF = 0x0a;

export function generateKotEscPos(payload: any): Buffer {
  const commands: number[] = [];
  
  // Initialize printer
  commands.push(ESC, 0x40);
  
  // Center align
  commands.push(ESC, 0x61, 0x01);
  
  // Bold + Double size for KOT header
  commands.push(ESC, 0x45, 0x01); // Bold on
  commands.push(ESC, 0x21, 0x30); // Double size
  commands.push(...Buffer.from('KOT'));
  commands.push(LF);
  
  // Normal size
  commands.push(ESC, 0x21, 0x00);
  commands.push(ESC, 0x45, 0x00); // Bold off
  
  // Left align
  commands.push(ESC, 0x61, 0x00);
  
  // KOT details
  commands.push(...Buffer.from(`KOT#: ${payload.kotNumber}\n`));
  commands.push(...Buffer.from(`Table: ${payload.tableNumber}\n`));
  commands.push(...Buffer.from(`Kitchen: ${payload.kitchen}\n`));
  commands.push(...Buffer.from(`Print#: ${payload.printCount}\n`));
  commands.push(...Buffer.from('--------------------------------\n'));
  
  // Items
  for (const item of payload.items) {
    commands.push(ESC, 0x45, 0x01); // Bold
    commands.push(...Buffer.from(`${item.quantity}x ${item.name}\n`));
    commands.push(ESC, 0x45, 0x00); // Bold off
    
    if (item.specialInstructions) {
      commands.push(...Buffer.from(`   >> ${item.specialInstructions}\n`));
    }
  }
  
  // Footer
  commands.push(...Buffer.from('--------------------------------\n'));
  commands.push(LF, LF, LF);
  
  // Cut paper
  commands.push(GS, 0x56, 0x01);
  
  return Buffer.from(commands);
}
```

## Configuration Example

When setting up a kitchen printer for server-side printing:

```json
{
  "name": "Kitchen Printer 1",
  "branchId": "...",
  "printerType": "kot",
  "connectionType": "network",
  "ipAddress": "192.168.1.100",
  "port": 9100,
  "use_server_side_printing": true,
  "model": "Epson TM-T82",
  "isDefault": true
}
```

## Testing

1. Configure the printer with the network IP address
2. Test connection: `telnet 192.168.1.100 9100`
3. Send a test print from the backend
4. Check printer responds and prints

## Common Network Printer Ports

- **9100**: Standard RAW printing port (ESC/POS)
- **515**: LPR/LPD protocol
- **631**: IPP (Internet Printing Protocol)

Most thermal receipt printers use port 9100 with RAW ESC/POS protocol.
