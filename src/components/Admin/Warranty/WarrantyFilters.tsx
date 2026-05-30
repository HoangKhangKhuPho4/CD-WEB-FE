"use client";

const STATUS_OPTIONS = [
  { value: "", label: "Tất cả trạng thái" },
  { value: "PENDING", label: "Chờ kiểm tra" },
  { value: "IN_PROGRESS", label: "Đang sửa chữa" },
  { value: "COMPLETED", label: "Đã sửa xong" },
  { value: "RETURNED", label: "Đã trả khách" },
  { value: "CANCELLED", label: "Đã hủy" },
];

export default function WarrantyFilters({
  keyword,
  status,
  onKeywordChange,
  onStatusChange,
}: {
  keyword: string;
  status: string;
  onKeywordChange: (v: string) => void;
  onStatusChange: (v: string) => void;
}) {
  return (
    <div className="bg-white rounded-xl border border-gray-3/50 p-4">
      <div className="flex flex-col lg:flex-row lg:items-center gap-3">
        <div className="flex-1 relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8D93A5]">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M7.33333 12.6667C10.2789 12.6667 12.6667 10.2789 12.6667 7.33333C12.6667 4.38781 10.2789 2 7.33333 2C4.38781 2 2 4.38781 2 7.33333C2 10.2789 4.38781 12.6667 7.33333 12.6667Z"
                stroke="currentColor"
                strokeWidth="1.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M14 14L11.1 11.1"
                stroke="currentColor"
                strokeWidth="1.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </span>
          <input
            type="search"
            value={keyword}
            onChange={(e) => onKeywordChange(e.target.value)}
            placeholder="Mã phiếu, IMEI, SĐT..."
            className="w-full pl-9 pr-3 py-2.5 bg-[#F7F9FC] border border-gray-3 rounded-lg text-sm text-dark placeholder:text-[#8D93A5] focus:outline-none focus:border-[#3C50E0] focus:ring-1 focus:ring-[#3C50E0]/20"
          />
        </div>
        <select
          value={status}
          onChange={(e) => onStatusChange(e.target.value)}
          className="w-full lg:w-[200px] px-3 py-2.5 bg-[#F7F9FC] border border-gray-3 rounded-lg text-sm text-dark focus:outline-none focus:border-[#3C50E0]"
        >
          {STATUS_OPTIONS.map((o) => (
            <option key={o.value || "all"} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
