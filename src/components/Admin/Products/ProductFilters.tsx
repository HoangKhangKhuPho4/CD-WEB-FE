"use client";
import { useProducts } from "@/components/Admin/Products/productsStore";

export default function ProductFilters() {
  const { filters, setFilters, categories, manufacturers } = useProducts();

  return (
    <div className="bg-white rounded-xl border border-gray-3/50 p-4">
      <div className="flex flex-col lg:flex-row lg:items-end gap-4">
        {/* Search */}
        <div className="flex-1 min-w-[180px]">
          <label className="block text-xs font-medium text-[#6C6F93] mb-1.5">Tìm kiếm</label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8D93A5]">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M7.33333 12.6667C10.2789 12.6667 12.6667 10.2789 12.6667 7.33333C12.6667 4.38781 10.2789 2 7.33333 2C4.38781 2 2 4.38781 2 7.33333C2 10.2789 4.38781 12.6667 7.33333 12.6667Z" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M14 14L11.1 11.1" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </span>
            <input
              type="search"
              placeholder="Tên SP, SKU..."
              value={filters.query}
              onChange={(e) => setFilters((p) => ({ ...p, query: e.target.value }))}
              className="w-full pl-9 pr-3 py-2.5 bg-[#F7F9FC] border border-gray-3 rounded-lg text-sm text-dark placeholder:text-[#8D93A5] focus:outline-none focus:border-[#3C50E0] focus:ring-1 focus:ring-[#3C50E0]/20 transition-all"
            />
          </div>
        </div>

        {/* Category */}
        <div className="w-full lg:w-[160px]">
          <label className="block text-xs font-medium text-[#6C6F93] mb-1.5">Danh mục</label>
          <select
            value={filters.category}
            onChange={(e) => setFilters((p) => ({ ...p, category: e.target.value }))}
            className="w-full px-3 py-2.5 bg-[#F7F9FC] border border-gray-3 rounded-lg text-sm text-dark focus:outline-none focus:border-[#3C50E0] focus:ring-1 focus:ring-[#3C50E0]/20 transition-all appearance-none cursor-pointer"
          >
            <option value="">Tất cả</option>
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        {/* Manufacturer */}
        <div className="w-full lg:w-[160px]">
          <label className="block text-xs font-medium text-[#6C6F93] mb-1.5">Nhà sản xuất</label>
          <select
            value={filters.manufacturer}
            onChange={(e) => setFilters((p) => ({ ...p, manufacturer: e.target.value }))}
            className="w-full px-3 py-2.5 bg-[#F7F9FC] border border-gray-3 rounded-lg text-sm text-dark focus:outline-none focus:border-[#3C50E0] focus:ring-1 focus:ring-[#3C50E0]/20 transition-all appearance-none cursor-pointer"
          >
            <option value="">Tất cả</option>
            {manufacturers.map((m) => (
              <option key={m.value} value={m.value}>
                {m.label}
              </option>
            ))}
          </select>
        </div>

        {/* Status */}
        <div className="w-full lg:w-[160px]">
          <label className="block text-xs font-medium text-[#6C6F93] mb-1.5">Trạng thái</label>
          <select
            value={filters.status}
            onChange={(e) => setFilters((p) => ({ ...p, status: e.target.value as any }))}
            className="w-full px-3 py-2.5 bg-[#F7F9FC] border border-gray-3 rounded-lg text-sm text-dark focus:outline-none focus:border-[#3C50E0] focus:ring-1 focus:ring-[#3C50E0]/20 transition-all appearance-none cursor-pointer"
          >
            <option value="">Tất cả</option>
            <option value="selling">Đang bán</option>
            <option value="stopped">Ngừng bán</option>
            <option value="out_of_stock">Hết hàng</option>
          </select>
        </div>

        {/* Featured toggle */}
        <div className="flex items-center gap-3 pb-0.5">
          <label className="text-sm font-medium text-dark whitespace-nowrap">Nổi bật</label>
          <button
            type="button"
            role="switch"
            aria-checked={filters.featuredOnly}
            onClick={() => setFilters((p) => ({ ...p, featuredOnly: !p.featuredOnly }))}
            className={`relative w-11 h-6 rounded-full transition-colors duration-200 ${
              filters.featuredOnly ? "bg-[#3C50E0]" : "bg-gray-3"
            }`}
          >
            <span
              className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform duration-200 ${
                filters.featuredOnly ? "translate-x-5" : "translate-x-0"
              }`}
            />
          </button>
        </div>

        {/* Advanced filter */}
        <button
          type="button"
          className="flex items-center justify-center w-10 h-10 rounded-lg border border-gray-3 text-[#6C6F93] hover:text-[#3C50E0] hover:border-[#3C50E0] hover:bg-[#3C50E0]/5 transition-all flex-shrink-0 lg:mb-0.5"
          title="Bộ lọc nâng cao"
        >
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M2.25 4.5H15.75M4.5 9H13.5M6.75 13.5H11.25" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      </div>
    </div>
  );
}
