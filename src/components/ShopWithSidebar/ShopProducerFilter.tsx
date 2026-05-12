"use client";

import { useEffect, useState } from "react";
import type { ProducerDto } from "@/types/product-api";
import { fetchBrands, fetchProducers } from "@/utils/productApi";

type ShopProducerFilterProps = {
  producerId: number | null;
  brandKeyword: string | null;
  onProducerChange: (id: number | null) => void;
  onBrandKeywordChange: (keyword: string | null) => void;
};

/**
 * Thương hiệu: ưu tiên GET /api/producers (`producer_id`);
 * nếu rỗng thì dùng GET /api/products/brands + `keyword`.
 */
export default function ShopProducerFilter({
  producerId,
  brandKeyword,
  onProducerChange,
  onBrandKeywordChange,
}: ShopProducerFilterProps) {
  const [open, setOpen] = useState(true);
  const [producers, setProducers] = useState<ProducerDto[]>([]);
  const [brandNames, setBrandNames] = useState<string[]>([]);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      const plist = await fetchProducers();
      if (cancelled) return;
      if (plist.length > 0) {
        setProducers(plist);
        setBrandNames([]);
        return;
      }
      const names = await fetchBrands();
      if (!cancelled) {
        setProducers([]);
        setBrandNames(names);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const selectProducer = (id: number) => {
    if (producerId === id) {
      onProducerChange(null);
    } else {
      onBrandKeywordChange(null);
      onProducerChange(id);
    }
  };

  const selectBrandName = (name: string) => {
    if (brandKeyword === name) {
      onBrandKeywordChange(null);
    } else {
      onProducerChange(null);
      onBrandKeywordChange(name);
    }
  };

  return (
    <div className="bg-white shadow-1 rounded-lg">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={`flex w-full cursor-pointer items-center justify-between py-3 pl-6 pr-5.5 ${
          open ? "shadow-filter" : ""
        }`}
      >
        <p className="text-dark">Thương hiệu</p>
        <span className={`text-dark duration-200 ${open ? "rotate-180" : ""}`} aria-hidden>
          <svg className="fill-current" width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M4.43057 8.51192C4.70014 8.19743 5.17361 8.161 5.48811 8.43057L12 14.0122L18.5119 8.43057C18.8264 8.16101 19.2999 8.19743 19.5695 8.51192C19.839 8.82642 19.8026 9.29989 19.4881 9.56946L12.4881 15.5695C12.2072 15.8102 11.7928 15.8102 11.5119 15.5695L4.51192 9.56946C4.19743 9.29989 4.161 8.82641 4.43057 8.51192Z"
              fill=""
            />
          </svg>
        </span>
      </button>

      {open ? (
        <ul className="max-h-56 space-y-1 overflow-y-auto px-6 py-4">
          {producers.length > 0
            ? producers.map((p) => (
                <li key={p.id}>
                  <button
                    type="button"
                    onClick={() => selectProducer(p.id)}
                    className={`w-full rounded-md px-2 py-2 text-left text-sm ${
                      producerId === p.id ? "bg-blue/10 font-medium text-blue" : "text-dark hover:bg-gray-1"
                    }`}
                  >
                    {p.name}
                  </button>
                </li>
              ))
            : brandNames.map((name) => (
                <li key={name}>
                  <button
                    type="button"
                    onClick={() => selectBrandName(name)}
                    className={`w-full rounded-md px-2 py-2 text-left text-sm ${
                      brandKeyword === name ? "bg-blue/10 font-medium text-blue" : "text-dark hover:bg-gray-1"
                    }`}
                  >
                    {name}
                  </button>
                </li>
              ))}
          {producers.length === 0 && brandNames.length === 0 ? (
            <li className="text-sm text-dark-4">Chưa tải được danh sách thương hiệu.</li>
          ) : null}
        </ul>
      ) : null}
    </div>
  );
}
