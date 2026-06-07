"use client";

import { useState } from "react";
import { adminInventoryApi, type VariantSearchHit } from "@/utils/adminApi";
import { formatVariantLabel } from "@/components/Admin/Inventory/inventoryUtils";

export default function VariantSearchInput({
  label,
  value,
  variantId,
  onChange,
  onSelect,
  placeholder = "Tìm SKU / tên sản phẩm...",
}: {
  label?: string;
  value: string;
  variantId: number | null;
  onChange: (text: string) => void;
  onSelect: (hit: VariantSearchHit) => void;
  placeholder?: string;
}) {
  const [hits, setHits] = useState<VariantSearchHit[]>([]);
  const [loading, setLoading] = useState(false);

  const search = async (keyword: string) => {
    onChange(keyword);
    if (keyword.length < 2) {
      setHits([]);
      return;
    }
    setLoading(true);
    try {
      const res = await adminInventoryApi.searchVariants(keyword);
      if (res.data.success) setHits(res.data.data);
      else setHits([]);
    } catch {
      setHits([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-1">
      {label ? <label className="text-sm font-medium text-dark">{label}</label> : null}
      <input
        value={value}
        onChange={(e) => void search(e.target.value)}
        placeholder={placeholder}
        className="w-full px-4 py-2.5 border border-gray-3 rounded-lg text-sm"
      />
      {variantId != null && value ? (
        <p className="text-xs text-green">Đã chọn variant #{variantId}</p>
      ) : null}
      {loading ? <p className="text-xs text-[#8D93A5]">Đang tìm...</p> : null}
      {hits.length > 0 && (
        <ul className="border border-gray-3 rounded-lg max-h-36 overflow-auto z-10 bg-white">
          {hits.map((v) => (
            <li key={v.id}>
              <button
                type="button"
                className="w-full text-left px-3 py-2 text-sm hover:bg-[#F7F9FC]"
                onClick={() => {
                  onSelect(v);
                  setHits([]);
                }}
              >
                {formatVariantLabel(v)}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
