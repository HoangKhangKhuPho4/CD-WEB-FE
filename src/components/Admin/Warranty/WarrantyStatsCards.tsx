export interface WarrantyStats {
  filteredTotal: number;
  processing: number;
  completed: number;
  closed: number;
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
      label: "Tổng phiếu (bộ lọc hiện tại)",
      value: stats.filteredTotal,
      trend: "Theo tìm kiếm & trạng thái",
      iconBg: "bg-[#3C50E0]/10",
      iconColor: "#3C50E0",
    },
    {
      label: "Đang xử lý",
      value: stats.processing,
      trend: "PENDING + IN_PROGRESS",
      iconBg: "bg-[#F3E8FF]",
      iconColor: "#9333EA",
    },
    {
      label: "Hoàn tất",
      value: stats.completed,
      trend: "COMPLETED",
      iconBg: "bg-green-light-6",
      iconColor: "#22AD5C",
    },
    {
      label: "Đã đóng",
      value: stats.closed,
      trend: "RETURNED + CANCELLED",
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
