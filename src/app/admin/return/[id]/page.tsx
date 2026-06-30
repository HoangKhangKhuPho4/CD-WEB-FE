"use client";

import { useParams } from "next/navigation";
import AdminWarehouseSubNav from "@/components/Admin/AdminWarehouseSubNav";
import AdminCatalogSubNav from "@/components/Admin/AdminCatalogSubNav";
import ReturnInspectionProcessPanel from "@/components/Admin/Return/ReturnInspectionProcessPanel";
import { useAppSelector } from "@/redux/store";
import { isWarehouseOnlyUser } from "@/utils/rbac";

export default function AdminReturnProcessPage() {
  const params = useParams();
  const user = useAppSelector((s) => s.authReducer.user);
  const warehouseOnly = isWarehouseOnlyUser(user);
  const id = Number(params.id);

  if (!id || Number.isNaN(id)) {
    return <p className="text-sm text-red">Mã phiếu không hợp lệ</p>;
  }

  return (
    <div className="space-y-6">
      {warehouseOnly ? <AdminWarehouseSubNav /> : <AdminCatalogSubNav />}
      <ReturnInspectionProcessPanel sheetId={id} />
    </div>
  );
}
