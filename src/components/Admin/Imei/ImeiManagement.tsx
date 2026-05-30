"use client";

import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import Modal from "@/components/Admin/shared/Modal";
import PrimaryButton from "@/components/Admin/shared/PrimaryButton";
import AdminPagination from "@/components/Admin/shared/AdminPagination";
import {
  adminInventoryApi,
  adminWarrantyApi,
  type ProductItemRow,
  type VariantSearchHit,
} from "@/utils/adminApi";
import { formatDate } from "@/utils/adminFormat";

const statusMap: Record<string, { label: string; className: string }> = {
  AVAILABLE: { label: "Trong kho", className: "bg-green-light-6 text-green" },
  SOLD: { label: "Đã bán", className: "bg-[#EEF2FF] text-[#3C50E0]" },
  IN_REPAIR: { label: "Bảo hành", className: "bg-[#FEF3C7] text-yellow-dark-2" },
  DEFECTIVE: { label: "Lỗi", className: "bg-red-light-6 text-red" },
  RESERVED: { label: "Đã giữ", className: "bg-gray-3 text-[#6C6F93]" },
  RETURNED: { label: "Trả hàng", className: "bg-red-light-6 text-red" },
};

const DEVICE_STATUS_OPTIONS = [
  "AVAILABLE",
  "RESERVED",
  "SOLD",
  "IN_REPAIR",
  "DEFECTIVE",
  "RETURNED",
] as const;

const PER_PAGE = 15;

