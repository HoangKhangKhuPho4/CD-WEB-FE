"use client";

import AdminPaginationControls from "@/components/Admin/shared/AdminPaginationControls";

export type AdminPaginationProps = {
  /** Trang hiện tại (bắt đầu từ 1). */
  page: number;
  totalPages: number;
  totalElements: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  label?: string;
  className?: string;
};

export default function AdminPagination({
  page,
  totalPages,
  totalElements,
  pageSize,
  onPageChange,
  label = "kết quả",
  className = "",
}: AdminPaginationProps) {
  if (totalElements === 0 && totalPages <= 1) {
    return null;
  }

  const safeTotalPages = Math.max(1, totalPages);
  const start = totalElements === 0 ? 0 : (page - 1) * pageSize + 1;
  const end = Math.min(page * pageSize, totalElements);

  return (
    <div
      className={`flex flex-col gap-4 px-1 ${className}`}
    >
      <p className="text-sm text-[#6C6F93]">
        Hiển thị{" "}
        <span className="font-medium text-dark">
          {start}-{end}
        </span>{" "}
        trên <span className="font-medium text-dark">{totalElements}</span> {label}
      </p>
      <AdminPaginationControls
        page={page}
        totalPages={safeTotalPages}
        onPageChange={onPageChange}
      />
    </div>
  );
}
