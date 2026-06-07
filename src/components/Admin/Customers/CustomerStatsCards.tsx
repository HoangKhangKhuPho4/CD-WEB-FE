"use client";

import { IconCheckCircle, IconUsersTeam } from "@/components/Admin/icons/AdminIcons";

export default function CustomerStatsCards({
  total,
  activeOnPage,
  customerAccounts,
  topSegment,
}: {
  total: number;
  activeOnPage: number;
  customerAccounts?: number;
  topSegment?: string;
}) {
  const cards = [
    {
      label: "Tổng khách (trang hiện tại)",
      value: total,
      sub: "Kết quả lọc đang xem",
      gradient: "from-[#3C50E0] to-[#1C3FB7]",
      Icon: IconUsersTeam,
    },
    {
      label: "Đang hoạt động",
      value: activeOnPage,
      sub: "Trên trang này",
      gradient: "from-emerald-500 to-teal-600",
      Icon: IconCheckCircle,
    },
    {
      label: "Tài khoản KH (hệ thống)",
      value: customerAccounts ?? "—",
      sub: "Từ thống kê staff",
      gradient: "from-violet-500 to-purple-600",
      Icon: IconUsersTeam,
    },
    {
      label: "Phân khúc nổi bật",
      value: topSegment ?? "—",
      sub: "Sở thích mua hàng",
      gradient: "from-amber-500 to-orange-500",
      Icon: IconUsersTeam,
      isText: true,
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {cards.map((c) => {
        const { Icon } = c;
        return (
          <div
            key={c.label}
            className="bg-white rounded-xl border border-gray-3/50 p-4 flex items-center gap-3"
          >
            <div
              className={`w-10 h-10 rounded-xl bg-gradient-to-br ${c.gradient} text-white flex items-center justify-center shadow-sm shrink-0`}
            >
              <Icon size={18} />
            </div>
            <div className="min-w-0">
              <p className="text-xs text-[#8D93A5] font-medium truncate">{c.label}</p>
              <p
                className={`font-bold text-dark truncate ${
                  c.isText ? "text-sm" : "text-xl"
                }`}
              >
                {c.value}
              </p>
              <p className="text-[10px] text-[#8D93A5] truncate">{c.sub}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
