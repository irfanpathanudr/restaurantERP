# Printer Management System

## Overview
Complete printer configuration and management system for the Restaurant ERP. Supports multiple printers per branch with different types (Receipt, Kitchen, Bar, Label) and connection methods (Network, USB, Bluetooth).

## Features

### Printer Configuration
- **Multiple Printer Support**: Configure multiple printers per branch
- **Printer Types**: 
  - Receipt Printer (for bills/invoices)
  - Kitchen Printer (for KOT orders)
  - Bar Printer (for bar orders)
  - Label Printer (for product labels)
  
### Connection Methods
- **Network (IP)**: Connect via IP address and port
- **USB**: Direct USB connection
- **Bluetooth**: Wireless Bluetooth connection

### Print Settings
- Paper width (58mm or 80mm)
- Number of copies (1-5)
- Auto-cut after printing
- Open cash drawer trigger
- Print header/footer with custom text
- Character encoding configuration
- Set default printer per type

### Management Features
- Full CRUD operations
- Test printer connectivity
- Real-time status monitoring (Online/Offline/Error)
- Branch-specific printer management
- Default printer assignment

## Backend Components

### Entity
**File**: `backend/src/database/entities/Printer.entity.ts`
- Printer entity with all configuration fields
- Enums for printer type, connection type, and status
- Relationships with Branch entity

### DTOs
**Files**:
- `backend/src/dto/printer/CreatePrinterDto.ts`
- `backend/src/dto/printer/UpdatePrinterDto.ts`

Validation rules for printer data with class-validator decorators.

### Service
**File**: `backend/src/services/printer.service.ts`

Methods:
- `create(data)` - Create new printer
- `findAll(filters)` - Get all printers with filtering
- `findById(id)` - Get printer by ID
- `findByBranch(branchId)` - Get printers for specific branch
- `findDefault(branchId, printerType)` - Get default printer
- `update(id, data)` - Update printer configuration
- `delete(id)` - Soft delete printer
- `testConnection(id)` - Test printer connectivity
- `updateStatus(id, status, error)` - Update printer status

### Controller
**File**: `backend/src/controllers/printer.controller.ts`

Endpoints for all CRUD operations and printer management.

### Routes
**File**: `backend/src/routes/printer.routes.ts`

API Endpoints:
- `GET /api/v1/printers` - Get all printers
- `GET /api/v1/printers/:id` - Get printer by ID
- `GET /api/v1/printers/branch/:branchId` - Get printers by branch
- `GET /api/v1/printers/branch/:branchId/default` - Get default printer
- `POST /api/v1/printers` - Create printer
- `PUT /api/v1/printers/:id` - Update printer
- `PATCH /api/v1/printers/:id` - Partial update
- `DELETE /api/v1/printers/:id` - Delete printer
- `POST /api/v1/printers/:id/test` - Test printer connection

### Migration
**File**: `backend/src/database/migrations/1723190000000-CreatePrintersTable.ts`

Creates `printers` table with:
- All printer configuration fields
- Foreign key to branches table
- Indexes for performance
- Enum types for printer_type, connection_type, printer_status

## Frontend Components

### Service
**File**: `frontend/src/services/printer.service.ts`

TypeScript interfaces and API methods for printer management.

### Pages
**Files**:
- `frontend/src/pages/printers/PrintersPage.tsx` - Main printer management page
- `frontend/src/pages/printers/PrinterFormModal.tsx` - Add/Edit printer modal

### Features
- DataTable with search and filtering
- Color-coded printer types
- Connection status indicators
- Test connection button
- Quick actions (Edit, Delete, Test)
- Comprehensive configuration form
- Real-time status updates

## Setup Instructions

### 1. Run Database Migration

```bash
cd backend
npm run migration:run
```

This will create the `printers` table.

### 2. Register Routes

Routes are already registered in `backend/src/app.ts`:
```typescript
const printerRoutes = require('./routes/printer.routes').default;
this.app.use('/api/v1/printers', printerRoutes);
```

### 3. Restart Backend Server

```bash
cd backend
npm run dev
```

### 4. Access Printer Management

Navigate to: `http://localhost:3000/printers`

Or add a menu item in the admin navigation.

## Usage Guide

### Adding a Printer

1. Click "Add Printer" button
2. Fill in basic information:
   - Printer name
   - Select branch
   - Choose printer type
   - Select connection type

3. Configure connection details:
   - **Network**: Enter IP address and port (default 9100)
   - **USB**: Enter USB path (e.g., /dev/usb/lp0 or COM3)
   - **Bluetooth**: Enter Bluetooth MAC address

4. Set print settings:
   - Paper width (58mm or 80mm)
   - Number of copies
   - Enable/disable auto-cut
   - Enable/disable cash drawer trigger
   - Configure header/footer

5. Advanced settings:
   - Set as default printer
   - Enable/disable printer

6. Click "Create Printer"

### Testing Connection

Click the "Test" button next to any printer to verify connectivity. The system will:
- Attempt to connect to the printer
- Update printer status (Online/Offline/Error)
- Show success/failure message
- Log last connection attempt

### Editing a Printer

1. Click the Settings icon next to any printer
2. Modify configuration
3. Click "Update Printer"

### Deleting a Printer

1. Click the Trash icon next to any printer
2. Confirm deletion
3. Printer will be soft-deleted

### Setting Default Printer

Check "Set as Default" when creating/editing a printer. Only one printer per type can be default for each branch.

