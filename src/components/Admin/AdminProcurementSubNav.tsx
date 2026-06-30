"use client";

import { useAppSelector } from "@/redux/store";
import { procurementSubNavLinks } from "@/components/Admin/adminNavConfig";
import AdminSubNav from "@/components/Admin/AdminSubNav";

/** Sub-nav Thu mua & PO — procurement, duyệt, đơn kho. */
export default function AdminProcurementSubNav() {
  const user = useAppSelector((s) => s.authReducer.user);
  return <AdminSubNav links={procurementSubNavLinks(user)} />;
}
