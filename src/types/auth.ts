export enum UserRole {
  ADMIN = 1,
  WAREHOUSE = 2,
  SALES = 3,
  CUSTOMER = 4,
}

export interface Role {
  id: number;
  name: string;
}

export interface User {
  id: number;
  username: string;
  email: string;
  name: string;
  phone?: string | null;
  birth?: string | null;
  gender?: string | null;
  address?: string | null;
  createdAt?: string;
  updatedAt?: string;
  lastLoginAt?: string | null;
  status?: number;
  roles?: Role[];
}

export interface AuthResponse {
  success: boolean;
  message: string;
  data: {
    token: string;
    type: string;
    user: User;
  };
}

export interface RegisterResponse {
  success: boolean;
  message: string;
  data: User;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}
