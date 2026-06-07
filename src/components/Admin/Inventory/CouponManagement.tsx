"use client";

import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import AdminTablePagination from "@/components/Admin/shared/AdminTablePagination";
import {
  adminCouponApi,
  type AdminCoupon,
  type AdminCouponStats,
  type CouponCreatePayload,
  type CouponLifecycleStatus,
  type CouponScopeType,
  type CouponUsageOrder,
} from "@/utils/adminApi";
import { formatDateTime, formatVnd } from "@/utils/adminFormat";

const PAGE_SIZE_OPTIONS = [10, 15, 20, 50];

const lifecycleLabels: Record<CouponLifecycleStatus, string> = {
  ACTIVE: "Đang chạy",
  INACTIVE: "Tạm dừng",
  EXPIRED: "Hết hạn",
  UPCOMING: "Sắp diễn ra",
  EXHAUSTED: "Hết lượt",
};

const lifecycleStyles: Record<CouponLifecycleStatus, string> = {
  ACTIVE: "bg-green-light-6 text-green border border-green-light-5",
  INACTIVE: "bg-[#FEF3C7] text-yellow-dark-2 border border-yellow-light",
  EXPIRED: "bg-red-light-6 text-red border border-red-light-4",
  UPCOMING: "bg-blue-light-5/30 text-blue border border-blue-light-3",
  EXHAUSTED: "bg-gray-2 text-[#6C6F93] border border-gray-3",
};

type FormState = {
  code: string;
  name: string;
  description: string;
  type: "percent" | "fixed";
  value: string;
  minOrder: string;
  maxDiscount: string;
  limit: string;
  perUserLimit: string;
  firstOrderOnly: boolean;
  scopeType: CouponScopeType;
  productIds: string;
  productTypeIds: string;
  dateStart: string;
  dateEnd: string;
  isActive: boolean;
};

function toApiDateTime(d: Date) {
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}:${p(d.getSeconds())}`;
}

function toDatetimeLocalValue(iso?: string) {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}`;
}

function fromDatetimeLocalValue(v: string) {
  if (!v) return toApiDateTime(new Date());
  const d = new Date(v);
  return toApiDateTime(d);
}

function parseIdList(raw: string): number[] {
  return raw
    .split(/[,;\s]+/)
    .map((s) => Number(s.trim()))
    .filter((n) => Number.isFinite(n) && n > 0);
}

function emptyForm(): FormState {
  const now = new Date();
  const end = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
  return {
    code: "",
    name: "",
    description: "",
    type: "percent",
    value: "",
    minOrder: "",
    maxDiscount: "",
    limit: "",
    perUserLimit: "",
    firstOrderOnly: false,
    scopeType: "ALL",
    productIds: "",
    productTypeIds: "",
    dateStart: toDatetimeLocalValue(now.toISOString()),
    dateEnd: toDatetimeLocalValue(end.toISOString()),
    isActive: true,
  };
}

function couponToForm(c: AdminCoupon): FormState {
  const type = c.discountType?.toUpperCase() === "FIXED" ? "fixed" : "percent";
  return {
    code: c.code,
    name: c.name ?? "",
    description: c.description ?? "",
    type,
    value: String(c.discountValue ?? ""),
    minOrder: c.minOrderValue != null ? String(c.minOrderValue) : "",
    maxDiscount: c.maxDiscountAmount != null ? String(c.maxDiscountAmount) : "",
    limit: c.usageLimit != null ? String(c.usageLimit) : "",
    perUserLimit: c.perUserLimit != null ? String(c.perUserLimit) : "",
    firstOrderOnly: Boolean(c.firstOrderOnly),
    scopeType: (c.scopeType as CouponScopeType) ?? "ALL",
    productIds: (c.productIds ?? []).join(", "),
    productTypeIds: (c.productTypeIds ?? []).join(", "),
    dateStart: toDatetimeLocalValue(c.dateStart),
    dateEnd: toDatetimeLocalValue(c.dateEnd),
    isActive: c.isActive !== false,
  };
}

function formatDiscount(c: AdminCoupon) {
  const type = c.discountType?.toUpperCase();
  return type === "FIXED"
    ? formatVnd(Number(c.discountValue))
    : `${c.discountValue}%`;
}

function resolveLifecycle(c: AdminCoupon): CouponLifecycleStatus {
  return (c.lifecycleStatus as CouponLifecycleStatus) ?? (c.isActive ? "ACTIVE" : "INACTIVE");
}

