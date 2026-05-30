"use client";

import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useDispatch } from "react-redux";
import { useAppSelector } from "@/redux/store";
import { logout } from "@/redux/features/auth-slice";
import UserAvatar, { getStaffAvatarGradient } from "@/components/Admin/shared/UserAvatar";
import {
  getStaffRoleLabel,
  getUserDisplayName,
} from "@/utils/staffDisplay";

export default function AdminHeader() {
  const [searchQuery, setSearchQuery] = useState("");
  const pathname = usePathname();
  const router = useRouter();
  const dispatch = useDispatch();
  const user = useAppSelector((s) => s.authReducer.user);

  const displayName = getUserDisplayName(user);
  const roleLabel = getStaffRoleLabel(user);
  const avatarGradient = getStaffAvatarGradient(user);

  const searchPlaceholder =
    pathname?.startsWith("/admin/settings") || pathname?.startsWith("/admin/warranty")
      ? "Tìm kiếm hệ thống..."
      : "Tìm kiếm nhanh...";

  const handleLogout = () => {
    dispatch(logout());
    router.replace("/signin");
  };

  return (
    <header className="bg-white border-b border-gray-3 px-6 py-3 flex items-center justify-between flex-shrink-0">
      <div className="relative w-full max-w-[400px]">
        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8D93A5]">
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M8.25 14.25C11.5637 14.25 14.25 11.5637 14.25 8.25C14.25 4.93629 11.5637 2.25 8.25 2.25C4.93629 2.25 2.25 4.93629 2.25 8.25C2.25 11.5637 4.93629 14.25 8.25 14.25Z"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M15.75 15.75L12.4875 12.4875"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>
        <input
          type="search"
          placeholder={searchPlaceholder}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 bg-[#F7F9FC] border border-gray-3 rounded-lg text-sm text-dark placeholder:text-[#8D93A5] focus:outline-none focus:border-[#3C50E0] focus:ring-1 focus:ring-[#3C50E0]/20 transition-all"
        />
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        <button
          type="button"
          onClick={handleLogout}
          className="hidden sm:inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-[#6C6F93] hover:text-red rounded-lg hover:bg-red-light-6 transition-colors"
        >
          <svg width="16" height="16" viewBox="0 0 20 20" fill="none" aria-hidden>
            <path
              d="M7.5 17.5H4.16667C3.72464 17.5 3.30072 17.3244 2.98816 17.0118C2.6756 16.6993 2.5 16.2754 2.5 15.8333V4.16667C2.5 3.72464 2.6756 3.30072 2.98816 2.98816C3.30072 2.6756 3.72464 2.5 4.16667 2.5H7.5"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M13.3333 14.1667L17.5 10L13.3333 5.83334"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M17.5 10H7.5"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          Đăng xuất
        </button>

        <div className="flex items-center gap-3 pl-3 pr-2 py-1.5 rounded-xl border border-gray-3 bg-[#F7F9FC]/80">
          <div className="text-right hidden sm:block min-w-0 max-w-[160px]">
            <p className="text-sm font-semibold text-dark truncate">{displayName}</p>
            <p className="text-xs text-[#8D93A5] truncate">{roleLabel}</p>
          </div>
          <UserAvatar
            name={displayName}
            gradientClass={avatarGradient}
            size="md"
            showStatus
          />
        </div>
      </div>
    </header>
  );
}
