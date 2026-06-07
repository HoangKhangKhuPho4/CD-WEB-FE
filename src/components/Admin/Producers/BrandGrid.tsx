"use client";

import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import AdminTablePagination from "@/components/Admin/shared/AdminTablePagination";
import BrandFormModal, { type BrandFormData } from "@/components/Admin/Producers/BrandFormModal";
import PrimaryButton from "@/components/Admin/shared/PrimaryButton";
import {
  adminProducerApi,
  type ProducerItem,
  type ProducerProductSummary,
  type ProducerStats,
} from "@/utils/adminApi";

const PAGE_SIZE_OPTIONS = [8, 12, 16, 24];

const gradients = [
  "from-gray-700 to-gray-900",
  "from-[#3C50E0] to-[#1C3FB7]",
  "from-[#1C274C] to-[#495270]",
  "from-[#F27430] to-[#FB923C]",
  "from-[#9333EA] to-[#A855F7]",
];

function producerToForm(p: ProducerItem): BrandFormData {
  return {
    name: p.name,
    code: p.code,
    country: p.country ?? "",
    website: p.website ?? "",
    description: p.description ?? "",
    logoUrl: p.logoUrl ?? "",
    isActive: p.isActive !== false,
  };
}

function extractError(err: unknown, fallback: string) {
  return (
    (err as { response?: { data?: { message?: string } } })?.response?.data?.message || fallback
  );
}

