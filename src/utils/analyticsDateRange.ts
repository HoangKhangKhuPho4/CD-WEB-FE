export type AnalyticsTimeFilter =
  | "7 ngày"
  | "30 ngày"
  | "Tháng này"
  | "Năm nay"
  | "Tùy chọn";

export interface AnalyticsDateRange {
  fromDate: string;
  toDate: string;
  chartPeriod: "day" | "month" | "year";
}

export interface CustomAnalyticsRange {
  fromDate: string;
  toDate: string;
}

function pad(n: number) {
  return String(n).padStart(2, "0");
}

export function formatIsoDate(d: Date): string {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

/** Chọn period biểu đồ theo độ dài khoảng ngày tùy chọn. */
export function chartPeriodForRange(fromDate: string, toDate: string): "day" | "month" | "year" {
  const from = new Date(`${fromDate}T00:00:00`);
  const to = new Date(`${toDate}T00:00:00`);
  if (Number.isNaN(from.getTime()) || Number.isNaN(to.getTime())) {
    return "day";
  }
  const days = Math.round((to.getTime() - from.getTime()) / 86_400_000) + 1;
  if (days <= 62) return "day";
  if (days <= 366) return "month";
  return "year";
}

/** Chuẩn hóa from ≤ to; bỏ qua nếu thiếu/không hợp lệ. */
export function normalizeCustomRange(
  fromDate?: string,
  toDate?: string,
): CustomAnalyticsRange | null {
  if (!fromDate?.trim() || !toDate?.trim()) return null;
  const from = fromDate.trim();
  const to = toDate.trim();
  if (Number.isNaN(Date.parse(`${from}T00:00:00`)) || Number.isNaN(Date.parse(`${to}T00:00:00`))) {
    return null;
  }
  if (from <= to) return { fromDate: from, toDate: to };
  return { fromDate: to, toDate: from };
}

export function resolveAnalyticsDateRange(
  filter: AnalyticsTimeFilter,
  custom?: Partial<CustomAnalyticsRange> | null,
): AnalyticsDateRange {
  if (filter === "Tùy chọn") {
    const normalized = normalizeCustomRange(custom?.fromDate, custom?.toDate);
    if (normalized) {
      return {
        fromDate: normalized.fromDate,
        toDate: normalized.toDate,
        chartPeriod: chartPeriodForRange(normalized.fromDate, normalized.toDate),
      };
    }
    // Chưa chọn đủ ngày → mặc định 30 ngày gần nhất
    return resolveAnalyticsDateRange("30 ngày");
  }

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

/** Giá trị khởi tạo khi admin bấm "Tùy chọn". */
export function defaultCustomRange(): CustomAnalyticsRange {
  const preset = resolveAnalyticsDateRange("30 ngày");
  return { fromDate: preset.fromDate, toDate: preset.toDate };
}
