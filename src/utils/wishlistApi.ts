import api from './api';

// 1. Thêm sản phẩm vào Wishlist
export const addToWishlistApi = async (productId: number, variantId?: number | null) => {
  const res = await api.post('/wishlist', { productId, variantId: variantId || null });
  return res.data;
};

// 2. Kiểm tra trạng thái yêu thích
export const checkWishlistStatus = async (productId: number): Promise<boolean> => {
  const res = await api.get(`/wishlist/check/${productId}`);
  if (res.data.success) {
    return res.data.data; // true or false
  }
  return false;
};

// 3. Lấy danh sách Wishlist (phân trang)
export const getWishlistApi = async (page: number = 0, size: number = 10) => {
  const res = await api.get('/wishlist', { params: { page, size } });
  return res.data;
};

// 4. Xóa khỏi Wishlist theo productId
export const removeFromWishlistByProductId = async (productId: number) => {
  const res = await api.delete(`/wishlist/product/${productId}`);
  return res.data;
};

// 5. Xóa khỏi Wishlist theo wishlist record ID
export const removeFromWishlistById = async (id: number) => {
  const res = await api.delete(`/wishlist/${id}`);
  return res.data;
};

// 6. Xóa toàn bộ Wishlist
export const clearAllWishlistApi = async () => {
  const res = await api.delete('/wishlist/clear');
  return res.data;
};