export default function BrandGrid() {
  const [producers, setProducers] = useState<ProducerItem[]>([]);
  const [stats, setStats] = useState<ProducerStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(12);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);
  const [keyword, setKeyword] = useState("");
  const [activeFilter, setActiveFilter] = useState<"" | "true" | "false">("");
  const [hasProductsFilter, setHasProductsFilter] = useState<"" | "true" | "false">("");
  const [selected, setSelected] = useState<number[]>([]);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formInitial, setFormInitial] = useState<BrandFormData | undefined>();
  const [codeHint, setCodeHint] = useState("");

  const [productsOpen, setProductsOpen] = useState(false);
  const [productsBrand, setProductsBrand] = useState("");
  const [products, setProducts] = useState<ProducerProductSummary[]>([]);

  const loadStats = useCallback(async () => {
    try {
      const res = await adminProducerApi.stats();
      if (res.data.success) setStats(res.data.data);
    } catch {
      /* optional */
    }
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminProducerApi.list({
        page: page - 1,
        size: pageSize,
        keyword: keyword.trim() || undefined,
        isActive: activeFilter === "" ? undefined : activeFilter === "true",
        hasProducts: hasProductsFilter === "" ? undefined : hasProductsFilter === "true",
        sortBy: "createdAt",
        sortDir: "desc",
      });
      if (res.data.success) {
        const data = res.data.data;
        setProducers(data.content);
        setTotalPages(Math.max(1, data.totalPages));
        setTotalElements(data.totalElements);
      }
    } catch {
      toast.error("Không tải được thương hiệu");
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, keyword, activeFilter, hasProductsFilter]);

  useEffect(() => {
    void loadStats();
  }, [loadStats]);

  useEffect(() => {
    void load();
  }, [load]);

  const openCreate = () => {
    setEditingId(null);
    setFormInitial(undefined);
    setCodeHint("");
    setModalOpen(true);
  };

  const openEdit = async (id: number) => {
    try {
      const res = await adminProducerApi.get(id);
      if (res.data.success) {
        setEditingId(id);
        setFormInitial(producerToForm(res.data.data));
        setCodeHint("");
        setModalOpen(true);
      }
    } catch {
      toast.error("Không tải được chi tiết thương hiệu");
    }
  };

  const handleSave = async (data: BrandFormData) => {
    if (!data.name.trim() || !data.code.trim()) {
      toast.error("Nhập tên và mã thương hiệu");
      return;
    }
    const payload = {
      name: data.name.trim(),
      code: data.code.trim().toUpperCase(),
      country: data.country.trim() || undefined,
      website: data.website.trim() || undefined,
      description: data.description.trim() || undefined,
      logoUrl: data.logoUrl.trim() || undefined,
      isActive: data.isActive,
    };
    try {
      if (!editingId) {
        const v = await adminProducerApi.validateCode({ code: payload.code });
        if (v.data.success && !v.data.data.available) {
          toast.error(v.data.data.message || "Mã thương hiệu đã tồn tại");
          return;
        }
      }
      if (editingId) {
        await adminProducerApi.update(editingId, payload);
        toast.success("Đã cập nhật thương hiệu");
      } else {
        await adminProducerApi.create(payload);
        toast.success("Đã thêm thương hiệu");
      }
      setModalOpen(false);
      await Promise.all([load(), loadStats()]);
    } catch (err) {
      toast.error(extractError(err, "Lưu thương hiệu thất bại"));
    }
  };

  const checkCode = async (code: string) => {
    if (!code.trim()) return;
    try {
      const res = await adminProducerApi.validateCode({
        code: code.trim(),
        excludeId: editingId ?? undefined,
      });
      if (res.data.success) {
        setCodeHint(res.data.data.message ?? "");
      }
    } catch {
      setCodeHint("");
    }
  };

  const toggleBrand = async (id: number) => {
    try {
      await adminProducerApi.toggle(id);
      await Promise.all([load(), loadStats()]);
    } catch {
      toast.error("Không đổi được trạng thái");
    }
  };

  const deleteBrand = async (p: ProducerItem) => {
    const hasProducts = (p.productCount ?? 0) > 0;
    const msg = hasProducts
      ? `Thương hiệu "${p.name}" còn ${p.productCount} sản phẩm. Xóa sẽ chuyển sang trạng thái inactive. Tiếp tục?`
      : `Xóa vĩnh viễn thương hiệu "${p.name}"?`;
    if (!confirm(msg)) return;
    try {
      await adminProducerApi.remove(p.id);
      toast.success(hasProducts ? "Đã vô hiệu hóa thương hiệu" : "Đã xóa thương hiệu");
      await Promise.all([load(), loadStats()]);
    } catch (err) {
      toast.error(extractError(err, "Xóa thất bại"));
    }
  };

  const bulkSetActive = async (isActive: boolean) => {
    if (!selected.length) {
      toast.error("Chọn ít nhất một thương hiệu");
      return;
    }
    try {
      await adminProducerApi.bulkStatus(selected, isActive);
      toast.success(isActive ? "Đã kích hoạt hàng loạt" : "Đã tạm dừng hàng loạt");
      setSelected([]);
      await Promise.all([load(), loadStats()]);
    } catch {
      toast.error("Cập nhật hàng loạt thất bại");
    }
  };

  const openProducts = async (p: ProducerItem) => {
    try {
      const res = await adminProducerApi.getProducts(p.id, { page: 0, size: 20 });
      if (res.data.success) {
        setProducts(res.data.data.content);
        setProductsBrand(p.name);
        setProductsOpen(true);
      }
    } catch {
      toast.error("Không tải được danh sách sản phẩm");
    }
  };

  const toggleSelect = (id: number) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  return (
    <div className="space-y-6">
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {[
            { label: "Tổng", value: stats.total },
            { label: "Đang hoạt động", value: stats.active },
            { label: "Tạm dừng", value: stats.inactive },
            { label: "Có sản phẩm", value: stats.withProducts },
            { label: "Chưa có SP", value: stats.withoutProducts },
            { label: "SP liên kết", value: stats.totalLinkedProducts },
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

      <div className="bg-white rounded-xl border border-gray-3/50">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between px-6 py-5 border-b border-gray-3/50 gap-3">
          <div>
            <h2 className="text-xl font-bold text-dark">Danh sách thương hiệu</h2>
            <p className="text-sm text-[#6C6F93] mt-0.5">
              Quản lý nhà sản xuất, logo, mã code và số sản phẩm liên kết.
            </p>
          </div>
          <PrimaryButton onClick={openCreate}>
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path d="M9 3.75V14.25" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
              <path d="M3.75 9H14.25" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
            Thêm thương hiệu
          </PrimaryButton>
        </div>

        <div className="px-6 py-4 border-b border-gray-3/50 flex flex-wrap gap-3 items-center">
          <input
            type="text"
            placeholder="Tìm tên, mã..."
            value={keyword}
            onChange={(e) => {
              setKeyword(e.target.value);
              setPage(1);
            }}
            className="px-3 py-2 border border-gray-3 rounded-lg text-sm min-w-[180px]"
          />
          <select
            value={activeFilter}
            onChange={(e) => {
              setActiveFilter(e.target.value as "" | "true" | "false");
              setPage(1);
            }}
            className="px-3 py-2 border border-gray-3 rounded-lg text-sm"
          >
            <option value="">Tất cả trạng thái</option>
            <option value="true">Đang hoạt động</option>
            <option value="false">Tạm dừng</option>
          </select>
          <select
            value={hasProductsFilter}
            onChange={(e) => {
              setHasProductsFilter(e.target.value as "" | "true" | "false");
              setPage(1);
            }}
            className="px-3 py-2 border border-gray-3 rounded-lg text-sm"
          >
            <option value="">Tất cả SP</option>
            <option value="true">Đã có sản phẩm</option>
            <option value="false">Chưa có sản phẩm</option>
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

        {loading ? (
          <p className="px-6 py-10 text-sm text-[#8D93A5]">Đang tải thương hiệu...</p>
        ) : producers.length === 0 ? (
          <p className="px-6 py-10 text-sm text-[#8D93A5]">Chưa có thương hiệu nào.</p>
        ) : (
          <div className="p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {producers.map((p, index) => {
              const gradient = gradients[index % gradients.length];
              const enabled = p.isActive !== false;
              return (
                <div
                  key={p.id}
                  className="bg-[#F7F9FC]/40 rounded-xl border border-gray-3/50 p-5 hover:shadow-2 transition-all relative"
                >
                  <div className="absolute top-3 left-3">
                    <input
                      type="checkbox"
                      checked={selected.includes(p.id)}
                      onChange={() => toggleSelect(p.id)}
                    />
                  </div>

                  <div className="flex items-start justify-between mb-4 pl-6">
                    {p.logoUrl ? (
                      <div className="relative w-14 h-14 rounded-xl overflow-hidden bg-white border border-gray-3">
                        <Image src={p.logoUrl} alt={p.name} fill className="object-contain p-1" />
                      </div>
                    ) : (
                      <div
                        className={`w-14 h-14 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center text-white font-bold text-lg shadow-sm`}
                      >
                        {p.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <button
                      type="button"
                      role="switch"
                      aria-checked={enabled}
                      onClick={() => void toggleBrand(p.id)}
                      className={`relative w-11 h-6 rounded-full transition-colors ${
                        enabled ? "bg-[#3C50E0]" : "bg-gray-3"
                      }`}
                    >
                      <span
                        className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform ${
                          enabled ? "translate-x-5" : "translate-x-0"
                        }`}
                      />
                    </button>
                  </div>

                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <h3 className="text-lg font-bold text-dark">{p.name}</h3>
                    <span className="text-xs font-mono text-[#3C50E0] bg-[#3C50E0]/10 px-2 py-0.5 rounded">
                      {p.code}
                    </span>
                    {!enabled && (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-[#F3E8FF] text-[#9333EA]">
                        Inactive
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-[#8D93A5] mb-3">
                    {p.country || "—"}
                    {p.website ? ` · ${p.website.replace(/^https?:\/\//, "")}` : ""}
                  </p>

                  <div className="flex items-end justify-between pt-3 border-t border-gray-3/50">
                    <div>
                      <p className="text-[10px] font-bold text-[#8D93A5] uppercase">Sản phẩm</p>
                      <p className="text-2xl font-bold text-[#3C50E0]">
                        {p.productCount ?? 0}
                        {p.activeProductCount != null && (
                          <span className="text-xs text-[#8D93A5] font-normal ml-1">
                            ({p.activeProductCount} active)
                          </span>
                        )}
                      </p>
                    </div>
                    <div className="flex gap-1">
                      <button
                        type="button"
                        onClick={() => void openProducts(p)}
                        className="px-2 py-1 text-xs text-[#6C6F93] hover:text-[#3C50E0]"
                        title="Xem SP"
                      >
                        SP
                      </button>
                      <button
                        type="button"
                        onClick={() => void openEdit(p.id)}
                        className="px-2 py-1 text-xs text-[#3C50E0] hover:underline"
                      >
                        Sửa
                      </button>
                      <button
                        type="button"
                        onClick={() => void deleteBrand(p)}
                        className="px-2 py-1 text-xs text-red hover:underline"
                      >
                        Xóa
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
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
            label="thương hiệu"
          />
        </div>
      </div>

      <BrandFormModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={handleSave}
        initial={formInitial}
        isEdit={!!editingId}
        codeHint={codeHint}
        onCodeBlur={(code) => void checkCode(code)}
      />

      {productsOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-dark/40" onClick={() => setProductsOpen(false)} />
          <div className="relative bg-white rounded-2xl shadow-3 w-full max-w-[640px] max-h-[80vh] overflow-y-auto p-6">
            <h3 className="text-lg font-bold mb-4">Sản phẩm — {productsBrand}</h3>
            {products.length === 0 ? (
              <p className="text-sm text-[#8D93A5]">Chưa có sản phẩm thuộc thương hiệu này.</p>
            ) : (
              <ul className="space-y-2 text-sm">
                {products.map((pr) => (
                  <li
                    key={pr.id}
                    className="flex justify-between items-center py-2 border-b border-gray-3/30"
                  >
                    <span>{pr.name}</span>
                    <span className="text-[#8D93A5]">
                      {pr.isActive ? "Active" : "Inactive"}
                      {pr.basePrice != null &&
                        ` · ${Number(pr.basePrice).toLocaleString("vi-VN")}₫`}
                    </span>
                  </li>
                ))}
              </ul>
            )}
            <div className="flex justify-end mt-4">
              <button
                type="button"
                onClick={() => setProductsOpen(false)}
                className="px-4 py-2 text-sm text-[#6C6F93]"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
