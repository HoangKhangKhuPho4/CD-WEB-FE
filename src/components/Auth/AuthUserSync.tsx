"use client";

import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { updateUser } from "@/redux/features/auth-slice";
import { registerAuthRefreshHandler, unregisterAuthRefreshHandler } from "@/utils/authSync";
import { getMe } from "@/utils/userApi";

/** Đồng bộ user/permissions từ BE khi có token (và sau refresh token). */
export default function AuthUserSync() {
  const dispatch = useDispatch();

  useEffect(() => {
    const refresh = async () => {
      const token =
        typeof window !== "undefined"
          ? localStorage.getItem("token") ?? sessionStorage.getItem("token")
          : null;
      if (!token) return;
      try {
        const user = await getMe();
        dispatch(updateUser(user));
      } catch {
        /* ignore — guard hoặc interceptor sẽ xử lý 401 */
      }
    };

    registerAuthRefreshHandler(refresh);
    void refresh();

    return () => unregisterAuthRefreshHandler();
  }, [dispatch]);

  return null;
}
