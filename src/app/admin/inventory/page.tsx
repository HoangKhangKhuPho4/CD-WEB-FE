"use client";
import StockManagement from "@/components/Admin/Inventory/StockManagement";
import CouponManagement from "@/components/Admin/Inventory/CouponManagement";
import ProductAttributes from "@/components/Admin/Inventory/ProductAttributes";
import AdminCatalogSubNav from "@/components/Admin/AdminCatalogSubNav";
import { useAppSelector } from "@/redux/store";
import { canManageCoupons } from "@/utils/catalogPermissions";
import { useEffect, useState } from "react";

export default function InventoryPage() {
  const user = useAppSelector((s) => s.authReducer.user);
  const showCouponsTab = canManageCoupons(user);
  const [activeMainTab, setActiveMainTab] = useState<"stock" | "coupons">("stock");

  useEffect(() => {
    if (!showCouponsTab && activeMainTab === "coupons") {
      setActiveMainTab("stock");
    }
  }, [showCouponsTab, activeMainTab]);

  return (
    <div className="space-y-6">
      <AdminCatalogSubNav />
      {showCouponsTab && (
        <div className="flex bg-white rounded-lg p-1 w-fit border border-gray-3/50 shadow-sm">
          <button
            onClick={() => setActiveMainTab("stock")}
            className={`px-4 py-2 rounded-md text-sm font-semibold transition-all ${
              activeMainTab === "stock"
                ? "bg-[#3C50E0] text-white shadow-md"
                : "text-[#6C6F93] hover:text-dark hover:bg-gray-1"
            }`}
          >
            Quản lý Kho
          </button>
          <button
            onClick={() => setActiveMainTab("coupons")}
            className={`px-4 py-2 rounded-md text-sm font-semibold transition-all ${
              activeMainTab === "coupons"
                ? "bg-[#3C50E0] text-white shadow-md"
                : "text-[#6C6F93] hover:text-dark hover:bg-gray-1"
            }`}
          >
            Khuyến mãi & Thuộc tính
          </button>
        </div>
      )}

      {activeMainTab === "stock" || !showCouponsTab ? (
        <StockManagement />
      ) : (
        <div className="space-y-6 animate-fadeIn">
          <div>
            <h1 className="text-2xl font-bold text-dark">Khuyến mãi & Thuộc tính</h1>
            <p className="text-sm text-[#6C6F93] mt-1">
              Quản lý mã giảm giá, thuộc tính sản phẩm và các dịch vụ khác.
            </p>
          </div>
          <CouponManagement />
          <ProductAttributes />
        </div>
      )}
    </div>
  );
}
