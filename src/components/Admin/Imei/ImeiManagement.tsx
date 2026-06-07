"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import AdminTablePagination from "@/components/Admin/shared/AdminTablePagination";
import PrimaryButton from "@/components/Admin/shared/PrimaryButton";
import ImeiBulkBar from "@/components/Admin/Imei/ImeiBulkBar";
import ImeiDetailDrawer from "@/components/Admin/Imei/ImeiDetailDrawer";
import ImeiFilters, { type ImeiFilterState } from "@/components/Admin/Imei/ImeiFilters";
import ImeiImportModal from "@/components/Admin/Imei/ImeiImportModal";
import ImeiStatsCards from "@/components/Admin/Imei/ImeiStatsCards";
import {
  IMEI_STATUS_OPTIONS,
  imeiStatusClass,
  imeiStatusLabel,
} from "@/components/Admin/Imei/imeiStatusMap";
import { downloadCsvBlob, extractApiError } from "@/components/Admin/Imei/imeiUtils";
import { adminImeiApi, type ImeiListItem, type ImeiStats } from "@/utils/adminApi";
import { formatDate } from "@/utils/adminFormat";

const PAGE_SIZE_OPTIONS = [10, 15, 20, 50];

const emptyFilters: ImeiFilterState = {
  keyword: "",
  status: "",
  orderCode: "",
  fromDate: "",
  toDate: "",
  variantLabel: "",
  variantId: null,
};

