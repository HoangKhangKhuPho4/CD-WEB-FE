"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import type { RootState } from "@/redux/store";
import { hasAnyPermission, isAdminUser } from "@/utils/rbac";
import { permissionsForAdminPath } from "@/components/Admin/adminRoutePermissions";

export default function AdminRouteGuard({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const user = useSelector((s: RootState) => s.authReducer.user);

  useEffect(() => {
    if (!user || !pathname?.startsWith("/admin")) return;
    if (isAdminUser(user)) return;

    const required = permissionsForAdminPath(pathname);
    if (required === null) return;
    if (required.length === 0) return;

    if (!hasAnyPermission(user, required)) {
      router.replace("/admin");
    }
  }, [pathname, user, router]);

  return <>{children}</>;
}
