"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import PreLoader from "@/components/Common/PreLoader";

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

    // 2. (Tùy chọn) Kiểm tra Role/Quyền của User nếu có yêu cầu
    // Giả sử user có thuộc tính user.role hoặc user.permissions
    /*
    if (requiredPermission && user?.role !== requiredPermission) {
      router.push("/403");
    }
    */
  }, [isClient, isAuthenticated, router, requiredPermission, user]);

  // Trong lúc chờ check trên client, hiển thị Loading
  if (!isClient || !isAuthenticated) {
    return <PreLoader />;
  }

  return <>{children}</>;
}
