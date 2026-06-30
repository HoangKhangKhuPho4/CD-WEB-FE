"use client";

import { use } from "react";
import AdminProcurementSubNav from "@/components/Admin/AdminProcurementSubNav";
import PageHeader from "@/components/Admin/shared/PageHeader";
import PurchaseOrderReceivePanel from "@/components/Admin/Warehouse/PurchaseOrderReceivePanel";

export default function PurchaseOrderReceivePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const poId = Number(id);

  return (
    <div className="space-y-6">
      <AdminProcurementSubNav />
      <PageHeader
        title="Kiểm đếm & Nhập kho"
        subtitle="Quét IMEI/serial gắn PO — sinh LOT và cập nhật tồn kho"
      />
      {Number.isFinite(poId) && poId > 0 ? (
        <PurchaseOrderReceivePanel poId={poId} />
      ) : (
        <p className="text-sm text-red">Mã PO không hợp lệ</p>
      )}
    </div>
  );
}
