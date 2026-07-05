"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useDispatch } from "react-redux";
import { logout } from "@/redux/features/auth-slice";
import { logoutSession } from "@/utils/authApi";
import {
  buildSidebarSections,
  canAccessAdminSettings,
  getStaffPortalSubtitle,
  INVENTORY_RETURN_HREF,
  matchNavHref,
  type NavLink,
} from "@/components/Admin/adminNavConfig";
import { getStoredUser } from "@/utils/adminApi";
import { useAppSelector } from "@/redux/store";
import BrandLogo from "@/components/Admin/shared/BrandLogo";
import { IconUsersTeam } from "@/components/Admin/icons/AdminIcons";

const NAV_ICONS: Record<string, React.ReactNode> = {
  "/admin": (
    <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
      <path d="M8.33333 2.5H2.5V8.33333H8.33333V2.5Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M17.5 2.5H11.6667V8.33333H17.5V2.5Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M17.5 11.6667H11.6667V17.5H17.5V11.6667Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M8.33333 11.6667H2.5V17.5H8.33333V11.6667Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  "/admin/analytics": (
    <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
      <path d="M3.33334 15.8333V10.8333M8.33334 15.8333V5.83333M13.3333 15.8333V8.33333M18.3333 15.8333V3.33333" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  "/admin/orders": (
    <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
      <path d="M6.66667 9.16667V5.83333C6.66667 4.94928 7.01786 4.10143 7.64298 3.47631C8.2681 2.85119 9.11595 2.5 10 2.5C10.884 2.5 11.7319 2.85119 12.357 3.47631C12.9821 4.10143 13.3333 4.94928 13.3333 5.83333V9.16667" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M3.33333 7.5H16.6667L17.5 17.5H2.5L3.33333 7.5Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  "/shop-with-sidebar": (
    <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
      <path d="M2.5 5.83333L10 2.5L17.5 5.83333V14.1667L10 17.5L2.5 14.1667V5.83333Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  "/admin/products": (
    <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
      <path d="M2.5 5.83333L10 2.5L17.5 5.83333V14.1667L10 17.5L2.5 14.1667V5.83333Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  "/admin/categories": (
    <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
      <path d="M7.5 2.5H3.33333C2.8731 2.5 2.5 2.8731 2.5 3.33333V7.5C2.5 7.96024 2.8731 8.33333 3.33333 8.33333H7.5C7.96024 8.33333 8.33333 7.96024 8.33333 7.5V3.33333C8.33333 2.8731 7.96024 2.5 7.5 2.5Z" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M16.6667 2.5H12.5C12.0398 2.5 11.6667 2.8731 11.6667 3.33333V7.5C11.6667 7.96024 12.0398 8.33333 12.5 8.33333H16.6667C17.1269 8.33333 17.5 7.96024 17.5 7.5V3.33333C17.5 2.8731 17.1269 2.5 16.6667 2.5Z" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  "/admin/producers": (
    <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
      <path d="M3.33333 10.8333L10.8333 3.33333H14.1667V6.66667L6.66667 14.1667L3.33333 10.8333Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  "/admin/attributes": (
    <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
      <path d="M7.5 5H17.5M7.5 10H17.5M7.5 15H17.5M2.5 5H3.33333M2.5 10H3.33333M2.5 15H3.33333" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  "/admin/inventory": (
    <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
      <path d="M2.5 5.83333L10 2.5L17.5 5.83333V14.1667L10 17.5L2.5 14.1667V5.83333Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  "/admin/coupons": (
    <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
      <path d="M5 6.66667H15V13.3333H5V6.66667Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M12.5 10H12.5083" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  "/admin/imei": (
    <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
      <path d="M3.33333 3.33333H8.33333V8.33333H3.33333V3.33333Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M11.6667 3.33333H16.6667V8.33333H11.6667V3.33333Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M3.33333 11.6667H8.33333V16.6667H3.33333V11.6667Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  "/admin/return": (
    <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
      <path d="M5 5L2.5 7.5L5 10M2.5 7.5H12.5C14.1569 7.5 15.5 8.84315 15.5 10.5V12.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  "/admin/warehouse-fulfillment": (
    <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
      <path d="M6.66667 9.16667V5.83333C6.66667 4.94928 7.01786 4.10143 7.64298 3.47631C8.2681 2.85119 9.11595 2.5 10 2.5C10.884 2.5 11.7319 2.85119 12.357 3.47631C12.9821 4.10143 13.3333 4.94928 13.3333 5.83333V9.16667" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M3.33333 7.5H16.6667L17.5 17.5H2.5L3.33333 7.5Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  "/admin/purchase-orders": (
    <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
      <path d="M5 3.33333H15C15.4602 3.33333 15.8333 3.70643 15.8333 4.16667V16.6667C15.8333 17.1269 15.4602 17.5 15 17.5H5C4.53976 17.5 4.16667 17.1269 4.16667 16.6667V4.16667C4.16667 3.70643 4.53976 3.33333 5 3.33333Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M7.5 7.5H12.5M7.5 10.8333H12.5M7.5 14.1667H10.8333" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  ),
  "/admin/procurement": (
    <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
      <path d="M5 3.33333H15C15.4602 3.33333 15.8333 3.70643 15.8333 4.16667V16.6667C15.8333 17.1269 15.4602 17.5 15 17.5H5C4.53976 17.5 4.16667 17.1269 4.16667 16.6667V4.16667C4.16667 3.70643 4.53976 3.33333 5 3.33333Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M7.5 7.5H12.5M7.5 10.8333H12.5M7.5 14.1667H10.8333" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  ),
  "/admin/po-management": (
    <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
      <path d="M5 3.33333H15C15.4602 3.33333 15.8333 3.70643 15.8333 4.16667V16.6667C15.8333 17.1269 15.4602 17.5 15 17.5H5C4.53976 17.5 4.16667 17.1269 4.16667 16.6667V4.16667C4.16667 3.70643 4.53976 3.33333 5 3.33333Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M7.5 7.5H12.5M7.5 10.8333H12.5M7.5 14.1667H10.8333" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  ),
  "/admin/inventory-audit-approval": (
    <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
      <path d="M7.5 2.5H3.33333V8.33333H7.5V2.5Z" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M16.6667 2.5H12.5V8.33333H16.6667V2.5Z" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M3.33333 11.6667H16.6667V17.5H3.33333V11.6667Z" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M8.33333 14.1667L9.58333 15.4167L12.0833 12.9167" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  "/admin/inventory-audit": (
    <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
      <path d="M7.5 2.5H3.33333V8.33333H7.5V2.5Z" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M16.6667 2.5H12.5V8.33333H16.6667V2.5Z" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M3.33333 11.6667H16.6667V17.5H3.33333V11.6667Z" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  "/admin/warranty-inbound": (
    <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
      <path d="M10 2.5L3.75 5.41667V9.58333C3.75 13.125 6.45833 16.4583 10 17.9167C13.5417 16.4583 16.25 13.125 16.25 9.58333V5.41667L10 2.5Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  "/admin/warranty": (
    <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
      <path d="M10 2.5L3.75 5.41667V9.58333C3.75 13.125 6.45833 16.4583 10 17.9167C13.5417 16.4583 16.25 13.125 16.25 9.58333V5.41667L10 2.5Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  "/admin/reviews": (
    <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
      <path d="M10 2.5L12.575 7.5L18.3333 8.33333L14.1667 12.5L15.175 18.3333L10 15.625L4.825 18.3333L5.83333 12.5L1.66667 8.33333L7.425 7.5L10 2.5Z" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  "/admin/customers": (
    <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
      <path d="M14.1667 17.5V15.8333C14.1667 14.9493 13.8155 14.1014 13.1904 13.4763C12.5652 12.8512 11.7174 12.5 10.8333 12.5H5.83333C4.94928 12.5 4.10143 12.8512 3.47631 13.4763C2.85119 14.1014 2.5 14.9493 2.5 15.8333V17.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M8.33333 9.16667C10.1743 9.16667 11.6667 7.67428 11.6667 5.83333C11.6667 3.99238 10.1743 2.5 8.33333 2.5C6.49238 2.5 5 3.99238 5 5.83333C5 7.67428 6.49238 9.16667 8.33333 9.16667Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  "/admin/banners": (
    <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
      <path d="M3.33333 5.83333H16.6667V14.1667H3.33333V5.83333Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  "/admin/posts": (
    <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
      <path d="M5.83333 5H14.1667M5.83333 10H14.1667M5.83333 15H10.8333" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M5 2.5H15V17.5H5V2.5Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  "/admin/settings": (
    <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
      <path d="M10 12.5C11.3807 12.5 12.5 11.3807 12.5 10C12.5 8.61929 11.3807 7.5 10 7.5C8.61929 7.5 7.5 8.61929 7.5 10C7.5 11.3807 8.61929 12.5 10 12.5Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M16.1667 12.5C16.0557 12.7513 16.0226 13.0302 16.0716 13.3005C16.1206 13.5708 16.2495 13.8203 16.4417 14.0167L16.4917 14.0667C16.6466 14.2215 16.7695 14.4053 16.8536 14.6076C16.9377 14.81 16.9812 15.0268 16.9812 15.2458C16.9812 15.4649 16.9377 15.6817 16.8536 15.884C16.7695 16.0864 16.6466 16.2702 16.4917 16.425C16.3369 16.5799 16.1531 16.7028 15.9507 16.7869C15.7484 16.871 15.5316 16.9145 15.3125 16.9145C15.0935 16.9145 14.8767 16.871 14.6743 16.7869C14.472 16.7028 14.2881 16.5799 14.1333 16.425L14.0833 16.375C13.887 16.1828 13.6375 16.0539 13.3672 16.0049C13.0969 15.9559 12.818 15.989 12.5667 16.1C12.3203 16.2056 12.1124 16.3818 11.9679 16.6074C11.8234 16.833 11.7488 17.0978 11.7542 17.3667V17.5C11.7542 17.942 11.5786 18.3659 11.2661 18.6785C10.9535 18.9911 10.5296 19.1667 10.0875 19.1667C9.64551 19.1667 9.22158 18.9911 8.90902 18.6785C8.59646 18.3659 8.42084 17.942 8.42084 17.5V17.425C8.41966 17.1489 8.33544 16.8797 8.1795 16.6536C8.02357 16.4275 7.80365 16.2549 7.54751 16.1583C7.29617 16.0474 7.01731 16.0143 6.74699 16.0633C6.47668 16.1123 6.22718 16.2412 6.03084 16.4333L5.98084 16.4833C5.82604 16.6382 5.64225 16.7612 5.43988 16.8453C5.23751 16.9294 5.02072 16.9729 4.80167 16.9729C4.58263 16.9729 4.36584 16.9294 4.16347 16.8453C3.9611 16.7612 3.77731 16.6382 3.62251 16.4833C3.46759 16.3285 3.34464 16.1448 3.26054 15.9424C3.17644 15.74 3.13293 15.5232 3.13293 15.3042C3.13293 15.0851 3.17644 14.8683 3.26054 14.666C3.34464 14.4636 3.46759 14.2798 3.62251 14.125L3.67251 14.075C3.86467 13.8787 3.99356 13.6292 4.04257 13.3589C4.09157 13.0885 4.05843 12.8097 3.94751 12.5583C3.84191 12.312 3.66567 12.104 3.44008 11.9595C3.21449 11.815 2.94976 11.7405 2.68084 11.7458H2.54751C2.10547 11.7458 1.68155 11.5702 1.36899 11.2577C1.05643 10.9451 0.880842 10.5212 0.880842 10.0792C0.880842 9.63713 1.05643 9.21321 1.36899 8.90065C1.68155 8.58809 2.10547 8.41247 2.54751 8.41247H2.62251C2.89861 8.41129 3.16786 8.32707 3.39396 8.17113C3.62006 8.0152 3.79266 7.79528 3.88917 7.53914C4.00009 7.2878 4.03323 7.00893 3.98423 6.73862C3.93522 6.46831 3.80633 6.21881 3.61417 6.02247L3.56417 5.97247C3.40926 5.81767 3.2863 5.63389 3.2022 5.43151C3.1181 5.22914 3.07459 5.01236 3.07459 4.79331C3.07459 4.57426 3.1181 4.35747 3.2022 4.1551C3.2863 3.95273 3.40926 3.76895 3.56417 3.61414C3.71898 3.45923 3.90276 3.33627 4.10513 3.25218C4.3075 3.16808 4.52429 3.12456 4.74334 3.12456C4.96239 3.12456 5.17917 3.16808 5.38154 3.25218C5.58392 3.33627 5.7677 3.45923 5.92251 3.61414L5.97251 3.66414C6.16885 3.8563 6.41835 3.98519 6.68866 4.0342C6.95898 4.0832 7.23785 4.05006 7.48917 3.93914H7.54751C7.79384 3.83354 8.00186 3.65731 8.14636 3.43172C8.29087 3.20612 8.36539 2.94139 8.36001 2.67247V2.5C8.36001 2.05797 8.53562 1.63405 8.84818 1.32149C9.16074 1.00893 9.58467 0.833313 10.0267 0.833313C10.4687 0.833313 10.8927 1.00893 11.2052 1.32149C11.5178 1.63405 11.6934 2.05797 11.6934 2.5V2.575C11.688 2.84392 11.7625 3.10866 11.907 3.33425C12.0515 3.55985 12.2596 3.73608 12.5059 3.84168C12.7572 3.9526 13.036 3.98574 13.3064 3.93673C13.5767 3.88773 13.8262 3.75884 14.0225 3.56668L14.0725 3.51668C14.2273 3.36177 14.4111 3.23881 14.6135 3.15471C14.8159 3.07061 15.0326 3.0271 15.2517 3.0271C15.4707 3.0271 15.6875 3.07061 15.8899 3.15471C16.0923 3.23881 16.276 3.36177 16.4308 3.51668C16.5858 3.67149 16.7087 3.85527 16.7928 4.05764C16.8769 4.26001 16.9204 4.4768 16.9204 4.69585C16.9204 4.91489 16.8769 5.13168 16.7928 5.33405C16.7087 5.53643 16.5858 5.72021 16.4308 5.87501L16.3808 5.92501C16.1887 6.12136 16.0598 6.37086 16.0108 6.64117C15.9618 6.91148 15.9949 7.19035 16.1058 7.44168V7.50001C16.2114 7.74634 16.3877 7.95437 16.6133 8.09887C16.8389 8.24337 17.1036 8.31789 17.3725 8.31251H17.5C17.942 8.31251 18.366 8.48813 18.6785 8.80069C18.9911 9.11325 19.1667 9.53717 19.1667 9.97917C19.1667 10.4212 18.9911 10.8451 18.6785 11.1577C18.366 11.4703 17.942 11.6459 17.5 11.6459H17.425C17.1561 11.6512 16.8913 11.7258 16.6658 11.8703C16.4402 12.0148 16.2639 12.2228 16.1583 12.4692V12.5Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  "/admin/users": <IconUsersTeam size={18} />,
};

function navIcon(item: NavLink) {
  const baseHref = item.href.split("?")[0];
  return NAV_ICONS[item.href] ?? NAV_ICONS[baseHref] ?? NAV_ICONS["/admin"];
}

function NavItemLink({
  item,
  collapsed,
  isActive,
}: {
  item: NavLink;
  collapsed: boolean;
  isActive: boolean;
}) {
  const className = `flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 border-l-2 ${
    isActive
      ? "bg-[#3C50E0]/20 text-white border-[#3C50E0]"
      : "text-[#8D93A5] hover:bg-white/5 hover:text-white border-transparent"
  }`;

  if (item.external) {
    return (
      <a
        href={item.href}
        target="_blank"
        rel="noopener noreferrer"
        title={collapsed ? item.label : undefined}
        className={className}
      >
        <span className="flex-shrink-0">{navIcon(item)}</span>
        {!collapsed && <span className="truncate">{item.label}</span>}
      </a>
    );
  }

  return (
    <Link href={item.href} title={collapsed ? item.label : undefined} className={className}>
      <span className="flex-shrink-0">{navIcon(item)}</span>
      {!collapsed && <span className="truncate">{item.label}</span>}
    </Link>
  );
}

export default function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const dispatch = useDispatch();
  const [collapsed, setCollapsed] = useState(false);
  const reduxUser = useAppSelector((s) => s.authReducer.user);
  const user = reduxUser ?? getStoredUser();

  const portalSubtitle = getStaffPortalSubtitle(user);
  const showSettings = canAccessAdminSettings(user);

  const visibleSections = useMemo(() => buildSidebarSections(user), [user]);

  const handleLogout = async () => {
    await logoutSession();
    dispatch(logout());
    router.replace("/signin");
  };

  return (
    <aside
      className={`${
        collapsed ? "w-[72px]" : "w-[260px]"
      } h-screen bg-[#1C274C] flex flex-col transition-all duration-300 ease-in-out flex-shrink-0`}
    >
      <div className="px-4 py-5 border-b border-white/10">
        <BrandLogo collapsed={collapsed} subtitle={portalSubtitle} />
      </div>

      <nav className="flex-1 py-3 px-2 overflow-y-auto no-scrollbar">
        {visibleSections.map((section) => (
          <div key={section.title} className="mb-4">
            {!collapsed && (
              <p className="px-3 mb-1.5 text-[10px] font-bold uppercase tracking-wider text-[#6C6F93]">
                {section.title}
              </p>
            )}
            <ul className="flex flex-col gap-0.5">
              {section.items.map((item) => (
                <li key={`${section.title}-${item.href}-${item.label}`}>
                  <NavItemLink
                    item={item}
                    collapsed={collapsed}
                    isActive={matchNavHref(pathname, item.href)}
                  />
                </li>
              ))}
            </ul>
          </div>
        ))}
      </nav>

      <div className="px-3 py-2">
        <button
          type="button"
          onClick={() => setCollapsed(!collapsed)}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 text-[#8D93A5] hover:text-white transition-colors rounded-lg hover:bg-white/5"
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className={`transition-transform ${collapsed ? "rotate-180" : ""}`}>
            <path d="M12.5 15L7.5 10L12.5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          {!collapsed && <span className="text-sm">Thu gọn</span>}
        </button>
      </div>

      <div className="px-3 pb-5 border-t border-white/10 pt-3 space-y-1">
        {showSettings && (
          <Link
            href="/admin/settings"
            className="flex items-center gap-3 px-3 py-2.5 text-[#8D93A5] hover:text-white rounded-lg hover:bg-white/5 transition-colors text-sm"
          >
            {NAV_ICONS["/admin/settings"]}
            {!collapsed && <span>Cài đặt</span>}
          </Link>
        )}
        <button
          type="button"
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 text-[#8D93A5] hover:text-red-light rounded-lg hover:bg-white/5 transition-colors text-sm"
        >
          <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
            <path d="M7.5 17.5H4.16667C3.72464 17.5 3.30072 17.3244 2.98816 17.0118C2.6756 16.6993 2.5 16.2754 2.5 15.8333V4.16667C2.5 3.72464 2.6756 3.30072 2.98816 2.98816C3.30072 2.6756 3.72464 2.5 4.16667 2.5H7.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M13.3333 14.1667L17.5 10L13.3333 5.83334" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M17.5 10H7.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          {!collapsed && <span>Đăng xuất</span>}
        </button>
      </div>
    </aside>
  );
}
