import api from "./api";
import type { ApiResponse } from "@/types/api";

export type PublicCoupon = {
  code: string;
  name?: string;
  description?: string;
  discountType: string;
  discountValue: number;
  minOrderValue?: number;
  maxDiscountAmount?: number;
  dateEnd?: string;
};

export type CouponValidateResult = {
  valid: boolean;
  code?: string;
  message?: string;
  discountType?: string;
  discountValue?: number;
  discountAmount?: number;
  originalSubtotal?: number;
  finalAmount?: number;
};

function extractError(err: unknown, fallback: string): string {
  const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
  return msg || fallback;
}

export async function fetchAvailableCoupons(): Promise<{
  ok: boolean;
  data: PublicCoupon[];
  message?: string;
}> {
  try {
    const res = await api.get<ApiResponse<PublicCoupon[]>>("/coupons");
    if (res.data.success) {
      return { ok: true, data: res.data.data ?? [] };
    }
    return { ok: false, data: [], message: res.data.message };
  } catch (err) {
    return { ok: false, data: [], message: extractError(err, "Không tải được mã giảm giá") };
  }
}

export async function fetchCouponByCode(code: string): Promise<{
  ok: boolean;
  data?: PublicCoupon;
  message?: string;
}> {
  try {
    const res = await api.get<ApiResponse<PublicCoupon>>(
      `/coupons/${encodeURIComponent(code.trim())}`
    );
    if (res.data.success) {
      return { ok: true, data: res.data.data };
    }
    return { ok: false, message: res.data.message };
  } catch (err) {
    return { ok: false, message: extractError(err, "Không tìm thấy mã giảm giá") };
  }
}

export async function validateCoupon(
  code: string,
  subtotal?: number
): Promise<{ ok: boolean; data?: CouponValidateResult; message?: string }> {
  try {
    const res = await api.post<ApiResponse<CouponValidateResult>>("/coupons/validate", {
      code: code.trim(),
      subtotal,
    });
    if (res.data.success) {
      return { ok: true, data: res.data.data };
    }
    return { ok: false, message: res.data.message };
  } catch (err) {
    return { ok: false, message: extractError(err, "Kiểm tra mã thất bại") };
  }
}

export function formatCouponLabel(c: PublicCoupon): string {
  const type = c.discountType?.toUpperCase();
  const value =
    type === "PERCENT"
      ? `${c.discountValue}%`
      : `${Number(c.discountValue).toLocaleString("vi-VN")}₫`;
  return c.name ? `${c.code} — ${value} (${c.name})` : `${c.code} — ${value}`;
}
