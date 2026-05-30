import type { ReactNode, SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement> & { size?: number };
type IconComponent = (p: IconProps) => React.JSX.Element;

function SvgIcon({ size = 18, className, children, ...props }: IconProps & { children: ReactNode }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 20 20"
      fill="none"
      className={className}
      aria-hidden
      {...props}
    >
      {children}
    </svg>
  );
}

export function IconUsersTeam(props: IconProps) {
  return (
    <SvgIcon {...props}>
      <path
        d="M13.3333 17.5V15.4167C13.3333 14.1061 12.4738 12.9639 11.3093 12.5347M6.66667 17.5V15.4167C6.66667 14.1061 7.52619 12.9639 8.69073 12.5347M11.3093 12.5347C12.4738 12.1306 13.3333 11.0355 13.3333 9.75C13.3333 8.46447 12.4738 7.36944 11.3093 6.96527M11.3093 12.5347C10.1448 12.1306 9.28532 11.0355 9.28532 9.75C9.28532 8.46447 10.1448 7.36944 11.3093 6.96527M6.66667 12.5347C5.50212 12.1306 4.6426 11.0355 4.6426 9.75C4.6426 8.46447 5.50212 7.36944 6.66667 6.96527M6.66667 12.5347C7.83121 12.9639 8.69073 14.1061 8.69073 15.4167V17.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="10" cy="5.83333" r="2.5" stroke="currentColor" strokeWidth="1.5" />
    </SvgIcon>
  );
}

export function IconShieldKey(props: IconProps) {
  return (
    <SvgIcon {...props}>
      <path
        d="M10 2.5L4.16667 5V9.58333C4.16667 12.875 6.70833 15.8333 10 17.0833C13.2917 15.8333 15.8333 12.875 15.8333 9.58333V5L10 2.5Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M7.5 9.16667H10.8333C11.7538 9.16667 12.5 9.91286 12.5 10.8333C12.5 11.7538 11.7538 12.5 10.8333 12.5H9.16667V13.3333"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </SvgIcon>
  );
}

export function IconUserPlus(props: IconProps) {
  return (
    <SvgIcon {...props}>
      <path
        d="M13.3333 17.5V15.4167C13.3333 14.1061 12.4738 12.9639 11.3093 12.5347M6.66667 17.5V15.4167C6.66667 14.1061 7.52619 12.9639 8.69073 12.5347"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <circle cx="10" cy="5.83333" r="2.5" stroke="currentColor" strokeWidth="1.5" />
      <path d="M15.8333 6.66667V10M17.5 8.33333H14.1667" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </SvgIcon>
  );
}

export function IconLock(props: IconProps) {
  return (
    <SvgIcon {...props}>
      <rect x="4.16667" y="8.33333" width="11.6667" height="8.33333" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
      <path
        d="M6.66667 8.33333V6.66667C6.66667 4.82572 8.15906 3.33333 10 3.33333C11.841 3.33333 13.3333 4.82572 13.3333 6.66667V8.33333"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </SvgIcon>
  );
}

export function IconUnlock(props: IconProps) {
  return (
    <SvgIcon {...props}>
      <rect x="4.16667" y="8.33333" width="11.6667" height="8.33333" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
      <path
        d="M6.66667 8.33333V6.66667C6.66667 5.286 7.786 4.16667 9.16667 4.16667"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path d="M13.3333 6.66667H10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </SvgIcon>
  );
}

export function IconCheckCircle(props: IconProps) {
  return (
    <SvgIcon {...props}>
      <circle cx="10" cy="10" r="7.5" stroke="currentColor" strokeWidth="1.5" />
      <path d="M7.5 10L9.16667 11.6667L12.9167 7.91667" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </SvgIcon>
  );
}

export function IconBan(props: IconProps) {
  return (
    <SvgIcon {...props}>
      <circle cx="10" cy="10" r="7.5" stroke="currentColor" strokeWidth="1.5" />
      <path d="M5.5 14.5L14.5 5.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </SvgIcon>
  );
}

