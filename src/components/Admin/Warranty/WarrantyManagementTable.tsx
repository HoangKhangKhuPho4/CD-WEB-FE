"use client";

import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import AdminTablePagination from "@/components/Admin/shared/AdminTablePagination";
import {
  warrantyStatusBadge,
  warrantyStatusLabel,
} from "@/components/Admin/Warranty/warrantyUtils";
import { adminWarrantyApi, type WarrantyTicket } from "@/utils/adminApi";
import { formatDate } from "@/utils/adminFormat";

export interface WarrantyRow {
  id: string;
  ticketId: number;
  code: string;
  customerName: string;
  phone: string;
  product: string;
  imei: string;
  issue: string;
  receivedAt: string;
  rawStatus?: string;
  statusDisplay?: string;
}

export function mapTicket(t: WarrantyTicket): WarrantyRow {
  return {
    id: String(t.id),
    ticketId: t.id,
    code: t.ticketCode ? `#${t.ticketCode}` : `#WR-${t.id}`,
    customerName: t.customerName ?? "—",
    phone: t.customerPhone ?? "—",
    product: t.variantName ? `${t.productName} (${t.variantName})` : t.productName ?? "—",
    imei: t.imei ?? t.serialNumber ?? "—",
    issue: t.issueDescription ?? "—",
    receivedAt: formatDate(t.receivedAt),
    rawStatus: t.status,
    statusDisplay: t.statusDisplay,
  };
}

const PAGE_SIZE_OPTIONS = [10, 15, 20, 50];

export default function WarrantyManagementTable({
  onView,
  refreshKey = 0,
  keyword = "",
  status = "",
  fromDate = "",
  toDate = "",
  page = 1,
  pageSize = 10,
  onPageChange,
  onPageSizeChange,
  onTotalsChange,
}: {
  onView?: (row: WarrantyRow) => void;
  refreshKey?: number;
  keyword?: string;
  status?: string;
  fromDate?: string;
  toDate?: string;
  page?: number;
  pageSize?: number;
  onPageChange?: (page: number) => void;
  onPageSizeChange?: (size: number) => void;
  onTotalsChange?: (total: number) => void;
}) {
  const [rows, setRows] = useState<WarrantyRow[]>([]);
  const [initialLoading, setInitialLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);
  const onTotalsChangeRef = useRef(onTotalsChange);
  const hasLoadedRef = useRef(false);

  useEffect(() => {
    onTotalsChangeRef.current = onTotalsChange;
  }, [onTotalsChange]);

  useEffect(() => {
    let cancelled = false;

    async function run() {
      if (!hasLoadedRef.current) {
        setInitialLoading(true);
      } else {
        setRefreshing(true);
      }
      try {
        const res = await adminWarrantyApi.list({
          page: page - 1,
          size: pageSize,
          keyword: keyword.trim() || undefined,
          status: status || undefined,
          fromDate: fromDate || undefined,
          toDate: toDate || undefined,
        });
        if (cancelled) return;
        if (res.data.success) {
          const data = res.data.data;
          setRows(data.content.map(mapTicket));
          setTotalPages(Math.max(1, data.totalPages));
          setTotalElements(data.totalElements);
          onTotalsChangeRef.current?.(data.totalElements);
          hasLoadedRef.current = true;
        }
      } catch {
        if (!cancelled) toast.error("Không tải được phiếu bảo hành");
      } finally {
        if (!cancelled) {
          setInitialLoading(false);
          setRefreshing(false);
        }
      }
    }

    void run();
    return () => {
      cancelled = true;
    };
  }, [page, pageSize, keyword, status, fromDate, toDate, refreshKey]);

  if (initialLoading) {
    return <p className="px-6 py-8 text-sm text-[#8D93A5]">Đang tải phiếu bảo hành...</p>;
  }

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-xl border border-gray-3/50 overflow-hidden relative">
        {refreshing && (
          <div className="absolute inset-0 z-10 bg-white/60 flex items-center justify-center">
            <span className="text-sm text-[#8D93A5]">Đang cập nhật...</span>
          </div>
        )}
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1000px]">
            <thead>
              <tr className="bg-[#F7F9FC] border-b border-gray-3/50">
                <th className="text-left px-6 py-3.5 text-xs font-bold text-[#8D93A5] uppercase tracking-wider">
                  Mã phiếu
                </th>
                <th className="text-left px-4 py-3.5 text-xs font-bold text-[#8D93A5] uppercase tracking-wider">
                  Khách hàng &amp; SĐT
                </th>
                <th className="text-left px-4 py-3.5 text-xs font-bold text-[#8D93A5] uppercase tracking-wider">
                  Sản phẩm / IMEI
                </th>
                <th className="text-left px-4 py-3.5 text-xs font-bold text-[#8D93A5] uppercase tracking-wider">
                  Tình trạng lỗi
                </th>
                <th className="text-left px-4 py-3.5 text-xs font-bold text-[#8D93A5] uppercase tracking-wider">
                  Ngày tiếp nhận
                </th>
                <th className="text-left px-4 py-3.5 text-xs font-bold text-[#8D93A5] uppercase tracking-wider">
                  Trạng thái
                </th>
                <th className="text-center px-6 py-3.5 text-xs font-bold text-[#8D93A5] uppercase tracking-wider">
                  Thao tác
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-3/50">
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-sm text-[#8D93A5] text-center">
                    Chưa có phiếu bảo hành
                  </td>
                </tr>
              ) : (
                rows.map((row) => {
                  const st = warrantyStatusBadge(row.rawStatus);
                  const label = row.statusDisplay ?? warrantyStatusLabel(row.rawStatus);
                  return (
                    <tr key={row.id} className="hover:bg-[#F7F9FC]/60 transition-colors">
                      <td className="px-6 py-4">
                        <span className="text-sm font-semibold text-[#3C50E0]">{row.code}</span>
                      </td>
                      <td className="px-4 py-4">
                        <p className="text-sm font-semibold text-dark">{row.customerName}</p>
                        <p className="text-xs text-[#8D93A5] mt-0.5">{row.phone}</p>
                      </td>
                      <td className="px-4 py-4">
                        <p className="text-sm text-dark">{row.product}</p>
                        <p className="text-xs text-[#8D93A5] font-mono mt-0.5">{row.imei}</p>
                      </td>
                      <td className="px-4 py-4 text-sm text-dark">{row.issue}</td>
                      <td className="px-4 py-4 text-sm text-[#6C6F93]">{row.receivedAt}</td>
                      <td className="px-4 py-4">
                        <span
                          className={`inline-flex items-center gap-2 px-2.5 py-1 rounded-full text-xs font-medium ${st.className}`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${st.dot}`} />
                          {label}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <button
                          type="button"
                          onClick={() => onView?.(row)}
                          className="p-2 rounded-lg text-[#6C6F93] hover:bg-[#F7F9FC]"
                        >
                          Chi tiết
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
        {onPageChange && totalElements > 0 && (
          <div className="px-6 py-4 border-t border-gray-3/50">
            <AdminTablePagination
              page={page}
              totalPages={totalPages}
              totalElements={totalElements}
              pageSize={pageSize}
              onPageChange={onPageChange}
              onPageSizeChange={
                onPageSizeChange
                  ? (size) => {
                      onPageSizeChange(size);
                      onPageChange(1);
                    }
                  : undefined
              }
              pageSizeOptions={PAGE_SIZE_OPTIONS}
              label="phiếu bảo hành"
            />
          </div>
        )}
      </div>
    </div>
  );
}
