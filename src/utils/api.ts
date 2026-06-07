import axios from "axios";

// ─── 1. Cấu hình Base URL & Axios Instance ───────────────────────────
const rawBase =
  typeof process !== "undefined" && process.env.NEXT_PUBLIC_API_BASE_URL
    ? process.env.NEXT_PUBLIC_API_BASE_URL.replace(/\/$/, "")
    : "http://localhost:8080";

const API_BASE_URL = `${rawBase}/api`;

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // QUAN TRỌNG: Để trình duyệt tự động gửi kèm Cookie (Refresh Token)
  headers: {
    "Content-Type": "application/json",
  },
});

// Hàm lấy token từ cả 2 loại storage
function getStoredToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("token") ?? sessionStorage.getItem("token");
}

// ─── 2. Request Interceptor: Gắn Token vào Header ───────────────────
api.interceptors.request.use(
  (config) => {
    const token = getStoredToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ─── 3. Response Interceptor: Xử lý 401 & Refresh Token ─────────────
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const currentPath = typeof window !== "undefined" ? window.location.pathname : "";

    // 1. CHẶN TRIỆT ĐỂ: Nếu đang ở trang signin hoặc signup mà lỗi 401 thì dừng ngay
    if (error.response?.status === 401 && (currentPath === "/signin" || currentPath === "/signup")) {
      if (typeof window !== "undefined") {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        sessionStorage.removeItem("token");
      }
      return Promise.reject(error);
    }

    // 2. Tự động Refresh Token nếu KHÔNG phải ở trang đăng nhập
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const res = await axios.post(`${API_BASE_URL}/auth/refresh`, {}, { withCredentials: true });
        const newAccessToken = res.data.data.accessToken;
        
        // Lưu lại token mới vào nơi user đang dùng
        if (sessionStorage.getItem("token")) {
          sessionStorage.setItem("token", newAccessToken);
        } else {
          localStorage.setItem("token", newAccessToken);
        }
        
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

        try {
          const { triggerAuthUserRefresh } = await import("./authSync");
          await triggerAuthUserRefresh();
        } catch {
          /* profile refresh optional */
        }

        return api(originalRequest);
      } catch (refreshError) {
        // Nếu refresh cũng lỗi (hết hạn refresh token) -> Đăng xuất
        if (typeof window !== "undefined") {
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          sessionStorage.removeItem("token");
        }
        
        if (currentPath !== "/signin") {
          window.location.href = "/signin";
        }
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;


// ════════════════════════════════════════════════════════════════════
// ─── 4. ĐỊNH NGHĨA TYPESCRIPT INTERFACES ────────────────────────────
// ════════════════════════════════════════════════════════════════════

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}

export interface User {
  id: number;
  username: string;
  email?: string;
  name: string;
  phone?: string;
  birth?: string;
  gender?: string;
  roles: { id: number; name: string }[];
}

export interface RegisterPayload {
  username: string;
  email: string;
  password: string;
  name: string;
  phone?: string;
  address?: string;
}

export interface UpdateProfilePayload {
  name?: string;
  phone?: string;
  birth?: string;
  gender?: string;
}

export interface ChangePasswordPayload {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface Address {
  id: number;
  receiverName: string;
  phone: string;
  province?: string;
  district?: string;
  ward?: string;
  addressDetail: string;
  label?: string;
  isDefault: boolean;
}

export interface AddressPayload {
  receiverName: string;
  phone: string;
  province?: string;
  district?: string;
  ward?: string;
  addressDetail: string;
  label?: string;
  isDefault?: boolean;
}

export interface CheckoutPayload {
  addressId?: number;
  shippingName?: string;
  shippingPhone?: string;
  shippingAddress?: string;
  shippingProvince?: string;
  shippingDistrict?: string;
  shippingWard?: string;
  toDistrictId?: number;
  toWardCode?: string;
  paymentMethod: string;
  couponCode?: string;
  note?: string;
}

export interface CheckoutOrderResponse {
  id: number;
  orderCode: string;
  status: string;
  statusDisplay?: string;
  paymentMethod: string;
  paymentStatus: string;
  paymentUrl?: string | null;
  subtotal: number;
  shippingFee: number;
  discountAmount: number;
  totalAmount: number;
}

export interface QrGenerateResponse {
  sessionId: string;
  token: string;
  qrContent: string;
  expiresInSeconds: number;
  status: string;
}

export interface QrStatusResponse {
  sessionId: string;
  status: 'PENDING' | 'SCANNED' | 'CONFIRMED' | 'EXPIRED';
  jwtToken?: string;
  user?: User;
  qrType?: 'QR_LOGIN' | 'QR_ORDER_CONFIRMATION';
  orderId?: number;
  orderCode?: string;
  orderStatus?: string;
}

export interface OrderSummary {
  id: number;
  orderCode: string;
  status: string;
  customerName: string;
  customerEmail: string;
  total: number;
  paymentMethod: string;
  paymentStatus: string;
  createdAt: string;
}

export interface OrderDetail extends OrderSummary {
  customerPhone: string;
  shippingAddress: string;
  subtotal: number;
  shippingFee: number;
  discount: number;
  ghnOrderCode?: string;
  updatedAt: string;
  items: OrderItem[];
  timeline: TimelineItem[];
}

export interface OrderItem {
  productId: number;
  productName: string;
  variantInfo?: string;
  imageUrl?: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

export interface TimelineItem {
  status: string;
  note?: string;
  changedBy: string;
  createdAt: string;
}

export interface BulkUpdateResult {
  successCount: number;
  failCount: number;
  errors: string[];
}

export interface Product {
  id: number;
  name: string;
  price: number;
  discountedPrice?: number;
  imageUrl?: string;
  categoryId?: number;
  categoryName?: string;
  stock?: number;
  rating?: number;
  reviewCount?: number;
}

export interface ProductDetail extends Product {
  description?: string;
  images: string[];
  variants?: ProductVariant[];
  attributes?: Record<string, string[]>;
}

export interface ProductVariant {
  id: number;
  sku?: string;
  attributes: Record<string, string>;
  price: number;
  stock: number;
}

export interface Category {
  id: number;
  name: string;
  code?: string;
  iconUrl?: string;
  parentId?: number;
  subCategories?: Category[];
}

export interface Cart {
  id: number;
  items: CartItem[];
  totalItems: number;
  totalAmount: number;
}

export interface CartItem {
  id: number;
  productVariantId?: number;
  productName?: string;
  variantInfo?: string;
  imageUrl?: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
  variant?: {
    id: number;
    variantName?: string;
    imageUrl?: string;
    product?: { id: number; name: string };
  };
}

export interface GhnProvince { provinceId: number; provinceName: string; code?: string; }
export interface GhnDistrict { districtId: number; districtName: string; provinceId?: number; }
export interface GhnWard { wardCode: string; wardName: string; districtId?: number; }

export interface GhnCheckoutShipping {
  shippingFee: number;
  shippingFeeFormatted?: string;
  freeShipping?: boolean;
  estimatedDeliveryDate?: string;
}


// ════════════════════════════════════════════════════════════════════
// ─── 5. API SERVICES EXPORT ─────────────────────────────────────────
// ════════════════════════════════════════════════════════════════════

export const authService = {
  login: (usernameOrEmail: string, password: string) =>
    api.post<ApiResponse<{ token: string; type: string; user: User }>>('/auth/login', {
      usernameOrEmail, password,
    }),

  register: (data: RegisterPayload) =>
    api.post<ApiResponse<User>>('/auth/register', data),

  googleLogin: (idToken: string) =>
    api.post<ApiResponse<{ token: string; type: string; user: User }>>('/auth/google', { idToken }),

  facebookLogin: (accessToken: string) =>
    api.post<ApiResponse<{ token: string; type: string; user: User }>>('/auth/facebook', { accessToken }),

  forgotPassword: (email: string) =>
    api.post<ApiResponse<void>>('/auth/forgot-password', { email }),

  resetPassword: (token: string, newPassword: string) =>
    api.post<ApiResponse<void>>('/auth/reset-password', { token, newPassword }),

  checkUsername: (username: string) =>
    api.post<ApiResponse<boolean>>(`/auth/check-username?username=${username}`),

  checkEmail: (email: string) =>
    api.post<ApiResponse<boolean>>(`/auth/check-email?email=${email}`),
};

export const profileService = {
  getProfile: () => api.get<ApiResponse<User>>("/users/me"),

  updateProfile: (data: UpdateProfilePayload) => api.put<ApiResponse<User>>("/users/me", data),

  changePassword: (data: ChangePasswordPayload) =>
    api.put<ApiResponse<void>>("/users/change-password", data),
};

export const addressService = {
  getAll: () =>
    api.get<ApiResponse<Address[]>>('/addresses'),

  create: (data: AddressPayload) =>
    api.post<ApiResponse<Address>>('/addresses', data),

  update: (id: number, data: Partial<AddressPayload>) =>
    api.put<ApiResponse<Address>>(`/addresses/${id}`, data),

  delete: (id: number) =>
    api.delete<ApiResponse<void>>(`/addresses/${id}`),

  setDefault: (id: number) =>
    api.put<ApiResponse<Address>>(`/addresses/${id}/default`),
};

export const qrService = {
  generate: (qrType: 'QR_LOGIN' | 'QR_ORDER_CONFIRMATION', orderId?: number) =>
    api.post<ApiResponse<QrGenerateResponse>>('/qr/generate', { qrType, orderId }),

  getStatus: (sessionId: string) =>
    api.get<ApiResponse<QrStatusResponse>>(`/qr/status/${sessionId}`),

  scan: (token: string) =>
    api.post<ApiResponse<QrStatusResponse>>('/qr/scan', { token }),

  confirm: (sessionId: string) =>
    api.post<ApiResponse<QrStatusResponse>>('/qr/confirm', { sessionId }),
};

export const productService = {
  getAll: (params?: {
    page?: number; size?: number; keyword?: string; categoryId?: number;
    minPrice?: number; maxPrice?: number; sortBy?: string; sortDir?: string;
  }) =>
    api.get<ApiResponse<PageResponse<Product>>>('/products', { params }),

  getById: (id: number) =>
    api.get<ApiResponse<ProductDetail>>(`/products/${id}`),

  getCategories: () =>
    api.get<ApiResponse<Category[]>>('/categories'),
};

export const cartService = {
  getCart: () =>
    api.get<ApiResponse<Cart>>('/cart'),

  addItem: (variantId: number, quantity: number) =>
    api.post<ApiResponse<Cart>>('/cart', { variantId, quantity }),

  updateItem: (itemId: number, quantity: number) =>
    api.put<ApiResponse<Cart>>(`/cart/${itemId}`, { quantity }),

  removeItem: (itemId: number) =>
    api.delete<ApiResponse<Cart>>(`/cart/${itemId}`),

  clearCart: () =>
    api.delete<ApiResponse<void>>('/cart'),
};

export const checkoutService = {
  placeOrder: (data: CheckoutPayload) =>
    api.post<ApiResponse<CheckoutOrderResponse>>('/orders', data),

  previewCoupon: (code: string) =>
    api.get<ApiResponse<{
      couponCode: string;
      discountType?: string;
      discountValue?: number;
      originalSubtotal?: number;
      discountAmount: number;
      finalAmount: number;
      message?: string;
    }>>('/orders/preview-coupon', { params: { code } }),
};

export const shippingService = {
  getProvinces: () =>
    api.get<ApiResponse<GhnProvince[]>>('/ghn/provinces'),

  getDistricts: (provinceId: number) =>
    api.get<ApiResponse<GhnDistrict[]>>('/ghn/districts', { params: { provinceId } }),

  getWards: (districtId: number) =>
    api.get<ApiResponse<GhnWard[]>>('/ghn/wards', { params: { districtId } }),

  getCheckoutShipping: (data: {
    toDistrictId: number;
    toWardCode: string;
    toProvinceId?: number;
    orderSubtotal?: number;
  }) =>
    api.post<ApiResponse<GhnCheckoutShipping>>('/ghn/checkout', data),
};

export type PaymentUrlResponse = {
  orderCode: string;
  paymentMethod: string;
  paymentUrl: string;
  transactionRef: string;
  amount: number;
};

export type PaymentStatusResponse = {
  orderCode: string;
  paymentMethod: string;
  paymentStatus: string;
  transactionRef?: string;
  amount?: number;
  paidAt?: string;
  gatewayTransactionId?: string;
  message?: string;
};

export const paymentService = {
  createPayment: (data: {
    orderCode: string;
    bankCode?: string;
    language?: string;
  }) => api.post<ApiResponse<PaymentUrlResponse>>('/payment/create', data),

  retryPayment: (data: {
    orderCode: string;
    bankCode?: string;
    language?: string;
  }) => api.post<ApiResponse<PaymentUrlResponse>>('/payment/retry', data),

  getStatus: (orderCode: string) =>
    api.get<ApiResponse<PaymentStatusResponse>>(`/payment/status/${orderCode}`),
};