"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useProducts, type AdminProduct, type ProductStatus } from "@/components/Admin/Products/productsStore";
import { adminProductApi, type AdminProductDetail } from "@/utils/adminApi";
import { resolveBackendImageUrl } from "@/utils/productMapper";

type Mode = "create" | "edit";

type FormState = {
  name: string;
  sku: string;
  category: string;
  manufacturer: string;
  description: string;
  price: string;
  stock: string;
  status: ProductStatus;
  featured: boolean;
  imageUrl: string;
};

function formatPriceInput(n: number): string {
  if (!n) return "";
  return n.toLocaleString("vi-VN");
}

function statusFromDetail(d: AdminProductDetail): ProductStatus {
  const active = d.status === "ACTIVE";
  const stock =
    d.variants?.reduce((sum, v) => sum + (v.stockQuantity ?? 0), 0) ??
    d.totalQuantity ??
    0;
  if (stock === 0) return "out_of_stock";
  return active ? "selling" : "stopped";
}

function detailToFormState(d: AdminProductDetail): FormState {
  const defaultVariant =
    d.variants?.find((v) => v.isActive) ?? d.variants?.[0];
  const stock =
    d.variants?.reduce((sum, v) => sum + (v.stockQuantity ?? 0), 0) ??
    d.totalQuantity ??
    0;
  const imageFromList = resolveBackendImageUrl(d.imageUrl);
  const imageFromGallery = resolveBackendImageUrl(d.images?.[0]?.linkImage);

  return {
    name: d.name ?? "",
    sku: defaultVariant?.skuCode ?? `SP-${d.id}`,
    category: d.productType?.name ?? "",
    manufacturer: d.producer?.name ?? "",
    description: d.description ?? "",
    price: formatPriceInput(defaultVariant?.price ?? d.basePrice ?? 0),
    stock: stock > 0 ? String(stock) : "",
    status: statusFromDetail(d),
    featured: !!d.isFeatured,
    imageUrl: imageFromList ?? imageFromGallery ?? "",
  };
}

function toFormState(p?: AdminProduct): FormState {
  return {
    name: p?.name ?? "",
    sku: p?.sku ?? "",
    category: p?.category ?? "",
    manufacturer: p?.manufacturer ?? "",
    description: p?.description ?? "",
    price: p ? formatPriceInput(p.price) : "",
    stock: p ? String(p.stock) : "",
    status: p?.status ?? "selling",
    featured: p?.featured ?? false,
    imageUrl: p?.imageUrl ?? "",
  };
}

function normalizeNumberInput(v: string) {
  // allow user to type "28.990.000" or "28990000"
  const onlyDigits = v.replace(/[^\d]/g, "");
  return onlyDigits;
}

