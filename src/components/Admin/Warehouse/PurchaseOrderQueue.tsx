"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import PrimaryButton from "@/components/Admin/shared/PrimaryButton";
import AdminTablePagination from "@/components/Admin/shared/AdminTablePagination";
import Modal from "@/components/Admin/shared/Modal";
import {
  adminPurchaseOrderApi,
  adminStatisticsApi,
  type PurchaseOrderDetail,
  type PurchaseOrderFeStatus,
  type PurchaseOrderSummary,
} from "@/utils/adminApi";

const statusMap: Record<
  PurchaseOrderFeStatus,
  { label: string; className: string }
> = {
  pending: { label: "Chờ nhập kho", className: "bg-[#FEF3C7] text-yellow-dark-2" },
  receiving: { label: "Đang kiểm đếm", className: "bg-[#EEF2FF] text-[#3C50E0]" },
  completed: { label: "Đã nhập kho", className: "bg-green-light-6 text-green" },
};

const filterTabs: { key: PurchaseOrderFeStatus | "all"; label: string }[] = [
  { key: "all", label: "Tất cả" },
  { key: "pending", label: "Chờ nhập kho" },
  { key: "receiving", label: "Đang kiểm đếm" },
  { key: "completed", label: "Hoàn tất" },
];

const PAGE_SIZE_OPTIONS = [10, 15, 20, 50];

