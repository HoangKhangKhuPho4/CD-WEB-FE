"use client";

import { useState } from "react";
import AdminSubNav from "@/components/Admin/AdminSubNav";
import { systemLinks } from "@/components/Admin/adminNavConfig";
import PageHeader from "@/components/Admin/shared/PageHeader";
import StaffManagement from "@/components/Admin/Users/StaffManagement";
import RolePermissionsPanel from "@/components/Admin/Users/RolePermissionsPanel";
import { IconShieldKey, IconUsersTeam } from "@/components/Admin/icons/AdminIcons";

const tabs = [
  { id: "staff", label: "Nhân viên", Icon: IconUsersTeam },
  { id: "rbac", label: "Phân quyền vai trò", Icon: IconShieldKey },
] as const;

export default function AdminUsersPage() {
  const [tab, setTab] = useState<(typeof tabs)[number]["id"]>("staff");

  return (
    <div className="space-y-6">
      <AdminSubNav links={systemLinks} />
      <PageHeader
        title="Nhân viên & Phân quyền"
        subtitle="Quản lý tài khoản nhân viên và quyền truy cập hệ thống"
      />

      <div className="flex gap-1 p-1 bg-[#F7F9FC] rounded-xl border border-gray-3/40 w-fit max-w-full overflow-x-auto">
        {tabs.map((t) => {
          const active = tab === t.id;
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              className={`inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold rounded-lg transition-all whitespace-nowrap ${
                active
                  ? "bg-white text-[#3C50E0] shadow-sm border border-gray-3/30"
                  : "text-[#8D93A5] hover:text-dark hover:bg-white/60"
              }`}
            >
              <t.Icon size={16} className={active ? "text-[#3C50E0]" : "text-[#8D93A5]"} />
              {t.label}
            </button>
          );
        })}
      </div>

      {tab === "staff" ? <StaffManagement /> : <RolePermissionsPanel />}
    </div>
  );
}
