export interface PermissionItem {
  id: number;
  code: string;
  name: string;
  description?: string;
}

export interface RoleDetail {
  id: number;
  name: string;
  description?: string;
  permissionIds?: number[];
  permissions?: PermissionItem[];
}
