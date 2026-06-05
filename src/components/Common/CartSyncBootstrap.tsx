"use client";

import { useEffect, useRef, useState } from "react";
import { useDispatch } from "react-redux";
import toast from "react-hot-toast";
import { AppDispatch, useAppSelector } from "@/redux/store";
import type { CartItem } from "@/redux/features/cart-slice";
import CartMergeModal, {
  type CartMergeChoice,
} from "@/components/Common/CartMergeModal";
import {
  clearCartApi,
  getServerCartItemCount,
  isGuestCartItem,
  loadCartFromApi,
  mergeGuestItemsToApi,
} from "@/utils/cartSync";

/** Đồng bộ giỏ hàng sau đăng nhập; gộp giỏ khách nếu cần. */
export default function CartSyncBootstrap() {
  const dispatch = useDispatch<AppDispatch>();
  const { isAuthenticated } = useAppSelector((state) => state.authReducer);
  const cartItems = useAppSelector((state) => state.cartReducer.items);
  const syncedRef = useRef(false);
  const awaitingChoiceRef = useRef(false);

  const [mergeOpen, setMergeOpen] = useState(false);
  const [guestSnapshot, setGuestSnapshot] = useState<CartItem[]>([]);
  const [serverCount, setServerCount] = useState(0);
  const [merging, setMerging] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      syncedRef.current = false;
      awaitingChoiceRef.current = false;
      setMergeOpen(false);
      setGuestSnapshot([]);
      return;
    }
    if (syncedRef.current || awaitingChoiceRef.current) return;

    const guestItems = cartItems.filter(isGuestCartItem);
    if (guestItems.length === 0) {
      syncedRef.current = true;
      void loadCartFromApi(dispatch);
      return;
    }

    let cancelled = false;
    void (async () => {
      const count = await getServerCartItemCount();
      if (cancelled) return;

      if (count === 0) {
        const { merged, failed } = await mergeGuestItemsToApi(
          dispatch,
          guestItems
        );
        syncedRef.current = true;
        if (merged > 0) {
          toast.success(`Đã đồng bộ ${merged} sản phẩm vào giỏ tài khoản`);
        }
        if (failed > 0) {
          toast.error(`${failed} sản phẩm không thêm được`);
        }
        return;
      }

      awaitingChoiceRef.current = true;
      setGuestSnapshot([...guestItems]);
      setServerCount(count);
      setMergeOpen(true);
    })();

    return () => {
      cancelled = true;
    };
  }, [dispatch, isAuthenticated, cartItems]);

  const handleMergeChoice = async (choice: CartMergeChoice) => {
    setMerging(true);
    try {
      if (choice === "keep_server") {
        await loadCartFromApi(dispatch);
        toast.success("Đã tải giỏ hàng tài khoản");
      } else if (choice === "replace") {
        await clearCartApi(dispatch, true);
        const { merged, failed } = await mergeGuestItemsToApi(
          dispatch,
          guestSnapshot
        );
        if (merged > 0) toast.success(`Đã lưu ${merged} sản phẩm lên tài khoản`);
        if (failed > 0) toast.error(`${failed} sản phẩm không thêm được`);
      } else {
        const { merged, failed } = await mergeGuestItemsToApi(
          dispatch,
          guestSnapshot
        );
        if (merged > 0) toast.success(`Đã gộp ${merged} sản phẩm vào giỏ`);
        if (failed > 0) toast.error(`${failed} sản phẩm không gộp được`);
      }
      syncedRef.current = true;
      awaitingChoiceRef.current = false;
      setMergeOpen(false);
      setGuestSnapshot([]);
    } finally {
      setMerging(false);
    }
  };

  return (
    <CartMergeModal
      open={mergeOpen}
      guestCount={guestSnapshot.length}
      serverCount={serverCount}
      loading={merging}
      onChoose={(c) => void handleMergeChoice(c)}
    />
  );
}
