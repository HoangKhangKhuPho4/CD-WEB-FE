"use client";

import AdminSidebar from "@/components/Admin/Sidebar";
import AdminHeader from "@/components/Admin/Header";
import AdminAuthGuard from "@/components/Admin/AdminAuthGuard";
import AdminRouteGuard from "@/components/Admin/AdminRouteGuard";
import AuthUserSync from "@/components/Auth/AuthUserSync";
import { ReduxProvider } from "@/redux/provider";
import { Toaster } from "react-hot-toast";

export default function AdminLayoutClient({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ReduxProvider>
      <AdminAuthGuard>
        <AuthUserSync />
        <AdminRouteGuard>
          <div className="flex h-screen bg-[#F3F4F6] overflow-hidden font-euclid-circular-a">
            <AdminSidebar />
            <div className="flex-1 flex flex-col overflow-hidden">
              <AdminHeader />
              <main className="flex-1 overflow-y-auto p-6">{children}</main>
            </div>
          </div>
          <Toaster position="top-center" />
        </AdminRouteGuard>
      </AdminAuthGuard>
    </ReduxProvider>
  );
}
