"use client";

import type { AnalyticsTimeFilter } from "@/utils/analyticsDateRange";

const defaultFilters: AnalyticsTimeFilter[] = ["7 ngày", "30 ngày", "Tháng này", "Năm nay"];

export default function AnalyticsTimeToolbar({
  activeFilter,
  onFilterChange,
  onExport,
  exporting = false,
  showExport = true,
  filters = defaultFilters,
}: {
  activeFilter: AnalyticsTimeFilter;
  onFilterChange: (filter: AnalyticsTimeFilter) => void;
  onExport?: () => void;
  exporting?: boolean;
  showExport?: boolean;
  filters?: AnalyticsTimeFilter[];
}) {
  return (
    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
      <div className="flex flex-wrap items-center bg-white rounded-lg border border-gray-3 p-1">
        {filters.map((filter) => (
          <button
            key={filter}
            type="button"
            onClick={() => onFilterChange(filter)}
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${
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
  );
}
