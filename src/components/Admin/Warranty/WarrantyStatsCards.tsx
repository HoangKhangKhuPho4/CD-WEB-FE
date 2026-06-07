export interface WarrantyStats {
  total: number;
  pending: number;
  inProgress: number;
  completed: number;
  cancelled: number;
  returned: number;
  filteredTotal: number;
}

export default function WarrantyStatsCards({
  stats,
  loading = false,
}: {
  stats: WarrantyStats;
  loading?: boolean;
}) {
  const cards = [
    {
      label: "Tổng phiếu hệ thống",
      value: stats.total,
      trend: `${stats.filteredTotal} theo bộ lọc hiện tại`,
      iconBg: "bg-[#3C50E0]/10",
      iconColor: "#3C50E0",
    },
    {
      label: "Đang xử lý",
      value: stats.pending + stats.inProgress,
      trend: `Chờ: ${stats.pending} · Sửa: ${stats.inProgress}`,
      iconBg: "bg-[#F3E8FF]",
      iconColor: "#9333EA",
    },
    {
      label: "Hoàn tất sửa chữa",
      value: stats.completed,
      trend: "Chờ khách nhận máy",
      iconBg: "bg-green-light-6",
      iconColor: "#22AD5C",
    },
    {
      label: "Đã đóng",
      value: stats.returned + stats.cancelled,
      trend: `Trả: ${stats.returned} · Hủy: ${stats.cancelled}`,
      iconBg: "bg-red-light-6",
      iconColor: "#F23030",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
      {cards.map((stat) => (
        <div
          key={stat.label}
          className="bg-white rounded-xl p-5 border border-gray-3/50 hover:shadow-2 transition-all"
        >
          <div className={`w-11 h-11 rounded-xl ${stat.iconBg} flex items-center justify-center mb-3`}>
            <svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M11 3L4.5 6V10C4.5 14 7.5 17.5 11 19C14.5 17.5 17.5 14 17.5 10V6L11 3Z"
                stroke={stat.iconColor}
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <p className="text-xs text-[#8D93A5] mb-1">{stat.label}</p>
          <p className="text-2xl font-bold text-dark mb-1">
            {loading ? "…" : stat.value}
          </p>
          <p className="text-xs font-medium text-[#8D93A5]">{stat.trend}</p>
        </div>
      ))}
    </div>
  );
}
