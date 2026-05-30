import "./css/euclid-circular-a-font.css";
import "./css/style.css";
import { BRAND, brandDescription, brandPageTitle } from "@/config/brand";

export const metadata = {
  title: {
    default: brandPageTitle(),
    template: `%s | ${BRAND.name}`,
  },
  description: brandDescription(),
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi" suppressHydrationWarning={true}>
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
