"use client";

import { useAppSelector } from "@/redux/store";
import { warehouseWarrantyLinks } from "@/components/Admin/adminNavConfig";
import AdminSubNav from "@/components/Admin/AdminSubNav";

/** Sub-nav bảo hành — gồm tiếp nhận kho + quản lý phiếu. */
export default function AdminWarrantySubNav() {
  const user = useAppSelector((s) => s.authReducer.user);
  return <AdminSubNav links={warehouseWarrantyLinks} />;
}
