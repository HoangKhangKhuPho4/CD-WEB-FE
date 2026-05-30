import ResetPassword from "@/components/Auth/ResetPassword";
import React, { Suspense } from "react";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Reset Password | Bảo Khang Gadget",
  description: "Set a new password for your account",
};

const ResetPasswordPage = () => {
  return (
    <main>
      <Suspense fallback={null}>
        <ResetPassword />
      </Suspense>
    </main>
  );
};

export default ResetPasswordPage;
