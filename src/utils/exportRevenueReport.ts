import { adminStatisticsApi } from "@/utils/adminApi";
import type { AnalyticsDateRange } from "@/utils/analyticsDateRange";

export async function downloadRevenueReportCsv(dateRange: AnalyticsDateRange) {
  const res = await adminStatisticsApi.exportRevenueCsv({
    period: dateRange.chartPeriod,
    startDate: dateRange.fromDate,
    endDate: dateRange.toDate,
  });
  const url = URL.createObjectURL(res.data);
  const a = document.createElement("a");
  a.href = url;
  a.download = `revenue-report-${dateRange.fromDate}_${dateRange.toDate}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}
