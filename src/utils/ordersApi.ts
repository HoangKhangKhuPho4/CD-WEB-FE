import api from './api';

// 1. Lấy danh sách đơn hàng (phân trang + filter trạng thái)
export const getOrdersApi = async (
  page: number = 0,
  size: number = 10,
  status?: string
) => {
  const params: Record<string, any> = { page, size };
  if (status) {
    params.status = status;
  }
  const res = await api.get('/orders', { params });
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
