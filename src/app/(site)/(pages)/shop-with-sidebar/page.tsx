import React, { Suspense } from "react";
import ShopWithSidebar from "@/components/ShopWithSidebar";

import { Metadata } from "next";
export const metadata: Metadata = {
  title: "Shop Page | Bảo Khang Gadget",
  description: "This is Shop Page - Bảo Khang Gadget",
  // other metadata
};

const ShopWithSidebarPage = () => {
  return (
    <main>
      <Suspense fallback={null}>
        <ShopWithSidebar />
      </Suspense>
    </main>
  );
};

export default ShopWithSidebarPage;
