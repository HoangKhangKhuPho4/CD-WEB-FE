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
  email?: string;
  name: string;
  phone?: string;
  birth?: string;
  gender?: string;
  address?: string;
  createdAt?: string;
  roles: Role[];
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
