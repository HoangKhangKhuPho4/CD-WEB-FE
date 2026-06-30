"use client";

import AdminCatalogSubNav from "@/components/Admin/AdminCatalogSubNav";
import AdminWarehouseSubNav from "@/components/Admin/AdminWarehouseSubNav";
import PageHeader from "@/components/Admin/shared/PageHeader";
import ImeiManagement from "@/components/Admin/Imei/ImeiManagement";
import ImeiWarehousePanel from "@/components/Admin/Imei/ImeiWarehousePanel";
import { useAppSelector } from "@/redux/store";
import { isWarehouseOnlyUser, warehousePoRequired } from "@/utils/rbac";

export default function AdminImeiPage() {
  const user = useAppSelector((s) => s.authReducer.user);
  const warehouseOnly = isWarehouseOnlyUser(user);
  const poRequired = warehousePoRequired(user);

  return (
    <div className="space-y-6">
      {warehouseOnly ? <AdminWarehouseSubNav /> : <AdminCatalogSubNav />}
      {!poRequired && (
        <PageHeader
          title="Quản lý IMEI / Serial"
          subtitle="Theo dõi mã thiết bị từ nhập kho đến bán hàng và bảo hành"
        />
      )}
      {poRequired ? <ImeiWarehousePanel /> : <ImeiManagement />}
    </div>
  );
}
