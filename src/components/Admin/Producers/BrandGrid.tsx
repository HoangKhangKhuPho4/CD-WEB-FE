"use client";

import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import type { BrandFormData } from "@/components/Admin/Producers/BrandFormModal";
import { adminProducerApi } from "@/utils/adminApi";

interface Brand {
  id: string;
  name: string;
  country: string;
  productCount: number;
  enabled: boolean;
  gradient: string;
  initial: string;
}

const gradients = [
  "from-gray-700 to-gray-900",
  "from-[#3C50E0] to-[#1C3FB7]",
  "from-[#1C274C] to-[#495270]",
  "from-[#F27430] to-[#FB923C]",
  "from-[#9333EA] to-[#A855F7]",
];

function mapProducer(p: { id: number; name: string; description?: string; isActive?: boolean }, index: number): Brand {
  const name = p.name;
  return {
    id: String(p.id),
    name,
    country: p.description?.trim() || "—",
    productCount: 0,
    enabled: p.isActive !== false,
    gradient: gradients[index % gradients.length],
    initial: name.charAt(0).toUpperCase(),
  };
}

export default function BrandGrid({
  saveTick,
  pendingSave,
  onEdit,
}: {
  saveTick?: number;
  pendingSave?: { id: string | null; data: BrandFormData } | null;
  onEdit?: (id: string, data: BrandFormData) => void;
}) {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);

  const loadBrands = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminProducerApi.listAll();
      if (res.data.success) {
        setBrands(res.data.data.map(mapProducer));
      }
    } catch {
      toast.error("Không tải được thương hiệu");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadBrands();
  }, [loadBrands]);

  useEffect(() => {
    if (!pendingSave || !saveTick) return;
    const { id, data } = pendingSave;
    if (!data.name.trim()) return;

    const persist = async () => {
      try {
        if (id) {
          await adminProducerApi.update(Number(id), {
            name: data.name.trim(),
            description: data.country.trim() || undefined,
          });
        } else {
          await adminProducerApi.create({
            name: data.name.trim(),
            description: data.country.trim() || undefined,
          });
        }
        toast.success(id ? "Đã cập nhật thương hiệu" : "Đã thêm thương hiệu");
        await loadBrands();
      } catch {
        toast.error("Lưu thương hiệu thất bại");
      }
    };
    void persist();
  }, [saveTick, pendingSave, loadBrands]);

  const toggleBrand = async (id: string) => {
    try {
      await adminProducerApi.toggle(Number(id));
      await loadBrands();
    } catch {
      toast.error("Không đổi được trạng thái");
    }
  };

  if (loading) {
    return <p className="text-sm text-[#8D93A5] py-8">Đang tải thương hiệu...</p>;
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
      {brands.map((brand) => (
        <div
          key={brand.id}
          className="bg-white rounded-xl border border-gray-3/50 p-5 hover:shadow-2 transition-all relative"
        >
          <div className="flex items-start justify-between mb-4">
            <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${brand.gradient} flex items-center justify-center text-white font-bold text-lg shadow-sm`}>
              {brand.initial}
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={brand.enabled}
              onClick={() => void toggleBrand(brand.id)}
              className={`relative w-11 h-6 rounded-full transition-colors ${
                brand.enabled ? "bg-[#3C50E0]" : "bg-gray-3"
              }`}
            >
              <span
                className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform flex items-center justify-center ${
                  brand.enabled ? "translate-x-5" : "translate-x-0"
                }`}
              >
                {brand.enabled && (
                  <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                    <path d="M2 5L4 7L8 3" stroke="#3C50E0" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </span>
            </button>
          </div>

          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-lg font-bold text-dark">{brand.name}</h3>
            {!brand.enabled && (
              <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide bg-[#F3E8FF] text-[#9333EA]">
                Inactive
              </span>
            )}
          </div>

          <div className="flex items-center gap-1.5 text-xs text-[#8D93A5] mb-4">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M7 7.58333C8.15068 7.58333 9.08333 6.65068 9.08333 5.5C9.08333 4.34932 8.15068 3.41667 7 3.41667C5.84932 3.41667 4.91667 4.34932 4.91667 5.5C4.91667 6.65068 5.84932 7.58333 7 7.58333Z" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M7 12.8333C9.91667 10.2083 11.6667 8.04932 11.6667 5.5C11.6667 3.567 9.933 2 7 2C4.067 2 2.33333 3.567 2.33333 5.5C2.33333 8.04932 4.08333 10.2083 7 12.8333Z" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            {brand.country}
          </div>

          <div className="flex items-end justify-between pt-3 border-t border-gray-3/50">
            <div>
              <p className="text-[10px] font-bold text-[#8D93A5] uppercase tracking-wider mb-0.5">Sản phẩm</p>
              <p className="text-2xl font-bold text-[#3C50E0]">{brand.productCount}</p>
            </div>
            <button
              type="button"
              onClick={() => onEdit?.(brand.id, { name: brand.name, country: brand.country, website: "" })}
              className="p-2 rounded-lg text-[#8D93A5] hover:bg-[#F7F9FC] hover:text-dark transition-colors"
              title="Chỉnh sửa"
            >
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <circle cx="4" cy="9" r="1.25" fill="currentColor" />
                <circle cx="9" cy="9" r="1.25" fill="currentColor" />
                <circle cx="14" cy="9" r="1.25" fill="currentColor" />
              </svg>
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