export default function ImeiManagement() {
  const [stats, setStats] = useState<ImeiStats | null>(null);
  const [rows, setRows] = useState<ImeiListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<ImeiFilterState>(emptyFilters);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(15);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);

  const [importOpen, setImportOpen] = useState(false);
  const [detailId, setDetailId] = useState<number | null>(null);
  const [selected, setSelected] = useState<number[]>([]);
  const [bulkStatus, setBulkStatus] = useState("AVAILABLE");
  const [bulkApplying, setBulkApplying] = useState(false);
  const [exporting, setExporting] = useState(false);

  const listParams = useCallback(
    () => ({
      keyword: filters.keyword.trim() || undefined,
      status: filters.status || undefined,
      variantId: filters.variantId ?? undefined,
      orderCode: filters.orderCode.trim() || undefined,
      fromDate: filters.fromDate || undefined,
      toDate: filters.toDate || undefined,
      page: page - 1,
      size: pageSize,
      sortBy: "createdAt",
      sortDir: "desc",
    }),
    [filters, page, pageSize]
  );

  const loadStats = useCallback(async () => {
    try {
      const res = await adminImeiApi.stats();
      if (res.data.success) setStats(res.data.data);
    } catch {
      /* optional */
    }
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminImeiApi.list(listParams());
      if (res.data.success) {
        const data = res.data.data;
        setRows(data.content);
        setTotalPages(Math.max(1, data.totalPages));
        setTotalElements(data.totalElements);
      }
    } catch (err) {
      toast.error(extractApiError(err, "Không tải được danh sách IMEI"));
    } finally {
      setLoading(false);
    }
  }, [listParams]);

  useEffect(() => {
    void loadStats();
  }, [loadStats]);

  useEffect(() => {
    const t = setTimeout(() => void load(), 300);
    return () => clearTimeout(t);
  }, [load]);

  useEffect(() => {
    setPage(1);
  }, [
    filters.keyword,
    filters.status,
    filters.orderCode,
    filters.fromDate,
    filters.toDate,
    filters.variantId,
  ]);

  const patchFilters = (patch: Partial<ImeiFilterState>) => {
    setFilters((p) => ({ ...p, ...patch }));
  };

  const resetFilters = () => setFilters(emptyFilters);

  const refreshAll = () => {
    void loadStats();
    void load();
  };

  const toggleSelect = (id: number) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selected.length === rows.length) setSelected([]);
    else setSelected(rows.map((r) => r.id));
  };

  const changeRowStatus = async (row: ImeiListItem, status: string) => {
    if (status === row.status) return;
    try {
      await adminImeiApi.updateStatus(row.id, { status });
      toast.success("Đã cập nhật trạng thái");
      refreshAll();
    } catch (err) {
      toast.error(extractApiError(err, "Cập nhật trạng thái thất bại"));
    }
  };

  const applyBulk = async () => {
    if (!selected.length) return;
    setBulkApplying(true);
    try {
      const res = await adminImeiApi.bulkStatus({ ids: selected, status: bulkStatus });
      if (res.data.success) {
        const d = res.data.data;
        toast.success(`Thành công ${d.successCount}, lỗi ${d.failCount}`);
        setSelected([]);
        refreshAll();
      }
    } catch (err) {
      toast.error(extractApiError(err, "Cập nhật hàng loạt thất bại"));
    } finally {
      setBulkApplying(false);
    }
  };

  const handleExport = async () => {
    setExporting(true);
    try {
      const res = await adminImeiApi.exportCsv({
        keyword: filters.keyword.trim() || undefined,
        status: filters.status || undefined,
        variantId: filters.variantId ?? undefined,
        orderCode: filters.orderCode.trim() || undefined,
        fromDate: filters.fromDate || undefined,
        toDate: filters.toDate || undefined,
      });
      downloadCsvBlob(res.data);
      toast.success("Đã tải file CSV");
    } catch (err) {
      toast.error(extractApiError(err, "Xuất CSV thất bại"));
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="space-y-6">
      <ImeiStatsCards stats={stats} />

      <div className="flex flex-wrap gap-3 justify-between items-center">
        <PrimaryButton onClick={() => setImportOpen(true)}>+ Nhập IMEI</PrimaryButton>
      </div>

      <ImeiFilters
        filters={filters}
        onChange={patchFilters}
        onReset={resetFilters}
        onExport={() => void handleExport()}
        exporting={exporting}
      />

      <ImeiBulkBar
        count={selected.length}
        bulkStatus={bulkStatus}
        onBulkStatusChange={setBulkStatus}
        onApply={() => void applyBulk()}
        onClear={() => setSelected([])}
        applying={bulkApplying}
      />

      <div className="bg-white rounded-xl border border-gray-3/50 overflow-hidden">
        {loading ? (
          <p className="px-6 py-8 text-sm text-[#8D93A5]">Đang tải...</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[960px]">
              <thead>
                <tr className="bg-[#F7F9FC] border-b border-gray-3/50">
                  <th className="px-4 py-3 w-10">
                    <input
                      type="checkbox"
                      checked={rows.length > 0 && selected.length === rows.length}
                      onChange={toggleSelectAll}
                      aria-label="Chọn tất cả"
                    />
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-bold text-[#8D93A5] uppercase">
                    IMEI / Serial
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-bold text-[#8D93A5] uppercase">
                    Sản phẩm
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-bold text-[#8D93A5] uppercase">
                    SKU
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-bold text-[#8D93A5] uppercase">
                    Đơn hàng
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-bold text-[#8D93A5] uppercase">
                    Ngày nhập
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-bold text-[#8D93A5] uppercase">
                    Trạng thái
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-bold text-[#8D93A5] uppercase">
                    Thao tác
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-3/50">
                {rows.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-8 text-sm text-[#8D93A5] text-center">
                      Không có IMEI phù hợp
                    </td>
                  </tr>
                ) : (
                  rows.map((row) => {
                    const stKey = String(row.status ?? "");
                    return (
                      <tr key={row.id} className="hover:bg-[#F7F9FC]/60">
                        <td className="px-4 py-4">
                          <input
                            type="checkbox"
                            checked={selected.includes(row.id)}
                            onChange={() => toggleSelect(row.id)}
                            aria-label={`Chọn ${row.imei}`}
                          />
                        </td>
                        <td className="px-4 py-4">
                          <button
                            type="button"
                            onClick={() => setDetailId(row.id)}
                            className="font-mono text-sm text-[#3C50E0] hover:underline text-left"
                          >
                            {row.imei ?? row.serialNumber ?? "—"}
                          </button>
                        </td>
                        <td className="px-4 py-4 text-sm">
                          {row.variantName
                            ? `${row.productName} (${row.variantName})`
                            : row.productName}
                        </td>
                        <td className="px-4 py-4 text-sm text-[#6C6F93]">{row.skuCode ?? "—"}</td>
                        <td className="px-4 py-4 text-sm">
                          {row.orderCode ? (
                            <Link
                              href="/admin/orders"
                              className="text-[#3C50E0] hover:underline font-medium"
                            >
                              {row.orderCode}
                            </Link>
                          ) : (
                            "—"
                          )}
                        </td>
                        <td className="px-4 py-4 text-sm text-[#6C6F93]">
                          {formatDate(row.createdAt)}
                        </td>
                        <td className="px-4 py-4">
                          <span
                            className={`px-2.5 py-1 rounded-full text-xs font-medium ${imeiStatusClass(stKey)}`}
                          >
                            {imeiStatusLabel(stKey)}
                          </span>
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => setDetailId(row.id)}
                              className="text-xs font-semibold text-[#3C50E0] hover:underline"
                            >
                              Chi tiết
                            </button>
                            <select
                              value={stKey}
                              onChange={(e) => void changeRowStatus(row, e.target.value)}
                              className="px-2 py-1.5 border border-gray-3 rounded-lg text-xs max-w-[120px]"
                            >
                              {IMEI_STATUS_OPTIONS.map((s) => (
                                <option key={s} value={s}>
                                  {imeiStatusLabel(s)}
                                </option>
                              ))}
                            </select>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        )}
        <div className="px-6 py-4 border-t border-gray-3/50">
          <AdminTablePagination
            page={page}
            totalPages={totalPages}
            totalElements={totalElements}
            pageSize={pageSize}
            onPageChange={setPage}
            onPageSizeChange={(size) => {
              setPageSize(size);
              setPage(1);
            }}
            pageSizeOptions={PAGE_SIZE_OPTIONS}
            label="thiết bị"
          />
        </div>
      </div>

      <ImeiImportModal
        open={importOpen}
        onClose={() => setImportOpen(false)}
        onSuccess={refreshAll}
      />

      <ImeiDetailDrawer
        id={detailId}
        onClose={() => setDetailId(null)}
        onUpdated={refreshAll}
      />
    </div>
  );
}
