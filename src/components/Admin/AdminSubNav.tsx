"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAppSelector } from "@/redux/store";
import { filterNavLinks, type NavLink } from "@/components/Admin/adminNavConfig";

export default function AdminSubNav({ links }: { links: NavLink[] }) {
  const pathname = usePathname();
  const user = useAppSelector((s) => s.authReducer.user);
  const visible = filterNavLinks(user, links);

  if (visible.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2 bg-white rounded-lg border border-gray-3/50 p-1 w-fit">
      {visible.map((link) => {
        const isActive =
          link.href === "/admin"
            ? pathname === "/admin"
            : pathname === link.href || pathname.startsWith(`${link.href}/`);

        return (
          <Link
            key={`${link.href}|${link.label}`}
            href={link.href}
            className={`px-4 py-2 rounded-md text-sm font-semibold transition-all ${
              isActive
                ? "bg-[#3C50E0] text-white shadow-md shadow-[#3C50E0]/20"
                : "text-[#6C6F93] hover:text-dark hover:bg-[#F7F9FC]"
            }`}
          >
            {link.label}
          </Link>
        );
      })}
    </div>
  );
}
