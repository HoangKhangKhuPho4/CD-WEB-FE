export type AnalyticsTimeFilter = "7 ngày" | "30 ngày" | "Tháng này" | "Năm nay";

export interface AnalyticsDateRange {
  fromDate: string;
  toDate: string;
  chartPeriod: "day" | "month" | "year";
}

function pad(n: number) {
  return String(n).padStart(2, "0");
}

export function formatIsoDate(d: Date): string {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export function resolveAnalyticsDateRange(filter: AnalyticsTimeFilter): AnalyticsDateRange {
  const today = new Date();
  const toDate = formatIsoDate(today);

  if (filter === "7 ngày") {
    const from = new Date(today);
    from.setDate(from.getDate() - 6);
    return { fromDate: formatIsoDate(from), toDate, chartPeriod: "day" };
  }

  if (filter === "30 ngày") {
    const from = new Date(today);
    from.setDate(from.getDate() - 29);
    return { fromDate: formatIsoDate(from), toDate, chartPeriod: "day" };
  }

  if (filter === "Tháng này") {
    const from = new Date(today.getFullYear(), today.getMonth(), 1);
    return { fromDate: formatIsoDate(from), toDate, chartPeriod: "day" };
  }

  const from = new Date(today.getFullYear(), 0, 1);
  return { fromDate: formatIsoDate(from), toDate, chartPeriod: "month" };
}
