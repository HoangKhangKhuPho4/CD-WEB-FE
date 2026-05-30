import { useProducts } from "@/components/Admin/Products/productsStore";

export default function ProductStatsCards() {
  const { stats } = useProducts();

  const statsData = [
    {
      label: "Tổng SP",
      value: stats.total.toLocaleString("vi-VN"),
      iconBg: "bg-[#3C50E0]/10",
      icon: (
        <svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M7 7H15V15H7V7Z" stroke="#3C50E0" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M9 7V6C9 5.46957 9.21071 4.96086 9.58579 4.58579C9.96086 4.21071 10.4696 4 11 4C11.5304 4 12.0391 4.21071 12.4142 4.58579C12.7893 4.96086 13 5.46957 13 6V7" stroke="#3C50E0" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      ),
    },
    {
      label: "Đang bán",
      value: stats.selling.toLocaleString("vi-VN"),
      iconBg: "bg-green-light-6",
      icon: (
        <svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M11 15C13.2091 15 15 13.2091 15 11C15 8.79086 13.2091 7 11 7C8.79086 7 7 8.79086 7 11C7 13.2091 8.79086 15 11 15Z" stroke="#22AD5C" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M11 4V5" stroke="#22AD5C" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M11 17V18" stroke="#22AD5C" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M4 11H5" stroke="#22AD5C" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M17 11H18" stroke="#22AD5C" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      ),
    },
    {
      label: "Ngừng bán",
      value: stats.stopped.toLocaleString("vi-VN"),
      iconBg: "bg-[#FEF3C7]",
      icon: (
        <svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M11 7V11L14 13" stroke="#F59E0B" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M11 18C14.866 18 18 14.866 18 11C18 7.13401 14.866 4 11 4C7.13401 4 4 7.13401 4 11C4 14.866 7.13401 18 11 18Z" stroke="#F59E0B" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      ),
    },
    {
      label: "Hết hàng",
      value: stats.outOfStock.toLocaleString("vi-VN"),
      iconBg: "bg-red-light-6",
      icon: (
        <svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M11 7V11" stroke="#F23030" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M11 15H11.01" stroke="#F23030" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M11 18C14.866 18 18 14.866 18 11C18 7.13401 14.866 4 11 4C7.13401 4 4 7.13401 4 11C4 14.866 7.13401 18 11 18Z" stroke="#F23030" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      ),
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
      {statsData.map((stat) => (
        <div
          key={stat.label}
          className="bg-white rounded-xl p-5 border border-gray-3/50 flex items-center gap-4 hover:shadow-2 transition-all duration-300"
        >
          <div className={`w-12 h-12 rounded-xl ${stat.iconBg} flex items-center justify-center flex-shrink-0`}>
            {stat.icon}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs text-[#8D93A5] mb-0.5">{stat.label}</p>
            <p className="text-2xl font-bold text-dark">{stat.value}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
