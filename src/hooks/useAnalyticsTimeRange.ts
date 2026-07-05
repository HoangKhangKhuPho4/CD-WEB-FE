"use client";

import { useCallback, useMemo, useState } from "react";
import {
  defaultCustomRange,
  resolveAnalyticsDateRange,
  type AnalyticsTimeFilter,
} from "@/utils/analyticsDateRange";

const PRESET_FILTERS: AnalyticsTimeFilter[] = [
  "7 ngày",
  "30 ngày",
  "Tháng này",
  "Năm nay",
  "Tùy chọn",
];

export function useAnalyticsTimeRange(
  initialFilter: AnalyticsTimeFilter = "30 ngày",
  filters: AnalyticsTimeFilter[] = PRESET_FILTERS,
) {
  const [activeFilter, setActiveFilter] = useState<AnalyticsTimeFilter>(initialFilter);
  const [customFromDate, setCustomFromDate] = useState("");
  const [customToDate, setCustomToDate] = useState("");

  const dateRange = useMemo(
    () =>
      resolveAnalyticsDateRange(activeFilter, {
        fromDate: customFromDate,
        toDate: customToDate,
      }),
    [activeFilter, customFromDate, customToDate],
  );

  const handleFilterChange = useCallback((filter: AnalyticsTimeFilter) => {
    setActiveFilter(filter);
    if (filter === "Tùy chọn") {
      const fallback = defaultCustomRange();
      setCustomFromDate((prev) => prev || fallback.fromDate);
      setCustomToDate((prev) => prev || fallback.toDate);
    }
  }, []);

  return {
    activeFilter,
    customFromDate,
    customToDate,
    setCustomFromDate,
    setCustomToDate,
    dateRange,
    handleFilterChange,
    filters,
  };
}
