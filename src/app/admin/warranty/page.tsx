"use client";

import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import AdminWarrantySubNav from "@/components/Admin/AdminWarrantySubNav";
import PageHeader from "@/components/Admin/shared/PageHeader";
import PrimaryButton from "@/components/Admin/shared/PrimaryButton";
import WarrantyStatsCards, { type WarrantyStats } from "@/components/Admin/Warranty/WarrantyStatsCards";
import WarrantyFilters from "@/components/Admin/Warranty/WarrantyFilters";
import WarrantyManagementTable from "@/components/Admin/Warranty/WarrantyManagementTable";
import WarrantyCreateModal from "@/components/Admin/Warranty/WarrantyCreateModal";
import WarrantyDetailModal from "@/components/Admin/Warranty/WarrantyDetailModal";
import {
  downloadWarrantyCsv,
  extractWarrantyError,
} from "@/components/Admin/Warranty/warrantyUtils";
import { adminWarrantyApi } from "@/utils/adminApi";

const emptyStats: WarrantyStats = {
  total: 0,
  pending: 0,
  inProgress: 0,
  completed: 0,
  cancelled: 0,
  returned: 0,
  filteredTotal: 0,
};

export default function AdminWarrantyPage() {
  const [createOpen, setCreateOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [detailId, setDetailId] = useState<number | null>(null);
  const [keyword, setKeyword] = useState("");
  const [status, setStatus] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [statsLoading, setStatsLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [stats, setStats] = useState<WarrantyStats>(emptyStats);

  const loadGlobalStats = useCallback(async () => {
    setStatsLoading(true);
    try {
      const res = await adminWarrantyApi.stats();
      if (res.data.success) {
        const d = res.data.data;
        setStats((prev) => ({
          ...prev,
          total: d.total,
          pending: d.pending,
          inProgress: d.inProgress,
          completed: d.completed,
          cancelled: d.cancelled,
          returned: d.returned,
        }));
      }
    } catch {
      toast.error("Không tải được thống kê bảo hành");
    } finally {
      setStatsLoading(false);
    }
  }, []);

  const handleTotalsChange = useCallback((total: number) => {
    setStats((prev) => (prev.filteredTotal === total ? prev : { ...prev, filteredTotal: total }));
  }, []);

  const handleExport = async () => {
    setExporting(true);
    try {
      const res = await adminWarrantyApi.exportCsv({
        keyword: keyword.trim() || undefined,
        status: status || undefined,
        fromDate: fromDate || undefined,
        toDate: toDate || undefined,
      });
      downloadWarrantyCsv(res.data);
      toast.success("Đã tải file CSV");
    } catch (err) {
      toast.error(extractWarrantyError(err, "Export thất bại"));
    } finally {
      setExporting(false);
    }
  };

  const refreshAll = () => {
    setRefreshKey((k) => k + 1);
    void loadGlobalStats();
  };

  useEffect(() => {
    void loadGlobalStats();
  }, [loadGlobalStats, refreshKey]);

  return (
    <div className="space-y-6">
      <AdminWarrantySubNav />
      <PageHeader
        title="Quản lý phiếu bảo hành"
        subtitle="Tiếp nhận, tra cứu thiết bị, theo dõi workflow và xử lý phiếu bảo hành"
        action={
          <PrimaryButton onClick={() => setCreateOpen(true)}>
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path
                d="M9 3.75V14.25"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M3.75 9H14.25"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            Tạo phiếu mới
          </PrimaryButton>
        }
      />
      <WarrantyStatsCards stats={stats} loading={statsLoading} />
      <WarrantyFilters
        keyword={keyword}
        status={status}
        fromDate={fromDate}
        toDate={toDate}
        exporting={exporting}
        onKeywordChange={(v) => {
          setKeyword(v);
          setPage(1);
        }}
        onStatusChange={(v) => {
          setStatus(v);
          setPage(1);
        }}
        onFromDateChange={(v) => {
          setFromDate(v);
          setPage(1);
        }}
        onToDateChange={(v) => {
          setToDate(v);
          setPage(1);
        }}
        onExport={() => void handleExport()}
      />
      <WarrantyManagementTable
        onView={(row) => setDetailId(row.ticketId)}
        refreshKey={refreshKey}
        keyword={keyword}
        status={status}
        fromDate={fromDate}
        toDate={toDate}
        page={page}
        pageSize={pageSize}
        onPageChange={setPage}
        onPageSizeChange={setPageSize}
        onTotalsChange={handleTotalsChange}
      />
      <WarrantyCreateModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onSaved={() => {
          refreshAll();
          setPage(1);
        }}
      />
      <WarrantyDetailModal
        open={detailId != null}
        ticketId={detailId}
        onClose={() => setDetailId(null)}
        onUpdated={refreshAll}
      />
    </div>
  );
}