export function IconSave(props: IconProps) {
  return (
    <SvgIcon {...props}>
      <path
        d="M5 17.5H15C15.9205 17.5 16.6667 16.7538 16.6667 15.8333V4.16667C16.6667 3.24619 15.9205 2.5 15 2.5H6.66667L3.33333 5.83333V15.8333C3.33333 16.7538 4.07953 17.5 5 17.5Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <path d="M7.5 2.5V7.5H12.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M7.5 12.5H12.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </SvgIcon>
  );
}

export function IconCrown(props: IconProps) {
  return (
    <SvgIcon {...props}>
      <path
        d="M3.33333 14.1667L5 8.33333L8.33333 10.8333L10 5.83333L11.6667 10.8333L15 8.33333L16.6667 14.1667H3.33333Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <path d="M4.16667 16.6667H15.8333" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </SvgIcon>
  );
}

export function IconWarehouse(props: IconProps) {
  return (
    <SvgIcon {...props}>
      <path
        d="M2.5 8.33333L10 3.33333L17.5 8.33333V16.6667H2.5V8.33333Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <path d="M7.5 16.6667V11.6667H12.5V16.6667" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
    </SvgIcon>
  );
}

export function IconSales(props: IconProps) {
  return (
    <SvgIcon {...props}>
      <path
        d="M6.66667 9.16667V5.83333C6.66667 4.94928 7.01786 4.10143 7.64298 3.47631C8.2681 2.85119 9.11595 2.5 10 2.5C10.884 2.5 11.7319 2.85119 12.357 3.47631C12.9821 4.10143 13.3333 4.94928 13.3333 5.83333V9.16667"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path d="M3.33333 7.5H16.6667L17.5 17.5H2.5L3.33333 7.5Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
    </SvgIcon>
  );
}

export function IconFolder(props: IconProps) {
  return (
    <SvgIcon {...props}>
      <path
        d="M3.33333 5.83333H8.33333L10 7.5H16.6667C17.5871 7.5 18.3333 8.24619 18.3333 9.16667V15.8333C18.3333 16.7538 17.5871 17.5 16.6667 17.5H3.33333C2.41286 17.5 1.66667 16.7538 1.66667 15.8333V6.66667C1.66667 5.74619 2.41286 5 3.33333 5Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </SvgIcon>
  );
}

export function IconChartBar(props: IconProps) {
  return (
    <SvgIcon {...props}>
      <path d="M3.33333 15.8333V10.8333M8.33333 15.8333V5.83333M13.3333 15.8333V8.33333M18.3333 15.8333V3.33333" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </SvgIcon>
  );
}

export function IconBox(props: IconProps) {
  return (
    <SvgIcon {...props}>
      <path d="M10 2.5L17.5 6.66667V13.3333L10 17.5L2.5 13.3333V6.66667L10 2.5Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
      <path d="M10 17.5V10M10 10L17.5 6.66667M10 10L2.5 6.66667" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
    </SvgIcon>
  );
}

export function IconChip(props: IconProps) {
  return (
    <SvgIcon {...props}>
      <rect x="3.33333" y="3.33333" width="13.3333" height="13.3333" rx="2" stroke="currentColor" strokeWidth="1.5" />
      <path d="M7.5 10H12.5M10 7.5V12.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </SvgIcon>
  );
}

export function IconClipboard(props: IconProps) {
  return (
    <SvgIcon {...props}>
      <path d="M7.5 3.33333H12.5C13.4205 3.33333 14.1667 4.07953 14.1667 5V6.66667H5.83333V5C5.83333 4.07953 6.57953 3.33333 7.5 3.33333Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
      <path d="M5.83333 6.66667H14.1667V16.6667C14.1667 17.5871 13.4205 18.3333 12.5 18.3333H7.5C6.57953 18.3333 5.83333 17.5871 5.83333 16.6667V6.66667Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
    </SvgIcon>
  );
}

