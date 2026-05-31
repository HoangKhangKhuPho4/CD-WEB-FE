import api from "./api";
import type { ApiResponse } from "@/types/api";

export type GhnTrackingLog = {
  status: string;
  statusDisplay?: string;
  updatedDate?: string;
  location?: string;
};

export type GhnTrackingResponse = {
  orderCode: string;
  status: string;
  statusDisplay?: string;
  currentLocation?: string;
  expectedDeliveryTime?: string;
  logs?: GhnTrackingLog[];
};

/** Tra cứu vận đơn GHN (public — `/api/shipping/tracking/{code}`). */
export async function trackGhnShipment(
  trackingCode: string
): Promise<GhnTrackingResponse | null> {
  if (!trackingCode?.trim()) return null;
  try {
    const res = await api.get<ApiResponse<GhnTrackingResponse>>(
      `/shipping/tracking/${encodeURIComponent(trackingCode.trim())}`
    );
    if (res.data?.success && res.data.data) {
      return res.data.data;
    }
  } catch {
    /* ignore */
  }
  return null;
}
