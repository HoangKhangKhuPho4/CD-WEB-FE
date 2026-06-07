import api, { type ApiResponse } from "./api";
import type { Page } from "@/types/api";

export type OrderSummaryApi = {
  id: number;
  orderCode: string;
  status: string;
  statusDisplay: string;
  paymentMethod: string;
  paymentStatus: string;
  totalAmount: number;
  totalItems: number;
  firstItemName: string;
  firstItemImage: string;
  orderDate: string;
};

// 1. Lấy danh sách đơn hàng (phân trang + filter trạng thái)
export const getOrdersApi = async (
  page: number = 0,
  size: number = 10,
  status?: string
): Promise<ApiResponse<Page<OrderSummaryApi>>> => {
  const params: Record<string, string | number> = { page, size };
  if (status) {
    params.status = status;
  }
  const res = await api.get<ApiResponse<Page<OrderSummaryApi>>>("/orders", { params });
  return res.data;
};

// 2. Xem chi tiết đơn hàng
export const getOrderDetailApi = async (orderCode: string) => {
  const res = await api.get(`/orders/${orderCode}`);
  return res.data;
};

// 3. Hủy đơn hàng
export const cancelOrderApi = async (orderId: number, reason?: string) => {
  const res = await api.put(`/orders/${orderId}/cancel`, { reason: reason || '' });
  return res.data;
};

// 4. Đặt lại — thêm sản phẩm đơn cũ vào giỏ
export const reorderOrderApi = async (orderCode: string) => {
  const res = await api.post(`/orders/${orderCode}/reorder`);
  return res.data;
};
