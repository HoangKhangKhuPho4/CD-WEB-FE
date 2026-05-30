"use client";

import { useEffect, useState } from "react";
import { adminStatisticsApi, type TopProductStat } from "@/utils/adminApi";
import { formatVnd } from "@/utils/adminFormat";

export default function BestSellingProducts() {
  const [products, setProducts] = useState<TopProductStat[]>([]);

  useEffect(() => {
    adminStatisticsApi
      .topProducts("best-selling", 5)
      .then((res) => setProducts(res.data.products ?? []))
      .catch(() => setProducts([]));
  }, []);

  return (
    <div className="bg-white rounded-xl p-6 border border-gray-3/50">
      <h3 className="text-lg font-bold text-dark mb-4">Sản phẩm bán chạy</h3>
      {products.length === 0 ? (
        <p className="text-sm text-[#8D93A5]">Chưa có dữ liệu</p>
      ) : (
        <ol className="space-y-3">
          {products.map((p, i) => (
            <li key={`${p.productId}-${i}`} className="flex justify-between gap-3 text-sm">
              <span className="text-dark font-medium truncate">
                {i + 1}. {p.productName}
              </span>
              <span className="text-[#606882] whitespace-nowrap">
                {p.quantitySold ?? 0} sp · {formatVnd(p.revenue)}
              </span>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}
