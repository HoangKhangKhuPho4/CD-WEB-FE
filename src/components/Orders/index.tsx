"use client";
import React, { useEffect, useState, useCallback } from "react";
import { getOrdersApi, cancelOrderApi, getOrderDetailApi } from "@/utils/ordersApi";
import { useAppSelector } from "@/redux/store";
import { hasPermission, hasStaffRole } from "@/utils/rbac";
import Link from "next/link";
import Image from "next/image";
import toast from "react-hot-toast";

// --- Types ---
type OrderSummary = {
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

type OrderItem = {
  id: number;
  variantId?: number;
  productName: string;
  variantName?: string;
  skuCode?: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  imageUrl?: string;
  assignedImeis?: string[];
};

type OrderDetail = {
  id: number;
  orderCode: string;
  shippingName: string;
  shippingPhone: string;
  shippingAddress: string;
  shippingProvince: string;
  shippingDistrict: string;
  shippingWard: string;
  shippingFee: number;
  paymentMethod: string;
  paymentStatus: string;
  status: string;
  statusDisplay: string;
  paymentUrl?: string | null;
  transactionRef?: string | null;
  subtotal: number;
  discountAmount: number;
  totalAmount: number;
  orderDate: string;
  confirmedAt?: string | null;
  deliveredAt?: string | null;
  cancelledAt?: string | null;
  cancelReason?: string | null;
  items: OrderItem[];
};

// --- Status tabs ---
const STATUS_TABS = [
  { key: "", label: "Tất cả" },
  { key: "PENDING", label: "Chờ xác nhận" },
  { key: "PROCESSING", label: "Đang xử lý" },
  { key: "SHIPPING", label: "Đang giao" },
  { key: "DELIVERED", label: "Đã giao" },
  { key: "COMPLETED", label: "Hoàn thành" },
  { key: "CANCELLED", label: "Đã hủy" },
];

// --- Status badge colors ---
const getStatusColor = (status: string) => {
  switch (status) {
    case "PENDING":
      return "bg-yellow-light-4 text-yellow";
    case "PROCESSING":
      return "bg-blue-light-5 text-blue";
    case "SHIPPING":
      return "bg-[#fff3e0] text-[#e65100]";
    case "DELIVERED":
      return "bg-green-light-6 text-green";
    case "COMPLETED":
      return "bg-green-light-6 text-green";
    case "CANCELLED":
      return "bg-red-light-6 text-red";
    default:
      return "bg-gray-2 text-dark";
  }
};

// --- Format VNĐ ---
const formatCurrency = (amount: number) => {
  return amount?.toLocaleString("vi-VN") + "₫";
};

// --- Format date ---
const formatDate = (dateStr: string) => {
  if (!dateStr) return "";
  return new Date(dateStr).toLocaleDateString("vi-VN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
};

// ==========================================
// ORDER DETAIL MODAL
// ==========================================
const OrderDetailModal = ({
  isOpen,
  onClose,
  orderCode,
  onCancelSuccess,
}: {
  isOpen: boolean;
  onClose: () => void;
  orderCode: string;
  onCancelSuccess: () => void;
}) => {
  const [detail, setDetail] = useState<OrderDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    if (isOpen && orderCode) {
      setLoading(true);
      getOrderDetailApi(orderCode)
        .then((data) => {
          if (data.success) {
            setDetail(data.data);
          } else {
            toast.error(data.message || "Không thể tải chi tiết đơn hàng");
          }
        })
        .catch(() => {
          toast.error("Không thể tải chi tiết đơn hàng");
        })
        .finally(() => setLoading(false));
    }
  }, [isOpen, orderCode]);

  const handleCancelOrder = async () => {
    if (!detail) return;
    setCancelling(true);
    try {
      const data = await cancelOrderApi(detail.id, cancelReason);
      if (data.success) {
        toast.success("Đã hủy đơn hàng thành công!");
        setCancelModalOpen(false);
        setCancelReason("");
        onCancelSuccess();
        onClose();
      } else {
        toast.error(data.message || "Không thể hủy đơn hàng");
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Không thể hủy đơn hàng");
    } finally {
      setCancelling(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/40 px-4 py-8 sm:px-8">
      <div className="relative w-full max-w-[700px] max-h-[90vh] overflow-y-auto rounded-2xl bg-white shadow-xl">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-gray-2 hover:bg-red-light-6 hover:text-red ease-out duration-200"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </button>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue"></div>
          </div>
        ) : detail ? (
          <div className="p-6 sm:p-8">
            {/* Header */}
            <div className="flex flex-wrap items-center justify-between gap-3 mb-6 pr-8">
              <div>
                <h3 className="text-xl font-semibold text-dark">
                  Đơn hàng #{detail.orderCode}
                </h3>
                <p className="text-sm text-gray-500 mt-1">
                  Ngày đặt: {formatDate(detail.orderDate)}
                </p>
              </div>
              <span
                className={`inline-block text-sm font-medium py-1.5 px-4 rounded-full ${getStatusColor(
                  detail.status
                )}`}
              >
                {detail.statusDisplay}
              </span>
            </div>

            {/* Shipping info */}
            <div className="bg-gray-1 rounded-lg p-5 mb-6">
              <h4 className="font-medium text-dark mb-3 flex items-center gap-2">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <path d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" stroke="currentColor" strokeWidth="2" />
                  <path d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" stroke="currentColor" strokeWidth="2" />
                </svg>
                Thông tin giao hàng
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                <p><span className="text-gray-500">Người nhận:</span> <span className="text-dark font-medium">{detail.shippingName}</span></p>
                <p><span className="text-gray-500">Điện thoại:</span> <span className="text-dark">{detail.shippingPhone}</span></p>
                <p className="sm:col-span-2">
                  <span className="text-gray-500">Địa chỉ:</span>{" "}
                  <span className="text-dark">
                    {detail.shippingAddress}, {detail.shippingWard}, {detail.shippingDistrict}, {detail.shippingProvince}
                  </span>
                </p>
              </div>
            </div>

            {/* Order items */}
            <div className="mb-6">
              <h4 className="font-medium text-dark mb-3">Sản phẩm đặt hàng</h4>
              <div className="space-y-3">
                {detail.items.map((orderItem) => (
                  <div
                    key={orderItem.id}
                    className="flex items-center gap-4 p-3 rounded-lg border border-gray-3"
                  >
                    <div className="flex-shrink-0 w-16 h-16 bg-gray-1 rounded-lg overflow-hidden flex items-center justify-center">
                      {orderItem.imageUrl ? (
                        <Image
                          src={orderItem.imageUrl}
                          alt={orderItem.productName}
                          width={64}
                          height={64}
                          className="object-cover"
                        />
                      ) : (
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-gray-400">
                          <path d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" stroke="currentColor" strokeWidth="2" />
                        </svg>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-dark text-sm truncate">
                        {orderItem.productName}
                      </p>
                      {orderItem.variantName && (
                        <p className="text-xs text-gray-500 mt-0.5">
                          Phân loại: {orderItem.variantName}
                        </p>
                      )}
                      <p className="text-xs text-gray-500 mt-0.5">
                        x{orderItem.quantity}
                      </p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="font-medium text-dark text-sm">
                        {formatCurrency(orderItem.totalPrice)}
                      </p>
                      <p className="text-xs text-gray-500">
                        {formatCurrency(orderItem.unitPrice)}/sp
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Payment summary */}
            <div className="bg-gray-1 rounded-lg p-5 mb-6">
              <h4 className="font-medium text-dark mb-3">Thanh toán</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Tạm tính:</span>
                  <span className="text-dark">{formatCurrency(detail.subtotal)}</span>
                </div>
                {detail.discountAmount > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Giảm giá:</span>
                    <span className="text-green">-{formatCurrency(detail.discountAmount)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-gray-500">Phí vận chuyển:</span>
                  <span className="text-dark">{formatCurrency(detail.shippingFee)}</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-gray-3">
                  <span className="font-semibold text-dark">Tổng cộng:</span>
                  <span className="font-semibold text-lg text-red">{formatCurrency(detail.totalAmount)}</span>
                </div>
                <div className="flex justify-between mt-2">
                  <span className="text-gray-500">Phương thức:</span>
                  <span className="text-dark font-medium">{detail.paymentMethod}</span>
                </div>
              </div>
            </div>

            {/* Cancel reason if cancelled */}
            {detail.status === "CANCELLED" && detail.cancelReason && (
              <div className="bg-red-light-6 rounded-lg p-4 mb-6">
                <p className="text-sm text-red font-medium">Lý do hủy:</p>
                <p className="text-sm text-dark mt-1">{detail.cancelReason}</p>
              </div>
            )}

            {/* Action buttons */}
            <div className="flex flex-wrap gap-3 justify-end">
              {detail.status === "PENDING" && (
                <button
                  onClick={() => setCancelModalOpen(true)}
                  className="px-6 py-2.5 rounded-md border border-red text-red font-medium ease-out duration-200 hover:bg-red hover:text-white"
                >
                  Hủy đơn hàng
                </button>
              )}
              <button
                onClick={onClose}
                className="px-6 py-2.5 rounded-md bg-blue text-white font-medium ease-out duration-200 hover:bg-blue-dark"
              >
                Đóng
              </button>
            </div>
          </div>
        ) : (
          <div className="py-20 text-center text-gray-500">
            Không tìm thấy đơn hàng
          </div>
        )}

        {/* Cancel confirmation modal */}
        {cancelModalOpen && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/30 rounded-2xl">
            <div className="bg-white rounded-xl p-6 m-4 max-w-[400px] w-full shadow-xl">
              <h4 className="font-semibold text-dark text-lg mb-3">
                Xác nhận hủy đơn hàng
              </h4>
              <p className="text-sm text-gray-500 mb-4">
                Bạn có chắc muốn hủy đơn hàng #{detail?.orderCode}?
              </p>
              <textarea
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                placeholder="Nhập lý do hủy (tùy chọn)..."
                className="w-full rounded-lg border border-gray-3 bg-gray-1 py-3 px-4 text-sm outline-none focus:border-blue focus:ring-2 focus:ring-blue/20 resize-none"
                rows={3}
              />
              <div className="flex gap-3 mt-4 justify-end">
                <button
                  onClick={() => {
                    setCancelModalOpen(false);
                    setCancelReason("");
                  }}
                  className="px-5 py-2 rounded-md border border-gray-3 text-dark font-medium ease-out duration-200 hover:bg-gray-2"
                >
                  Quay lại
                </button>
                <button
                  onClick={handleCancelOrder}
                  disabled={cancelling}
                  className="px-5 py-2 rounded-md bg-red text-white font-medium ease-out duration-200 hover:bg-red/90 disabled:opacity-50"
                >
                  {cancelling ? "Đang hủy..." : "Xác nhận hủy"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// ==========================================
// MAIN ORDERS COMPONENT
// ==========================================
const Orders = () => {
  const [orders, setOrders] = useState<OrderSummary[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeStatus, setActiveStatus] = useState("");
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [selectedOrderCode, setSelectedOrderCode] = useState("");
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const { isAuthenticated, user } = useAppSelector((state) => state.authReducer);
  const canViewCustomerOrders = hasPermission(user, "USER_ORDER_HISTORY");
  const isStaff = hasStaffRole(user);

  const fetchOrders = useCallback(
    async (page: number = 0, status: string = "") => {
      if (!isAuthenticated || !canViewCustomerOrders) return;
      setLoading(true);
      try {
        const data = await getOrdersApi(page, 10, status || undefined);
        if (data.success) {
          setOrders(data.data.content || []);
          setTotalPages(data.data.totalPages || 0);
          setTotalElements(data.data.totalElements || 0);
          setCurrentPage(data.data.pageable?.pageNumber || 0);
        }
      } catch (err) {
        console.error("Fetch orders error:", err);
      } finally {
        setLoading(false);
      }
    },
    [isAuthenticated, canViewCustomerOrders]
  );

  useEffect(() => {
    if (canViewCustomerOrders) {
      fetchOrders(0, activeStatus);
    }
  }, [fetchOrders, activeStatus, canViewCustomerOrders]);

  const handleTabChange = (status: string) => {
    setActiveStatus(status);
    setCurrentPage(0);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    fetchOrders(page, activeStatus);
  };

  const handleViewDetail = (orderCode: string) => {
    setSelectedOrderCode(orderCode);
    setDetailModalOpen(true);
  };

  const handleCancelSuccess = () => {
    fetchOrders(currentPage, activeStatus);
  };

  if (!isAuthenticated) {
    return (
      <div className="py-10 px-7.5 text-center">
        <p className="text-gray-500">Vui lòng đăng nhập để xem đơn hàng</p>
      </div>
    );
  }

  if (isStaff && !canViewCustomerOrders) {
    return (
      <div className="py-10 px-7.5 text-center space-y-3">
        <p className="text-gray-600">
          Tài khoản nhân viên không dùng trang đơn hàng khách hàng.
        </p>
        <Link
          href="/admin/orders"
          className="inline-flex text-sm font-medium text-blue hover:underline"
        >
          Mở Quản lý đơn hàng (Admin)
        </Link>
      </div>
    );
  }

  return (
    <>
      {/* Status tabs */}
      <div className="flex flex-wrap gap-2 py-4 px-4 sm:px-7.5 border-b border-gray-3">
        {STATUS_TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => handleTabChange(tab.key)}
            className={`py-2 px-4 rounded-full text-sm font-medium ease-out duration-200 ${
              activeStatus === tab.key
                ? "bg-blue text-white"
                : "bg-gray-1 text-dark-2 hover:bg-blue/10 hover:text-blue"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Orders list */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue"></div>
        </div>
      ) : orders.length === 0 ? (
        <div className="py-16 text-center">
          <svg className="mx-auto mb-4" width="48" height="48" viewBox="0 0 24 24" fill="none">
            <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" stroke="#ccc" strokeWidth="2" />
          </svg>
          <p className="text-gray-500">
            {activeStatus
              ? `Không có đơn hàng "${STATUS_TABS.find((t) => t.key === activeStatus)?.label}"`
              : "Bạn chưa có đơn hàng nào"}
          </p>
        </div>
      ) : (
        <>
          {/* Desktop table header */}
          <div className="hidden md:flex items-center justify-between py-4 px-7.5 bg-gray-1">
            <div className="min-w-[120px]">
              <p className="text-sm font-medium text-dark">Mã đơn</p>
            </div>
            <div className="min-w-[150px]">
              <p className="text-sm font-medium text-dark">Ngày đặt</p>
            </div>
            <div className="min-w-[110px]">
              <p className="text-sm font-medium text-dark">Trạng thái</p>
            </div>
            <div className="min-w-[200px]">
              <p className="text-sm font-medium text-dark">Sản phẩm</p>
            </div>
            <div className="min-w-[120px]">
              <p className="text-sm font-medium text-dark">Tổng tiền</p>
            </div>
            <div className="min-w-[100px]">
              <p className="text-sm font-medium text-dark text-right">Thao tác</p>
            </div>
          </div>

          {/* Order rows */}
          {orders.map((order) => (
            <div key={order.id}>
              {/* Desktop view */}
              <div className="hidden md:flex items-center justify-between border-t border-gray-3 py-5 px-7.5 hover:bg-gray-1/50 ease-out duration-200">
                <div className="min-w-[120px]">
                  <p className="text-sm font-medium text-blue">
                    #{order.orderCode}
                  </p>
                </div>
                <div className="min-w-[150px]">
                  <p className="text-sm text-dark">
                    {formatDate(order.orderDate)}
                  </p>
                </div>
                <div className="min-w-[110px]">
                  <span
                    className={`inline-block text-xs font-medium py-1 px-3 rounded-full ${getStatusColor(
                      order.status
                    )}`}
                  >
                    {order.statusDisplay}
                  </span>
                </div>
                <div className="min-w-[200px]">
                  <div className="flex items-center gap-3">
                    {order.firstItemImage && (
                      <div className="flex-shrink-0 w-10 h-10 bg-gray-2 rounded overflow-hidden">
                        <Image
                          src={order.firstItemImage}
                          alt={order.firstItemName}
                          width={40}
                          height={40}
                          className="object-cover"
                        />
                      </div>
                    )}
                    <div className="min-w-0">
                      <p className="text-sm text-dark truncate max-w-[150px]">
                        {order.firstItemName}
                      </p>
                      {order.totalItems > 1 && (
                        <p className="text-xs text-gray-500">
                          +{order.totalItems - 1} sản phẩm khác
                        </p>
                      )}
                    </div>
                  </div>
                </div>
                <div className="min-w-[120px]">
                  <p className="text-sm font-semibold text-dark">
                    {formatCurrency(order.totalAmount)}
                  </p>
                </div>
                <div className="min-w-[100px] flex justify-end">
                  <button
                    onClick={() => handleViewDetail(order.orderCode)}
                    className="text-sm font-medium text-blue ease-out duration-200 hover:underline"
                  >
                    Xem chi tiết
                  </button>
                </div>
              </div>

              {/* Mobile view */}
              <div className="block md:hidden border-t border-gray-3 py-4 px-4 sm:px-7.5">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-sm font-medium text-blue">
                    #{order.orderCode}
                  </p>
                  <span
                    className={`inline-block text-xs font-medium py-1 px-3 rounded-full ${getStatusColor(
                      order.status
                    )}`}
                  >
                    {order.statusDisplay}
                  </span>
                </div>
                <div className="flex items-center gap-3 mb-3">
                  {order.firstItemImage && (
                    <div className="flex-shrink-0 w-12 h-12 bg-gray-2 rounded overflow-hidden">
                      <Image
                        src={order.firstItemImage}
                        alt={order.firstItemName}
                        width={48}
                        height={48}
                        className="object-cover"
                      />
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="text-sm text-dark truncate">{order.firstItemName}</p>
                    {order.totalItems > 1 && (
                      <p className="text-xs text-gray-500">+{order.totalItems - 1} sản phẩm khác</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-gray-500">{formatDate(order.orderDate)}</p>
                    <p className="text-sm font-semibold text-dark mt-0.5">
                      {formatCurrency(order.totalAmount)}
                    </p>
                  </div>
                  <button
                    onClick={() => handleViewDetail(order.orderCode)}
                    className="text-sm font-medium text-blue ease-out duration-200 hover:underline"
                  >
                    Xem chi tiết
                  </button>
                </div>
              </div>
            </div>
          ))}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 py-6 border-t border-gray-3">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 0}
                className="px-3 py-1.5 rounded text-sm border border-gray-3 disabled:opacity-50 disabled:cursor-not-allowed ease-out duration-200 hover:bg-blue hover:text-white hover:border-blue"
              >
                ‹
              </button>
              {Array.from({ length: totalPages }, (_, i) => (
                <button
                  key={i}
                  onClick={() => handlePageChange(i)}
                  className={`w-8 h-8 rounded text-sm ease-out duration-200 ${
                    currentPage === i
                      ? "bg-blue text-white"
                      : "border border-gray-3 hover:bg-blue hover:text-white hover:border-blue"
                  }`}
                >
                  {i + 1}
                </button>
              ))}
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage >= totalPages - 1}
                className="px-3 py-1.5 rounded text-sm border border-gray-3 disabled:opacity-50 disabled:cursor-not-allowed ease-out duration-200 hover:bg-blue hover:text-white hover:border-blue"
              >
                ›
              </button>
            </div>
          )}
        </>
      )}

      {/* Order Detail Modal */}
      <OrderDetailModal
        isOpen={detailModalOpen}
        onClose={() => setDetailModalOpen(false)}
        orderCode={selectedOrderCode}
        onCancelSuccess={handleCancelSuccess}
      />
    </>
  );
};

export default Orders;
