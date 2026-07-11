import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Permission } from '@/types/entities.types';

interface PermissionState {
  permissions: string[]; // Array of permission names like "users:create", "orders:read"
  permissionsLoaded: boolean;
}

const initialState: PermissionState = {
  permissions: [],
  permissionsLoaded: false,
};

const permissionSlice = createSlice({
  name: 'permission',
  initialState,
  reducers: {
    setPermissions: (state, action: PayloadAction<string[]>) => {
      state.permissions = action.payload;
      state.permissionsLoaded = true;
    },
    clearPermissions: (state) => {
      state.permissions = [];
      state.permissionsLoaded = false;
    },
    addPermission: (state, action: PayloadAction<string>) => {
      if (!state.permissions.includes(action.payload)) {
        state.permissions.push(action.payload);
      }
    },
    removePermission: (state, action: PayloadAction<string>) => {
      state.permissions = state.permissions.filter(p => p !== action.payload);
    },
  },
});

export const { setPermissions, clearPermissions, addPermission, removePermission } = permissionSlice.actions;
export default permissionSlice.reducer;

// Selectors
export const selectPermissions = (state: { permission: PermissionState }) => state.permission.permissions;
export const selectPermissionsLoaded = (state: { permission: PermissionState }) => state.permission.permissionsLoaded;

// Permission check selector
export const selectHasPermission = (state: { permission: PermissionState }, permission: string) => {
  return state.permission.permissions.includes(permission);
};

export const selectHasAnyPermission = (state: { permission: PermissionState }, permissions: string[]) => {
  return permissions.some(p => state.permission.permissions.includes(p));
};

export const selectHasAllPermissions = (state: { permission: PermissionState }, permissions: string[]) => {
  return permissions.every(p => state.permission.permissions.includes(p));
};
