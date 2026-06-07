"use client";

import { useState } from "react";
import { IMEI_STATUS_OPTIONS, imeiStatusMap } from "@/components/Admin/Imei/imeiStatusMap";
import { adminInventoryApi, type VariantSearchHit } from "@/utils/adminApi";

export interface ImeiFilterState {
  keyword: string;
  status: string;
  orderCode: string;
  fromDate: string;
  toDate: string;
  variantLabel: string;
  variantId: number | null;
}

export default function ImeiFilters({
  filters,
  onChange,
  onReset,
  onExport,
  exporting,
}: {
  filters: ImeiFilterState;
  onChange: (patch: Partial<ImeiFilterState>) => void;
  onReset: () => void;
  onExport: () => void;
  exporting?: boolean;
}) {
  const [variantHits, setVariantHits] = useState<VariantSearchHit[]>([]);

  const searchVariant = async (keyword: string) => {
    onChange({ variantLabel: keyword, variantId: null });
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
  return (
    <div className="bg-white rounded-xl border border-gray-3/50 p-4 space-y-3">
      <div className="flex flex-col lg:flex-row gap-3">
        <input
          value={filters.keyword}
          onChange={(e) => onChange({ keyword: e.target.value })}
          placeholder="Tìm IMEI, sản phẩm, SKU..."
          className="flex-1 px-4 py-2.5 border border-gray-3 rounded-lg text-sm"
        />
        <select
          value={filters.status}
          onChange={(e) => onChange({ status: e.target.value })}
          className="w-full lg:w-44 px-3 py-2.5 border border-gray-3 rounded-lg text-sm"
        >
          <option value="">Tất cả trạng thái</option>
          {IMEI_STATUS_OPTIONS.map((s) => (
            <option key={s} value={s}>
              {imeiStatusMap[s]?.label ?? s}
            </option>
          ))}
        </select>
        <input
          value={filters.orderCode}
          onChange={(e) => onChange({ orderCode: e.target.value })}
          placeholder="Mã đơn hàng"
          className="w-full lg:w-40 px-3 py-2.5 border border-gray-3 rounded-lg text-sm"
        />
      </div>
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
        <input
          type="date"
          value={filters.fromDate}
          onChange={(e) => onChange({ fromDate: e.target.value })}
          className="px-3 py-2.5 border border-gray-3 rounded-lg text-sm"
        />
        <span className="text-sm text-[#8D93A5] hidden sm:inline">đến</span>
        <input
          type="date"
          value={filters.toDate}
          onChange={(e) => onChange({ toDate: e.target.value })}
          className="px-3 py-2.5 border border-gray-3 rounded-lg text-sm"
        />
        <div className="flex-1 relative">
          <input
            value={filters.variantLabel}
            onChange={(e) => void searchVariant(e.target.value)}
            placeholder="Lọc theo SKU / biến thể..."
            className="w-full px-3 py-2.5 border border-gray-3 rounded-lg text-sm"
          />
          {variantHits.length > 0 && (
            <ul className="absolute z-10 mt-1 w-full bg-white border border-gray-3 rounded-lg shadow-lg max-h-36 overflow-auto">
              {variantHits.map((v) => (
                <li key={v.id}>
                  <button
                    type="button"
                    className="w-full text-left px-3 py-2 text-sm hover:bg-[#F7F9FC]"
                    onClick={() => {
                      onChange({
                        variantId: v.id,
                        variantLabel: `${v.productName} — ${v.skuCode ?? v.variantName}`,
                      });
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
        <div className="flex gap-2 ml-auto">
          <button
            type="button"
            onClick={onReset}
            className="px-4 py-2.5 text-sm font-medium text-[#6C6F93] border border-gray-3 rounded-lg hover:bg-gray-1"
          >
            Xóa lọc
          </button>
          <button
            type="button"
            onClick={onExport}
            disabled={exporting}
            className="px-4 py-2.5 text-sm font-semibold text-[#3C50E0] border border-[#3C50E0]/40 rounded-lg hover:bg-[#3C50E0]/5 disabled:opacity-50"
          >
            {exporting ? "Đang xuất..." : "Xuất CSV"}
          </button>
        </div>
      </div>
    </div>
  );
}
