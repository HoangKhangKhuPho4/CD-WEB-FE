"use client";

import { useEffect, useRef } from "react";
import { useDispatch } from "react-redux";
import { AppDispatch, useAppSelector } from "@/redux/store";
import { loadCartFromApi } from "@/utils/cartSync";

/** Đồng bộ giỏ hàng từ API sau khi đăng nhập. */
export default function CartSyncBootstrap() {
  const dispatch = useDispatch<AppDispatch>();
  const { isAuthenticated } = useAppSelector((state) => state.authReducer);
  const syncedRef = useRef(false);

  useEffect(() => {
    if (!isAuthenticated) {
      syncedRef.current = false;
      return;
    }
    if (syncedRef.current) return;
    syncedRef.current = true;
    void loadCartFromApi(dispatch);
  }, [dispatch, isAuthenticated]);

  return null;
}
