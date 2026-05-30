"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { adminStatisticsApi } from "@/utils/adminApi";

export default function PendingOrders() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    adminStatisticsApi
      .overview()
      .then((res) => setCount(res.data.pendingOrders ?? 0))
      .catch(() => setCount(0));
  }, []);

  return (
    <div className="bg-[#F5F5F7] rounded-xl p-6 border border-gray-3/50">
      <p className="text-sm text-[#606882]">Đơn chờ xử lý</p>
      <p className="text-4xl font-bold text-dark mt-2">{count}</p>
      <Link
        href="/admin/orders?status=PENDING"
        className="inline-flex mt-4 px-4 py-2 rounded-lg bg-[#3C50E0] text-white text-sm font-semibold hover:bg-[#1C3FB7]"
      >
        Xem đơn chờ
      </Link>
    </div>
  );
}
