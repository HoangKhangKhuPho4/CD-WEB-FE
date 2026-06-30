"use client";

import { useAppSelector } from "@/redux/store";
import { warehouseSubNavLinks } from "@/components/Admin/adminNavConfig";
import AdminSubNav from "@/components/Admin/AdminSubNav";

/** Sub-nav các trang nghiệp vụ kho. */
export default function AdminWarehouseSubNav() {
  const user = useAppSelector((s) => s.authReducer.user);
  return <AdminSubNav links={warehouseSubNavLinks(user)} />;
}
