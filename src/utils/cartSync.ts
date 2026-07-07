import { AppDispatch } from "@/redux/store";
import {
  addItemToCart,
  setCartItems,
  updateCartItemQuantity,
  removeItemFromCart,
  type CartItem,
} from "@/redux/features/cart-slice";
import { cartService, type Cart, type CartItem as ApiCartItem } from "@/utils/api";
import { fetchProductDetail } from "@/utils/productApi";
import { resolveBackendImageUrl } from "@/utils/productMapper";
import toast from "react-hot-toast";

export type CartProductPayload = {
  id: number;
  title: string;
  price: number;
  discountedPrice: number;
  imgs?: {
    thumbnails: string[];
    previews: string[];
  };
};

export function formatVnd(amount: number) {
  return amount.toLocaleString("vi-VN") + "₫";
}

export function mapApiCartToReduxItems(cart: Cart): CartItem[] {
  return (cart.items ?? []).map((item: ApiCartItem) => {
    const v = item.variant;
    const rawImg = item.imageUrl || v?.imageUrl;
    const img = resolveBackendImageUrl(rawImg) || "/images/products/product-1-bg-1.png";
    const productId = v?.product?.id ?? 0;
    return {
      id: item.id,
      productId,
      variantId: v?.id ?? item.productVariantId,
      title:
        [v?.product?.name ?? item.productName, item.variantInfo ?? v?.variantName]
          .filter(Boolean)
          .join(" – ") || "Sản phẩm",
      price: item.unitPrice,
      discountedPrice: item.unitPrice,
      quantity: item.quantity,
      imgs: { thumbnails: [img], previews: [img] },
    };
  });
}

export async function loadCartFromApi(dispatch: AppDispatch): Promise<void> {
  const res = await cartService.getCart();
  if (res.data?.success && res.data.data) {
    dispatch(setCartItems(mapApiCartToReduxItems(res.data.data)));
  }
}

export async function sanitizeGuestCartItems(
  dispatch: AppDispatch,
  items: CartItem[]
): Promise<void> {
  const guestItems = items.filter(isGuestCartItem);
  if (guestItems.length === 0) return;

  const kept: CartItem[] = [];
  let removed = 0;

  for (const item of items) {
    if (!isGuestCartItem(item)) {
      kept.push(item);
      continue;
    }
    const productId = item.productId ?? item.id;
    try {
      const raw = await fetchProductDetail(productId);
      const active = raw != null && raw.active !== 0;
      if (active && raw?.variants?.some((v) => v.isActive !== false)) {
        kept.push(item);
      } else {
        removed += 1;
      }
    } catch {
      removed += 1;
    }
  }

  if (removed > 0) {
    dispatch(setCartItems(kept));
    toast.success("Đã loại bỏ sản phẩm không còn kinh doanh khỏi giỏ hàng");
  }
}

export function isGuestCartItem(item: CartItem): boolean {
  return item.variantId == null;
}

export async function mergeGuestItemsToApi(
  dispatch: AppDispatch,
  guestItems: CartItem[]
): Promise<{ merged: number; failed: number }> {
  let merged = 0;
  let failed = 0;

  for (const item of guestItems) {
    try {
      let variantId = item.variantId;
      const productId = item.productId ?? item.id;
      if (!variantId && productId) {
        const raw = await fetchProductDetail(productId);
        variantId = resolveDefaultVariantId(raw?.variants) ?? undefined;
      }
      if (!variantId) {
        failed += 1;
        continue;
      }
      const res = await cartService.addItem(variantId, item.quantity);
      if (res.data?.success) {
        merged += 1;
      } else {
        failed += 1;
      }
    } catch {
      failed += 1;
    }
  }

  await loadCartFromApi(dispatch);
  return { merged, failed };
}

export async function getServerCartItemCount(): Promise<number> {
  try {
    const res = await cartService.getCart();
    return res.data?.data?.items?.length ?? 0;
  } catch {
    return 0;
  }
}


export function updateCartLineQuantityOptimistic(
  dispatch: AppDispatch,
  isAuthenticated: boolean,
  cartLineId: number,
  newQuantity: number,
  previousQuantity: number
): void {
  if (newQuantity < 1) return;

  dispatch(updateCartItemQuantity({ id: cartLineId, quantity: newQuantity }));

  if (!isAuthenticated) return;

  void (async () => {
    try {
      const res = await cartService.updateItem(cartLineId, newQuantity);
      if (res.data?.success && res.data.data) {
        dispatch(setCartItems(mapApiCartToReduxItems(res.data.data)));
      } else {
        dispatch(updateCartItemQuantity({ id: cartLineId, quantity: previousQuantity }));
        toast.error(res.data?.message || "Không cập nhật được giỏ hàng");
      }
    } catch (err: unknown) {
      dispatch(updateCartItemQuantity({ id: cartLineId, quantity: previousQuantity }));
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        "Không cập nhật được giỏ hàng";
      toast.error(msg);
    }
  })();
}

