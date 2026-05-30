"use client";

import AdminSubNav from "@/components/Admin/AdminSubNav";
import { warrantyTicketLinks } from "@/components/Admin/adminNavConfig";

/** Sub-nav trang quản lý phiếu bảo hành (staff). */
export default function AdminWarrantySubNav() {
  return <AdminSubNav links={warrantyTicketLinks} />;
}
