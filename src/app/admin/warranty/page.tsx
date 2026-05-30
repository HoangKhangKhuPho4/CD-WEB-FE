"use client";

import { useCallback, useEffect, useState } from "react";
import AdminWarrantySubNav from "@/components/Admin/AdminWarrantySubNav";
import PageHeader from "@/components/Admin/shared/PageHeader";
import PrimaryButton from "@/components/Admin/shared/PrimaryButton";
import WarrantyStatsCards, { type WarrantyStats } from "@/components/Admin/Warranty/WarrantyStatsCards";
import WarrantyFilters from "@/components/Admin/Warranty/WarrantyFilters";
import WarrantyManagementTable from "@/components/Admin/Warranty/WarrantyManagementTable";
import WarrantyCreateModal from "@/components/Admin/Warranty/WarrantyCreateModal";
import WarrantyDetailModal from "@/components/Admin/Warranty/WarrantyDetailModal";
import { adminWarrantyApi } from "@/utils/adminApi";

async function countByStatus(status?: string): Promise<number> {
  const res = await adminWarrantyApi.list({ page: 0, size: 1, status });
  if (res.data.success) return res.data.data.totalElements;
  return 0;
}

export default function AdminWarrantyPage() {
  const [createOpen, setCreateOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [detailId, setDetailId] = useState<number | null>(null);
  const [keyword, setKeyword] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const [statsLoading, setStatsLoading] = useState(true);
  const [stats, setStats] = useState<WarrantyStats>({
    filteredTotal: 0,
    processing: 0,
    completed: 0,
    closed: 0,
  });

  const loadGlobalStats = useCallback(async () => {
    setStatsLoading(true);
    try {
      const [pending, inProgress, completed, returned, cancelled] = await Promise.all([
        countByStatus("PENDING"),
        countByStatus("IN_PROGRESS"),
        countByStatus("COMPLETED"),
        countByStatus("RETURNED"),
        countByStatus("CANCELLED"),
      ]);
      setStats((prev) => ({
        ...prev,
        processing: pending + inProgress,
        completed,
        closed: returned + cancelled,
      }));
    } finally {
      setStatsLoading(false);
    }
  }, []);

  const handleTotalsChange = useCallback((total: number) => {
    setStats((prev) => (prev.filteredTotal === total ? prev : { ...prev, filteredTotal: total }));
  }, []);

  useEffect(() => {
    void loadGlobalStats();
  }, [loadGlobalStats, refreshKey]);

  return (
    <div className="space-y-6">
      <AdminWarrantySubNav />
      <PageHeader
        title="Quản lý phiếu bảo hành"
        subtitle="Tiếp nhận, theo dõi và xử lý phiếu bảo hành thiết bị"
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
        onKeywordChange={(v) => {
          setKeyword(v);
          setPage(1);
        }}
        onStatusChange={(v) => {
          setStatus(v);
          setPage(1);
        }}
      />
      <WarrantyManagementTable
        onView={(row) => setDetailId(row.ticketId)}
        refreshKey={refreshKey}
        keyword={keyword}
        status={status}
        page={page}
        onPageChange={setPage}
        onTotalsChange={handleTotalsChange}
      />
      <WarrantyCreateModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onSaved={() => {
          setRefreshKey((k) => k + 1);
          setPage(1);
        }}
      />
      <WarrantyDetailModal
        open={detailId != null}
        ticketId={detailId}
        onClose={() => setDetailId(null)}
        onUpdated={() => setRefreshKey((k) => k + 1)}
      />
    </div>
  );
}
