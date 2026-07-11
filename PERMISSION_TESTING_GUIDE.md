# Permission Testing Guide

## 🔐 How the Permission System Works

The frontend uses a comprehensive Role-Based Access Control (RBAC) system that integrates with the backend.

## Permission Structure

Permissions follow the pattern: `<module>:<action>`

### Actions
- `read` - View the module/list items
- `create` - Create new records
- `update` - Edit existing records
- `delete` - Remove records

## Frontend Permission Implementation

### 1. Menu Items (Sidebar)
Menu items are automatically hidden if the user doesn't have the read permission:

```typescript
// In Sidebar.tsx
<PermissionGuard permission="vendors:read">
  <NavLink to="/vendors">Vendors</NavLink>
</PermissionGuard>
```

### 2. Action Buttons
Buttons check permissions before rendering:

```typescript
// Using Button component with permission prop
<Button permission="vendors:create">
  Add Vendor
</Button>

// Using PermissionGuard for complex scenarios
<PermissionGuard permission="vendors:delete">
  <Button variant="danger">Delete</Button>
</PermissionGuard>
```

### 3. useAuth Hook
Access permission checking in components:

```typescript
import { useAuth } from '@/hooks/useAuth';

const { hasPermission, hasRole } = useAuth();

if (hasPermission('vendors:update')) {
  // Show edit button
}

if (hasRole('admin')) {
  // Show admin features
}
```

## Complete Permission List

### Dashboard & Analytics
```
dashboard:read
```

### Orders Management
```
orders:read
orders:create
orders:update
orders:delete
```

### Kitchen Order Tickets
```
kot:read
kot:create
kot:update
```

### Tables
```
tables:read
tables:create
tables:update
tables:delete
```

### Menu Items
```
menu_items:read
menu_items:create
menu_items:update
menu_items:delete
```

### Recipes
```
recipes:read
recipes:create
recipes:update
recipes:delete
```

### Customers
```
customers:read
customers:create
customers:update
customers:delete
```

### Reservations
```
reservations:read
reservations:create
reservations:update
reservations:delete
```

### Inventory
```
inventory:read
inventory:update
```

### Vendors
```
vendors:read
vendors:create
vendors:update
vendors:delete
```

### Purchase Orders
```
purchase_orders:read
purchase_orders:create
purchase_orders:update
purchase_orders:delete
```

### Expenses
```
expenses:read
expenses:create
expenses:update
expenses:delete
```

### Payments
```
payments:read
payments:create
```

### Employees
```
employees:read
employees:create
employees:update
employees:delete
```

### Restaurants
```
restaurants:read
restaurants:create
restaurants:update
restaurants:delete
```

### Branches
```
branches:read
branches:create
branches:update
branches:delete
```

### Kitchens
```
kitchens:read
kitchens:create
kitchens:update
kitchens:delete
```

### Reports
```
reports:read
```

### Audit Logs
```
audit_logs:read
```

### Settings
```
settings:read
settings:update
```

## Testing Different Roles

### 1. Super Admin (All Permissions)
- Has access to all 20 modules
- Can perform all CRUD operations
- Sees all menu items in sidebar

### 2. Manager (Most Permissions)
```sql
-- Sample permissions for Manager role
orders:read, orders:create, orders:update
menu_items:read, menu_items:create, menu_items:update
inventory:read, inventory:update
customers:read, customers:create, customers:update
employees:read
reports:read
```

### 3. Cashier (Limited Permissions)
```sql
-- Sample permissions for Cashier role
orders:read, orders:create
customers:read, customers:create
payments:read, payments:create
```

### 4. Kitchen Staff (Kitchen-Only Permissions)
```sql
-- Sample permissions for Kitchen Staff role
kot:read, kot:update
recipes:read
inventory:read
```

### 5. Waiter (Front-of-House Permissions)
```sql
-- Sample permissions for Waiter role
orders:read, orders:create
tables:read, tables:update
customers:read
reservations:read
```

## How to Test Permissions

### Method 1: Backend Database
1. Connect to MySQL database
2. Query the permissions table:
```sql
SELECT * FROM permissions;
```
3. Check role_permissions table:
```sql
SELECT r.name as role, p.name as permission
FROM roles r
JOIN role_permissions rp ON r.id = rp.role_id
JOIN permissions p ON p.id = rp.permission_id
ORDER BY r.name, p.name;
```

