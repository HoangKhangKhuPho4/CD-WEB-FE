"use client";

import AdminPaginationControls from "@/components/Admin/shared/AdminPaginationControls";

type OrdersPaginationProps = {
  page: number;
  totalPages: number;
  totalElements: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange?: (size: number) => void;
  pageSizeOptions?: number[];
};

export default function OrdersPagination({
  page,
  totalPages,
  totalElements,
  pageSize,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [5, 10, 20],
}: OrdersPaginationProps) {
  if (totalElements === 0) return null;

  const safeTotalPages = Math.max(1, totalPages);
  const start = page * pageSize + 1;
  const end = Math.min((page + 1) * pageSize, totalElements);

  return (
    <div className="flex flex-col gap-4 py-6 px-4 sm:px-7.5 border-t border-gray-3">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <p className="text-sm text-dark-3">
          Hiển thị{" "}
          <span className="font-medium text-dark">
            {start}-{end}
          </span>{" "}
          trên{" "}
          <span className="font-medium text-dark">{totalElements}</span> đơn hàng
        </p>

        {onPageSizeChange && (
          <label className="flex items-center gap-2 text-sm text-dark-3">
            <span>Số dòng / trang:</span>
            <select
              value={pageSize}
              onChange={(e) => onPageSizeChange(Number(e.target.value))}
              className="rounded-[10px] border border-[#E5E7EB] bg-white py-1.5 px-2.5 text-sm text-dark outline-none focus:border-[#3C50E0] focus:ring-2 focus:ring-[#3C50E0]/15"
            >
              {pageSizeOptions.map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
          </label>
        )}
      </div>

      <AdminPaginationControls
        page={page + 1}
        totalPages={safeTotalPages}
        onPageChange={(p) => onPageChange(p - 1)}
      />
    </div>
  );
}
