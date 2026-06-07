"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import CustomerDetailDrawer from "@/components/Admin/Customers/CustomerDetailDrawer";
import CustomerFormModal from "@/components/Admin/Customers/CustomerFormModal";
import CustomerStatsCards from "@/components/Admin/Customers/CustomerStatsCards";
import AdminPagination from "@/components/Admin/shared/AdminPagination";
import PrimaryButton from "@/components/Admin/shared/PrimaryButton";
import {
  IconBan,
  IconCheckCircle,
  IconLock,
  IconUnlock,
  IconUserPlus,
  IconUsersTeam,
} from "@/components/Admin/icons/AdminIcons";
import {
  adminCustomerApi,
  adminStatisticsApi,
  adminUserApi,
  type AdminUser,
} from "@/utils/adminApi";
import { formatDate, formatDateTime } from "@/utils/adminFormat";
import { getUserInitials } from "@/utils/staffDisplay";

const PAGE_SIZE = 15;

type SortKey = "createdAt" | "username" | "fullName";

function providerBadge(provider?: string) {
  if (!provider || provider === "LOCAL") {
    return (
      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#EEF2FF] text-[#3C50E0]">
        Local
      </span>
    );
  }
  return (
    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700">
      {provider}
    </span>
  );
}

export default function CustomerManagement({ canManage }: { canManage: boolean }) {
  const [customers, setCustomers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [keyword, setKeyword] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);
  const [sortBy, setSortBy] = useState<SortKey>("createdAt");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

  const [customerAccounts, setCustomerAccounts] = useState<number | undefined>();
  const [topSegment, setTopSegment] = useState<string | undefined>();

  const [detailId, setDetailId] = useState<number | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [editCustomer, setEditCustomer] = useState<AdminUser | null>(null);

  const activeOnPage = useMemo(
    () => customers.filter((c) => c.enabled !== false).length,
    [customers]
  );

  const loadStats = useCallback(async () => {
    try {
      const [overview, segments] = await Promise.all([
        adminStatisticsApi.staffOverview(),
        adminStatisticsApi.customerSegments().catch(() => null),
      ]);
      setCustomerAccounts(overview.data.customerAccounts);
      const top = segments?.data?.segments?.[0];
      if (top?.segmentLabel) setTopSegment(top.segmentLabel);
    } catch {
      /* optional stats */
    }
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminCustomerApi.list({
        page: page - 1,
        size: PAGE_SIZE,
        keyword: keyword || undefined,
        sortBy,
        sortDir,
      });
      if (res.data.success) {
        setCustomers(res.data.data.content);
        setTotalPages(Math.max(1, res.data.data.totalPages));
        setTotalElements(res.data.data.totalElements);
      }
    } catch {
      toast.error("Không tải được danh sách khách hàng");
    } finally {
      setLoading(false);
    }
  }, [page, keyword, sortBy, sortDir]);

  useEffect(() => {
    void loadStats();
  }, [loadStats]);

  useEffect(() => {
    void load();
  }, [load]);

  const onSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    setKeyword(searchInput.trim());
  };

  const toggleSort = (key: SortKey) => {
    if (sortBy === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortBy(key);
      setSortDir("desc");
    }
    setPage(1);
  };

  const openCreate = () => {
    setEditCustomer(null);
    setFormOpen(true);
  };

  const openEdit = (c: AdminUser) => {
    setEditCustomer(c);
    setFormOpen(true);
    setDetailId(null);
  };

  const quickToggle = async (id: number) => {
    try {
      const res = await adminUserApi.toggleStatus(id);
      if (res.data.success) {
        toast.success(res.data.message || "Đã cập nhật trạng thái");
        void load();
      }
    } catch {
      toast.error("Không đổi được trạng thái");
    }
  };

  const sortIndicator = (key: SortKey) =>
    sortBy === key ? (sortDir === "asc" ? " ↑" : " ↓") : "";

  return (
    <>
      <CustomerStatsCards
        total={totalElements}
        activeOnPage={activeOnPage}
        customerAccounts={customerAccounts}
        topSegment={topSegment}
      />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mt-5">
        <p className="text-sm text-[#8D93A5]">
          {canManage
            ? "Tạo, chỉnh sửa, khóa/mở khóa tài khoản khách hàng."
            : "Chế độ xem — cần quyền USER_MANAGE để thao tác."}
        </p>
        {canManage && (
          <PrimaryButton onClick={openCreate}>
            <IconUserPlus size={16} />
            Thêm khách hàng
          </PrimaryButton>
        )}
      </div>

      <div className="bg-white rounded-xl border border-gray-3/50 overflow-hidden mt-4">
        <div className="px-6 py-5 border-b border-gray-3/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-lg font-bold text-dark">Danh sách khách hàng</h3>
            <p className="text-xs text-[#8D93A5] mt-0.5">
              Vai trò CUSTOMER — chỉ tài khoản đang hoạt động trong danh sách này
            </p>
          </div>
          <form onSubmit={onSearch} className="flex gap-2">
            <input
              type="search"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Tìm tên, email, SĐT..."
              className="rounded-lg border border-gray-3 px-3 py-2 text-sm min-w-[200px]"
            />
            <button
              type="submit"
              className="px-4 py-2 bg-[#3C50E0] text-white text-sm font-semibold rounded-lg"
            >
              Tìm
            </button>
          </form>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px]">
            <thead>
              <tr className="bg-[#F7F9FC] border-b border-gray-3/50">
                <th className="text-left px-6 py-3 text-xs font-bold text-[#8D93A5] uppercase">
                  <button type="button" onClick={() => toggleSort("fullName")} className="hover:text-dark">
                    Khách hàng{sortIndicator("fullName")}
                  </button>
                </th>
                <th className="text-left px-4 py-3 text-xs font-bold text-[#8D93A5] uppercase">
                  <button type="button" onClick={() => toggleSort("username")} className="hover:text-dark">
                    Tài khoản{sortIndicator("username")}
                  </button>
                </th>
                <th className="text-left px-4 py-3 text-xs font-bold text-[#8D93A5] uppercase">Email</th>
                <th className="text-left px-4 py-3 text-xs font-bold text-[#8D93A5] uppercase">Điện thoại</th>
                <th className="text-left px-4 py-3 text-xs font-bold text-[#8D93A5] uppercase">Nguồn</th>
                <th className="text-left px-4 py-3 text-xs font-bold text-[#8D93A5] uppercase">Đăng nhập</th>
                <th className="text-left px-4 py-3 text-xs font-bold text-[#8D93A5] uppercase">
                  <button type="button" onClick={() => toggleSort("createdAt")} className="hover:text-dark">
                    Tham gia{sortIndicator("createdAt")}
                  </button>
                </th>
                {canManage && (
                  <th className="text-center px-6 py-3 text-xs font-bold text-[#8D93A5] uppercase">
                    Thao tác
                  </th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-3/50">
              {loading ? (
                <tr>
                  <td colSpan={canManage ? 8 : 7} className="px-6 py-10 text-center text-sm text-[#8D93A5]">
                    Đang tải...
                  </td>
                </tr>
              ) : customers.length === 0 ? (
                <tr>
                  <td colSpan={canManage ? 8 : 7} className="px-6 py-12 text-center">
                    <div className="inline-flex flex-col items-center gap-3 text-[#8D93A5]">
                      <div className="w-14 h-14 rounded-2xl bg-[#F7F9FC] flex items-center justify-center text-[#3C50E0]">
                        <IconUsersTeam size={28} />
                      </div>
                      <p className="text-sm">Không có khách hàng phù hợp bộ lọc.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                customers.map((c) => {
                  const name = c.fullName ?? c.name ?? c.username;
                  const active = c.enabled !== false;
                  return (
                    <tr
                      key={c.id}
                      className="hover:bg-[#F7F9FC]/60 cursor-pointer"
                      onClick={() => setDetailId(c.id)}
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#3C50E0] to-[#1C3FB7] text-white flex items-center justify-center text-xs font-bold shrink-0">
                            {getUserInitials(name)}
                          </div>
                          <div>
                            <span className="text-sm font-semibold text-dark block">{name}</span>
                            <span
                              className={`inline-flex items-center gap-1 text-[10px] font-semibold ${
                                active ? "text-green" : "text-[#8D93A5]"
                              }`}
                            >
                              {active ? (
                                <IconCheckCircle size={12} />
                              ) : (
                                <IconBan size={12} />
                              )}
                              {active ? "Hoạt động" : "Vô hiệu"}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-sm text-[#606882] font-mono">{c.username}</td>
                      <td className="px-4 py-4 text-sm text-[#606882]">{c.email}</td>
                      <td className="px-4 py-4 text-sm text-[#606882]">{c.phone ?? "—"}</td>
                      <td className="px-4 py-4">{providerBadge(c.provider)}</td>
                      <td className="px-4 py-4 text-xs text-[#8D93A5]">
                        {formatDateTime(c.lastLoginAt)}
                      </td>
                      <td className="px-4 py-4 text-sm text-[#606882]">{formatDate(c.createdAt)}</td>
                      {canManage && (
                        <td className="px-6 py-4 text-center" onClick={(e) => e.stopPropagation()}>
                          <button
                            type="button"
                            onClick={() => void quickToggle(c.id)}
                            className={`inline-flex items-center gap-1 text-sm font-semibold ${
                              active
                                ? "text-[#8D93A5] hover:text-red"
                                : "text-[#3C50E0] hover:text-[#1C3FB7]"
                            }`}
                          >
                            {active ? (
                              <>
                                <IconLock size={14} />
                                Khóa
                              </>
                            ) : (
                              <>
                                <IconUnlock size={14} />
                                Mở
                              </>
                            )}
                          </button>
                        </td>
                      )}
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        <div className="px-6 py-4 border-t border-gray-3/50">
          <AdminPagination
            page={page}
            totalPages={totalPages}
            totalElements={totalElements}
            pageSize={PAGE_SIZE}
            onPageChange={setPage}
            label="khách hàng"
          />
        </div>
      </div>

      <CustomerDetailDrawer
        id={detailId}
        canManage={canManage}
        onClose={() => setDetailId(null)}
        onUpdated={() => void load()}
        onEdit={openEdit}
      />

      <CustomerFormModal
        open={formOpen}
        onClose={() => {
          setFormOpen(false);
          setEditCustomer(null);
        }}
        customer={editCustomer}
        onSaved={() => {
          void load();
          void loadStats();
        }}
      />
    </>
  );
}
