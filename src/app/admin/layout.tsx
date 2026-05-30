import type { Metadata } from "next";
import { BRAND, brandPageTitle } from "@/config/brand";
import AdminLayoutClient from "./AdminLayoutClient";

export const metadata: Metadata = {
  title: {
    default: brandPageTitle("Quản trị"),
    template: `%s | ${BRAND.name}`,
  },
  description: `${BRAND.name} — Bảng điều khiển quản trị cửa hàng`,
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AdminLayoutClient>{children}</AdminLayoutClient>;
}
