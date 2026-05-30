"use client";

import { useEffect, useRef } from "react";
import { useDispatch } from "react-redux";
import { AppDispatch, useAppSelector } from "@/redux/store";
import { fetchWishlist } from "@/redux/features/wishlist-slice";

/**
 * Đồng bộ danh sách yêu thích sau khi đăng nhập (likedMap + số lượng).
 */
export default function WishlistBootstrap() {
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
    void dispatch(fetchWishlist({ page: 0, size: 100 }));
  }, [dispatch, isAuthenticated]);

  return null;
}
