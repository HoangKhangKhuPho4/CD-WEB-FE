"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import Modal from "@/components/Admin/shared/Modal";
import PrimaryButton from "@/components/Admin/shared/PrimaryButton";
import {
  getStaffRoleVisual,
  IconBan,
  IconCheckCircle,
  IconLock,
  IconUnlock,
  IconUserPlus,
  IconUsersTeam,
} from "@/components/Admin/icons/AdminIcons";
import { adminUserApi, rbacApi, type AdminUser } from "@/utils/adminApi";
import { getUserInitials } from "@/utils/staffDisplay";
import { staffRoleDisplayName } from "@/utils/roleDisplayLabels";
import type { RoleDetail } from "@/types/rbac";

const STAFF_ROLE_NAMES = new Set(["ADMIN", "WAREHOUSE", "SALES", "ROLE_ADMIN"]);

function isStaffUser(u: AdminUser): boolean {
  return (u.roles ?? []).some((r) => STAFF_ROLE_NAMES.has((r.name ?? "").toUpperCase()));
}

const emptyForm = {
  username: "",
  email: "",
  password: "",
  fullName: "",
  phone: "",
  roleId: "",
};

function StaffAvatar({ name, roleName }: { name: string; roleName?: string }) {
  const visual = getStaffRoleVisual(roleName);
  return (
    <div
      className={`w-10 h-10 rounded-xl bg-gradient-to-br ${visual.gradient} text-white flex items-center justify-center text-xs font-bold shadow-sm shrink-0`}
    >
      {getUserInitials(name)}
    </div>
  );
}

