import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { AuthState, User } from "@/types/auth";
import { normalizeAuthUser } from "@/utils/userApi";

function readStoredAuth(): Pick<AuthState, "user" | "token" | "isAuthenticated"> {
  if (typeof window === "undefined") {
    return { user: null, token: null, isAuthenticated: false };
  }
  const token = localStorage.getItem("token") ?? sessionStorage.getItem("token");
  const userJson = localStorage.getItem("user") ?? sessionStorage.getItem("user");
  let user: User | null = null;
  if (userJson) {
    try {
      user = normalizeAuthUser(JSON.parse(userJson) as User & { fullName?: string });
    } catch {
      user = null;
    }
  }
  return {
    user,
    token,
    isAuthenticated: Boolean(token && user),
  };
}

const persisted = readStoredAuth();

const initialState: AuthState = {
  user: persisted.user,
  token: persisted.token,
  isAuthenticated: persisted.isAuthenticated,
  loading: false,
  error: null,
};

export const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    loginStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    loginSuccess: (
      state,
      action: PayloadAction<{ user: User & { fullName?: string }; token: string; rememberMe?: boolean }>
    ) => {
      const { token, rememberMe = true } = action.payload;
      const user = normalizeAuthUser(action.payload.user);
      state.loading = false;
      state.isAuthenticated = true;
      state.user = user;
      state.token = token;
      state.error = null;
      if (typeof window !== "undefined") {
        if (rememberMe) {
          localStorage.setItem("token", token);
          localStorage.setItem("user", JSON.stringify(user));
          sessionStorage.removeItem("token");
          sessionStorage.removeItem("user");
        } else {
          sessionStorage.setItem("token", token);
          sessionStorage.setItem("user", JSON.stringify(user));
          localStorage.removeItem("token");
          localStorage.removeItem("user");
        }
      }
    },
    loginFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
      state.isAuthenticated = false;
      state.user = null;
      state.token = null;
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.loading = false;
      state.error = null;
      if (typeof window !== "undefined") {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        sessionStorage.removeItem("token");
        sessionStorage.removeItem("user");
      }
    },
    clearError: (state) => {
      state.error = null;
    },
    updateUser: (state, action: PayloadAction<User & { fullName?: string }>) => {
      state.user = normalizeAuthUser(action.payload);
      if (typeof window !== "undefined") {
        const storage = sessionStorage.getItem("token") ? sessionStorage : localStorage;
        storage.setItem("user", JSON.stringify(state.user));
      }
    },
  },
});

export const { loginStart, loginSuccess, loginFailure, logout, clearError, updateUser } =
  authSlice.actions;
export default authSlice.reducer;
