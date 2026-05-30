"use client";

import ConfigurationPanel from "@/components/Admin/Settings/ConfigurationPanel";
import AdminSubNav from "@/components/Admin/AdminSubNav";
import { systemLinks } from "@/components/Admin/adminNavConfig";

export default function AdminSettingsPage() {
  return (
    <div className="space-y-6">
      <AdminSubNav links={systemLinks} />
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-dark">Quản lý &amp; Cấu hình</h1>
        <p className="text-sm text-[#6C6F93] mt-1">
          Thiết lập thông số vận hành, thanh toán và AI cho hệ thống.
        </p>
      </div>

      {/* Configuration tabs */}
      <ConfigurationPanel />
    </div>
  );
}