export function IconSettings(props: IconProps) {
  return (
    <SvgIcon {...props}>
      <circle cx="10" cy="10" r="2.5" stroke="currentColor" strokeWidth="1.5" />
      <path d="M10 2.5V4.16667M10 15.8333V17.5M17.5 10H15.8333M4.16667 10H2.5M15.3033 4.69667L14.1667 5.83333M5.83333 14.1667L4.69667 15.3033M15.3033 15.3033L14.1667 14.1667M5.83333 5.83333L4.69667 4.69667" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </SvgIcon>
  );
}

export function IconQrCode(props: IconProps) {
  return (
    <SvgIcon {...props}>
      <rect x="3.33333" y="3.33333" width="5.83333" height="5.83333" rx="1" stroke="currentColor" strokeWidth="1.5" />
      <rect x="10.8333" y="3.33333" width="5.83333" height="5.83333" rx="1" stroke="currentColor" strokeWidth="1.5" />
      <rect x="3.33333" y="10.8333" width="5.83333" height="5.83333" rx="1" stroke="currentColor" strokeWidth="1.5" />
      <path d="M13.3333 13.3333H14.1667M15.8333 13.3333V15.8333M13.3333 15.8333H15.8333" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </SvgIcon>
  );
}

export function IconSparkles(props: IconProps) {
  return (
    <SvgIcon {...props}>
      <path d="M10 2.5L11.25 7.5L16.25 8.75L11.25 10L10 15L8.75 10L3.75 8.75L8.75 7.5L10 2.5Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
      <path d="M16.6667 3.33333L17.0833 5.41667L19.1667 5.83333L17.0833 6.25L16.6667 8.33333L16.25 6.25L14.1667 5.83333L16.25 5.41667L16.6667 3.33333Z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round" />
    </SvgIcon>
  );
}

export type RoleVisual = {
  label: string;
  shortLabel: string;
  gradient: string;
  badgeClass: string;
  Icon: IconComponent;
};

export function getStaffRoleVisual(roleName?: string): RoleVisual {
  const name = (roleName ?? "").toUpperCase();
  if (name.includes("ADMIN")) {
    return {
      label: "Quản trị viên",
      shortLabel: "Admin",
      gradient: "from-[#1C274C] to-[#3C50E0]",
      badgeClass: "bg-[#1C274C]/10 text-[#1C274C] border-[#1C274C]/20",
      Icon: IconCrown,
    };
  }
  if (name.includes("WAREHOUSE")) {
    return {
      label: "Nhân viên kho",
      shortLabel: "Kho",
      gradient: "from-[#0EA5E9] to-[#3C50E0]",
      badgeClass: "bg-[#EEF2FF] text-[#3C50E0] border-[#3C50E0]/20",
      Icon: IconWarehouse,
    };
  }
  if (name.includes("SALES")) {
    return {
      label: "Nhân viên bán hàng",
      shortLabel: "Sales",
      gradient: "from-[#8B5CF6] to-[#3C50E0]",
      badgeClass: "bg-green-light-6 text-green border-green/20",
      Icon: IconSales,
    };
  }
  return {
    label: "Nhân viên",
    shortLabel: "Staff",
    gradient: "from-[#3C50E0] to-[#5475E5]",
    badgeClass: "bg-gray-2 text-[#6C6F93] border-gray-3",
    Icon: IconUsersTeam,
  };
}

const PERM_GROUP_ICONS: Record<string, IconComponent> = {
  ORDER: IconSales,
  PRODUCT: IconBox,
  STOCK: IconWarehouse,
  IMEI: IconChip,
  INVENTORY: IconWarehouse,
  REPORT: IconChartBar,
  USER: IconUsersTeam,
  ROLE: IconShieldKey,
  WARRANTY: IconClipboard,
  SYSTEM: IconSettings,
  QR: IconQrCode,
  AI: IconSparkles,
  OTHER: IconFolder,
};

export function getPermissionGroupIcon(prefix: string) {
  return PERM_GROUP_ICONS[prefix.toUpperCase()] ?? IconShieldKey;
}
