"use client";

import { useEffect, useState } from "react";
import { adminStatisticsApi, type TopProductStat } from "@/utils/adminApi";

export default function LowStockProducts() {
  const [products, setProducts] = useState<TopProductStat[]>([]);

  useEffect(() => {
    adminStatisticsApi
      .topProducts("low-stock", 5)
      .then((res) => setProducts(res.data.products ?? []))
      .catch(() => setProducts([]));
  }, []);

  return (
    <div className="bg-white rounded-xl p-6 border border-gray-3/50">
      <h3 className="text-lg font-bold text-dark mb-4">Tồn kho thấp</h3>
      {products.length === 0 ? (
        <p className="text-sm text-[#8D93A5]">Không có cảnh báo tồn kho</p>
      ) : (
        <ol className="space-y-3">
          {products.map((p, i) => (
            <li key={`${p.productId}-${i}`} className="flex justify-between gap-3 text-sm">
              <span className="text-dark font-medium truncate">{p.productName}</span>
              <span className="text-red font-semibold whitespace-nowrap">
                Còn {p.currentStock ?? 0}
              </span>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}