export default function CouponManagement() {
  const [coupons, setCoupons] = useState<AdminCoupon[]>([]);
  const [stats, setStats] = useState<AdminCouponStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showUsageModal, setShowUsageModal] = useState(false);
  const [showValidateModal, setShowValidateModal] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [formData, setFormData] = useState<FormState>(emptyForm);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);
  const [keyword, setKeyword] = useState("");
  const [lifecycleFilter, setLifecycleFilter] = useState("");
  const [discountTypeFilter, setDiscountTypeFilter] = useState("");
  const [selected, setSelected] = useState<number[]>([]);
  const [usageOrders, setUsageOrders] = useState<CouponUsageOrder[]>([]);
  const [usageCouponCode, setUsageCouponCode] = useState("");
  const [validateCode, setValidateCode] = useState("");
  const [validateSubtotal, setValidateSubtotal] = useState("1000000");
  const [validateResult, setValidateResult] = useState<string>("");

  const loadStats = useCallback(async () => {
    try {
      const res = await adminCouponApi.stats();
      if (res.data.success) setStats(res.data.data);
    } catch {
      /* optional */
    }
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminCouponApi.list({
        page: page - 1,
        size: pageSize,
        keyword: keyword.trim() || undefined,
        lifecycle: lifecycleFilter || undefined,
        discountType: discountTypeFilter || undefined,
        sortBy: "createdAt",
        sortDir: "desc",
      });
      if (res.data.success) {
        const data = res.data.data;
        setCoupons(data.content);
        setTotalPages(Math.max(1, data.totalPages));
        setTotalElements(data.totalElements);
      }
    } catch {
      toast.error("Không tải được mã giảm giá");
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, keyword, lifecycleFilter, discountTypeFilter]);

  useEffect(() => {
    void loadStats();
  }, [loadStats]);

  useEffect(() => {
    void load();
  }, [load]);

  const openCreateModal = () => {
    setEditId(null);
    setFormData(emptyForm());
    setShowModal(true);
  };

  const openEditModal = async (id: number) => {
    try {
      const res = await adminCouponApi.get(id);
      if (res.data.success) {
        setEditId(id);
        setFormData(couponToForm(res.data.data));
        setShowModal(true);
      }
    } catch {
      toast.error("Không tải được chi tiết mã");
    }
  };

  const buildPayload = (): CouponCreatePayload => {
    const payload: CouponCreatePayload = {
      code: formData.code.trim().toUpperCase(),
      name: formData.name.trim() || undefined,
      description: formData.description.trim() || undefined,
      discountType: formData.type === "percent" ? "PERCENT" : "FIXED",
      discountValue: Number(formData.value),
      minOrderValue: formData.minOrder ? Number(formData.minOrder) : undefined,
      maxDiscountAmount: formData.maxDiscount ? Number(formData.maxDiscount) : undefined,
      usageLimit: formData.limit ? Number(formData.limit) : undefined,
      perUserLimit: formData.perUserLimit ? Number(formData.perUserLimit) : undefined,
      firstOrderOnly: formData.firstOrderOnly,
      scopeType: formData.scopeType,
      dateStart: fromDatetimeLocalValue(formData.dateStart),
      dateEnd: fromDatetimeLocalValue(formData.dateEnd),
      isActive: formData.isActive,
    };
    if (formData.scopeType === "PRODUCTS") {
      payload.productIds = parseIdList(formData.productIds);
    }
    if (formData.scopeType === "PRODUCT_TYPES") {
      payload.productTypeIds = parseIdList(formData.productTypeIds);
    }
    return payload;
  };

  const handleSave = async () => {
    if (!formData.code.trim() || !formData.value) {
      toast.error("Nhập mã và giá trị giảm");
      return;
    }
    const body = buildPayload();
    try {
      if (editId) {
        await adminCouponApi.update(editId, body);
        toast.success("Đã cập nhật mã");
      } else {
        await adminCouponApi.create(body);
        toast.success("Đã tạo mã");
      }
      setShowModal(false);
      await Promise.all([load(), loadStats()]);
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        "Lưu mã giảm giá thất bại";
      toast.error(msg);
    }
  };

  const toggleCoupon = async (id: number) => {
    try {
      await adminCouponApi.toggle(id);
      await Promise.all([load(), loadStats()]);
    } catch {
      toast.error("Không đổi được trạng thái");
    }
  };

  const deleteCoupon = async (id: number) => {
    if (!confirm("Vô hiệu hóa mã giảm giá này?")) return;
    try {
      await adminCouponApi.remove(id);
      toast.success("Đã vô hiệu hóa mã");
      await Promise.all([load(), loadStats()]);
    } catch {
      toast.error("Xóa mã thất bại");
    }
  };

  const bulkSetActive = async (isActive: boolean) => {
    if (!selected.length) {
      toast.error("Chọn ít nhất một mã");
      return;
    }
    try {
      await adminCouponApi.bulkStatus(selected, isActive);
      toast.success(isActive ? "Đã kích hoạt hàng loạt" : "Đã tạm dừng hàng loạt");
      setSelected([]);
      await Promise.all([load(), loadStats()]);
    } catch {
      toast.error("Cập nhật hàng loạt thất bại");
    }
  };

  const toggleSelect = (id: number) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selected.length === coupons.length) setSelected([]);
    else setSelected(coupons.map((c) => c.id));
  };

  const openUsage = async (coupon: AdminCoupon) => {
    try {
      const res = await adminCouponApi.getUsageOrders(coupon.id, { page: 0, size: 20 });
      if (res.data.success) {
        setUsageOrders(res.data.data.content);
        setUsageCouponCode(coupon.code);
        setShowUsageModal(true);
      }
    } catch {
      toast.error("Không tải được lịch sử sử dụng");
    }
  };

  const runValidate = async () => {
    if (!validateCode.trim()) return;
    try {
      const res = await adminCouponApi.validate({
        code: validateCode.trim(),
        subtotal: Number(validateSubtotal) || 0,
      });
      if (res.data.success) {
        const v = res.data.data;
        setValidateResult(
          v.valid
            ? `Hợp lệ — giảm ${formatVnd(Number(v.discountAmount ?? 0))}`
            : `Không hợp lệ — ${v.message ?? ""}`
        );
      }
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        "Kiểm tra thất bại";
      setValidateResult(msg);
    }
  };

  return (
    <div className="space-y-6">
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
          {[
            { label: "Tổng", value: stats.total },
            { label: "Đang chạy", value: stats.active },
            { label: "Tạm dừng", value: stats.inactive },
            { label: "Hết hạn", value: stats.expired },
            { label: "Sắp diễn ra", value: stats.upcoming },
            { label: "Hết lượt", value: stats.exhausted },
            { label: "Lượt đã dùng", value: stats.totalUsedCount },
            { label: "Chỉ đơn đầu", value: stats.firstOrderOnlyCount },
          ].map((s) => (
            <div
              key={s.label}
              className="bg-white rounded-xl border border-gray-3/50 px-4 py-3 text-center"
            >
              <p className="text-xs text-[#8D93A5]">{s.label}</p>
              <p className="text-lg font-bold text-dark mt-1">{s.value}</p>
            </div>
          ))}
        </div>
      )}

      <div className="bg-white rounded-xl border border-gray-3/50 hover:shadow-2 transition-shadow duration-300">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between px-6 py-5 border-b border-gray-3/50 gap-3">
          <div>
            <h2 className="text-xl font-bold text-dark">Mã giảm giá</h2>
            <p className="text-sm text-[#6C6F93] mt-0.5">
              Quản lý voucher, giới hạn theo user/sản phẩm và thống kê sử dụng.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => {
                setValidateCode("");
                setValidateResult("");
                setShowValidateModal(true);
              }}
              className="px-4 py-2.5 border border-gray-3 rounded-lg text-sm font-medium text-[#6C6F93] hover:border-[#3C50E0] hover:text-[#3C50E0]"
            >
              Kiểm tra mã
            </button>
            <button
              type="button"
              onClick={openCreateModal}
              className="px-5 py-2.5 bg-[#3C50E0] text-white rounded-lg text-sm font-semibold hover:bg-[#1C3FB7] shadow-lg shadow-[#3C50E0]/25"
            >
              Tạo mã
            </button>
          </div>
        </div>

        <div className="px-6 py-4 border-b border-gray-3/50 flex flex-wrap gap-3 items-center">
          <input
            type="text"
            placeholder="Tìm mã, tên..."
            value={keyword}
            onChange={(e) => {
              setKeyword(e.target.value);
              setPage(1);
            }}
            className="px-3 py-2 border border-gray-3 rounded-lg text-sm min-w-[180px]"
          />
          <select
            value={lifecycleFilter}
            onChange={(e) => {
              setLifecycleFilter(e.target.value);
              setPage(1);
            }}
            className="px-3 py-2 border border-gray-3 rounded-lg text-sm"
          >
            <option value="">Tất cả vòng đời</option>
            <option value="ACTIVE">Đang chạy</option>
            <option value="INACTIVE">Tạm dừng</option>
            <option value="EXPIRED">Hết hạn</option>
            <option value="UPCOMING">Sắp diễn ra</option>
            <option value="EXHAUSTED">Hết lượt</option>
          </select>
          <select
            value={discountTypeFilter}
            onChange={(e) => {
              setDiscountTypeFilter(e.target.value);
              setPage(1);
            }}
            className="px-3 py-2 border border-gray-3 rounded-lg text-sm"
          >
            <option value="">Tất cả loại giảm</option>
            <option value="PERCENT">Phần trăm</option>
            <option value="FIXED">Cố định</option>
          </select>
          {selected.length > 0 && (
            <div className="flex gap-2 ml-auto">
              <button
                type="button"
                onClick={() => void bulkSetActive(true)}
                className="px-3 py-1.5 text-xs font-medium bg-green-light-6 text-green rounded-lg"
              >
                Kích hoạt ({selected.length})
              </button>
              <button
                type="button"
                onClick={() => void bulkSetActive(false)}
                className="px-3 py-1.5 text-xs font-medium bg-yellow-light-2 text-yellow-dark-2 rounded-lg"
              >
                Tạm dừng ({selected.length})
              </button>
            </div>
          )}
        </div>

        <div className="overflow-x-auto">
          {loading ? (
            <p className="px-6 py-8 text-sm text-[#8D93A5]">Đang tải...</p>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="bg-[#F7F9FC]">
                  <th className="px-4 py-3 w-10">
                    <input
                      type="checkbox"
                      checked={coupons.length > 0 && selected.length === coupons.length}
                      onChange={toggleSelectAll}
                    />
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-bold text-[#8D93A5] uppercase">Mã</th>
                  <th className="text-left px-4 py-3 text-xs font-bold text-[#8D93A5] uppercase">Giảm</th>
                  <th className="text-left px-4 py-3 text-xs font-bold text-[#8D93A5] uppercase">Phạm vi</th>
                  <th className="text-left px-4 py-3 text-xs font-bold text-[#8D93A5] uppercase">Lượt dùng</th>
                  <th className="text-left px-4 py-3 text-xs font-bold text-[#8D93A5] uppercase">Hiệu lực</th>
                  <th className="text-left px-4 py-3 text-xs font-bold text-[#8D93A5] uppercase">Trạng thái</th>
                  <th className="text-center px-4 py-3 text-xs font-bold text-[#8D93A5] uppercase">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-3/50">
                {coupons.map((coupon) => {
                  const lc = resolveLifecycle(coupon);
                  const style = lifecycleStyles[lc] ?? lifecycleStyles.INACTIVE;
                  return (
                    <tr key={coupon.id} className="hover:bg-[#F7F9FC]/50">
                      <td className="px-4 py-4">
                        <input
                          type="checkbox"
                          checked={selected.includes(coupon.id)}
                          onChange={() => toggleSelect(coupon.id)}
                        />
                      </td>
                      <td className="px-4 py-4">
                        <span className="inline-block px-3 py-1 rounded-md text-sm font-bold bg-[#3C50E0]/8 text-[#3C50E0]">
                          {coupon.code}
                        </span>
                        {coupon.name && (
                          <p className="text-xs text-[#8D93A5] mt-1">{coupon.name}</p>
                        )}
                      </td>
                      <td className="px-4 py-4 text-sm font-semibold">{formatDiscount(coupon)}</td>
                      <td className="px-4 py-4 text-xs text-[#6C6F93]">
                        {coupon.scopeType ?? "ALL"}
                        {coupon.firstOrderOnly && (
                          <span className="block text-[#3C50E0]">Đơn đầu tiên</span>
                        )}
                        {coupon.perUserLimit != null && (
                          <span className="block">{coupon.perUserLimit} lần/user</span>
                        )}
                      </td>
                      <td className="px-4 py-4 text-sm text-[#6C6F93]">
                        {coupon.usedCount ?? 0}
                        {coupon.usageLimit != null ? ` / ${coupon.usageLimit}` : " / ∞"}
                      </td>
                      <td className="px-4 py-4 text-xs text-[#6C6F93]">
                        {coupon.dateEnd ? formatDateTime(coupon.dateEnd).split(",")[0] : "—"}
                      </td>
                      <td className="px-4 py-4">
                        <button
                          type="button"
                          onClick={() => void toggleCoupon(coupon.id)}
                          className={`px-3 py-1 rounded-full text-xs font-medium ${style}`}
                        >
                          {lifecycleLabels[lc] ?? lc}
                        </button>
                      </td>
                      <td className="px-4 py-4 text-center">
                        <div className="flex justify-center gap-1 flex-wrap">
                          <button
                            type="button"
                            onClick={() => void openEditModal(coupon.id)}
                            className="px-2 py-1 text-xs text-[#3C50E0] hover:underline"
                          >
                            Sửa
                          </button>
                          <button
                            type="button"
                            onClick={() => void openUsage(coupon)}
                            className="px-2 py-1 text-xs text-[#6C6F93] hover:underline"
                          >
                            Lịch sử
                          </button>
                          <button
                            type="button"
                            onClick={() => void deleteCoupon(coupon.id)}
                            className="px-2 py-1 text-xs text-red hover:underline"
                          >
                            Xóa
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
            label="mã giảm giá"
          />
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-dark/40" onClick={() => setShowModal(false)} />
          <div className="relative bg-white rounded-2xl shadow-3 w-full max-w-[640px] max-h-[90vh] overflow-y-auto p-6 space-y-4">
            <h3 className="text-lg font-bold text-dark">
              {editId ? "Chỉnh sửa mã giảm giá" : "Tạo mã giảm giá mới"}
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <input
                type="text"
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                placeholder="Mã code *"
                disabled={!!editId}
                className="w-full px-4 py-2.5 border border-gray-3 rounded-lg text-sm uppercase sm:col-span-2"
              />
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Tên chương trình"
                className="w-full px-4 py-2.5 border border-gray-3 rounded-lg text-sm"
              />
              <select
                value={formData.scopeType}
                onChange={(e) =>
                  setFormData({ ...formData, scopeType: e.target.value as CouponScopeType })
                }
                className="w-full px-4 py-2.5 border border-gray-3 rounded-lg text-sm"
              >
                <option value="ALL">Toàn bộ giỏ hàng</option>
                <option value="PRODUCTS">Theo sản phẩm</option>
                <option value="PRODUCT_TYPES">Theo loại SP</option>
              </select>
            </div>

            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Mô tả"
              rows={2}
              className="w-full px-4 py-2.5 border border-gray-3 rounded-lg text-sm"
            />

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, type: "percent" })}
                className={`flex-1 py-2.5 rounded-lg text-sm border ${formData.type === "percent" ? "bg-[#3C50E0] text-white" : ""}`}
              >
                Giảm %
              </button>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, type: "fixed" })}
                className={`flex-1 py-2.5 rounded-lg text-sm border ${formData.type === "fixed" ? "bg-[#3C50E0] text-white" : ""}`}
              >
                Giảm VND
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <input
                type="number"
                value={formData.value}
                onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                placeholder="Giá trị giảm *"
                className="px-4 py-2.5 border border-gray-3 rounded-lg text-sm"
              />
              <input
                type="number"
                value={formData.minOrder}
                onChange={(e) => setFormData({ ...formData, minOrder: e.target.value })}
                placeholder="Đơn tối thiểu (VNĐ)"
                className="px-4 py-2.5 border border-gray-3 rounded-lg text-sm"
              />
              <input
                type="number"
                value={formData.maxDiscount}
                onChange={(e) => setFormData({ ...formData, maxDiscount: e.target.value })}
                placeholder="Giảm tối đa (VNĐ)"
                className="px-4 py-2.5 border border-gray-3 rounded-lg text-sm"
              />
              <input
                type="number"
                value={formData.limit}
                onChange={(e) => setFormData({ ...formData, limit: e.target.value })}
                placeholder="Giới hạn tổng lượt"
                className="px-4 py-2.5 border border-gray-3 rounded-lg text-sm"
              />
              <input
                type="number"
                value={formData.perUserLimit}
                onChange={(e) => setFormData({ ...formData, perUserLimit: e.target.value })}
                placeholder="Giới hạn / user"
                className="px-4 py-2.5 border border-gray-3 rounded-lg text-sm"
              />
              <label className="flex items-center gap-2 text-sm px-2">
                <input
                  type="checkbox"
                  checked={formData.firstOrderOnly}
                  onChange={(e) =>
                    setFormData({ ...formData, firstOrderOnly: e.target.checked })
                  }
                />
                Chỉ đơn hàng đầu tiên
              </label>
            </div>

            {formData.scopeType === "PRODUCTS" && (
              <input
                type="text"
                value={formData.productIds}
                onChange={(e) => setFormData({ ...formData, productIds: e.target.value })}
                placeholder="ID sản phẩm (cách nhau bởi dấu phẩy)"
                className="w-full px-4 py-2.5 border border-gray-3 rounded-lg text-sm"
              />
            )}
            {formData.scopeType === "PRODUCT_TYPES" && (
              <input
                type="text"
                value={formData.productTypeIds}
                onChange={(e) => setFormData({ ...formData, productTypeIds: e.target.value })}
                placeholder="ID loại sản phẩm (cách nhau bởi dấu phẩy)"
                className="w-full px-4 py-2.5 border border-gray-3 rounded-lg text-sm"
              />
            )}

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-[#8D93A5]">Bắt đầu</label>
                <input
                  type="datetime-local"
                  value={formData.dateStart}
                  onChange={(e) => setFormData({ ...formData, dateStart: e.target.value })}
                  className="w-full mt-1 px-3 py-2 border border-gray-3 rounded-lg text-sm"
                />
              </div>
              <div>
                <label className="text-xs text-[#8D93A5]">Kết thúc</label>
                <input
                  type="datetime-local"
                  value={formData.dateEnd}
                  onChange={(e) => setFormData({ ...formData, dateEnd: e.target.value })}
                  className="w-full mt-1 px-3 py-2 border border-gray-3 rounded-lg text-sm"
                />
              </div>
            </div>

            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={formData.isActive}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
              />
              Kích hoạt ngay
            </label>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="px-4 py-2 text-sm text-[#6C6F93]"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={() => void handleSave()}
                className="px-4 py-2 text-sm font-semibold text-white bg-[#3C50E0] rounded-lg"
              >
                Lưu
              </button>
            </div>
          </div>
        </div>
      )}

      {showUsageModal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-dark/40" onClick={() => setShowUsageModal(false)} />
          <div className="relative bg-white rounded-2xl shadow-3 w-full max-w-[720px] max-h-[80vh] overflow-y-auto p-6">
            <h3 className="text-lg font-bold mb-4">Lịch sử dùng mã {usageCouponCode}</h3>
            {usageOrders.length === 0 ? (
              <p className="text-sm text-[#8D93A5]">Chưa có đơn hàng nào dùng mã này.</p>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs text-[#8D93A5] border-b">
                    <th className="py-2">Mã đơn</th>
                    <th className="py-2">Khách</th>
                    <th className="py-2">Giảm</th>
                    <th className="py-2">Ngày</th>
                  </tr>
                </thead>
                <tbody>
                  {usageOrders.map((o) => (
                    <tr key={o.orderId} className="border-b border-gray-3/30">
                      <td className="py-2">{o.orderCode}</td>
                      <td className="py-2">{o.customerName ?? o.customerUsername ?? "—"}</td>
                      <td className="py-2">{formatVnd(Number(o.discountAmount ?? 0))}</td>
                      <td className="py-2">
                        {o.orderDate ? formatDateTime(o.orderDate) : "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {showValidateModal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-dark/40"
            onClick={() => setShowValidateModal(false)}
          />
          <div className="relative bg-white rounded-2xl shadow-3 w-full max-w-[420px] p-6 space-y-3">
            <h3 className="text-lg font-bold">Kiểm tra mã (admin)</h3>
            <input
              type="text"
              value={validateCode}
              onChange={(e) => setValidateCode(e.target.value)}
              placeholder="Mã coupon"
              className="w-full px-4 py-2.5 border border-gray-3 rounded-lg text-sm uppercase"
            />
            <input
              type="number"
              value={validateSubtotal}
              onChange={(e) => setValidateSubtotal(e.target.value)}
              placeholder="Tạm tính giả định (VNĐ)"
              className="w-full px-4 py-2.5 border border-gray-3 rounded-lg text-sm"
            />
            {validateResult && (
              <p className="text-sm p-3 rounded-lg bg-[#F7F9FC] text-dark">{validateResult}</p>
            )}
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowValidateModal(false)}
                className="px-4 py-2 text-sm text-[#6C6F93]"
              >
                Đóng
              </button>
              <button
                type="button"
                onClick={() => void runValidate()}
                className="px-4 py-2 text-sm font-semibold text-white bg-[#3C50E0] rounded-lg"
              >
                Kiểm tra
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
