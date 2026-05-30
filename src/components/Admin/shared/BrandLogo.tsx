"use client";

import Image from "next/image";
import Link from "next/link";
import { BRAND } from "@/config/brand";

type BrandLogoProps = {
  collapsed?: boolean;
  subtitle?: string;
  href?: string;
};

/** Logo thương hiệu admin — icon + tên Bảo Khang Gadget. */
export default function BrandLogo({
  collapsed = false,
  subtitle,
  href = "/admin",
}: BrandLogoProps) {
  return (
    <Link
      href={href}
      className={`flex items-center gap-3 min-w-0 group ${collapsed ? "justify-center" : ""}`}
      title={collapsed ? BRAND.name : undefined}
    >
      <div className="relative w-11 h-11 rounded-xl overflow-hidden flex-shrink-0 shadow-lg shadow-[#3C50E0]/25 ring-1 ring-white/10 group-hover:ring-white/25 transition-all">
        <Image
          src={BRAND.logoMark}
          alt={BRAND.name}
          width={44}
          height={44}
          className="w-full h-full object-cover"
          priority
        />
      </div>
      {!collapsed && (
        <div className="overflow-hidden min-w-0">
          <h2 className="text-white font-bold text-base leading-tight truncate">{BRAND.name}</h2>
          <p className="text-[#8D93A5] text-xs truncate mt-0.5">
            {subtitle ?? BRAND.tagline}
          </p>
        </div>
      )}
    </Link>
  );
}
