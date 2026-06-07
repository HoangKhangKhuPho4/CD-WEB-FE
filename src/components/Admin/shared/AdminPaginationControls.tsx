"use client";

type AdminPaginationControlsProps = {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  className?: string;
};

export default function AdminPaginationControls({
  page,
  totalPages,
  onPageChange,
  className = "",
}: AdminPaginationControlsProps) {
  const safeTotalPages = Math.max(1, totalPages);

  const windowSize = 5;
  let rangeStart = Math.max(1, page - Math.floor(windowSize / 2));
  let rangeEnd = Math.min(safeTotalPages, rangeStart + windowSize - 1);
  if (rangeEnd - rangeStart + 1 < windowSize) {
    rangeStart = Math.max(1, rangeEnd - windowSize + 1);
  }
  const pages = Array.from(
    { length: rangeEnd - rangeStart + 1 },
    (_, i) => rangeStart + i
  );

  const goToPage = (p: number) => {
    if (p < 1 || p > safeTotalPages || p === page) return;
    onPageChange(p);
  };

  const prevDisabled = page <= 1;
  const nextDisabled = page >= safeTotalPages;

  const navBtn =
    "inline-flex items-center justify-center h-10 min-w-[4.5rem] px-4 rounded-[10px] text-sm font-medium transition-all duration-200";
  const pageBtn =
    "inline-flex items-center justify-center h-10 min-w-[2.5rem] w-10 rounded-[10px] text-sm font-semibold transition-all duration-200";

  return (
    <nav
      className={`flex flex-wrap items-center justify-center gap-2 ${className}`}
      aria-label="Phân trang"
    >
      <button
        type="button"
        onClick={() => goToPage(page - 1)}
        disabled={prevDisabled}
        className={`${navBtn} ${
          prevDisabled
            ? "border border-[#E5E7EB] text-[#CBD5E1] bg-white cursor-not-allowed"
            : "border border-[#E5E7EB] text-[#64748B] bg-white hover:border-[#3C50E0] hover:text-[#3C50E0]"
        }`}
      >
        Trước
      </button>

      {rangeStart > 1 && (
        <>
          <button
            type="button"
            onClick={() => goToPage(1)}
            className={`${pageBtn} border border-[#E5E7EB] text-dark bg-white hover:border-[#3C50E0] hover:text-[#3C50E0]`}
          >
            1
          </button>
          {rangeStart > 2 && (
            <span className="px-0.5 text-[#94A3B8] select-none text-sm">…</span>
          )}
        </>
      )}

      {pages.map((p) => (
        <button
          key={p}
          type="button"
          onClick={() => goToPage(p)}
          aria-current={page === p ? "page" : undefined}
          className={`${pageBtn} ${
            page === p
              ? "bg-[#3C50E0] text-white border border-[#3C50E0] shadow-sm shadow-[#3C50E0]/25"
              : "border border-[#E5E7EB] text-dark bg-white hover:border-[#3C50E0] hover:text-[#3C50E0]"
          }`}
        >
          {p}
        </button>
      ))}

      {rangeEnd < safeTotalPages && (
        <>
          {rangeEnd < safeTotalPages - 1 && (
            <span className="px-0.5 text-[#94A3B8] select-none text-sm">…</span>
          )}
          <button
            type="button"
            onClick={() => goToPage(safeTotalPages)}
            className={`${pageBtn} border border-[#E5E7EB] text-dark bg-white hover:border-[#3C50E0] hover:text-[#3C50E0]`}
          >
            {safeTotalPages}
          </button>
        </>
      )}

      <button
        type="button"
        onClick={() => goToPage(page + 1)}
        disabled={nextDisabled}
        className={`${navBtn} ${
          nextDisabled
            ? "border border-[#E5E7EB] text-[#CBD5E1] bg-white cursor-not-allowed"
            : "border border-[#3C50E0] text-[#3C50E0] bg-white hover:bg-[#3C50E0]/5"
        }`}
      >
        Sau
      </button>
    </nav>
  );
}
