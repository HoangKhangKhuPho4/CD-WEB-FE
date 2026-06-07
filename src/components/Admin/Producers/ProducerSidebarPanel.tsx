"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { adminProducerApi, type ProducerItem } from "@/utils/adminApi";

/** Panel thương hiệu gọn — dùng ở Danh mục, Kho, v.v. */
export default function ProducerSidebarPanel({ limit = 8 }: { limit?: number }) {
  const [producers, setProducers] = useState<ProducerItem[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminProducerApi.list({
        page: 0,
        size: limit,
        sortBy: "createdAt",
        sortDir: "desc",
      });
      if (res.data.success) {
        setProducers(res.data.data.content);
      }
    } catch {
      toast.error("Không tải được thương hiệu");
    } finally {
      setLoading(false);
    }
  }, [limit]);

  useEffect(() => {
    void load();
  }, [load]);

  const toggle = async (id: number) => {
    try {
      await adminProducerApi.toggle(id);
      await load();
    } catch {
      toast.error("Không đổi được trạng thái");
    }
  };

  return (
    <div className="bg-white rounded-xl border border-gray-3/50 p-5 h-full">
      <div className="flex items-center justify-between mb-4 gap-2">
        <h3 className="font-bold text-dark">Thương hiệu</h3>
        <Link
          href="/admin/producers"
          className="text-xs font-semibold text-[#3C50E0] hover:underline whitespace-nowrap"
        >
          Quản lý đầy đủ →
        </Link>
      </div>

      {loading ? (
        <p className="text-sm text-[#8D93A5]">Đang tải...</p>
      ) : producers.length === 0 ? (
        <p className="text-sm text-[#8D93A5]">Chưa có thương hiệu.</p>
      ) : (
        <div className="space-y-3">
          {producers.map((p) => (
            <div
              key={p.id}
              className="flex items-center justify-between p-3 rounded-lg border border-gray-3/50 hover:bg-[#F7F9FC]/60 transition-colors"
            >
              <div className="min-w-0 pr-2">
                <p className="text-sm font-semibold text-dark truncate">{p.name}</p>
                <p className="text-xs text-[#8D93A5]">
                  <span className="font-mono text-[#3C50E0]">{p.code}</span>
                  {" · "}
                  {p.productCount ?? 0} SP
                  {p.country ? ` · ${p.country}` : ""}
                </p>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={p.isActive !== false}
                onClick={() => void toggle(p.id)}
                className={`relative w-10 h-5 rounded-full flex-shrink-0 ${
                  p.isActive !== false ? "bg-[#3C50E0]" : "bg-gray-3"
                }`}
              >
                <span
                  className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-transform ${
                    p.isActive !== false ? "left-5" : "left-0.5"
                  }`}
                />
              </button>
            </div>
          ))}
        </div>
      )}

      <Link
        href="/admin/producers"
        className="mt-4 block text-center text-sm font-medium text-[#3C50E0] border border-[#3C50E0]/30 rounded-lg py-2 hover:bg-[#3C50E0]/5"
      >
        + Thêm thương hiệu
      </Link>
    </div>
  );
}
