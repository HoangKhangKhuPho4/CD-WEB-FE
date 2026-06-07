"use client";

import { useEffect, useState } from "react";
import { adminStatisticsApi } from "@/utils/adminApi";

export default function CustomerSegmentsPanel() {
  const [segments, setSegments] = useState<
    {
      categoryName?: string;
      segmentLabel?: string;
      userCount?: number;
      percentage?: number;
      color?: string;
    }[]
  >([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    adminStatisticsApi
      .customerSegments()
      .then((res) => setSegments(res.data.segments ?? []))
      .catch(() => setSegments([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="bg-white rounded-xl p-6 border border-gray-3/50">
      <h3 className="text-lg font-bold text-dark mb-1">Phân khúc khách hàng</h3>
      <p className="text-xs text-[#8D93A5] mb-4">Sở thích theo danh mục sản phẩm</p>
      {loading ? (
        <div className="h-40 animate-pulse bg-[#F7F9FC] rounded-lg" />
      ) : segments.length === 0 ? (
        <p className="text-sm text-[#8D93A5] py-8 text-center">Chưa có dữ liệu phân khúc</p>
      ) : (
        <ul className="space-y-3">
          {segments.map((s) => (
            <li key={`${s.categoryName}-${s.segmentLabel}`}>
              <div className="flex justify-between text-sm mb-1">
                <span className="font-medium text-dark">
                  {s.segmentLabel ?? s.categoryName}
                </span>
                <span className="text-[#606882]">
                  {s.userCount ?? 0} ({s.percentage?.toFixed(1)}%)
                </span>
              </div>
              <div className="h-2 bg-[#F3F4F6] rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full"
                  style={{
                    width: `${s.percentage ?? 0}%`,
                    backgroundColor: s.color ?? "#3C50E0",
                  }}
                />
              </div>
              {s.categoryName && s.segmentLabel !== s.categoryName && (
                <p className="text-[10px] text-[#8D93A5] mt-0.5">{s.categoryName}</p>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
