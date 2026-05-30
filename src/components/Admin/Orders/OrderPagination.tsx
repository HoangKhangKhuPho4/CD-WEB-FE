"use client";

import { useOrdersAdmin } from "@/components/Admin/Orders/ordersAdminStore";

export default function OrderPagination() {
  const { page, totalPages, setPage, orders } = useOrdersAdmin();

  if (totalPages <= 1 && orders.length === 0) return null;

  return (
    <div className="flex items-center justify-between gap-4">
      <p className="text-sm text-[#606882]">
        Trang {page + 1} / {Math.max(totalPages, 1)}
      </p>
      <div className="flex gap-2">
        <button
          type="button"
          disabled={page <= 0}
          onClick={() => setPage(page - 1)}
          className="px-3 py-1.5 rounded border border-gray-3 text-sm disabled:opacity-40"
        >
          Trước
        </button>
        <button
          type="button"
          disabled={page >= totalPages - 1}
          onClick={() => setPage(page + 1)}
          className="px-3 py-1.5 rounded border border-gray-3 text-sm disabled:opacity-40"
        >
          Sau
        </button>
      </div>
    </div>
  );
}