### Method 2: Frontend Redux DevTools
1. Open browser DevTools
2. Go to Redux tab
3. Check `state.auth.user.role.permissions`
4. Verify permissions array

### Method 3: Manual Testing
1. Login with different user accounts
2. Check which menu items appear in sidebar
3. Try clicking buttons (they should be hidden if no permission)
4. Try accessing routes directly (should redirect if no permission)

## Adding Permissions to Database

### Via Backend Seeder
The permission seeder (`backend/src/database/seeders/permission.seeder.ts`) creates all permissions.

Run the seeder:
```bash
cd backend
npm run seed
```

### Manually in Database
```sql
-- Create a new permission
INSERT INTO permissions (name, description, resource, action)
VALUES ('custom:read', 'Read custom data', 'custom', 'read');

-- Assign permission to a role
INSERT INTO role_permissions (role_id, permission_id)
VALUES (
  (SELECT id FROM roles WHERE name = 'manager'),
  (SELECT id FROM permissions WHERE name = 'custom:read')
);
```

## Permission Guard Component

The PermissionGuard component wraps any element and hides it if the user lacks permission:

```typescript
// Hides the entire section if no permission
<PermissionGuard permission="vendors:create">
  <div className="create-form">
    {/* Form content */}
  </div>
</PermissionGuard>

// Alternative: Check multiple permissions (ANY match)
<PermissionGuard permission={['vendors:create', 'vendors:update']}>
  <Button>Save</Button>
</PermissionGuard>
```

## Button Component with Permission

The Button component has built-in permission checking:

```typescript
// Button automatically hides if no permission
<Button permission="vendors:delete" variant="danger">
  Delete
</Button>

// Button is visible but disabled if loading
<Button permission="vendors:create" loading={isSubmitting}>
  Create
</Button>
```

## Common Issues

### Issue: All menu items hidden
**Cause**: User has no permissions assigned
**Solution**: Check role_permissions table and assign permissions to the user's role

### Issue: Button still shows but action fails
**Cause**: Frontend permission check passed but backend denies access
**Solution**: Ensure frontend and backend permissions match exactly

### Issue: Permission check returns false incorrectly
**Cause**: User object not loaded or permission name mismatch
**Solution**: 
1. Check Redux state for user.role.permissions
2. Verify permission name matches exactly (case-sensitive)

### Issue: useAuth hook returns undefined
**Cause**: Component rendered before auth state initialized
**Solution**: Check loading state in useAuth:
```typescript
const { isAuthenticated, loading } = useAuth();

if (loading) return <Loading />;
```

## Permission Hierarchy

Some modules have hierarchical permissions:

1. **Read permission required first**
   - User needs `module:read` before any other actions
   - If no read permission, the entire module is inaccessible

2. **Create/Update/Delete build on Read**
   - `vendors:create` requires `vendors:read`
   - Backend should enforce this hierarchy

## Best Practices

1. **Always check read permission for modules**
   ```typescript
   // In component
   if (!hasPermission('vendors:read')) {
     return <AccessDenied />;
   }
   ```

2. **Use PermissionGuard for UI elements**
   ```typescript
   <PermissionGuard permission="vendors:create">
     <CreateButton />
   </PermissionGuard>
   ```

3. **Use Button permission prop for actions**
   ```typescript
   <Button permission="vendors:delete">Delete</Button>
   ```

4. **Check permissions before API calls**
   ```typescript
   const handleDelete = async () => {
     if (!hasPermission('vendors:delete')) {
       toast.error('No permission');
       return;
     }
     await vendorService.delete(id);
   };
   ```

## Testing Checklist

For each module, verify:

- [ ] Module appears in sidebar for users with `module:read` permission
- [ ] Module hidden from sidebar for users without `module:read` permission
- [ ] Create button hidden for users without `module:create` permission
- [ ] Edit buttons hidden for users without `module:update` permission
- [ ] Delete buttons hidden for users without `module:delete` permission
- [ ] Direct URL access redirects if no read permission
- [ ] API calls return 403 if backend denies permission

## Summary

The permission system provides comprehensive access control:

- **Menu-level**: Controls sidebar visibility
- **Page-level**: Controls route access
- **Action-level**: Controls CRUD operations
- **API-level**: Backend validates all requests

All 20 modules are permission-protected and ready for role-based testing!
