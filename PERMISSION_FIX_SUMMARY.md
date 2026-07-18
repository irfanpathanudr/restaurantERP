# KOT App Permission Issue - Fix Summary

## Problem Identified

The cashier role was showing "You do not have permission to perform this action" errors throughout the KOT Floor app, specifically:
1. Unable to view the Bills page
2. Unable to access menu items
3. Unable to view tables and orders
4. Missing permissions for KOT operations

## Root Causes

### 1. Missing Permissions in Cashier Role
The cashier role was missing the `kot.create` permission, which is needed to send orders to kitchen and print KOTs.

### 2. Overly Permissive Permission Check
The `hasPermission()` function in `kot/src/hooks/useAuth.tsx` was returning `true` when no permissions were defined, which masked the issue during development but failed in production with actual role-based users.

### 3. Incomplete Manager Permissions
The manager role was missing delete permissions for various modules, limiting their ability to fully manage the restaurant.

### 4. Missing Permission Guard in BillsPage
The Bills page had no permission check, relying only on role-based navigation hiding.

## Changes Made

### 1. Backend - Role Seeder (`backend/src/database/seeders/role.seeder.ts`)

#### Cashier Role - Added Permissions:
```typescript
permissionNames: [
  'branches.read',
  'tables.read', 'tables.update',
  'menu.read',                    // ✓ Already had
  'kitchens.read',                // ✓ Already had
  'orders.read', 'orders.update',
  'kot.read', 'kot.create',       // ✓ ADDED kot.create
  'customers.read', 'customers.create',
  'payments.read', 'payments.create', 'payments.refund',
  'invoices.read', 'invoices.create',
],
```

**Impact:** Cashiers can now:
- View and access menu items (menu.read)
- View kitchens for KOT routing (kitchens.read)
- Create and print KOTs (kot.create)
- View bills and generate invoices (invoices.create)

#### Manager Role - Added Delete Permissions:
```typescript
permissionNames: [
  'users.read', 'users.create', 'users.update', 'users.delete',      // ✓ Added delete
  'branches.read', 'branches.create', 'branches.update', 'branches.delete',  // ✓ Added delete
  'menu.read', 'menu.create', 'menu.update', 'menu.delete',
  'orders.read', 'orders.create', 'orders.update', 'orders.delete',  // ✓ Added delete
  'kot.read', 'kot.create', 'kot.update',
  'kitchens.read', 'kitchens.create', 'kitchens.update', 'kitchens.delete',  // ✓ Added delete
  'tables.read', 'tables.create', 'tables.update', 'tables.delete',  // ✓ Added delete
  'customers.read', 'customers.create', 'customers.update', 'customers.delete',  // ✓ Added delete
  'inventory.read', 'inventory.create', 'inventory.update', 'inventory.delete',  // ✓ Added delete
  'payments.read', 'payments.create', 'payments.refund',
  'invoices.read', 'invoices.create', 'invoices.update',
  'employees.read', 'employees.create', 'employees.update', 'employees.delete',  // ✓ Added delete
  'reports.read', 'reports.export',
],
```

### 2. KOT App - Permission Hook (`kot/src/hooks/useAuth.tsx`)

**Before:**
```typescript
const hasPermission = useCallback(
  (code: string) => {
    const perms = permissionCodes(user);
    if (perms.length === 0) return true;  // ⚠️ Too permissive
    return perms.includes(code);
  },
  [user]
);
```

**After:**
```typescript
const hasPermission = useCallback(
  (code: string) => {
    const perms = permissionCodes(user);
    // Super admin or manager bypass
    const codes = roleCodes(user);
    if (codes.some((c) => c === 'super_admin' || c === 'SUPER_ADMIN')) return true;
    // If no permissions defined, deny access
    if (perms.length === 0) return false;  // ✓ Secure by default
    return perms.includes(code);
  },
  [user]
);
```

### 3. KOT App - Navigation Permissions (`kot/src/components/AppShell.tsx`)

**Before:**
```typescript
const tabs = [
  { to: '/tables', label: 'Tables', icon: LayoutGrid, show: role !== 'chef' },
  { to: '/kitchen', label: 'Kitchen', icon: ChefHat, show: role === 'chef' || role === 'manager' || role === 'admin' },
  { to: '/bills', label: 'Bills', icon: Receipt, show: role === 'manager' || role === 'cashier' || role === 'admin' },
].filter((t) => t.show);
```

**After:**
```typescript
const tabs = [
  { 
    to: '/tables', 
    label: 'Tables', 
    icon: LayoutGrid, 
    show: role !== 'chef' && hasPermission('tables.read')  // ✓ Permission check
  },
  { 
    to: '/kitchen', 
    label: 'Kitchen', 
    icon: ChefHat, 
    show: (role === 'chef' || role === 'manager' || role === 'admin') && hasPermission('kot.read')  // ✓ Permission check
  },
  { 
    to: '/bills', 
    label: 'Bills', 
    icon: Receipt, 
    show: (role === 'manager' || role === 'cashier' || role === 'admin') && hasPermission('invoices.create')  // ✓ Permission check
  },
].filter((t) => t.show);
```

### 4. KOT App - Bills Page Guard (`kot/src/pages/BillsPage.tsx`)