## Integration with Printing

### Getting Default Printer

```typescript
const printer = await printerService.getDefault(branchId, 'receipt');
```

### Getting All Printers for Branch

```typescript
const printers = await printerService.getByBranch(branchId);
```

### Printing a Receipt

```typescript
// Get default receipt printer
const printer = await printerService.getDefault(branchId, 'receipt');

if (printer && printer.status === 'online') {
  // Send print job to printer
  // Use printer.ip_address, printer.port, etc.
}
```

### Kitchen Order Printing

```typescript
// Get default kitchen printer
const kitchenPrinter = await printerService.getDefault(branchId, 'kitchen');

if (kitchenPrinter && kitchenPrinter.status === 'online') {
  // Print KOT to kitchen
}
```

## Database Schema

### printers Table

| Column | Type | Description |
|--------|------|-------------|
| id | VARCHAR(36) | Primary key (UUID) |
| name | VARCHAR(100) | Printer name |
| branch_id | VARCHAR(36) | Foreign key to branches |
| printer_type | ENUM | receipt, kitchen, bar, label |
| connection_type | ENUM | network, usb, bluetooth |
| printer_status | ENUM | online, offline, error |
| ip_address | VARCHAR(255) | IP address for network printers |
| port | INT | Port number (default 9100) |
| usb_path | VARCHAR(255) | USB device path |
| bluetooth_address | VARCHAR(255) | Bluetooth MAC address |
| model | VARCHAR(100) | Printer model |
| manufacturer | VARCHAR(100) | Manufacturer name |
| paper_width | INT | Paper width in mm (58 or 80) |
| number_of_copies | INT | Number of copies to print (1-5) |
| auto_cut | BOOLEAN | Auto-cut after printing |
| open_cash_drawer | BOOLEAN | Trigger cash drawer |
| print_header | BOOLEAN | Include header text |
| print_footer | BOOLEAN | Include footer text |
| header_text | TEXT | Custom header text |
| footer_text | TEXT | Custom footer text |
| character_encoding | VARCHAR(20) | Character encoding (default utf-8) |
| is_default | BOOLEAN | Is default printer for this type |
| is_active | BOOLEAN | Is printer active |
| last_connected_at | TIMESTAMP | Last successful connection |
| last_error | TEXT | Last error message |
| config_json | TEXT | Additional JSON configuration |
| status | VARCHAR(50) | Entity status |
| created_at | TIMESTAMP | Creation timestamp |
| updated_at | TIMESTAMP | Update timestamp |
| deleted_at | TIMESTAMP | Soft delete timestamp |

## Next Steps

### Actual Printer Integration

To implement actual printing functionality, you'll need:

1. **Node.js Printer Libraries**:
   - `escpos` - For ESC/POS thermal printers
   - `node-thermal-printer` - Alternative thermal printer library
   - `pdf-to-printer` - For PDF printing to any printer

2. **Installation**:
```bash
npm install escpos escpos-network escpos-usb
```

3. **Print Service**:
Create `backend/src/services/print.service.ts` to handle actual print jobs using the configured printer settings.

4. **Receipt Template**:
Create HTML/template for receipt formatting based on order data.

5. **KOT Template**:
Create template for kitchen order tickets.

### Security Considerations

- Printers on local network should be behind firewall
- Use VPN for remote printer access
- Implement printer access control/permissions
- Log all print jobs for audit trail
- Validate printer configurations before saving

## Troubleshooting

### Printer Shows Offline
- Check network connectivity
- Verify IP address and port
- Ensure printer is powered on
- Test from command line: `ping [printer_ip]`

### Test Connection Fails
- Verify connection type matches physical setup
- Check firewall settings
- Ensure printer supports ESC/POS commands
- Review last_error field for details

### Print Jobs Not Working
- Check printer status is 'online'
- Verify paper is loaded
- Check printer drivers/firmware
- Review backend logs for errors

## Files Modified/Created

### Backend
- ✅ `backend/src/database/entities/Printer.entity.ts`
- ✅ `backend/src/dto/printer/CreatePrinterDto.ts`
- ✅ `backend/src/dto/printer/UpdatePrinterDto.ts`
- ✅ `backend/src/services/printer.service.ts`
- ✅ `backend/src/controllers/printer.controller.ts`
- ✅ `backend/src/routes/printer.routes.ts`
- ✅ `backend/src/database/migrations/1723190000000-CreatePrintersTable.ts`
- ✅ `backend/src/app.ts` (modified - added printer routes)

### Frontend
- ✅ `frontend/src/services/printer.service.ts`
- ✅ `frontend/src/pages/printers/PrintersPage.tsx`
- ✅ `frontend/src/pages/printers/PrinterFormModal.tsx`
- ✅ `frontend/src/App.tsx` (modified - added printer route)

## Testing Checklist

- [ ] Run migration to create printers table
- [ ] Restart backend server
- [ ] Access /printers page
- [ ] Create a network printer
- [ ] Create a USB printer
- [ ] Test printer connection
- [ ] Edit printer configuration
- [ ] Set printer as default
- [ ] Delete printer
- [ ] Filter by branch
- [ ] Search printers
- [ ] Verify printer status updates
- [ ] Check API endpoints with Postman

## Support

For issues or questions:
1. Check backend logs: `backend/logs/error-[date].log`
2. Check browser console for frontend errors
3. Verify database migration completed
4. Ensure all dependencies are installed
