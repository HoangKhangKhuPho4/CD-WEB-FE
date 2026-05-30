"use client";

import { useAppSelector } from "@/redux/store";
import { catalogSubNavLinks } from "@/components/Admin/adminNavConfig";
import AdminSubNav from "@/components/Admin/AdminSubNav";

/** Sub-nav Sản phẩm & Kho — menu gọn cho kho, đầy đủ cho admin. */
export default function AdminCatalogSubNav() {
  const user = useAppSelector((s) => s.authReducer.user);
  return <AdminSubNav links={catalogSubNavLinks(user)} />;
}
