import MyAccount from "@/components/MyAccount";
import ProtectedRoute from "@/components/Auth/ProtectedRoute";
import React, { Suspense } from "react";

import { Metadata } from "next";
export const metadata: Metadata = {
  title: "My Account | Bảo Khang Gadget",
  description: "This is My Account page - Bảo Khang Gadget",
  // other metadata
};

const MyAccountPage = () => {
  return (
    <ProtectedRoute>
      <main>
        <Suspense fallback={<div className="py-20 text-center">Đang tải...</div>}>
          <MyAccount />
        </Suspense>
      </main>
    </ProtectedRoute>
  );
};

export default MyAccountPage;
