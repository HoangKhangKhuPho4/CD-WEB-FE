"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import PrimaryButton from "@/components/Admin/shared/PrimaryButton";
import {
  getPermissionGroupIcon,
  getStaffRoleVisual,
  IconSave,
  IconShieldKey,
} from "@/components/Admin/icons/AdminIcons";
import { rbacApi } from "@/utils/adminApi";
import { permissionGroupLabel, staffRoleDisplayName } from "@/utils/roleDisplayLabels";
import type { PermissionItem, RoleDetail } from "@/types/rbac";

const STAFF_ROLES = new Set(["ADMIN", "WAREHOUSE", "SALES", "ROLE_ADMIN"]);

function groupPermissions(items: PermissionItem[]) {
  const groups = new Map<string, PermissionItem[]>();
  for (const p of items) {
    const prefix = p.code.includes("_") ? p.code.split("_")[0] : "OTHER";
    const list = groups.get(prefix) ?? [];
    list.push(p);
    groups.set(prefix, list);
  }
  return Array.from(groups.entries()).sort(([a], [b]) => a.localeCompare(b));
}

export default function RolePermissionsPanel() {
  const [roles, setRoles] = useState<RoleDetail[]>([]);
  const [permissions, setPermissions] = useState<PermissionItem[]>([]);
  const [selectedRoleId, setSelectedRoleId] = useState<number | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const staffRoles = useMemo(
    () => roles.filter((r) => STAFF_ROLES.has((r.name ?? "").toUpperCase())),
    [roles]
  );

  const selectedRole = staffRoles.find((r) => r.id === selectedRoleId) ?? null;
  const selectedVisual = getStaffRoleVisual(selectedRole?.name);
  const SelectedRoleIcon = selectedVisual.Icon;

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [roleList, permList] = await Promise.all([
        rbacApi.listRoles(),
        rbacApi.listPermissions(),
      ]);
      setRoles(roleList ?? []);
      setPermissions(permList ?? []);
      const staff = (roleList ?? []).filter((r) =>
        STAFF_ROLES.has((r.name ?? "").toUpperCase())
      );
      if (staff.length) {
        setSelectedRoleId((prev) => prev ?? staff[0].id);
      }
    } catch {
      toast.error("Không tải được dữ liệu phân quyền");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    if (!selectedRole) return;
    const ids =
      selectedRole.permissionIds ??
      selectedRole.permissions?.map((p) => p.id) ??
      [];
    setSelectedIds(new Set(ids));
  }, [selectedRole]);

  const togglePerm = (id: number) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleGroup = (items: PermissionItem[], checked: boolean) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      for (const p of items) {
        if (checked) next.add(p.id);
        else next.delete(p.id);
      }
      return next;
    });
  };

  const save = async () => {
    if (!selectedRoleId) return;
    if ((selectedRole?.name ?? "").toUpperCase() === "CUSTOMER") {
      toast.error("Không thể sửa quyền vai trò khách hàng");
      return;
    }
    setSaving(true);
    try {
      const updated = await rbacApi.updateRolePermissions(
        selectedRoleId,
        Array.from(selectedIds)
      );
      setRoles((prev) => prev.map((r) => (r.id === updated.id ? { ...r, ...updated } : r)));
      toast.success("Đã cập nhật quyền cho vai trò");
    } catch {
      toast.error("Lưu phân quyền thất bại");
    } finally {
      setSaving(false);
    }
  };

  const groups = groupPermissions(permissions);

  if (loading) {
    return (
      <div className="flex items-center gap-3 py-8 text-sm text-[#8D93A5]">
        <span className="inline-block w-5 h-5 border-2 border-[#3C50E0]/30 border-t-[#3C50E0] rounded-full animate-spin" />
        Đang tải phân quyền...
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-gray-3/50 overflow-hidden">
      <div className="p-4 sm:p-5 border-b border-gray-3/50 bg-[#F7F9FC]/40">
        <div className="flex flex-col lg:flex-row lg:items-center gap-4 justify-between">
          <div className="flex items-start gap-3">
            <div
              className={`w-11 h-11 rounded-xl bg-gradient-to-br ${selectedVisual.gradient} text-white flex items-center justify-center shadow-sm shrink-0`}
            >
              <SelectedRoleIcon size={20} />
            </div>
            <div>
              <p className="text-sm font-bold text-dark">Chọn vai trò</p>
              <p className="text-xs text-[#8D93A5] mt-0.5">
                {selectedIds.size} / {permissions.length} quyền đang bật
              </p>
            </div>
          </div>
          <PrimaryButton onClick={() => void save()} disabled={saving || !selectedRoleId}>
            <IconSave size={16} />
            {saving ? "Đang lưu..." : "Lưu quyền"}
          </PrimaryButton>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mt-4">
          {staffRoles.map((r) => {
            const visual = getStaffRoleVisual(r.name);
            const { Icon } = visual;
            const selected = selectedRoleId === r.id;
            const permCount =
              r.permissionIds?.length ?? r.permissions?.length ?? 0;
            return (
              <button
                key={r.id}
                type="button"
                onClick={() => setSelectedRoleId(r.id)}
                className={`flex items-center gap-3 p-3 rounded-xl border text-left transition-all ${
                  selected
                    ? "border-[#3C50E0] bg-white shadow-sm ring-2 ring-[#3C50E0]/15"
                    : "border-gray-3/50 bg-white/60 hover:border-[#3C50E0]/30 hover:bg-white"
                }`}
              >
                <div
                  className={`w-10 h-10 rounded-xl bg-gradient-to-br ${visual.gradient} text-white flex items-center justify-center shrink-0`}
                >
                  <Icon size={18} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-dark truncate">
                    {staffRoleDisplayName(r.name)}
                  </p>
                  <p className="text-xs text-[#8D93A5]">{permCount} quyền</p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <div className="p-4 sm:p-5 max-h-[520px] overflow-y-auto space-y-6">
        {groups.map(([group, items]) => {
          const GroupIcon = getPermissionGroupIcon(group);
          const checkedCount = items.filter((p) => selectedIds.has(p.id)).length;
          const allChecked = checkedCount === items.length;
          const someChecked = checkedCount > 0 && !allChecked;
          return (
            <div key={group}>
              <div className="flex items-center justify-between gap-3 mb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-[#EEF2FF] text-[#3C50E0] flex items-center justify-center">
                    <GroupIcon size={16} />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-dark">
                      {permissionGroupLabel(group)}
                    </p>
                    <p className="text-xs text-[#8D93A5]">
                      {checkedCount}/{items.length} quyền
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => toggleGroup(items, !allChecked)}
                  className="text-xs font-semibold text-[#3C50E0] hover:text-[#1C3FB7] transition-colors"
                >
                  {allChecked ? "Bỏ chọn nhóm" : someChecked ? "Chọn hết nhóm" : "Chọn hết nhóm"}
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {items.map((p) => {
                  const checked = selectedIds.has(p.id);
                  return (
                    <label
                      key={p.id}
                      className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                        checked
                          ? "border-[#3C50E0]/30 bg-[#EEF2FF]/50"
                          : "border-gray-3/40 hover:bg-[#F7F9FC] hover:border-gray-3"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => togglePerm(p.id)}
                        className="mt-0.5 accent-[#3C50E0]"
                      />
                      <span className="text-sm min-w-0">
                        <span className="font-medium text-dark block">{p.name || p.code}</span>
                        <span className="text-xs text-[#8D93A5] font-mono">{p.code}</span>
                      </span>
                    </label>
                  );
                })}
              </div>
            </div>
          );
        })}

        {groups.length === 0 && (
          <div className="flex flex-col items-center gap-3 py-10 text-[#8D93A5]">
            <div className="w-14 h-14 rounded-2xl bg-[#F7F9FC] flex items-center justify-center text-[#3C50E0]">
              <IconShieldKey size={28} />
            </div>
            <p className="text-sm">Không có dữ liệu quyền hệ thống.</p>
          </div>
        )}
      </div>
    </div>
  );
}
