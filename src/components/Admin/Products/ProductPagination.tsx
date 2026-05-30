"use client";
import { useProducts } from "@/components/Admin/Products/productsStore";

export default function ProductPagination() {
  const { perPage, currentPage, setCurrentPage, totalPages, totalElements, loading } =
    useProducts();
  const totalProducts = totalElements;
  const start = totalProducts === 0 ? 0 : (currentPage - 1) * perPage + 1;
  const end = Math.min(currentPage * perPage, totalProducts);

  const getPageNumbers = () => {
    const pages: (number | "...")[] = [];
    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1, 2, 3, "...", totalPages);
    }
    return pages;
  };

  if (!loading && totalProducts === 0) {
    return (
      <div className="flex items-center justify-between px-1">
        <p className="text-sm text-[#6C6F93]">Không có sản phẩm phù hợp.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 px-1">
      <p className="text-sm text-[#6C6F93]">
        Hiển thị{" "}
        <span className="font-medium text-dark">
          {start} - {end}
        </span>{" "}
        của{" "}
        <span className="font-medium text-dark">
          {totalProducts.toLocaleString("vi-VN")}
        </span>{" "}
        sản phẩm
      </p>

      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
          disabled={currentPage === 1}
          className="w-9 h-9 flex items-center justify-center rounded-lg border border-gray-3 text-[#6C6F93] hover:border-[#3C50E0] hover:text-[#3C50E0] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M10 12L6 8L10 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>

        {getPageNumbers().map((page, idx) =>
          page === "..." ? (
            <span key={`ellipsis-${idx}`} className="w-9 h-9 flex items-center justify-center text-[#8D93A5] text-sm">
              ...
            </span>
          ) : (
            <button
              key={page}
              type="button"
              onClick={() => setCurrentPage(page)}
              className={`w-9 h-9 flex items-center justify-center rounded-lg text-sm font-medium transition-colors ${
                currentPage === page
                  ? "bg-[#3C50E0] text-white shadow-sm"
                  : "border border-gray-3 text-[#6C6F93] hover:border-[#3C50E0] hover:text-[#3C50E0]"
              }`}
            >
              {page}
            </button>
          )
        )}

        <button
          type="button"
          onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
          disabled={currentPage === totalPages}
          className="w-9 h-9 flex items-center justify-center rounded-lg border border-gray-3 text-[#6C6F93] hover:border-[#3C50E0] hover:text-[#3C50E0] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M6 12L10 8L6 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      </div>
    </div>
  );
}