function RoleBadge({ roleName }: { roleName?: string }) {
  const visual = getStaffRoleVisual(roleName);
  const { Icon } = visual;
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${visual.badgeClass}`}
    >
      <Icon size={14} className="shrink-0" />
      {visual.shortLabel}
    </span>
  );
}

export default function StaffManagement() {
  const [staff, setStaff] = useState<AdminUser[]>([]);
  const [roles, setRoles] = useState<RoleDetail[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(emptyForm);

  const staffRoles = useMemo(
    () => roles.filter((r) => STAFF_ROLE_NAMES.has((r.name ?? "").toUpperCase())),
    [roles]
  );

  const roleStats = useMemo(() => {
    const counts = { admin: 0, warehouse: 0, sales: 0, other: 0 };
    for (const s of staff) {
      const name = (s.roles?.[0]?.name ?? "").toUpperCase();
      if (name.includes("ADMIN")) counts.admin++;
      else if (name.includes("WAREHOUSE")) counts.warehouse++;
      else if (name.includes("SALES")) counts.sales++;
      else counts.other++;
    }
    return counts;
  }, [staff]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [userRes, roleList] = await Promise.all([
        adminUserApi.list({ page: 0, size: 100 }),
        rbacApi.listRoles(),
      ]);
      if (userRes.data.success) {
        setStaff(userRes.data.data.content.filter(isStaffUser));
      }
      setRoles(roleList ?? []);
    } catch {
      toast.error("Không tải được danh sách nhân viên");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!form.roleId && staffRoles.length) {
      const sales = staffRoles.find((r) => (r.name ?? "").toUpperCase() === "SALES");
      setForm((f) => ({ ...f, roleId: String(sales?.id ?? staffRoles[0].id) }));
    }
  }, [staffRoles, form.roleId]);

  useEffect(() => {
    void load();
  }, [load]);

  const addStaff = async () => {
    if (!form.username.trim() || !form.email.trim() || !form.password.trim() || !form.fullName.trim()) {
      toast.error("Vui lòng điền đủ thông tin bắt buộc");
      return;
    }
    setSaving(true);
    try {
      const res = await adminUserApi.create({
        username: form.username.trim(),
        email: form.email.trim(),
        password: form.password,
        fullName: form.fullName.trim(),
        phone: form.phone.trim() || undefined,
        roleId: form.roleId ? Number(form.roleId) : undefined,
      });
      if (res.data.success) {
        toast.success("Đã tạo tài khoản nhân viên");
        setForm(emptyForm);
        setModalOpen(false);
        void load();
      }
    } catch {
      toast.error("Tạo nhân viên thất bại");
    } finally {
      setSaving(false);
    }
  };

  const toggleActive = async (id: number) => {
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

  if (loading) {
    return (
      <div className="flex items-center gap-3 py-8 text-sm text-[#8D93A5]">
        <span className="inline-block w-5 h-5 border-2 border-[#3C50E0]/30 border-t-[#3C50E0] rounded-full animate-spin" />
        Đang tải nhân viên...
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
        {[
          { key: "total", label: "Tổng nhân viên", value: staff.length, visual: getStaffRoleVisual() },
          { key: "admin", label: "Quản trị", value: roleStats.admin, visual: getStaffRoleVisual("ADMIN") },
          { key: "warehouse", label: "Kho", value: roleStats.warehouse, visual: getStaffRoleVisual("WAREHOUSE") },
          { key: "sales", label: "Bán hàng", value: roleStats.sales, visual: getStaffRoleVisual("SALES") },
        ].map(({ key, label, value, visual }) => {
          const { Icon } = visual;
          return (
            <div
              key={key}
              className="bg-white rounded-xl border border-gray-3/50 p-4 flex items-center gap-3"
            >
              <div
                className={`w-10 h-10 rounded-xl bg-gradient-to-br ${visual.gradient} text-white flex items-center justify-center shadow-sm`}
              >
                <Icon size={18} />
              </div>
              <div>
                <p className="text-xs text-[#8D93A5] font-medium">{label}</p>
                <p className="text-xl font-bold text-dark">{value}</p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex justify-end mb-4">
        <PrimaryButton onClick={() => setModalOpen(true)}>
          <IconUserPlus size={16} />
          Thêm nhân viên
        </PrimaryButton>
      </div>

      <div className="bg-white rounded-xl border border-gray-3/50 overflow-hidden">
        <table className="w-full min-w-[700px]">
          <thead>
            <tr className="bg-[#F7F9FC] border-b border-gray-3/50">
              <th className="text-left px-6 py-3 text-xs font-bold text-[#8D93A5] uppercase">Họ tên</th>
              <th className="text-left px-4 py-3 text-xs font-bold text-[#8D93A5] uppercase">Tài khoản</th>
              <th className="text-left px-4 py-3 text-xs font-bold text-[#8D93A5] uppercase">Email</th>
              <th className="text-left px-4 py-3 text-xs font-bold text-[#8D93A5] uppercase">Vai trò</th>
              <th className="text-left px-4 py-3 text-xs font-bold text-[#8D93A5] uppercase">Trạng thái</th>
              <th className="text-center px-6 py-3 text-xs font-bold text-[#8D93A5] uppercase">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-3/50">
            {staff.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center">
                  <div className="inline-flex flex-col items-center gap-3 text-[#8D93A5]">
                    <div className="w-14 h-14 rounded-2xl bg-[#F7F9FC] flex items-center justify-center text-[#3C50E0]">
                      <IconUsersTeam size={28} />
                    </div>
                    <p className="text-sm">Chưa có nhân viên. Bấm &quot;Thêm nhân viên&quot; để tạo tài khoản.</p>
                  </div>
                </td>
              </tr>
            ) : (
              staff.map((s) => {
                const roleName = s.roles?.[0]?.name;
                const name = s.fullName ?? s.name ?? s.username;
                const active = s.enabled !== false;
                return (
                  <tr key={s.id} className="hover:bg-[#F7F9FC]/60 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <StaffAvatar name={name} roleName={roleName} />
                        <div>
                          <span className="text-sm font-semibold text-dark block">{name}</span>
                          <span className="text-xs text-[#8D93A5]">{getStaffRoleVisual(roleName).label}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-sm text-[#6C6F93] font-mono">{s.username}</td>
                    <td className="px-4 py-4 text-sm text-[#6C6F93]">{s.email}</td>
                    <td className="px-4 py-4">
                      <RoleBadge roleName={roleName} />
                    </td>
                    <td className="px-4 py-4">
                      <span
                        className={`inline-flex items-center gap-1.5 text-xs font-semibold ${
                          active ? "text-green" : "text-[#8D93A5]"
                        }`}
                      >
                        {active ? (
                          <IconCheckCircle size={14} className="text-green" />
                        ) : (
                          <IconBan size={14} />
                        )}
                        {active ? "Hoạt động" : "Vô hiệu"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button
                        type="button"
                        onClick={() => void toggleActive(s.id)}
                        className={`inline-flex items-center gap-1.5 text-sm font-semibold transition-colors ${
                          active
                            ? "text-[#8D93A5] hover:text-red"
                            : "text-[#3C50E0] hover:text-[#1C3FB7]"
                        }`}
                      >
                        {active ? (
                          <>
                            <IconLock size={15} />
                            Khóa
                          </>
                        ) : (
                          <>
                            <IconUnlock size={15} />
                            Mở khóa
                          </>
                        )}
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Thêm nhân viên"
        subtitle="Tạo tài khoản truy cập khu vực quản trị"
        footer={
          <PrimaryButton onClick={() => void addStaff()} disabled={saving}>
            {saving ? "Đang lưu..." : "Lưu"}
          </PrimaryButton>
        }
      >
        <div className="space-y-4">
          <input
            value={form.username}
            onChange={(e) => setForm((p) => ({ ...p, username: e.target.value }))}
            placeholder="Tên đăng nhập *"
            className="w-full px-3 py-2.5 border border-gray-3 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#3C50E0]/20 focus:border-[#3C50E0]"
          />
          <input
            value={form.fullName}
            onChange={(e) => setForm((p) => ({ ...p, fullName: e.target.value }))}
            placeholder="Họ và tên *"
            className="w-full px-3 py-2.5 border border-gray-3 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#3C50E0]/20 focus:border-[#3C50E0]"
          />
          <input
            type="email"
            value={form.email}
            onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
            placeholder="Email *"
            className="w-full px-3 py-2.5 border border-gray-3 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#3C50E0]/20 focus:border-[#3C50E0]"
          />
          <input
            value={form.phone}
            onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))}
            placeholder="Số điện thoại"
            className="w-full px-3 py-2.5 border border-gray-3 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#3C50E0]/20 focus:border-[#3C50E0]"
          />
          <input
            type="password"
            value={form.password}
            onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))}
            placeholder="Mật khẩu (tối thiểu 6 ký tự) *"
            className="w-full px-3 py-2.5 border border-gray-3 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#3C50E0]/20 focus:border-[#3C50E0]"
          />

          <div>
            <p className="text-sm font-medium text-dark mb-2">Vai trò</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {staffRoles.map((r) => {
                const visual = getStaffRoleVisual(r.name);
                const { Icon } = visual;
                const selected = form.roleId === String(r.id);
                return (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() => setForm((p) => ({ ...p, roleId: String(r.id) }))}
                    className={`flex items-center gap-2.5 p-3 rounded-xl border text-left transition-all ${
                      selected
                        ? "border-[#3C50E0] bg-[#EEF2FF] ring-2 ring-[#3C50E0]/20"
                        : "border-gray-3/60 hover:border-[#3C50E0]/40 hover:bg-[#F7F9FC]"
                    }`}
                  >
                    <div
                      className={`w-9 h-9 rounded-lg bg-gradient-to-br ${visual.gradient} text-white flex items-center justify-center shrink-0`}
                    >
                      <Icon size={16} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-dark truncate">
                        {staffRoleDisplayName(r.name)}
                      </p>
                      {r.description && (
                        <p className="text-xs text-[#8D93A5] truncate">{r.description}</p>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </Modal>
    </>
  );
}
