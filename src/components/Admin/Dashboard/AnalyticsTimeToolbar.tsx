"use client";

import type { AnalyticsTimeFilter } from "@/utils/analyticsDateRange";

const defaultFilters: AnalyticsTimeFilter[] = [
  "7 ngày",
  "30 ngày",
  "Tháng này",
  "Năm nay",
  "Tùy chọn",
];

export default function AnalyticsTimeToolbar({
  activeFilter,
  onFilterChange,
  customFromDate = "",
  customToDate = "",
  onCustomFromDateChange,
  onCustomToDateChange,
  onExport,
  exporting = false,
  showExport = true,
  filters = defaultFilters,
}: {
  activeFilter: AnalyticsTimeFilter;
  onFilterChange: (filter: AnalyticsTimeFilter) => void;
  customFromDate?: string;
  customToDate?: string;
  onCustomFromDateChange?: (value: string) => void;
  onCustomToDateChange?: (value: string) => void;
  onExport?: () => void;
  exporting?: boolean;
  showExport?: boolean;
  filters?: AnalyticsTimeFilter[];
}) {
  const showCustomPickers =
    activeFilter === "Tùy chọn" && onCustomFromDateChange && onCustomToDateChange;

  return (
    <div className="flex flex-col items-stretch sm:items-end gap-2">
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
        <div className="flex flex-wrap items-center bg-white rounded-lg border border-gray-3 p-1">
          {filters.map((filter) => (
            <button
              key={filter}
              type="button"
              onClick={() => onFilterChange(filter)}
              className={`px-3 sm:px-4 py-1.5 rounded-md text-sm font-medium transition-all ${
                activeFilter === filter
                  ? "bg-[#1C274C] text-white shadow-sm"
                  : "text-[#6C6F93] hover:text-dark"
              }`}
            >
              {filter}
            </button>
          ))}
        </div>
        {showExport && onExport && (
          <button
            type="button"
            onClick={onExport}
            disabled={exporting}
            className="px-4 py-2 rounded-lg border border-gray-3 text-sm font-semibold text-dark hover:bg-[#F7F9FC] disabled:opacity-60 whitespace-nowrap"
          >
            {exporting ? "Đang export..." : "Export CSV"}
          </button>
        )}
      </div>

      {showCustomPickers && (
        <div className="flex flex-wrap items-center gap-2 bg-white rounded-lg border border-gray-3 px-3 py-2">
          <label className="flex items-center gap-2 text-sm text-[#6C6F93]">
            <span className="font-medium whitespace-nowrap">Từ ngày</span>
            <input
              type="date"
              value={customFromDate}
              max={customToDate || undefined}
              onChange={(e) => onCustomFromDateChange(e.target.value)}
              className="rounded-md border border-gray-3 px-2 py-1 text-sm text-dark focus:outline-none focus:ring-2 focus:ring-[#1C274C]/20"
            />
          </label>
          <span className="text-[#6C6F93] hidden sm:inline">→</span>
          <label className="flex items-center gap-2 text-sm text-[#6C6F93]">
            <span className="font-medium whitespace-nowrap">Đến ngày</span>
            <input
              type="date"
              value={customToDate}
              min={customFromDate || undefined}
              onChange={(e) => onCustomToDateChange(e.target.value)}
              className="rounded-md border border-gray-3 px-2 py-1 text-sm text-dark focus:outline-none focus:ring-2 focus:ring-[#1C274C]/20"
            />
          </label>
        </div>
      )}
    </div>
  );
}