export default function ImeiManagement() {
  const [rows, setRows] = useState<ProductItemRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [importOpen, setImportOpen] = useState(false);
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);
  const [variantId, setVariantId] = useState<number | null>(null);
  const [variantLabel, setVariantLabel] = useState("");
  const [variantHits, setVariantHits] = useState<VariantSearchHit[]>([]);
  const [imeiText, setImeiText] = useState("");

  const changeDeviceStatus = async (row: ProductItemRow, status: string) => {
    const code = row.imei ?? row.serialNumber;
    if (!code) {
      toast.error("Thiết bị không có IMEI/Serial");
      return;
    }
    try {
      await adminWarrantyApi.updateDeviceStatus(code, status);
      toast.success("Đã cập nhật trạng thái thiết bị");
      void load();
    } catch {
      toast.error("Cập nhật trạng thái thất bại");
    }
  };

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminInventoryApi.listProductItems({
        keyword: q.trim() || undefined,
        page: page - 1,
        size: PER_PAGE,
      });
      if (res.data.success) {
        const data = res.data.data;
        setRows(data.content);
        setTotalPages(Math.max(1, data.totalPages));
        setTotalElements(data.totalElements);
      }
    } catch {
      toast.error("Không tải được danh sách IMEI");
    } finally {
      setLoading(false);
    }
  }, [q, page]);

  useEffect(() => {
    const t = setTimeout(() => void load(), 300);
    return () => clearTimeout(t);
  }, [load]);

  const searchVariant = async (keyword: string) => {
    setVariantLabel(keyword);
    if (keyword.length < 2) {
      setVariantHits([]);
      return;
    }
    try {
      const res = await adminInventoryApi.searchVariants(keyword);
      if (res.data.success) setVariantHits(res.data.data);
    } catch {
      setVariantHits([]);
    }
  };

  const submitImei = async () => {
    if (!variantId) {
      toast.error("Chọn biến thể sản phẩm");
      return;
    }
    const imeis = imeiText
      .split(/[\n,;]+/)
      .map((s) => s.trim())
      .filter(Boolean);
    if (!imeis.length) {
      toast.error("Nhập ít nhất một IMEI");
      return;
    }
    try {
      await adminInventoryApi.addImei({ variantId, imeis });
      toast.success(`Đã lưu ${imeis.length} IMEI`);
      setImportOpen(false);
      setImeiText("");
      setPage(1);
      await load();
    } catch {
      toast.error("Nhập IMEI thất bại");
    }
  };

  const onExcel = async (file: File) => {
    try {
      await adminInventoryApi.uploadImeiExcel(file);
      toast.success("Import Excel thành công");
      setPage(1);
      await load();
    } catch {
      toast.error("Import Excel thất bại");
    }
  };

  return (
    <>
      <div className="flex flex-col sm:flex-row gap-3">
        <input
          value={q}
          onChange={(e) => {
            setQ(e.target.value);
            setPage(1);
          }}
          placeholder="Tìm IMEI, sản phẩm, SKU..."
          className="flex-1 px-4 py-2.5 border border-gray-3 rounded-lg text-sm"
        />
        <label className="flex items-center gap-2 px-4 py-2.5 border border-gray-3 rounded-lg text-sm cursor-pointer hover:border-[#3C50E0]">
          <span>Excel</span>
          <input
            type="file"
            accept=".xlsx,.xls"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) void onExcel(f);
            }}
          />
        </label>
        <PrimaryButton onClick={() => setImportOpen(true)}>Nhập IMEI</PrimaryButton>
      </div>

      <div className="bg-white rounded-xl border border-gray-3/50 overflow-hidden">
        {loading ? (
          <p className="px-6 py-8 text-sm text-[#8D93A5]">Đang tải...</p>
        ) : (
          <table className="w-full min-w-[800px]">
            <thead>
              <tr className="bg-[#F7F9FC] border-b border-gray-3/50">
                <th className="text-left px-6 py-3 text-xs font-bold text-[#8D93A5] uppercase">IMEI / Serial</th>
                <th className="text-left px-4 py-3 text-xs font-bold text-[#8D93A5] uppercase">Sản phẩm</th>
                <th className="text-left px-4 py-3 text-xs font-bold text-[#8D93A5] uppercase">SKU</th>
                <th className="text-left px-4 py-3 text-xs font-bold text-[#8D93A5] uppercase">Ngày nhập</th>
                <th className="text-left px-4 py-3 text-xs font-bold text-[#8D93A5] uppercase">Trạng thái</th>
                <th className="text-left px-4 py-3 text-xs font-bold text-[#8D93A5] uppercase">Đổi TT</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-3/50">
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-sm text-[#8D93A5] text-center">
                    Không có IMEI phù hợp
                  </td>
                </tr>
              ) : (
                rows.map((row) => {
                  const stKey = String(row.status ?? "");
                  const st = statusMap[stKey] ?? { label: stKey, className: "bg-gray-3 text-[#6C6F93]" };
                  return (
                    <tr key={row.id} className="hover:bg-[#F7F9FC]/60">
                      <td className="px-6 py-4 font-mono text-sm text-[#3C50E0]">
                        {row.imei ?? row.serialNumber ?? "—"}
                      </td>
                      <td className="px-4 py-4 text-sm">
                        {row.variantName ? `${row.productName} (${row.variantName})` : row.productName}
                      </td>
                      <td className="px-4 py-4 text-sm text-[#6C6F93]">{row.skuCode ?? "—"}</td>
                      <td className="px-4 py-4 text-sm text-[#6C6F93]">{formatDate(row.createdAt)}</td>
                      <td className="px-4 py-4">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${st.className}`}>
                          {st.label}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <select
                          value={stKey}
                          onChange={(e) => void changeDeviceStatus(row, e.target.value)}
                          className="px-2 py-1.5 border border-gray-3 rounded-lg text-xs max-w-[130px]"
                        >
                          {DEVICE_STATUS_OPTIONS.map((s) => (
                            <option key={s} value={s}>
                              {statusMap[s]?.label ?? s}
                            </option>
                          ))}
                        </select>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        )}
        <div className="px-6 py-4 border-t border-gray-3/50">
          <AdminPagination
            page={page}
            totalPages={totalPages}
            totalElements={totalElements}
            pageSize={PER_PAGE}
            onPageChange={setPage}
            label="thiết bị"
          />
        </div>
      </div>

      <Modal
        open={importOpen}
        onClose={() => setImportOpen(false)}
        title="Nhập IMEI"
        subtitle="Chọn biến thể và nhập mỗi dòng một mã"
        footer={<PrimaryButton onClick={() => void submitImei()}>Xác nhận nhập</PrimaryButton>}
      >
        <div className="space-y-4">
          <div>
            <input
              value={variantLabel}
              onChange={(e) => void searchVariant(e.target.value)}
              placeholder="Tìm SKU / tên sản phẩm..."
              className="w-full px-3 py-2.5 border border-gray-3 rounded-lg text-sm"
            />
            {variantHits.length > 0 && (
              <ul className="mt-2 border border-gray-3 rounded-lg max-h-40 overflow-auto">
                {variantHits.map((v) => (
                  <li key={v.id}>
                    <button
                      type="button"
                      className="w-full text-left px-3 py-2 text-sm hover:bg-[#F7F9FC]"
                      onClick={() => {
                        setVariantId(v.id);
                        setVariantLabel(`${v.productName} — ${v.skuCode ?? v.variantName}`);
                        setVariantHits([]);
                      }}
                    >
                      {v.productName} ({v.skuCode ?? v.variantName})
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
          <textarea
            value={imeiText}
            onChange={(e) => setImeiText(e.target.value)}
            rows={8}
            placeholder="356789012345678&#10;356789098765432"
            className="w-full px-3 py-2.5 border border-gray-3 rounded-lg text-sm font-mono resize-none"
          />
        </div>
      </Modal>
    </>
  );
}
