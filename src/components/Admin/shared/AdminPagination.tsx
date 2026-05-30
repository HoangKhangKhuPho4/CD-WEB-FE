"use client";

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
      className={`flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 px-1 ${className}`}
    >
      <p className="text-sm text-[#6C6F93]">
        Hiển thị{" "}
        <span className="font-medium text-dark">
          {start}-{end}
        </span>{" "}
        trên <span className="font-medium text-dark">{totalElements}</span> {label}
      </p>
      <div className="flex items-center gap-1.5">
        <button
          type="button"
          onClick={() => onPageChange(Math.max(1, page - 1))}
          disabled={page <= 1}
          className="w-9 h-9 flex items-center justify-center rounded-lg border border-gray-3 bg-white text-[#6C6F93] hover:border-[#3C50E0] hover:text-[#3C50E0] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          aria-label="Trang trước"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path
              d="M10 12L6 8L10 4"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
        <span className="text-sm text-dark px-2 min-w-[4.5rem] text-center">
          {page} / {safeTotalPages}
        </span>
        <button
          type="button"
          onClick={() => onPageChange(Math.min(safeTotalPages, page + 1))}
          disabled={page >= safeTotalPages}
          className="w-9 h-9 flex items-center justify-center rounded-lg border border-gray-3 bg-white text-[#6C6F93] hover:border-[#3C50E0] hover:text-[#3C50E0] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          aria-label="Trang sau"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path
              d="M6 12L10 8L6 4"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </div>
    </div>
  );
}
