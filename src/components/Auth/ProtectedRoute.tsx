"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import PreLoader from "@/components/Common/PreLoader";
import { hasAnyPermission, hasPermission } from "@/utils/rbac";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredAny?: string[];
  requiredPermission?: string;
}

export default function ProtectedRoute({
  children,
  requiredAny,
  requiredPermission,
}: ProtectedRouteProps) {
  const router = useRouter();
  const { isAuthenticated, user } = useSelector((state: RootState) => state.authReducer);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    // Đảm bảo code chỉ chạy trên client-side
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!isClient) return;

    // 1. Kiểm tra chưa đăng nhập -> Đẩy về trang đăng nhập
    if (!isAuthenticated) {
      router.push("/signin");
      return;
    }

    if (requiredPermission && !hasPermission(user, requiredPermission)) {
      router.push("/");
      return;
    }
    if (requiredAny?.length && !hasAnyPermission(user, requiredAny)) {
      router.push("/");
      return;
    }
  }, [isClient, isAuthenticated, router, requiredPermission, requiredAny, user]);

  // Trong lúc chờ check trên client, hiển thị Loading
  if (!isClient || !isAuthenticated) {
    return <PreLoader />;
  }

  return <>{children}</>;
}
