# User Role & Permission Management System

## Overview

The Restaurant ERP system now includes a comprehensive user role and permission management module. This allows fine-grained control over what different users can access and do within the system.

## Key Features

### 1. Super Admin Role
- **Full Access**: Super Admin users have unrestricted access to all features and permissions
- **Automatic Permissions**: No need to assign individual permissions - they automatically have everything
- **Cannot be restricted**: Super Admin role cannot be deleted or have permissions removed
- **User Management**: Can manage all other users, roles, and permissions

### 2. Role-Based Access Control (RBAC)
- Users are assigned to roles
- Roles have collections of permissions
- Users inherit all permissions from their assigned role
- Multiple roles can be created with different permission sets

### 3. Permission Types
The system supports different types of permissions:
- **PAGE**: Controls access to entire pages/routes
- **BUTTON**: Controls visibility of specific buttons/actions
- **API**: Controls backend API access
- **FIELD**: Controls access to specific form fields
- **RECORD**: Controls access to specific data records
- **BRANCH**: Controls branch-level access
- **KITCHEN**: Controls kitchen-level access

### 4. Permission Structure
Each permission consists of:
- **Name**: Human-readable name (e.g., "View Users")
- **Code**: Machine-readable identifier (e.g., "users:read")
- **Type**: One of the permission types listed above
- **Resource**: The entity/resource being controlled (e.g., "users", "orders")
- **Action**: The action being performed (e.g., "create", "read", "update", "delete")
- **Description**: Optional description of what the permission allows

## Frontend Components

### Pages
Located in `frontend/src/pages/`:

1. **UsersPage** (`/users`)
   - List all system users
   - Create new users
   - Edit user details
   - Assign roles to users
   - Activate/deactivate users
   - Delete users

2. **RolesPage** (`/roles`)
   - List all roles
   - Create new roles
   - Edit role details
   - Assign permissions to roles
   - Delete roles
   - View permission count per role

3. **PermissionsPage** (`/permissions`)
   - List all permissions
   - Create new permissions
   - Edit permission details
   - Organized by permission type
   - Delete permissions

### Services
Located in `frontend/src/services/`:

1. **user.service.ts**: User CRUD operations
2. **role.service.ts**: Role management and permission assignment
3. **permission.service.ts**: Permission CRUD operations

### Hooks
Located in `frontend/src/hooks/`:

1. **usePermission.ts**: Hook for checking user permissions
   ```typescript
   const { hasPermission, hasAnyPermission, hasAllPermissions, isSuperAdmin } = usePermission();
   
   if (hasPermission('users:create')) {
     // Show create user button
   }
   
   if (isSuperAdmin()) {
     // Show admin-only features
   }
   ```

### Components
Located in `frontend/src/components/common/`:

1. **PermissionGuard.tsx**: Component to conditionally render based on permissions
   ```typescript
   <PermissionGuard permission="users:create">
     <Button>Create User</Button>
   </PermissionGuard>
   ```

2. **Button.tsx**: Enhanced with permission prop
   ```typescript
   <Button permission="users:delete" onClick={handleDelete}>
     Delete
   </Button>
   ```

## Usage Examples

### Protecting Routes
Routes are protected at the component level using the PermissionGuard:

```typescript
<PermissionGuard permission="users:read">
  <UsersPage />
</PermissionGuard>
```

### Protecting UI Elements
Buttons and other UI elements can be conditionally rendered:

```typescript
<Button 
  permission="users:create" 
  onClick={handleCreate}
>
  Add User
</Button>
```

### Sidebar Navigation
The sidebar automatically hides menu items based on permissions:

```typescript
{
  name: 'Users',
  path: '/users',
  icon: <Users />,
  permission: 'users:read',
}
```

### Checking Permissions in Code
Use the `usePermission` hook in your components:

```typescript
const { hasPermission, isSuperAdmin } = usePermission();

const canDelete = hasPermission('users:delete') || isSuperAdmin();

if (canDelete) {
  // Show delete button
}
```

## Backend Integration

The frontend expects the backend API to:

1. Return user object with role and permissions:
```typescript
{
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  role: {
    id: string;
    name: string;
    code: string;
    permissions: [
      {
        id: string;
        name: string;
        code: string;
        type: string;
        resource: string;
        action: string;
      }
    ]
  }
}
```

2. Provide these endpoints:
   - `GET /users` - List users
   - `POST /users` - Create user
   - `PUT /users/:id` - Update user
   - `DELETE /users/:id` - Delete user
   - `PATCH /users/:id/status` - Change user status
   - `GET /roles` - List roles
   - `POST /roles` - Create role
   - `PUT /roles/:id` - Update role
   - `DELETE /roles/:id` - Delete role
   - `POST /roles/:id/permissions` - Assign permissions to role
   - `GET /permissions` - List permissions
   - `POST /permissions` - Create permission
   - `PUT /permissions/:id` - Update permission
   - `DELETE /permissions/:id` - Delete permission

## Permission Naming Convention

Use consistent naming for permissions:
- Format: `resource:action`
- Examples:
  - `users:create`
  - `users:read`
  - `users:update`
  - `users:delete`
  - `orders:create`
  - `menu_items:read`
  - `reports:export`

## Security Considerations

1. **Super Admin Protection**: The Super Admin role code should be `SUPER_ADMIN` and cannot be modified or deleted
2. **Self-Management**: Users cannot delete or deactivate their own account
3. **Permission Inheritance**: Users automatically get all permissions from their assigned role
4. **Frontend Validation**: Permission checks are done in the frontend for UX, but backend must also validate
5. **Token-Based Auth**: User role and permissions are included in the JWT token or fetched after authentication

## Development Tips

1. **Adding New Permissions**: 
   - Create the permission in the database
   - Add the permission code to relevant UI components
   - Assign the permission to appropriate roles

2. **Creating New Roles**:
   - Define the role with a unique code (e.g., `MANAGER`, `CASHIER`)
   - Set the role level (higher = more authority)
   - Assign relevant permissions

3. **Testing Permissions**:
   - Create test users with different roles
   - Verify UI elements show/hide correctly
   - Check API calls are properly protected
   - Test Super Admin can access everything

## Future Enhancements

- [ ] Permission groups for easier management
- [ ] Role hierarchy and inheritance
- [ ] User-specific permission overrides
- [ ] Audit logging for permission changes
- [ ] Bulk permission assignment
- [ ] Permission templates for common roles
- [ ] Branch-level and kitchen-level permission scoping
- [ ] Time-based permission grants

## Support

For issues or questions about the user role and permission system, please contact the development team.
