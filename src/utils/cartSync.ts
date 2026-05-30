import { AppDispatch } from "@/redux/store";
import {
  addItemToCart,
  setCartItems,
  type CartItem,
} from "@/redux/features/cart-slice";
import { cartService, type Cart, type CartItem as ApiCartItem } from "@/utils/api";
import { fetchProductDetail } from "@/utils/productApi";
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
    const img =
      item.imageUrl ||
      v?.imageUrl ||
      "/images/products/product-1-bg-1.png";
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

/**
 * Thêm sản phẩm vào giỏ: gọi API khi đã đăng nhập, luôn cập nhật Redux cho UI.
 */
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

  toast.success(
    "Đã thêm vào giỏ (đăng nhập để đồng bộ với tài khoản)"
  );
  return true;
}

/** Thêm từ grid/quick view: lấy biến thể mặc định từ API khi đã đăng nhập. */
export async function addProductToCartByProductId(
  dispatch: AppDispatch,
  isAuthenticated: boolean,
  productId: number,
  quantity: number,
  product: CartProductPayload
): Promise<boolean> {
  if (!isAuthenticated) {
    return addProductToCart(
      dispatch,
      false,
      productId,
      quantity,
      product
    );
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
    return addProductToCart(
      dispatch,
      true,
      variantId,
      quantity,
      {
        ...product,
        price,
        discountedPrice: price,
      }
    );
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
