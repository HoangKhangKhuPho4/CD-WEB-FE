"use client";

import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import toast from "react-hot-toast";
import {
  adminOrderApi,
  adminStatisticsApi,
  type AdminOrderDetail,
  type AdminOrderSummary,
} from "@/utils/adminApi";
export interface OrderDetail {
  id: number;
  code: string;
  customerName: string;
  phone: string;
  date: string;
  total: string;
  payment: string;
  status: string;
  address: string;
  trackingCode?: string;
  ghnOrderCode?: string;
  items: {
    orderDetailId?: number;
    name: string;
    qty: number;
    price: string;
  }[];
  timeline?: { status: string; note?: string; changedBy?: string; createdAt?: string }[];
}

type OrdersAdminContextValue = {
  orders: AdminOrderSummary[];
  loading: boolean;
  page: number;
  totalPages: number;
  keyword: string;
  statusFilter: string;
  pendingCount: number;
  setKeyword: (v: string) => void;
  setStatusFilter: (v: string) => void;
  setPage: (p: number) => void;
  reload: () => void;
  fetchDetail: (id: number) => Promise<OrderDetail | null>;
  updateStatus: (
    id: number,
    status: string,
    note?: string,
    extra?: { trackingCode?: string; ghnOrderCode?: string }
  ) => Promise<void>;
  bulkUpdateStatus: (
    orderIds: number[],
    status: string,
    note?: string
  ) => Promise<void>;
};

const OrdersAdminContext = createContext<OrdersAdminContextValue | null>(null);

function mapDetail(d: AdminOrderDetail): OrderDetail {
  return {
    id: d.id,
    code: d.orderCode,
    customerName: d.customerName,
    phone: d.customerPhone ?? "",
    date: d.createdAt,
    total: String(d.total),
    payment: d.paymentMethod,
    status: d.status,
    address: d.shippingAddress ?? "",
    trackingCode: d.trackingCode,
    ghnOrderCode: d.ghnOrderCode,
    items:
      d.items?.map((i) => ({
        orderDetailId: i.orderDetailId,
        name: i.productName,
        qty: i.quantity,
        price: String(i.unitPrice),
      })) ?? [],
    timeline: d.timeline,
  };
}

export function OrdersAdminProvider({ children }: { children: React.ReactNode }) {
  const [orders, setOrders] = useState<AdminOrderSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [keyword, setKeyword] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [pendingCount, setPendingCount] = useState(0);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminOrderApi.list({
        page,
        size: 15,
        keyword: keyword || undefined,
        status: statusFilter || undefined,
        sortBy: "createdAt",
        sortDir: "desc",
      });
      if (res.data.success) {
        setOrders(res.data.data.content);
        setTotalPages(res.data.data.totalPages);
      }
    } catch {
      toast.error("Không tải được danh sách đơn hàng");
    } finally {
      setLoading(false);
    }
  }, [page, keyword, statusFilter]);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    adminStatisticsApi
      .staffOverview()
      .then((r) => setPendingCount(r.data.pendingOrders ?? 0))
      .catch(() => {
        adminStatisticsApi
          .overview()
          .then((o) => setPendingCount(o.data.pendingOrders ?? 0))
          .catch(() => setPendingCount(0));
      });
  }, [orders]);

  const fetchDetail = async (id: number) => {
    try {
      const res = await adminOrderApi.detail(id);
      if (res.data.success) return mapDetail(res.data.data);
    } catch {
      toast.error("Không tải chi tiết đơn");
    }
    return null;
  };

  const updateStatus = async (
    id: number,
    status: string,
    note?: string,
    extra?: { trackingCode?: string; ghnOrderCode?: string }
  ) => {
    await adminOrderApi.updateStatus(id, status, note, extra);
    toast.success("Đã cập nhật trạng thái");
    await load();
  };

  const bulkUpdateStatus = async (
    orderIds: number[],
    status: string,
    note?: string
  ) => {
    const res = await adminOrderApi.bulkUpdateStatus(orderIds, status, note);
    if (res.data.success) {
      const r = res.data.data;
      toast.success(
        `Cập nhật ${r.successCount} đơn${r.failCount ? `, ${r.failCount} lỗi` : ""}`
      );
      if (r.errors?.length) {
        console.warn("Bulk update errors:", r.errors);
      }
    }
    await load();
  };

  return (
    <OrdersAdminContext.Provider
      value={{
        orders,
        loading,
        page,
        totalPages,
        keyword,
        statusFilter,
        pendingCount,
        setKeyword,
        setStatusFilter,
        setPage,
        reload: load,
        fetchDetail,
        updateStatus,
        bulkUpdateStatus,
      }}
    >
      {children}
    </OrdersAdminContext.Provider>
  );
}

export function useOrdersAdmin() {
  const ctx = useContext(OrdersAdminContext);
  if (!ctx) throw new Error("useOrdersAdmin must be inside OrdersAdminProvider");
  return ctx;
}