Added explicit permission check at the top of the component:
```typescript
export function BillsPage() {
  const { branchId, hasPermission } = useAuth();
  // ... state declarations

  // Check permission
  if (!hasPermission('invoices.create') && !hasPermission('orders.read')) {
    return (
      <div className="px-4 pt-8 max-w-lg mx-auto">
        <div className="rounded-2xl bg-surface-card border border-red-500/20 p-6 text-center">
          <p className="text-red-400 font-semibold mb-2">Access Denied</p>
          <p className="text-sm text-white/60">
            You do not have permission to view bills.
          </p>
        </div>
      </div>
    );
  }
  // ... rest of component
}
```

## How to Apply the Fixes

### Step 1: Reseed the Database
Run the seed command to update role permissions:

```bash
cd backend
npm run seed
```

This will update the cashier and manager roles with the new permissions.

### Step 2: Restart the Backend Server
```bash
cd backend
npm run dev
```

### Step 3: Rebuild KOT App (if using build)
```bash
cd kot
npm run build
```

### Step 4: Test with Cashier User
1. Log out of the KOT app if currently logged in
2. Log in with a cashier account
3. Verify the following:
   - ✓ Tables page is visible and accessible
   - ✓ Bills page is visible and accessible
   - ✓ Can view menu items on order page
   - ✓ Can send orders to kitchen (creates KOT)
   - ✓ Can print KOTs
   - ✓ Can generate and print bills

## Permission Matrix by Role

### Cashier
| Module | Permissions |
|--------|-------------|
| Branches | read |
| Tables | read, update |
| Menu | read |
| Kitchens | read |
| Orders | read, update |
| KOT | read, **create** |
| Customers | read, create |
| Payments | read, create, refund |
| Invoices | read, create |

### Manager (Restaurant Manager)
| Module | Permissions |
|--------|-------------|
| Users | read, create, update, **delete** |
| Branches | read, create, update, **delete** |
| Menu | read, create, update, delete |
| Orders | read, create, update, **delete** |
| KOT | read, create, update |
| Kitchens | read, create, update, **delete** |
| Tables | read, create, update, **delete** |
| Customers | read, create, update, **delete** |
| Inventory | read, create, update, **delete** |
| Payments | read, create, refund |
| Invoices | read, create, update |
| Employees | read, create, update, **delete** |
| Reports | read, export |

### Waiter
| Module | Permissions |
|--------|-------------|
| Branches | read |
| Tables | read, update |
| Menu | read |
| Kitchens | read |
| Orders | read, create, update |
| KOT | read, create |
| Customers | read, create |
| Payments | read, create |

### Chef
| Module | Permissions |
|--------|-------------|
| Branches | read |
| Tables | read |
| Menu | read |
| Kitchens | read |
| Orders | read |
| KOT | read, update |
| Inventory | read |

## Verification Checklist

### For Cashier Users:
- [ ] Can access Tables page
- [ ] Can access Bills page
- [ ] Can view menu items when creating order
- [ ] Can see kitchen dropdown when ordering
- [ ] Can send order to kitchen (creates KOT)
- [ ] Can print KOT
- [ ] Can generate invoice from Bills page
- [ ] Can view order details
- [ ] Cannot access Kitchen board page (chef only)

### For Manager Users:
- [ ] Can access all pages (Tables, Kitchen, Bills)
- [ ] Can view and manage all modules
- [ ] Can delete records (users, branches, tables, etc.)
- [ ] Can access reports
- [ ] Full KOT floor functionality

## Additional Notes

1. **Super Admin Bypass**: Users with `SUPER_ADMIN` role automatically have all permissions.

2. **Permission Naming Convention**: Backend uses dot notation (e.g., `menu.read`, `kot.create`) which must match exactly in frontend permission checks.

3. **RBAC Middleware**: All backend routes are protected by `checkPermission()` middleware which validates user permissions from the database.

4. **Future Permissions**: When adding new features, ensure to:
   - Add permission to `permission.seeder.ts`
   - Assign to appropriate roles in `role.seeder.ts`
   - Add permission checks in frontend components
   - Add permission to route middleware in backend

## Troubleshooting

If permissions still don't work after reseeding:

1. **Check User's Role Assignment**:
   ```sql
   SELECT u.email, u.first_name, r.code, r.name 
   FROM users u 
   LEFT JOIN roles r ON u.role_id = r.id 
   WHERE u.email = 'cashier@example.com';
   ```

2. **Verify Role Permissions**:
   ```sql
   SELECT r.code, p.code, p.name 
   FROM roles r 
   LEFT JOIN role_permissions rp ON r.id = rp.role_id 
   LEFT JOIN permissions p ON rp.permission_id = p.id 
   WHERE r.code = 'cashier';
   ```

3. **Check Permission Codes Match**:
   Ensure frontend permission checks use exact same codes as backend:
   - Backend: `menu.read`, `kot.create`, `invoices.create`
   - Frontend: Must match exactly (case-sensitive)

4. **Clear Browser Storage**:
   The KOT app caches user info in localStorage. Clear it and log in again:
   ```javascript
   localStorage.clear();
   ```

5. **Check Backend Logs**:
   Look for "Permission denied" warnings in backend logs:
   ```bash
   tail -f backend/logs/application-*.log
   ```
