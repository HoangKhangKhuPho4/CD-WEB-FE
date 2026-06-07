"use client";

import AdminPaginationControls from "@/components/Admin/shared/AdminPaginationControls";

export type AdminTablePaginationProps = {
  /** Trang hiện tại (bắt đầu từ 1). */
  page: number;
  totalPages: number;
  totalElements: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange?: (size: number) => void;
  pageSizeOptions?: number[];
  label?: string;
  className?: string;
};

export default function AdminTablePagination({
  page,
  totalPages,
  totalElements,
  pageSize,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [10, 15, 20, 50],
  label = "kết quả",
  className = "",
}: AdminTablePaginationProps) {
  if (totalElements === 0 && totalPages <= 1) {
    return null;
  }

  const safeTotalPages = Math.max(1, totalPages);
  const start = totalElements === 0 ? 0 : (page - 1) * pageSize + 1;
  const end = Math.min(page * pageSize, totalElements);

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <p className="text-sm text-[#6C6F93]">
          Hiển thị{" "}
          <span className="font-medium text-dark">
            {start}-{end}
          </span>{" "}
          trên <span className="font-medium text-dark">{totalElements}</span> {label}
        </p>
        {onPageSizeChange && (
          <label className="flex items-center gap-2 text-sm text-[#6C6F93] shrink-0">
            <span>Số dòng / trang:</span>
            <select
              value={pageSize}
              onChange={(e) => onPageSizeChange(Number(e.target.value))}
              className="px-2.5 py-1.5 bg-white border border-[#E5E7EB] rounded-[10px] text-sm text-dark outline-none focus:border-[#3C50E0] focus:ring-2 focus:ring-[#3C50E0]/15"
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

      {safeTotalPages >= 1 && (
        <AdminPaginationControls
          page={page}
          totalPages={safeTotalPages}
          onPageChange={onPageChange}
        />
      )}
    </div>
  );
}
