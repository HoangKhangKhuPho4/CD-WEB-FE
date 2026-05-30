"use client";

import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import AdminPagination from "@/components/Admin/shared/AdminPagination";
import { adminCustomerApi, type AdminUser } from "@/utils/adminApi";
import { formatDate } from "@/utils/adminFormat";

const PAGE_SIZE = 15;

export default function CustomerList() {
  const [customers, setCustomers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [keyword, setKeyword] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminCustomerApi.list({
        page: page - 1,
        size: PAGE_SIZE,
        keyword: keyword || undefined,
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
  }, [page, keyword]);

  useEffect(() => {
    void load();
  }, [load]);

  const onSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    setKeyword(searchInput.trim());
  };

  return (
    <div className="bg-white rounded-xl border border-gray-3/50 overflow-hidden">
      <div className="px-6 py-5 border-b border-gray-3/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-lg font-bold text-dark">Danh sách khách hàng</h3>
          <p className="text-xs text-[#8D93A5] mt-0.5">Chỉ xem — tài khoản vai trò Khách hàng</p>
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
        <table className="w-full min-w-[640px]">
          <thead>
            <tr className="bg-[#F7F9FC] border-b border-gray-3/50">
              <th className="text-left px-6 py-3 text-xs font-bold text-[#8D93A5] uppercase">
                Khách hàng
              </th>
              <th className="text-left px-4 py-3 text-xs font-bold text-[#8D93A5] uppercase">
                Email
              </th>
              <th className="text-left px-4 py-3 text-xs font-bold text-[#8D93A5] uppercase">
                Điện thoại
              </th>
              <th className="text-left px-6 py-3 text-xs font-bold text-[#8D93A5] uppercase">
                Ngày tham gia
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-3/50">
            {loading ? (
              <tr>
                <td colSpan={4} className="px-6 py-10 text-center text-sm text-[#8D93A5]">
                  Đang tải...
                </td>
              </tr>
            ) : customers.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-6 py-10 text-center text-sm text-[#8D93A5]">
                  Không có khách hàng
                </td>
              </tr>
            ) : (
              customers.map((c) => (
                <tr key={c.id} className="hover:bg-[#F7F9FC]/60">
                  <td className="px-6 py-4 text-sm font-medium text-dark">
                    {c.fullName ?? c.name ?? c.username}
                  </td>
                  <td className="px-4 py-4 text-sm text-[#606882]">{c.email}</td>
                  <td className="px-4 py-4 text-sm text-[#606882]">{c.phone ?? "—"}</td>
                  <td className="px-6 py-4 text-sm text-[#606882]">
                    {formatDate(c.createdAt)}
                  </td>
                </tr>
              ))
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
  );
}
