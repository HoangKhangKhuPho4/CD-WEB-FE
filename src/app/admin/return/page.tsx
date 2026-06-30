"use client";

import { useState } from "react";
import AdminCatalogSubNav from "@/components/Admin/AdminCatalogSubNav";
import AdminWarehouseSubNav from "@/components/Admin/AdminWarehouseSubNav";
import PageHeader from "@/components/Admin/shared/PageHeader";
import ReturnInspectionListPanel from "@/components/Admin/Return/ReturnInspectionListPanel";
import ReturnManagement from "@/components/Admin/Return/ReturnManagement";
import { useAppSelector } from "@/redux/store";
import {
  hasAnyPermission,
  hasPermission,
  isWarehouseOnlyUser,
  isWarehouseUser,
} from "@/utils/rbac";

export default function AdminReturnPage() {
  const user = useAppSelector((s) => s.authReducer.user);
  const warehouseOnly = isWarehouseOnlyUser(user);
  const canInspect = hasPermission(user, "STOCK_RETURN");
  const showRefundTab =
    hasAnyPermission(user, ["ORDER_MANAGE", "ROLE_ADMIN"]) && !warehouseOnly;

  const defaultTab = warehouseOnly || (isWarehouseUser(user) && !showRefundTab) ? "inspect" : "inspect";
  const [tab, setTab] = useState<"inspect" | "refund">(defaultTab);

  const showInspect = canInspect;
  const showBoth = showInspect && showRefundTab;

  return (
    <div className="space-y-6">
      {warehouseOnly ? <AdminWarehouseSubNav /> : <AdminCatalogSubNav />}
      <PageHeader
        title="Xử lý hàng hoàn trả"
        subtitle={
          showBoth
            ? "Kiểm định chất lượng kho & quản lý hoàn tiền"
            : showInspect
              ? "Trạm kiểm định QC — phân luồng hàng nguyên vẹn / hàng lỗi"
              : "Xử lý yêu cầu hoàn trả và hoàn tiền"
        }
      />

      {showBoth && (
        <div className="flex gap-2 p-1 bg-white rounded-lg border border-gray-3/50 w-fit">
          <button
            type="button"
            onClick={() => setTab("inspect")}
            className={`px-4 py-2 text-sm font-semibold rounded-md ${
              tab === "inspect" ? "bg-[#DC2626] text-white" : "text-[#6C6F93]"
            }`}
          >
            Kiểm định kho
          </button>
          <button
            type="button"
            onClick={() => setTab("refund")}
            className={`px-4 py-2 text-sm font-semibold rounded-md ${
              tab === "refund" ? "bg-[#3C50E0] text-white" : "text-[#6C6F93]"
            }`}
          >
            Hoàn tiền / Đơn trả
          </button>
        </div>
      )}

      {showInspect && (!showBoth || tab === "inspect") ? (
        <ReturnInspectionListPanel />
      ) : (
        <ReturnManagement />
      )}
    </div>
  );
}
