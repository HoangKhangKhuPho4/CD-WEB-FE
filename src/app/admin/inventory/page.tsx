"use client";

import StockManagement from "@/components/Admin/Inventory/StockManagement";
import CouponManagement from "@/components/Admin/Inventory/CouponManagement";
import ProductAttributes from "@/components/Admin/Inventory/ProductAttributes";
import BrandGrid from "@/components/Admin/Producers/BrandGrid";
import AdminCatalogSubNav from "@/components/Admin/AdminCatalogSubNav";
import { useAppSelector } from "@/redux/store";
import { canManageCoupons, canManageProducers } from "@/utils/catalogPermissions";
import { useEffect, useState } from "react";

type InventoryTab = "stock" | "coupons" | "brands";

export default function InventoryPage() {
  const user = useAppSelector((s) => s.authReducer.user);
  const showCouponsTab = canManageCoupons(user);
  const showBrandsTab = canManageProducers(user);
  const showExtraTabs = showCouponsTab || showBrandsTab;
  const [activeMainTab, setActiveMainTab] = useState<InventoryTab>("stock");

  useEffect(() => {
    if (activeMainTab === "coupons" && !showCouponsTab) {
      setActiveMainTab(showBrandsTab ? "brands" : "stock");
    }
    if (activeMainTab === "brands" && !showBrandsTab) {
      setActiveMainTab(showCouponsTab ? "coupons" : "stock");
    }
  }, [showCouponsTab, showBrandsTab, activeMainTab]);

  const tabClass = (tab: InventoryTab) =>
    `px-4 py-2 rounded-md text-sm font-semibold transition-all ${
      activeMainTab === tab
        ? "bg-[#3C50E0] text-white shadow-md"
        : "text-[#6C6F93] hover:text-dark hover:bg-gray-1"
    }`;

  return (
    <div className="space-y-6">
      <AdminCatalogSubNav />

      {showExtraTabs && (
        <div className="flex flex-wrap bg-white rounded-lg p-1 w-fit border border-gray-3/50 shadow-sm gap-1">
          <button type="button" onClick={() => setActiveMainTab("stock")} className={tabClass("stock")}>
            Quản lý Kho
          </button>
          {showCouponsTab && (
            <button
              type="button"
              onClick={() => setActiveMainTab("coupons")}
              className={tabClass("coupons")}
            >
              Khuyến mãi & Thuộc tính
            </button>
          )}
          {showBrandsTab && (
            <button type="button" onClick={() => setActiveMainTab("brands")} className={tabClass("brands")}>
              Thương hiệu
            </button>
          )}
        </div>
      )}

      {activeMainTab === "stock" && <StockManagement />}

      {activeMainTab === "coupons" && showCouponsTab && (
        <div className="space-y-6 animate-fadeIn">
          <div>
            <h1 className="text-2xl font-bold text-dark">Khuyến mãi & Thuộc tính</h1>
            <p className="text-sm text-[#6C6F93] mt-1">
              Quản lý mã giảm giá và thuộc tính sản phẩm.
            </p>
          </div>
          <CouponManagement />
          <ProductAttributes />
        </div>
      )}

      {activeMainTab === "brands" && showBrandsTab && (
        <div className="space-y-6 animate-fadeIn">
          <div>
            <h1 className="text-2xl font-bold text-dark">Thương hiệu</h1>
            <p className="text-sm text-[#6C6F93] mt-1">
              Quản lý nhà sản xuất — đồng bộ với{" "}
              <a href="/admin/producers" className="text-[#3C50E0] hover:underline">
                /admin/producers
              </a>
            </p>
          </div>
          <BrandGrid />
        </div>
      )}
    </div>
  );
}
