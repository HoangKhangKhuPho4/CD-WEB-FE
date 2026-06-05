import api from "./api";
import type { ApiResponse } from "@/types/api";

export type StoreSettings = {
  defaultShippingFee?: number;
  freeShippingThreshold?: number;
  codEnabled?: boolean;
  vnpayEnabled?: boolean;
  momoEnabled?: boolean;
  zalopayEnabled?: boolean;
  supportEmail?: string;
  supportHotline?: string;
  siteFooterText?: string;
  platformLanguage?: string;
};

export async function fetchStoreSettings(): Promise<StoreSettings | null> {
  try {
    const res = await api.get<ApiResponse<StoreSettings>>("/settings/general");
    if (res.data?.success && res.data.data) {
      return res.data.data;
    }
  } catch {
    /* ignore */
  }
  return null;
}