export default function PurchaseOrderQueue() {
  const [rows, setRows] = useState<PurchaseOrderSummary[]>([]);
  const [detail, setDetail] = useState<PurchaseOrderDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState<PurchaseOrderFeStatus | "all">("all");
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(15);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);
  const [pendingCount, setPendingCount] = useState(0);

  const loadList = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await adminPurchaseOrderApi.listPaged({
        status: statusFilter === "all" ? undefined : statusFilter,
        page,
        size: pageSize,
      });
      const pageData = res.data.data;
      setRows(pageData?.content ?? []);
      setTotalPages(Math.max(1, pageData?.totalPages ?? 1));
      setTotalElements(pageData?.totalElements ?? 0);
    } catch {
      setError("Không tải được danh sách PO. Kiểm tra kết nối backend.");
      setRows([]);
      setTotalPages(1);
      setTotalElements(0);
    } finally {
      setLoading(false);
    }
  }, [statusFilter, page, pageSize]);

  useEffect(() => {
    void loadList();
  }, [loadList]);

  useEffect(() => {
    adminStatisticsApi
      .staffOverview()
      .then((r) => setPendingCount(r.data.pendingPurchaseOrders ?? 0))
      .catch(() => setPendingCount(0));
  }, [rows]);

  const openDetail = async (row: PurchaseOrderSummary) => {
    try {
      const res = await adminPurchaseOrderApi.detail(row.id);
      setDetail(res.data.data ?? null);
    } catch {
      setDetail({ ...row, lineItems: [] });
    }
  };

  const startReceiving = async (id: number) => {
    setActionLoading(true);
    try {
      await adminPurchaseOrderApi.startReceiving(id);
      await loadList();
      setDetail(null);
      window.location.href = `/admin/purchase-orders/${id}/receive`;
    } catch {
      setError("Không thể bắt đầu kiểm đếm PO.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleStatusFilter = (key: PurchaseOrderFeStatus | "all") => {
    setStatusFilter(key);
    setPage(0);
  };

  return (
    <>
      <div className="flex flex-wrap gap-2">
        {filterTabs.map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => handleStatusFilter(tab.key)}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${
              statusFilter === tab.key
                ? "bg-[#3C50E0] text-white"
                : "bg-[#F7F9FC] text-[#6C6F93] hover:bg-[#EEF2FF]"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <p className="text-sm text-[#6C6F93]">
          {pendingCount > 0 ? `${pendingCount} đơn cần xử lý · ` : ""}
          PO đã duyệt, chờ xe tải giao tới kho
        </p>
      </div>

      {error && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-4 py-2">
          {error}
        </p>
      )}

      <div className="bg-white rounded-xl border border-gray-3/50 overflow-hidden">
        <table className="w-full min-w-[720px]">
          <thead>
            <tr className="bg-[#F7F9FC] border-b border-gray-3/50">
              <th className="text-left px-6 py-3 text-xs font-bold text-[#8D93A5] uppercase">Mã PO</th>
              <th className="text-left px-4 py-3 text-xs font-bold text-[#8D93A5] uppercase">Nhà cung cấp</th>
              <th className="text-left px-4 py-3 text-xs font-bold text-[#8D93A5] uppercase">Số dòng</th>
              <th className="text-left px-4 py-3 text-xs font-bold text-[#8D93A5] uppercase">Ngày dự kiến</th>
              <th className="text-left px-4 py-3 text-xs font-bold text-[#8D93A5] uppercase">Trạng thái</th>
              <th className="text-center px-6 py-3 text-xs font-bold text-[#8D93A5] uppercase">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-3/50">
            {loading ? (
              <tr>
                <td colSpan={6} className="px-6 py-8 text-center text-sm text-[#8D93A5]">
                  Đang tải...
                </td>
              </tr>
            ) : rows.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-8 text-center text-sm text-[#8D93A5]">
                  Không có đơn mua hàng đã duyệt
                </td>
              </tr>
            ) : (
              rows.map((row) => {
                const st = statusMap[row.status];
                return (
                  <tr key={row.id} className="hover:bg-[#F7F9FC]/60">
                    <td className="px-6 py-4 text-sm font-semibold text-[#3C50E0]">{row.code}</td>
                    <td className="px-4 py-4 text-sm">{row.supplier}</td>
                    <td className="px-4 py-4 text-sm">{row.items}</td>
                    <td className="px-4 py-4 text-sm text-[#6C6F93]">{row.expectedDate}</td>
                    <td className="px-4 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${st.className}`}>
                        {st.label}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      {row.status === "pending" ? (
                        <button
                          type="button"
                          onClick={() => openDetail(row)}
                          className="text-sm font-semibold text-white bg-[#3C50E0] hover:bg-[#2d3eb8] px-3 py-1.5 rounded-lg"
                        >
                          Kiểm đếm / Nhập kho
                        </button>
                      ) : row.status === "receiving" ? (
                        <Link
                          href={`/admin/purchase-orders/${row.id}/receive`}
                          className="text-sm font-semibold text-white bg-[#3C50E0] hover:bg-[#2d3eb8] px-3 py-1.5 rounded-lg inline-block"
                        >
                          Tiếp tục nhập kho
                        </Link>
                      ) : (
                        <button
                          type="button"
                          onClick={() => openDetail(row)}
                          className="text-sm font-semibold text-[#3C50E0] hover:underline"
                        >
                          Chi tiết
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <AdminTablePagination
        page={page + 1}
        totalPages={totalPages}
        totalElements={totalElements}
        pageSize={pageSize}
        onPageChange={(p) => setPage(p - 1)}
        onPageSizeChange={(size) => {
          setPageSize(size);
          setPage(0);
        }}
        pageSizeOptions={PAGE_SIZE_OPTIONS}
        label="đơn mua hàng"
      />

      <Modal
        open={!!detail}
        onClose={() => setDetail(null)}
        title={detail?.code ?? ""}
        subtitle={detail?.supplier}
        footer={
          detail?.status === "pending" ? (
            <PrimaryButton
              onClick={() => detail && startReceiving(detail.id)}
              disabled={actionLoading}
            >
              {actionLoading ? "Đang xử lý..." : "Bắt đầu kiểm đếm"}
            </PrimaryButton>
          ) : detail?.status === "receiving" ? (
            <Link href={`/admin/purchase-orders/${detail.id}/receive`}>
              <PrimaryButton>Tiếp tục nhập kho & quét IMEI</PrimaryButton>
            </Link>
          ) : detail?.status === "completed" ? (
            <Link href={`/admin/purchase-orders/${detail.id}/receive`}>
              <span className="inline-flex px-4 py-2 text-sm font-semibold text-[#3C50E0] border border-[#3C50E0] rounded-lg">
                Xem kết quả nhập kho
              </span>
            </Link>
          ) : (
            <button type="button" onClick={() => setDetail(null)} className="px-4 py-2 text-sm text-[#6C6F93]">
              Đóng
            </button>
          )
        }
      >
        {detail && (
          <div className="space-y-2 text-sm">
            <p>
              <span className="text-[#8D93A5]">Số dòng hàng:</span> {detail.items}
            </p>
            <p>
              <span className="text-[#8D93A5]">Ngày dự kiến:</span> {detail.expectedDate}
            </p>
            {detail.notes && (
              <p>
                <span className="text-[#8D93A5]">Ghi chú:</span> {detail.notes}
              </p>
            )}
            {detail.lineItems && detail.lineItems.length > 0 && (
              <ul className="pt-2 space-y-1 text-xs text-[#6C6F93] max-h-32 overflow-y-auto">
                {detail.lineItems.map((line) => (
                  <li key={line.id}>
                    {line.productName ?? line.skuCode ?? `#${line.variantId}`} · SL đặt{" "}
                    {line.quantityOrdered}
                  </li>
                ))}
              </ul>
            )}
            {detail.status === "pending" && (
              <p className="text-[#6C6F93] pt-2">
                Đối chiếu hóa đơn tài xế với mã PO, sau đó bấm <strong>Bắt đầu kiểm đếm</strong>.
              </p>
            )}
          </div>
        )}
      </Modal>
    </>
  );
}
