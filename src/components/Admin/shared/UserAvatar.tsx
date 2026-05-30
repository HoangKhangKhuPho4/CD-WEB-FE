"use client";

import {
  getStaffAvatarGradient,
  getUserInitials,
} from "@/utils/staffDisplay";

type UserAvatarProps = {
  name: string;
  gradientClass?: string;
  size?: "sm" | "md" | "lg";
  showStatus?: boolean;
};

const sizeClasses = {
  sm: "w-8 h-8 text-[10px] ring-1",
  md: "w-10 h-10 text-xs ring-2",
  lg: "w-12 h-12 text-sm ring-2",
};

/** Avatar nhân viên — gradient theo vai trò, chữ cái 2 ký tự. */
export default function UserAvatar({
  name,
  gradientClass = "from-[#3C50E0] to-[#5475E5]",
  size = "md",
  showStatus = false,
}: UserAvatarProps) {
  const initials = getUserInitials(name);

  return (
    <div className="relative flex-shrink-0">
      <div
        className={`${sizeClasses[size]} rounded-full bg-gradient-to-br ${gradientClass} flex items-center justify-center text-white font-bold ring-white shadow-sm`}
        aria-hidden
      >
        {initials}
      </div>
      {showStatus && (
        <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-green border-2 border-white" />
      )}
    </div>
  );
}

export { getStaffAvatarGradient };