export default function ProductForm({
  mode,
  productId,
}: {
  mode: Mode;
  productId?: string;
}) {
  const router = useRouter();
  const { createProduct, updateProduct, categories, manufacturers } = useProducts();

  const [form, setForm] = useState<FormState>(() => toFormState());
  const [loadingProduct, setLoadingProduct] = useState(mode === "edit");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const title = mode === "create" ? "Thêm Sản Phẩm Mới" : "Chỉnh sửa sản phẩm";

  useEffect(() => {
    if (mode !== "edit" || !productId) return;

    let cancelled = false;
    setLoadingProduct(true);
    setError(null);

    void adminProductApi
      .get(Number(productId))
      .then((res) => {
        if (cancelled) return;
        if (res.data.success && res.data.data) {
          setForm(detailToFormState(res.data.data));
        } else {
          setError(res.data.message || "Không tải được thông tin sản phẩm");
        }
      })
      .catch(() => {
        if (!cancelled) setError("Không tải được thông tin sản phẩm");
      })
      .finally(() => {
        if (!cancelled) setLoadingProduct(false);
      });

    return () => {
      cancelled = true;
    };
  }, [mode, productId]);

  const onSubmit = async (publish: boolean) => {
    setError(null);
    setSaving(true);
    try {
      if (!form.name.trim()) throw new Error("Vui lòng nhập tên sản phẩm.");
      if (mode === "edit" && !form.sku.trim()) throw new Error("Vui lòng nhập SKU.");
      if (!form.category.trim()) throw new Error("Vui lòng chọn danh mục.");
      if (!form.manufacturer.trim()) throw new Error("Vui lòng chọn thương hiệu.");

      const priceDigits = normalizeNumberInput(form.price);
      const stockDigits = normalizeNumberInput(form.stock);
      const price = Number(priceDigits || "0");
      const stock = Number(stockDigits || "0");
      if (!Number.isFinite(price) || price <= 0) throw new Error("Giá bán phải lớn hơn 0.");
      if (!Number.isFinite(stock) || stock < 0) throw new Error("Tồn kho không hợp lệ.");

      const status: ProductStatus =
        stock === 0 ? "out_of_stock" : form.status;

      const payload = {
        name: form.name.trim(),
        sku: form.sku.trim(),
        category: form.category.trim(),
        manufacturer: form.manufacturer.trim(),
        description: form.description.trim(),
        price,
        stock,
        status,
        featured: form.featured,
        imageUrl: form.imageUrl.trim() || undefined,
      };

      if (mode === "create") {
        const id = await createProduct(payload);
        router.push(publish ? "/admin/products" : `/admin/products/${id}/edit`);
      } else if (mode === "edit" && productId) {
        await updateProduct(productId, payload);
        if (publish) router.push("/admin/products");
      }
    } catch (e: any) {
      setError(e?.message ?? "Có lỗi xảy ra.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className={`space-y-6 ${loadingProduct ? "opacity-60 pointer-events-none" : ""}`}>
      {/* Breadcrumb + Title */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs text-[#8D93A5]">
            <Link href="/admin/products" className="hover:text-[#3C50E0] transition-colors">
              Sản phẩm
            </Link>
            {"  /  "}
            <span className="text-[#6C6F93]">{mode === "create" ? "Thêm sản phẩm mới" : "Chỉnh sửa"}</span>
          </p>
          <h1 className="text-2xl font-bold text-dark mt-2 flex items-center gap-3">
            {title}
            {loadingProduct && (
              <span className="inline-block h-5 w-5 animate-spin rounded-full border-2 border-[#3C50E0] border-t-transparent" />
            )}
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/admin/products"
            className="px-4 py-2.5 rounded-lg border border-gray-3 bg-white text-sm font-semibold text-[#6C6F93] hover:text-dark hover:border-[#3C50E0] transition-colors"
          >
            Hủy
          </Link>
          <button
            type="button"
            disabled={saving}
            onClick={() => onSubmit(false)}
            className="px-4 py-2.5 rounded-lg border border-gray-3 bg-white text-sm font-semibold text-dark hover:border-[#3C50E0] hover:text-[#3C50E0] transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
          >
            Lưu nháp
          </button>
          <button
            type="button"
            disabled={saving}
            onClick={() => onSubmit(true)}
            className="px-5 py-2.5 rounded-lg bg-[#3C50E0] text-white text-sm font-semibold hover:bg-[#1C3FB7] shadow-lg shadow-[#3C50E0]/25 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
          >
            Lưu &amp; Xuất bản
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-light-6 border border-red-light-4 text-red rounded-lg px-4 py-3 text-sm">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        {/* Left column */}
        <div className="xl:col-span-8 space-y-6">
          {/* Basic info */}
          <div className="bg-white rounded-xl border border-gray-3/50 p-5">
            <div className="flex items-center gap-2 mb-4">
              <span className="w-9 h-9 rounded-lg bg-[#3C50E0]/10 text-[#3C50E0] flex items-center justify-center">
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M6 6H12V12H6V6Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M7.5 6V5.25C7.5 4.83579 7.83579 4.5 8.25 4.5H9.75C10.1642 4.5 10.5 4.83579 10.5 5.25V6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </span>
              <h3 className="text-base font-bold text-dark">Thông tin cơ bản</h3>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-[#6C6F93] mb-1.5">Tên sản phẩm*</label>
                <input
                  value={form.name}
                  onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                  placeholder="Nhập tên sản phẩm..."
                  className="w-full px-3 py-2.5 bg-[#F7F9FC] border border-gray-3 rounded-lg text-sm text-dark placeholder:text-[#8D93A5] focus:outline-none focus:border-[#3C50E0] focus:ring-1 focus:ring-[#3C50E0]/20 transition-all"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-[#6C6F93] mb-1.5">Danh mục*</label>
                  <select
                    value={form.category}
                    onChange={(e) => setForm((p) => ({ ...p, category: e.target.value }))}
                    className="w-full px-3 py-2.5 bg-[#F7F9FC] border border-gray-3 rounded-lg text-sm text-dark focus:outline-none focus:border-[#3C50E0] focus:ring-1 focus:ring-[#3C50E0]/20 transition-all appearance-none cursor-pointer"
                  >
                    <option value="">Chọn danh mục</option>
                    {categories.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                    <option value="Phụ kiện">Phụ kiện</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#6C6F93] mb-1.5">Thương hiệu*</label>
                  <select
                    value={form.manufacturer}
                    onChange={(e) => setForm((p) => ({ ...p, manufacturer: e.target.value }))}
                    className="w-full px-3 py-2.5 bg-[#F7F9FC] border border-gray-3 rounded-lg text-sm text-dark focus:outline-none focus:border-[#3C50E0] focus:ring-1 focus:ring-[#3C50E0]/20 transition-all appearance-none cursor-pointer"
                  >
                    <option value="">Chọn thương hiệu</option>
                    {manufacturers.map((m) => (
                      <option key={m.value} value={m.value}>
                        {m.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#6C6F93] mb-1.5">SKU*</label>
                <input
                  value={form.sku}
                  onChange={(e) => setForm((p) => ({ ...p, sku: e.target.value }))}
                  placeholder="VD: IP15-S-256"
                  className="w-full px-3 py-2.5 bg-[#F7F9FC] border border-gray-3 rounded-lg text-sm text-dark placeholder:text-[#8D93A5] focus:outline-none focus:border-[#3C50E0] focus:ring-1 focus:ring-[#3C50E0]/20 transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#6C6F93] mb-1.5">Mô tả sản phẩm</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
                  placeholder="Nhập mô tả chi tiết sản phẩm tại đây..."
                  rows={6}
                  className="w-full px-3 py-2.5 bg-[#F7F9FC] border border-gray-3 rounded-lg text-sm text-dark placeholder:text-[#8D93A5] focus:outline-none focus:border-[#3C50E0] focus:ring-1 focus:ring-[#3C50E0]/20 transition-all resize-none"
                />
              </div>
            </div>
          </div>

          {/* Price & stock */}
          <div className="bg-white rounded-xl border border-gray-3/50 p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="w-9 h-9 rounded-lg bg-[#3C50E0]/10 text-[#3C50E0] flex items-center justify-center">
                  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M9 2.5V15.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M12 5.5H7.5C6.39543 5.5 5.5 6.39543 5.5 7.5C5.5 8.60457 6.39543 9.5 7.5 9.5H10.5C11.6046 9.5 12.5 10.3954 12.5 11.5C12.5 12.6046 11.6046 13.5 10.5 13.5H6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </span>
                <h3 className="text-base font-bold text-dark">Giá &amp; Kho</h3>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-sm font-medium text-dark whitespace-nowrap">Quản lý kho</span>
                <button
                  type="button"
                  role="switch"
                  aria-checked={true}
                  className="relative w-11 h-6 rounded-full bg-[#3C50E0]"
                >
                  <span className="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-sm translate-x-5" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-[#6C6F93] mb-1.5">Giá bán*</label>
                <input
                  value={form.price}
                  onChange={(e) => setForm((p) => ({ ...p, price: e.target.value }))}
                  placeholder="VD: 28.990.000"
                  inputMode="numeric"
                  className="w-full px-3 py-2.5 bg-[#F7F9FC] border border-gray-3 rounded-lg text-sm text-dark placeholder:text-[#8D93A5] focus:outline-none focus:border-[#3C50E0] focus:ring-1 focus:ring-[#3C50E0]/20 transition-all"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-[#6C6F93] mb-1.5">Tồn kho*</label>
                <input
                  value={form.stock}
                  onChange={(e) => setForm((p) => ({ ...p, stock: e.target.value }))}
                  placeholder="VD: 10"
                  inputMode="numeric"
                  className="w-full px-3 py-2.5 bg-[#F7F9FC] border border-gray-3 rounded-lg text-sm text-dark placeholder:text-[#8D93A5] focus:outline-none focus:border-[#3C50E0] focus:ring-1 focus:ring-[#3C50E0]/20 transition-all"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-[#6C6F93] mb-1.5">Trạng thái</label>
                <select
                  value={form.status}
                  onChange={(e) => setForm((p) => ({ ...p, status: e.target.value as ProductStatus }))}
                  className="w-full px-3 py-2.5 bg-[#F7F9FC] border border-gray-3 rounded-lg text-sm text-dark focus:outline-none focus:border-[#3C50E0] focus:ring-1 focus:ring-[#3C50E0]/20 transition-all appearance-none cursor-pointer"
                >
                  <option value="selling">Đang bán</option>
                  <option value="stopped">Ngừng bán</option>
                  <option value="out_of_stock">Hết hàng</option>
                </select>
              </div>

              <div className="flex items-center justify-between gap-4 pt-6">
                <div>
                  <p className="text-sm font-medium text-dark">Nổi bật</p>
                  <p className="text-xs text-[#8D93A5]">Hiển thị ưu tiên ở danh sách</p>
                </div>
                <button
                  type="button"
                  role="switch"
                  aria-checked={form.featured}
                  onClick={() => setForm((p) => ({ ...p, featured: !p.featured }))}
                  className={`relative w-11 h-6 rounded-full transition-colors duration-200 ${
                    form.featured ? "bg-[#3C50E0]" : "bg-gray-3"
                  }`}
                >
                  <span
                    className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform duration-200 ${
                      form.featured ? "translate-x-5" : "translate-x-0"
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right column */}
        <div className="xl:col-span-4 space-y-6">
          <div className="bg-white rounded-xl border border-gray-3/50 p-5">
            <div className="flex items-center gap-2 mb-4">
              <span className="w-9 h-9 rounded-lg bg-[#3C50E0]/10 text-[#3C50E0] flex items-center justify-center">
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M3.5 5.5H14.5V12.5H3.5V5.5Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M6.25 9.25L7.75 10.75L11.75 6.75" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </span>
              <h3 className="text-base font-bold text-dark">Hình ảnh</h3>
            </div>

            <label className="block text-xs font-medium text-[#6C6F93] mb-1.5">URL ảnh sản phẩm</label>
            <input
              value={form.imageUrl}
              onChange={(e) => setForm((p) => ({ ...p, imageUrl: e.target.value }))}
              placeholder="Dán link ảnh (https://...)"
              className="w-full px-3 py-2.5 bg-[#F7F9FC] border border-gray-3 rounded-lg text-sm text-dark placeholder:text-[#8D93A5] focus:outline-none focus:border-[#3C50E0] focus:ring-1 focus:ring-[#3C50E0]/20 transition-all"
            />

            <div className="mt-4">
              <div className="w-full aspect-[4/3] rounded-xl border border-gray-3 bg-[#F7F9FC] overflow-hidden flex items-center justify-center">
                {form.imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={form.imageUrl} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <div className="text-center px-6">
                    <p className="text-sm font-semibold text-dark">Kéo thả ảnh hoặc tải lên</p>
                    <p className="text-xs text-[#8D93A5] mt-1">Hiện demo dùng URL ảnh</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-3/50 p-5">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-dark">Tối ưu SEO</h3>
                <p className="text-xs text-[#8D93A5] mt-1">
                  Demo hiển thị — sẽ nối backend sau.
                </p>
              </div>
              <button
                type="button"
                className="text-sm font-semibold text-[#3C50E0] hover:underline"
                onClick={() => alert("Tính năng demo — sẽ bổ sung sau.")}
              >
                Chỉnh sửa
              </button>
            </div>
            <div className="mt-4 p-3 rounded-lg border border-gray-3 bg-[#F7F9FC]">
              <p className="text-xs text-[#6C6F93] font-medium">{form.name || "Tên sản phẩm"}</p>
              <p className="text-xs text-[#8D93A5] mt-1">
                {form.description ? form.description.slice(0, 120) : "Mô tả SEO sẽ hiển thị ở đây..."}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