export function removeCartLineOptimistic(
  dispatch: AppDispatch,
  isAuthenticated: boolean,
  cartLineId: number,
  itemSnapshot: CartItem 
): void {
  dispatch(removeItemFromCart(cartLineId));

  if (!isAuthenticated) return;

  void (async () => {
    try {
      const res = await cartService.removeItem(cartLineId);
      if (res.data?.success && res.data.data) {
        dispatch(setCartItems(mapApiCartToReduxItems(res.data.data)));
      } else {
        dispatch(addItemToCart(itemSnapshot));
        toast.error(res.data?.message || "Không xóa được sản phẩm");
      }
    } catch (err: unknown) {
      dispatch(addItemToCart(itemSnapshot));
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        "Không xóa được sản phẩm";
      toast.error(msg);
    }
  })();
}


/** @deprecated Dùng updateCartLineQuantityOptimistic thay thế */
export async function updateCartLineQuantity(
  dispatch: AppDispatch,
  isAuthenticated: boolean,
  cartLineId: number,
  quantity: number
): Promise<boolean> {
  if (quantity < 1) return false;
  if (isAuthenticated) {
    try {
      const res = await cartService.updateItem(cartLineId, quantity);
      if (res.data?.success && res.data.data) {
        dispatch(setCartItems(mapApiCartToReduxItems(res.data.data)));
        return true;
      }
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message || "Không cập nhật được giỏ hàng";
      toast.error(msg);
      return false;
    }
  }
  return true;
}

/** @deprecated Dùng removeCartLineOptimistic thay thế */
export async function removeCartLine(
  dispatch: AppDispatch,
  isAuthenticated: boolean,
  cartLineId: number
): Promise<boolean> {
  if (isAuthenticated) {
    try {
      const res = await cartService.removeItem(cartLineId);
      if (res.data?.success && res.data.data) {
        dispatch(setCartItems(mapApiCartToReduxItems(res.data.data)));
        return true;
      }
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message || "Không xóa được sản phẩm";
      toast.error(msg);
      return false;
    }
  }
  return true;
}

export async function clearCartApi(
  dispatch: AppDispatch,
  isAuthenticated: boolean
): Promise<boolean> {
  if (isAuthenticated) {
    try {
      await cartService.clearCart();
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message || "Không xóa được giỏ hàng";
      toast.error(msg);
      return false;
    }
  }
  dispatch(setCartItems([]));
  return true;
}

export async function addProductToCart(
  dispatch: AppDispatch,
  isAuthenticated: boolean,
  variantId: number,
  quantity: number,
  product: CartProductPayload
): Promise<boolean> {
  if (quantity < 1) {
    toast.error("Số lượng không hợp lệ");
    return false;
  }

  if (isAuthenticated) {
    try {
      const res = await cartService.addItem(variantId, quantity);
      if (res.data?.success && res.data.data) {
        dispatch(setCartItems(mapApiCartToReduxItems(res.data.data)));
        toast.success("Đã thêm vào giỏ hàng");
        return true;
      }
      toast.error(res.data?.message || "Không thêm được vào giỏ hàng");
      return false;
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message || "Không thêm được vào giỏ hàng";
      toast.error(msg);
      return false;
    }
  }

  dispatch(
    addItemToCart({
      id: product.id,
      productId: product.id,
      title: product.title,
      price: product.price,
      discountedPrice: product.discountedPrice,
      quantity,
      imgs: product.imgs,
    })
  );

  toast.success("Đã thêm vào giỏ (đăng nhập để đồng bộ với tài khoản)");
  return true;
}

export async function addProductToCartByProductId(
  dispatch: AppDispatch,
  isAuthenticated: boolean,
  productId: number,
  quantity: number,
  product: CartProductPayload
): Promise<boolean> {
  if (!isAuthenticated) {
    return addProductToCart(dispatch, false, productId, quantity, product);
  }

  try {
    const raw = await fetchProductDetail(productId);
    const variantId = resolveDefaultVariantId(raw?.variants);
    if (!variantId) {
      toast.error("Sản phẩm chưa có biến thể");
      return false;
    }
    const variant = raw?.variants?.find((v) => v.id === variantId);
    const price = variant?.price ?? product.discountedPrice;
    return addProductToCart(dispatch, true, variantId, quantity, {
      ...product,
      price,
      discountedPrice: price,
    });
  } catch {
    toast.error("Không tải được thông tin sản phẩm");
    return false;
  }
}

export function resolveDefaultVariantId(
  variants: { id: number; isDefault?: boolean }[] | undefined
): number | null {
  if (!variants?.length) return null;
  const picked = variants.find((v) => v.isDefault) ?? variants[0];
  return picked?.id ?? null;
}
