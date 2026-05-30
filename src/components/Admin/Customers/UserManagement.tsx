"use client";

import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { adminUserApi, type AdminUser } from "@/utils/adminApi";
import { formatDate } from "@/utils/adminFormat";

interface UserRow {
  id: number;
  name: string;
  email: string;
  avatar: string;
  avatarBg: string;
  role: "admin" | "staff";
  status: "active" | "locked";
  joinDate: string;
}

const avatarBgs = [
  "from-[#3C50E0] to-[#5475E5]",
  "from-[#22AD5C] to-[#2CD673]",
  "from-[#F27430] to-[#F59E0B]",
  "from-[#02AAA4] to-[#22AD5C]",
  "from-[#1C274C] to-[#3C50E0]",
];

const roleConfig: Record<string, { label: string; className: string }> = {
  admin: {
    label: "Quản trị viên",
    className: "bg-[#3C50E0]/8 text-[#3C50E0] border border-[#3C50E0]/20",
  },
  staff: {
    label: "Nhân viên",
    className: "bg-gray-2 text-[#6C6F93] border border-gray-3",
  },
};

const statusConfig: Record<string, { label: string; dotColor: string; textColor: string }> = {
  active: { label: "Hoạt động", dotColor: "bg-green", textColor: "text-green" },
  locked: { label: "Đã khóa", dotColor: "bg-red", textColor: "text-red" },
};

type RoleFilter = "all" | "admin" | "staff";

function mapUser(u: AdminUser, index: number): UserRow {
  const name = u.fullName ?? u.name ?? u.username;
  const initials =
    name
      .split(" ")
      .map((w) => w[0])
      .join("")
      .slice(-2)
      .toUpperCase() || "??";
  const isAdmin = (u.roles ?? []).some((r) => (r.name ?? "").toUpperCase().includes("ADMIN"));
  return {
    id: u.id,
    name,
    email: u.email,
    avatar: initials,
    avatarBg: avatarBgs[index % avatarBgs.length],
    role: isAdmin ? "admin" : "staff",
    status: u.enabled !== false ? "active" : "locked",
    joinDate: formatDate(u.createdAt),
  };
}

