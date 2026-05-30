"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { fetchProductSuggestions } from "@/utils/productApi";
import type { ProductSuggestItem } from "@/types/product-api";

type HeaderSearchFieldProps = {
  value: string;
  onChange: (value: string) => void;
  productTypeId: number | null;
  onSubmit: () => void;
};

function formatVnd(price?: number): string {
  if (price == null || Number.isNaN(price)) return "";
  return `${Math.round(price).toLocaleString("vi-VN")}đ`;
}

export default function HeaderSearchField({
  value,
  onChange,
  productTypeId,
  onSubmit,
}: HeaderSearchFieldProps) {
  const router = useRouter();
  const wrapRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState<ProductSuggestItem[]>([]);
  const [activeIdx, setActiveIdx] = useState(-1);

  const loadSuggestions = useCallback(
    async (keyword: string) => {
      const kw = keyword.trim();
      if (kw.length < 2) {
        setItems([]);
        setOpen(false);
        return;
      }
      setLoading(true);
      try {
        const data = await fetchProductSuggestions({
          keyword: kw,
          product_type_id: productTypeId ?? undefined,
          limit: 8,
        });
        setItems(data);
        setOpen(data.length > 0);
        setActiveIdx(-1);
      } finally {
        setLoading(false);
      }
    },
    [productTypeId]
  );

  useEffect(() => {
    const t = window.setTimeout(() => {
      void loadSuggestions(value);
    }, 280);
    return () => window.clearTimeout(t);
  }, [value, loadSuggestions]);

  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  const goProduct = (id: number) => {
    setOpen(false);
    router.push(`/shop-details/${id}`);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!open || items.length === 0) {
      if (e.key === "Enter") onSubmit();
      return;
    }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIdx((i) => (i + 1) % items.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIdx((i) => (i <= 0 ? items.length - 1 : i - 1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (activeIdx >= 0 && items[activeIdx]) {
        goProduct(items[activeIdx].id);
      } else {
        onSubmit();
      }
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  };

  const showPanel = open && value.trim().length >= 2;

  return (
    <div ref={wrapRef} className="relative min-w-0 w-full flex-1 sm:min-w-[200px]">
      <span className="absolute left-0 top-1/2 -translate-y-1/2 inline-block w-px h-5.5 bg-gray-4" />
      <input
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => {
          if (items.length > 0 && value.trim().length >= 2) setOpen(true);
        }}
        onKeyDown={handleKeyDown}
        value={value}
        type="search"
        name="search"
        id="search"
        placeholder="Tôi đang tìm kiếm..."
        autoComplete="off"
        role="combobox"
        aria-expanded={showPanel}
        aria-autocomplete="list"
        className="custom-search w-full rounded-r-[5px] bg-gray-1 !border-l-0 border border-gray-3 py-2.5 pl-4 pr-10 outline-none ease-in duration-200 focus:border-blue"
      />

      <button
        type="submit"
        id="search-btn"
        aria-label="Tìm kiếm"
        className="flex items-center justify-center absolute right-3 top-1/2 -translate-y-1/2 ease-in duration-200 hover:text-blue"
      >
        <svg className="fill-current" width="18" height="18" viewBox="0 0 18 18" fill="none">
          <path
            d="M17.2687 15.6656L12.6281 11.8969C14.5406 9.28123 14.3437 5.5406 11.9531 3.1781C10.6875 1.91248 8.99995 1.20935 7.19995 1.20935C5.39995 1.20935 3.71245 1.91248 2.44683 3.1781C-0.168799 5.79373 -0.168799 10.0687 2.44683 12.6844C3.71245 13.95 5.39995 14.6531 7.19995 14.6531C8.91558 14.6531 10.5187 14.0062 11.7843 12.8531L16.4812 16.65C16.5937 16.7344 16.7343 16.7906 16.875 16.7906C17.0718 16.7906 17.2406 16.7062 17.3531 16.5656C17.5781 16.2844 17.55 15.8906 17.2687 15.6656ZM7.19995 13.3875C5.73745 13.3875 4.38745 12.825 3.34683 11.7844C1.20933 9.64685 1.20933 6.18748 3.34683 4.0781C4.38745 3.03748 5.73745 2.47498 7.19995 2.47498C8.66245 2.47498 10.0125 3.03748 11.0531 4.0781C13.1906 6.2156 13.1906 9.67498 11.0531 11.7844C10.0406 12.825 8.66245 13.3875 7.19995 13.3875Z"
            fill=""
          />
        </svg>
      </button>

      {showPanel && (
        <ul
          className="absolute left-0 right-0 top-[calc(100%+6px)] z-[10000] max-h-[360px] overflow-y-auto rounded-lg border border-gray-3 bg-white shadow-lg py-1"
          role="listbox"
        >
          {loading && items.length === 0 && (
            <li className="px-4 py-3 text-sm text-[#8D93A5]">Đang tìm...</li>
          )}
          {!loading && items.length === 0 && (
            <li className="px-4 py-3 text-sm text-[#8D93A5]">Không có gợi ý phù hợp</li>
          )}
          {items.map((item, idx) => (
            <li key={item.id} role="option" aria-selected={idx === activeIdx}>
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => goProduct(item.id)}
                className={`flex w-full items-center gap-3 px-3 py-2.5 text-left transition-colors ${
                  idx === activeIdx ? "bg-[#3C50E0]/8" : "hover:bg-gray-1"
                }`}
              >
                <div className="w-10 h-10 rounded-md bg-gray-2 flex-shrink-0 overflow-hidden border border-gray-3">
                  {item.imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={item.imageUrl} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <span className="flex h-full w-full items-center justify-center text-[10px] text-[#8D93A5]">
                      SP
                    </span>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-dark truncate">{item.name}</p>
                  <p className="text-xs text-[#8D93A5] truncate">
                    {[item.categoryName, formatVnd(item.price)].filter(Boolean).join(" · ")}
                  </p>
                </div>
              </button>
            </li>
          ))}
          {items.length > 0 && (
            <li className="border-t border-gray-3 mt-1">
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={onSubmit}
                className="w-full px-4 py-2.5 text-sm font-medium text-[#3C50E0] hover:bg-[#3C50E0]/5 text-left"
              >
                Xem tất cả kết quả cho &quot;{value.trim()}&quot;
              </button>
            </li>
          )}
        </ul>
      )}
    </div>
  );
}
