import api, { type ApiResponse } from "./api";
import type { User } from "@/types/auth";

export type ApiUserProfile = {
  id: number;
  username: string;
  email?: string;
  fullName?: string;
  name?: string;
  phone?: string;
  birth?: string;
  gender?: string;
  address?: string;
  createdAt?: string;
  updatedAt?: string;
  lastLoginAt?: string | null;
  enabled?: boolean;
  status?: number;
  roles?: { id: number; name: string }[];
  permissions?: string[] | Set<string>;
};

export function mapApiUserToAuthUser(data: ApiUserProfile): User {
  const perms = data.permissions;
  return {
    id: data.id,
    username: data.username,
    email: data.email ?? "",
    name: data.fullName ?? data.name ?? data.username,
    phone: data.phone,
    birth: data.birth,
    gender: data.gender,
    address: data.address,
    createdAt: data.createdAt,
    updatedAt: data.updatedAt,
    lastLoginAt: data.lastLoginAt,
    status: data.enabled === false ? 0 : data.status ?? 1,
    roles: data.roles,
    permissions: perms ? (Array.isArray(perms) ? perms : Array.from(perms)) : undefined,
  };
}

/** Chuẩn hóa user từ login/me (fullName, permissions Set/array). */
export function normalizeAuthUser(raw: User & { fullName?: string }): User {
  return mapApiUserToAuthUser({
    id: raw.id,
    username: raw.username,
    email: raw.email,
    fullName: raw.fullName ?? raw.name,
    name: raw.name,
    phone: raw.phone ?? undefined,
    birth: raw.birth ?? undefined,
    gender: raw.gender ?? undefined,
    address: raw.address ?? undefined,
    createdAt: raw.createdAt,
    updatedAt: raw.updatedAt,
    lastLoginAt: raw.lastLoginAt,
    enabled: raw.status === 0 ? false : true,
    status: raw.status,
    roles: raw.roles,
    permissions: raw.permissions,
  });
}

export async function getMe(): Promise<User> {
  const res = await api.get<ApiResponse<ApiUserProfile>>("/users/me");
  if (!res.data.success || !res.data.data) {
    throw new Error(res.data.message || "Không lấy được thông tin tài khoản");
  }
  return mapApiUserToAuthUser(res.data.data);
}

export async function updateMyProfile(body: {
  fullName?: string;
  phone?: string;
  birth?: string;
  gender?: string;
  address?: string;
}): Promise<User> {
  const res = await api.put<ApiResponse<ApiUserProfile>>("/users/me", body);
  if (!res.data.success || !res.data.data) {
    throw new Error(res.data.message || "Cập nhật thất bại");
  }
  return mapApiUserToAuthUser(res.data.data);
}

export async function changeMyPassword(body: {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}): Promise<void> {
  const res = await api.put<ApiResponse<void>>("/users/change-password", body);
  if (!res.data.success) {
    throw new Error(res.data.message || "Đổi mật khẩu thất bại");
  }
}