export default function UserManagement() {
  const [users, setUsers] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [roleFilter, setRoleFilter] = useState<RoleFilter>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<number | null>(null);

  const perPage = 10;

  const loadUsers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminUserApi.list({ page: currentPage - 1, size: perPage });
      if (res.data.success) {
        const page = res.data.data;
        setUsers(page.content.map(mapUser));
        setTotalPages(Math.max(1, page.totalPages));
        setTotalElements(page.totalElements);
      }
    } catch {
      toast.error("Không tải được danh sách người dùng");
    } finally {
      setLoading(false);
    }
  }, [currentPage]);

  useEffect(() => {
    void loadUsers();
  }, [loadUsers]);

  const filteredUsers =
    roleFilter === "all" ? users : users.filter((u) => u.role === roleFilter);

  const toggleStatus = async (id: number) => {
    try {
      await adminUserApi.toggleStatus(id);
      toast.success("Đã cập nhật trạng thái");
      await loadUsers();
    } catch {
      toast.error("Không đổi được trạng thái");
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await adminUserApi.remove(id);
      toast.success("Đã xóa người dùng");
      setShowDeleteConfirm(null);
      await loadUsers();
    } catch {
      toast.error("Xóa người dùng thất bại");
    }
  };

  const filterTabs: { label: string; value: RoleFilter }[] = [
    { label: "Tất cả", value: "all" },
    { label: "Quản trị viên", value: "admin" },
    { label: "Nhân viên", value: "staff" },
  ];

  const start = totalElements === 0 ? 0 : (currentPage - 1) * perPage + 1;
  const end = Math.min(currentPage * perPage, totalElements);

  return (
    <div className="bg-white rounded-xl border border-gray-3/50 hover:shadow-2 transition-shadow duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between px-6 py-5 border-b border-gray-3/50 gap-3">
        <h3 className="text-lg font-bold text-dark">Danh sách thành viên</h3>
        <div className="flex items-center bg-[#F7F9FC] rounded-lg border border-gray-3 p-1">
          {filterTabs.map((tab) => (
            <button
              key={tab.value}
              onClick={() => {
                setRoleFilter(tab.value);
                setCurrentPage(1);
              }}
              className={`px-3.5 py-1.5 rounded-md text-xs font-medium transition-all duration-200 ${
                roleFilter === tab.value
                  ? "bg-white text-dark shadow-1"
                  : "text-[#8D93A5] hover:text-dark"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="overflow-x-auto">
        {loading ? (
          <p className="px-6 py-8 text-sm text-[#8D93A5]">Đang tải...</p>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="bg-[#F7F9FC]">
                <th className="text-left px-6 py-3 text-xs font-bold text-[#8D93A5] uppercase tracking-wider">Người dùng</th>
                <th className="text-left px-6 py-3 text-xs font-bold text-[#8D93A5] uppercase tracking-wider">Vai trò</th>
                <th className="text-left px-6 py-3 text-xs font-bold text-[#8D93A5] uppercase tracking-wider">Trạng thái</th>
                <th className="text-left px-6 py-3 text-xs font-bold text-[#8D93A5] uppercase tracking-wider">Ngày tham gia</th>
                <th className="text-center px-6 py-3 text-xs font-bold text-[#8D93A5] uppercase tracking-wider">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-3/50">
              {filteredUsers.map((user) => {
                const role = roleConfig[user.role];
                const status = statusConfig[user.status];
                return (
                  <tr key={user.id} className="hover:bg-[#F7F9FC]/50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${user.avatarBg} flex items-center justify-center text-white text-sm font-bold`}>
                          {user.avatar}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-dark">{user.name}</p>
                          <p className="text-xs text-[#8D93A5]">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${role.className}`}>
                        {role.label}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        type="button"
                        onClick={() => void toggleStatus(user.id)}
                        className="flex items-center gap-1.5"
                      >
                        <span className={`w-2 h-2 rounded-full ${status.dotColor}`} />
                        <span className={`text-sm font-medium ${status.textColor}`}>{status.label}</span>
                      </button>
                    </td>
                    <td className="px-6 py-4 text-sm text-[#6C6F93] whitespace-nowrap">{user.joinDate}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center">
                        <button
                          onClick={() => setShowDeleteConfirm(user.id)}
                          className="p-2 rounded-lg text-[#8D93A5] hover:text-red hover:bg-red-light-6 transition-all"
                          title="Xóa"
                        >
                          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                            <path d="M2.25 4.5H3.75H15.75" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M6 4.5V3C6 2.60218 6.15804 2.22064 6.43934 1.93934C6.72064 1.65804 7.10218 1.5 7.5 1.5H10.5C10.8978 1.5 11.2794 1.65804 11.5607 1.93934C11.842 2.22064 12 2.60218 12 3V4.5M14.25 4.5V15C14.25 15.3978 14.092 15.7794 13.8107 16.0607C13.5294 16.342 13.1478 16.5 12.75 16.5H5.25C4.85218 16.5 4.47064 16.342 4.18934 16.0607C3.90804 15.7794 3.75 15.3978 3.75 15V4.5H14.25Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-between px-6 py-4 border-t border-gray-3/50 gap-3">
        <p className="text-sm text-[#8D93A5]">
          Hiển thị {start}-{end} trên <span className="font-semibold text-dark">{totalElements}</span> người dùng
        </p>
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="w-9 h-9 rounded-lg border border-gray-3 flex items-center justify-center disabled:opacity-40"
          >
            ‹
          </button>
          <span className="text-sm text-dark px-2">
            {currentPage} / {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="w-9 h-9 rounded-lg border border-gray-3 flex items-center justify-center disabled:opacity-40"
          >
            ›
          </button>
        </div>
      </div>

      {showDeleteConfirm !== null && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center">
          <div className="absolute inset-0 bg-dark/40" onClick={() => setShowDeleteConfirm(null)} />
          <div className="relative bg-white rounded-2xl shadow-3 w-full max-w-[400px] mx-4 p-6 text-center">
            <h3 className="text-lg font-bold text-dark mb-2">Xác nhận xóa</h3>
            <p className="text-sm text-[#6C6F93] mb-6">Hành động này không thể hoàn tác.</p>
            <div className="flex items-center gap-3">
              <button onClick={() => setShowDeleteConfirm(null)} className="flex-1 py-2.5 text-sm border border-gray-3 rounded-lg">
                Hủy bỏ
              </button>
              <button
                onClick={() => void handleDelete(showDeleteConfirm)}
                className="flex-1 py-2.5 text-sm font-semibold text-white bg-red rounded-lg"
              >
                Xóa
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
