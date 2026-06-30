"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import type { RootState } from "@/redux/store";
import { hasAnyPermission, isAdminUser, isWarehouseOnlyUser } from "@/utils/rbac";
import {
  permissionsForAdminPath,
  WAREHOUSE_EXCLUDED_PATHS,
} from "@/components/Admin/adminRoutePermissions";

export default function AdminRouteGuard({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const user = useSelector((s: RootState) => s.authReducer.user);

  useEffect(() => {
    if (!user || !pathname?.startsWith("/admin")) return;
    if (isAdminUser(user)) return;

    const warehouseOnly = isWarehouseOnlyUser(user);

    if (warehouseOnly) {
      const blocked = WAREHOUSE_EXCLUDED_PATHS.some(
        (p) => pathname === p || pathname.startsWith(`${p}/`)
      );
      if (blocked) {
        router.replace("/admin/warehouse-fulfillment");
        return;
      }
    }

    const required = permissionsForAdminPath(pathname);
    if (required === null) return;
    if (required.length === 0) return;

    if (!hasAnyPermission(user, required)) {
      router.replace(warehouseOnly ? "/admin/warehouse-fulfillment" : "/admin");
    }
  }, [pathname, user, router]);

  return <>{children}</>;
}
