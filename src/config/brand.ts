/** Thương hiệu storefront & admin — nguồn tập trung. */
export const BRAND = {
  name: "Bảo Khang Gadget",
  shortName: "Bảo Khang",
  tagline: "Công nghệ & phụ kiện chính hãng",
  logoMark: "/images/logo/logo-mark.svg",
  logoFull: "/images/logo/logo.svg",
  copyright: (year: number) =>
    `© ${year} ${BRAND.name}. Cửa hàng công nghệ uy tín.`,
} as const;

/** Tiêu đề tab trình duyệt — vd: brandPageTitle("Đăng nhập") */
export function brandPageTitle(page?: string): string {
  return page ? `${page} | ${BRAND.name}` : BRAND.name;
}

/** Mô tả SEO mặc định */
export function brandDescription(extra?: string): string {
  return extra ?? `${BRAND.name} — ${BRAND.tagline}`;
}
