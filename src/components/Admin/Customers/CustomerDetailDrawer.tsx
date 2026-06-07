"use client";

import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import PrimaryButton from "@/components/Admin/shared/PrimaryButton";
import {
  IconBan,
  IconCheckCircle,
  IconLock,
  IconUnlock,
} from "@/components/Admin/icons/AdminIcons";
import { adminUserApi, type AdminUser } from "@/utils/adminApi";
import { formatDate, formatDateTime } from "@/utils/adminFormat";
import { getUserInitials } from "@/utils/staffDisplay";

function providerLabel(p?: string) {
  if (!p) return "Email / Mật khẩu";
  if (p === "GOOGLE") return "Google";
  if (p === "FACEBOOK") return "Facebook";
  return p;
}

export default function CustomerDetailDrawer({
  id,
  canManage,
  onClose,
  onUpdated,
  onEdit,
}: {
  id: number | null;
  canManage: boolean;
  onClose: () => void;
  onUpdated: () => void;
  onEdit: (user: AdminUser) => void;
}) {
  const [detail, setDetail] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    if (id == null) return;
    setLoading(true);
    try {
      const res = await adminUserApi.get(id);
      if (res.data.success) setDetail(res.data.data);
    } catch {
      toast.error("Không tải được thông tin khách hàng");
      onClose();
    } finally {
      setLoading(false);
    }
  }, [id, onClose]);

  useEffect(() => {
    if (id != null) void load();
    else setDetail(null);
  }, [id, load]);

  const toggleStatus = async () => {
    if (!detail) return;
    try {
      const res = await adminUserApi.toggleStatus(detail.id);
      if (res.data.success) {
        toast.success(res.data.message || "Đã cập nhật trạng thái");
        await load();
        onUpdated();
      }
    } catch {
      toast.error("Không đổi được trạng thái");
    }
  };

  const softDelete = async () => {
    if (!detail) return;
    if (!confirm(`Vô hiệu hóa tài khoản "${detail.username}"?`)) return;
    try {
      await adminUserApi.remove(detail.id);
      toast.success("Đã vô hiệu hóa khách hàng");
      onUpdated();
      onClose();
    } catch {
      toast.error("Không vô hiệu hóa được");
    }
  };

  if (id == null) return null;

  const name = detail?.fullName ?? detail?.name ?? detail?.username ?? "—";
  const active = detail?.enabled !== false;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} aria-hidden />
      <div className="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col animate-slide-in-right">
        <div className="px-6 py-5 border-b border-gray-3/50 flex items-center justify-between">
          <h2 className="text-lg font-bold text-dark">Chi tiết khách hàng</h2>
          <button
            type="button"
            onClick={onClose}
            className="text-[#8D93A5] hover:text-dark text-xl leading-none"
          >
            ×
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5">
          {loading ? (
            <p className="text-sm text-[#8D93A5]">Đang tải...</p>
          ) : detail ? (
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#3C50E0] to-[#1C3FB7] text-white flex items-center justify-center text-lg font-bold">
                  {detail.avatarUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={detail.avatarUrl}
                      alt=""
                      className="w-full h-full rounded-2xl object-cover"
                    />
                  ) : (
                    getUserInitials(name)
                  )}
                </div>
                <div>
                  <p className="font-bold text-dark text-lg">{name}</p>
                  <p className="text-sm text-[#8D93A5]">@{detail.username}</p>
                  <span
                    className={`inline-flex items-center gap-1 mt-1 text-xs font-semibold ${
                      active ? "text-green" : "text-[#8D93A5]"
                    }`}
                  >
                    {active ? (
                      <IconCheckCircle size={14} />
                    ) : (
                      <IconBan size={14} />
                    )}
                    {active ? "Đang hoạt động" : "Đã khóa / vô hiệu"}
                  </span>
                </div>
              </div>

              <dl className="space-y-3 text-sm">
                {[
                  ["Email", detail.email],
                  ["Điện thoại", detail.phone ?? "—"],
                  ["Giới tính", detail.gender ?? "—"],
                  ["Ngày sinh", formatDate(detail.birth)],
                  ["Địa chỉ", detail.address ?? "—"],
                  ["Đăng nhập qua", providerLabel(detail.provider)],
                  ["Ngày tham gia", formatDateTime(detail.createdAt)],
                  ["Đăng nhập gần nhất", formatDateTime(detail.lastLoginAt)],
                ].map(([label, value]) => (
                  <div key={String(label)} className="flex justify-between gap-4">
                    <dt className="text-[#8D93A5] shrink-0">{label}</dt>
                    <dd className="text-dark text-right font-medium break-all">{value}</dd>
                  </div>
                ))}
              </dl>
            </div>
          ) : null}
        </div>

        {canManage && detail && (
          <div className="px-6 py-4 border-t border-gray-3/50 flex flex-wrap gap-2">
            <PrimaryButton onClick={() => onEdit(detail)}>Chỉnh sửa</PrimaryButton>
            <button
              type="button"
              onClick={() => void toggleStatus()}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg border border-gray-3 text-sm font-semibold hover:bg-[#F7F9FC]"
            >
              {active ? <IconLock size={15} /> : <IconUnlock size={15} />}
              {active ? "Khóa tài khoản" : "Mở khóa"}
            </button>
            <button
              type="button"
              onClick={() => void softDelete()}
              className="px-4 py-2 rounded-lg text-sm font-semibold text-red hover:bg-red/5"
            >
              Vô hiệu hóa
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
