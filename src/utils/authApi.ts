import axios, { AxiosError } from "axios";
import type { ApiResponse } from "@/types/api";
import type { User } from "@/types/auth";

const rawBase =
  typeof process !== "undefined" && process.env.NEXT_PUBLIC_API_BASE_URL
    ? process.env.NEXT_PUBLIC_API_BASE_URL.replace(/\/$/, "")
    : "http://localhost:8080";

/** Client gọi /api/auth/** — không gắn interceptor 401 redirect của api chính */
export const authApiClient = axios.create({
  baseURL: `${rawBase}/api`,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

export type LoginResponse = {
  token: string;
  type: string;
  user: User;
};

export type RegisterPayload = {
  username: string;
  email: string;
  password: string;
  name: string;
  phone?: string;
  birth?: string;
  gender?: string;
  address?: string;
  roleId?: number;
};

function assertSuccess<T>(body: ApiResponse<T>): asserts body is ApiResponse<T> & { success: true; data: T } {
  if (!body.success) {
    const err = new Error(body.message) as Error & { body?: ApiResponse<T> };
    err.body = body;
    throw err;
  }
}

export async function login(usernameOrEmail: string, password: string): Promise<ApiResponse<LoginResponse>> {
  try {
    const res = await authApiClient.post<ApiResponse<LoginResponse>>("/auth/login", {
      usernameOrEmail,
      password,
    });
    const body = res.data;
    if (!body.success) {
      const err = new Error(body.message || "Invalid credentials") as Error & { body?: ApiResponse<LoginResponse> };
      err.body = body;
      throw err;
    }
    return body;
  } catch (e) {
    if (axios.isAxiosError(e) && e.response?.status === 401) {
      const body = e.response.data as ApiResponse<LoginResponse>;
      const err = new Error(body?.message || "Invalid credentials") as Error & {
        status: number;
        body?: ApiResponse<LoginResponse>;
      };
      err.status = 401;
      err.body = body;
      throw err;
    }
    throw e;
  }
}

export async function register(payload: RegisterPayload): Promise<ApiResponse<User>> {
  const res = await authApiClient.post<ApiResponse<User>>("/auth/register", payload);
  const body = res.data;
  if (!res.status.toString().startsWith("2") || !body.success) {
    const err = new Error(body.message || "Register failed") as Error & { body?: ApiResponse<User> };
    err.body = body;
    throw err;
  }
  return body;
}

export async function checkUsername(username: string): Promise<ApiResponse<boolean>> {
  const res = await authApiClient.post<ApiResponse<boolean>>(
    `/auth/check-username?${new URLSearchParams({ username }).toString()}`
  );
  const body = res.data;
  assertSuccess(body);
  return body;
}

export async function checkEmail(email: string): Promise<ApiResponse<boolean>> {
  const res = await authApiClient.post<ApiResponse<boolean>>(
    `/auth/check-email?${new URLSearchParams({ email }).toString()}`
  );
  const body = res.data;
  assertSuccess(body);
  return body;
}

export async function loginGoogle(idToken: string): Promise<ApiResponse<LoginResponse>> {
  const res = await authApiClient.post<ApiResponse<LoginResponse>>("/auth/google", { idToken });
  const body = res.data;
  if (!res.status.toString().startsWith("2") || !body.success) {
    const err = new Error(body.message || "Google login failed") as Error & { body?: ApiResponse<LoginResponse> };
    err.body = body;
    throw err;
  }
  assertSuccess(body);
  return body;
}

export async function loginFacebook(accessToken: string): Promise<ApiResponse<LoginResponse>> {
  const res = await authApiClient.post<ApiResponse<LoginResponse>>("/auth/facebook", { accessToken });
  const body = res.data;
  if (!res.status.toString().startsWith("2") || !body.success) {
    const err = new Error(body.message || "Facebook login failed") as Error & { body?: ApiResponse<LoginResponse> };
    err.body = body;
    throw err;
  }
  assertSuccess(body);
  return body;
}

export async function forgotPassword(email: string): Promise<ApiResponse<null>> {
  const res = await authApiClient.post<ApiResponse<null>>("/auth/forgot-password", { email });
  const body = res.data;
  if (!res.status.toString().startsWith("2") || !body.success) {
    const err = new Error(body.message || "Forgot password failed") as Error & {
      status?: number;
      body?: ApiResponse<null>;
    };
    err.status = res.status;
    err.body = body;
    throw err;
  }
  return body;
}

export async function resetPassword(
  token: string,
  newPassword: string,
  confirmPassword: string
): Promise<ApiResponse<null>> {
  const res = await authApiClient.post<ApiResponse<null>>("/auth/reset-password", {
    token,
    newPassword,
    confirmPassword,
  });
  const body = res.data;
  if (!res.status.toString().startsWith("2") || !body.success) {
    const err = new Error(body.message || "Reset password failed") as Error & { body?: ApiResponse<null> };
    err.body = body;
    throw err;
  }
  return body;
}

/** Thu hồi token phía server (Redis blacklist + xóa refresh cookie) rồi xóa storage phía client */
export async function logoutSession(): Promise<void> {
  const token =
    typeof window !== "undefined"
      ? localStorage.getItem("token") ?? sessionStorage.getItem("token")
      : null;
  try {
    await authApiClient.post(
      "/auth/logout",
      {},
      {
        withCredentials: true,
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      }
    );
  } catch {
    // Vẫn xóa storage phía client nếu server lỗi
  }
}

export function getAuthErrorMessage(err: unknown): string {
  if (axios.isAxiosError(err)) {
    const ax = err as AxiosError<ApiResponse<unknown>>;
    const data = ax.response?.data;
    if (data && typeof data.message === "string") return data.message;
    return err.message;
  }
  if (err instanceof Error) return err.message;
  return "Đã xảy ra lỗi";
}

export function getAuthValidationError(err: unknown): Record<string, string> | null {
  if (!axios.isAxiosError(err)) return null;
  const data = err.response?.data as ApiResponse<unknown> | undefined;
  const e = data?.error;
  if (e && typeof e === "object" && !Array.isArray(e)) return e as Record<string, string>;
  return null;
}
