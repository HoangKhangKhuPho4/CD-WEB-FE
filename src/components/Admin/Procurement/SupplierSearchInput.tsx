"use client";

import { useMemo, useState } from "react";
import type { SupplierOption } from "@/utils/adminApi";

export default function SupplierSearchInput({
  suppliers,
  supplierId,
  onSelect,
  label = "Nhà cung cấp *",
}: {
  suppliers: SupplierOption[];
  supplierId: number | null;
  onSelect: (supplier: SupplierOption | null) => void;
  label?: string;
}) {
  const selected = suppliers.find((s) => s.id === supplierId) ?? null;
  const [query, setQuery] = useState(selected?.name ?? "");
  const [open, setOpen] = useState(false);

  const hits = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return suppliers.slice(0, 12);
    return suppliers
      .filter(
        (s) =>
          s.name.toLowerCase().includes(q) ||
          (s.code?.toLowerCase().includes(q) ?? false) ||
          (s.phone?.includes(q) ?? false)
      )
      .slice(0, 12);
  }, [query, suppliers]);

  const pick = (s: SupplierOption) => {
    onSelect(s);
    setQuery(s.name);
    setOpen(false);
  };

  return (
    <div className="relative">
      <label className="block text-sm">
        <span className="text-[#6C6F93] font-medium">{label}</span>
        <input
          type="text"
          className="mt-1 w-full border border-gray-3 rounded-lg px-3 py-2 text-sm"
          placeholder="Gõ tên / mã NCC..."
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
            if (selected && e.target.value !== selected.name) {
              onSelect(null);
            }
          }}
          onFocus={() => setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 150)}
        />
      </label>
      {supplierId != null && selected ? (
        <p className="mt-1 text-xs text-green">
          Đã chọn: {selected.name}
          {selected.code ? ` (${selected.code})` : ""}
        </p>
      ) : null}
      {open && hits.length > 0 && (
        <ul className="absolute z-20 mt-1 w-full border border-gray-3 rounded-lg bg-white shadow-lg max-h-48 overflow-auto">
          {hits.map((s) => (
            <li key={s.id}>
              <button
                type="button"
                className="w-full text-left px-3 py-2 text-sm hover:bg-[#F7F9FC]"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => pick(s)}
              >
                <span className="font-medium">{s.name}</span>
                {s.code ? (
                  <span className="text-[#8D93A5] ml-2 text-xs">{s.code}</span>
                ) : null}
              </button>
            </li>
          ))}
        </ul>
      )}
      {open && query.trim() && hits.length === 0 && (
        <p className="absolute z-20 mt-1 w-full px-3 py-2 text-xs text-[#8D93A5] bg-white border border-gray-3 rounded-lg">
          Không tìm thấy NCC phù hợp
        </p>
      )}
    </div>
  );
}
