"use client";

import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import AdminPagination from "@/components/Admin/shared/AdminPagination";
import { adminCouponApi, type AdminCoupon } from "@/utils/adminApi";
import { formatVnd } from "@/utils/adminFormat";

const PER_PAGE = 10;

type CouponUi = {
  id: number;
  code: string;
  type: "percent" | "fixed";
  value: string;
  used: number;
  limit: number | null;
  status: "active" | "paused" | "expired";
};

function toApiDateTime(d: Date) {
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}:${p(d.getSeconds())}`;
}

function mapCoupon(c: AdminCoupon): CouponUi {
  const type = c.discountType?.toUpperCase() === "FIXED" ? "fixed" : "percent";
  const value =
    type === "percent"
      ? `${c.discountValue}%`
      : formatVnd(Number(c.discountValue));
  let status: CouponUi["status"] = "active";
  if (!c.isActive) status = "paused";
  else if (c.dateEnd && new Date(c.dateEnd) < new Date()) status = "expired";
  return {
    id: c.id,
    code: c.code,
    type,
    value,
    used: c.usedCount ?? 0,
    limit: c.usageLimit ?? null,
    status,
  };
}

const statusConfig: Record<string, { label: string; className: string }> = {
  active: { label: "Đang chạy", className: "bg-green-light-6 text-green border border-green-light-5" },
  paused: { label: "Tạm dừng", className: "bg-[#FEF3C7] text-yellow-dark-2 border border-yellow-light" },
  expired: { label: "Hết hạn", className: "bg-red-light-6 text-red border border-red-light-4" },
};

export default function CouponManagement() {
  const [coupons, setCoupons] = useState<CouponUi[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    code: "",
    type: "percent" as "percent" | "fixed",
    value: "",
    limit: "",
  });
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminCouponApi.list({ page: page - 1, size: PER_PAGE });
      if (res.data.success) {
        const data = res.data.data;
        setCoupons(data.content.map(mapCoupon));
        setTotalPages(Math.max(1, data.totalPages));
        setTotalElements(data.totalElements);
      }
    } catch {
      toast.error("Không tải được mã giảm giá");
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    void load();
  }, [load]);

  const openCreateModal = () => {
    setEditId(null);
    setFormData({ code: "", type: "percent", value: "", limit: "" });
    setShowModal(true);
  };

  const openEditModal = (c: CouponUi) => {
    setEditId(c.id);
    setFormData({
      code: c.code,
      type: c.type,
      value: c.value.replace(/[%₫\s,]/g, ""),
      limit: c.limit?.toString() ?? "",
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!formData.code.trim() || !formData.value) {
      toast.error("Nhập mã và giá trị giảm");
      return;
    }
    const now = new Date();
    const end = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
    const body = {
      code: formData.code.trim().toUpperCase(),
      discountType: formData.type === "percent" ? "PERCENT" : "FIXED",
      discountValue: Number(formData.value),
      usageLimit: formData.limit ? Number(formData.limit) : undefined,
      dateStart: toApiDateTime(now),
      dateEnd: toApiDateTime(end),
      isActive: true,
    };
    try {
      if (editId) {
        await adminCouponApi.update(editId, body);
        toast.success("Đã cập nhật mã");
      } else {
        await adminCouponApi.create(body);
        toast.success("Đã tạo mã");
      }
      setShowModal(false);
      await load();
    } catch {
      toast.error("Lưu mã giảm giá thất bại");
    }
  };

  const toggleCoupon = async (id: number) => {
    try {
      await adminCouponApi.toggle(id);
      await load();
    } catch {
      toast.error("Không đổi được trạng thái");
    }
  };

  return (
    <div className="bg-white rounded-xl border border-gray-3/50 hover:shadow-2 transition-shadow duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between px-6 py-5 border-b border-gray-3/50 gap-3">
        <div>
          <h2 className="text-xl font-bold text-dark">Mã giảm giá</h2>
          <p className="text-sm text-[#6C6F93] mt-0.5">Quản lý các chương trình khuyến mãi và voucher khách hàng.</p>
        </div>
        <button
          onClick={openCreateModal}
          className="flex items-center gap-2 px-5 py-2.5 bg-[#3C50E0] text-white rounded-lg text-sm font-semibold hover:bg-[#1C3FB7] transition-colors shadow-lg shadow-[#3C50E0]/25 flex-shrink-0"
        >
          Tạo mã
        </button>
      </div>

      <div className="overflow-x-auto">
        {loading ? (
          <p className="px-6 py-8 text-sm text-[#8D93A5]">Đang tải...</p>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="bg-[#F7F9FC]">
                <th className="text-left px-6 py-3 text-xs font-bold text-[#8D93A5] uppercase tracking-wider">Mã Code</th>
                <th className="text-left px-6 py-3 text-xs font-bold text-[#8D93A5] uppercase tracking-wider">Loại</th>
                <th className="text-left px-6 py-3 text-xs font-bold text-[#8D93A5] uppercase tracking-wider">Giá trị</th>
                <th className="text-left px-6 py-3 text-xs font-bold text-[#8D93A5] uppercase tracking-wider">Giới hạn</th>
                <th className="text-left px-6 py-3 text-xs font-bold text-[#8D93A5] uppercase tracking-wider">Trạng thái</th>
                <th className="text-center px-6 py-3 text-xs font-bold text-[#8D93A5] uppercase tracking-wider">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-3/50">
              {coupons.map((coupon) => {
                const status = statusConfig[coupon.status];
                return (
                  <tr key={coupon.id} className="hover:bg-[#F7F9FC]/50 transition-colors group">
                    <td className="px-6 py-4">
                      <span className="inline-block px-3 py-1.5 rounded-md text-sm font-bold tracking-wide bg-[#3C50E0]/8 text-[#3C50E0]">
                        {coupon.code}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-[#6C6F93]">
                      {coupon.type === "percent" ? "Phần trăm (%)" : "Cố định (đ)"}
                    </td>
                    <td className="px-6 py-4 text-sm font-semibold text-dark">{coupon.value}</td>
                    <td className="px-6 py-4 text-sm text-[#6C6F93]">
                      {coupon.limit === null ? "Unlimited" : `${coupon.used} / ${coupon.limit}`}
                    </td>
                    <td className="px-6 py-4">
                      <button type="button" onClick={() => void toggleCoupon(coupon.id)} className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${status.className}`}>
                        {status.label}
                      </button>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button onClick={() => openEditModal(coupon)} className="p-2 rounded-lg text-[#8D93A5] hover:text-[#3C50E0]">
                        Sửa
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      <div className="px-6 pb-4">
        <AdminPagination
          page={page}
          totalPages={totalPages}
          totalElements={totalElements}
          pageSize={PER_PAGE}
          onPageChange={setPage}
          label="mã giảm giá"
        />
      </div>

      {showModal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center">
          <div className="absolute inset-0 bg-dark/40" onClick={() => setShowModal(false)} />
          <div className="relative bg-white rounded-2xl shadow-3 w-full max-w-[480px] mx-4 overflow-hidden p-6 space-y-4">
            <h3 className="text-lg font-bold text-dark">{editId ? "Chỉnh sửa mã" : "Tạo mã mới"}</h3>
            <input
              type="text"
              value={formData.code}
              onChange={(e) => setFormData({ ...formData, code: e.target.value })}
              placeholder="Mã code"
              className="w-full px-4 py-2.5 border border-gray-3 rounded-lg text-sm uppercase"
            />
            <div className="flex gap-3">
              <button type="button" onClick={() => setFormData({ ...formData, type: "percent" })} className={`flex-1 py-2.5 rounded-lg text-sm border ${formData.type === "percent" ? "bg-[#3C50E0] text-white" : ""}`}>
                %
              </button>
              <button type="button" onClick={() => setFormData({ ...formData, type: "fixed" })} className={`flex-1 py-2.5 rounded-lg text-sm border ${formData.type === "fixed" ? "bg-[#3C50E0] text-white" : ""}`}>
                VND
              </button>
            </div>
            <input
              type="number"
              value={formData.value}
              onChange={(e) => setFormData({ ...formData, value: e.target.value })}
              placeholder="Giá trị"
              className="w-full px-4 py-2.5 border border-gray-3 rounded-lg text-sm"
            />
            <input
              type="number"
              value={formData.limit}
              onChange={(e) => setFormData({ ...formData, limit: e.target.value })}
              placeholder="Giới hạn lượt dùng (trống = không giới hạn)"
              className="w-full px-4 py-2.5 border border-gray-3 rounded-lg text-sm"
            />
            <div className="flex justify-end gap-2">
              <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 text-sm text-[#6C6F93]">
                Hủy
              </button>
              <button type="button" onClick={() => void handleSave()} className="px-4 py-2 text-sm font-semibold text-white bg-[#3C50E0] rounded-lg">
                Lưu
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
