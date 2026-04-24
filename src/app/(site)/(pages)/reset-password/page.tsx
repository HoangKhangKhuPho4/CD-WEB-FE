import ResetPassword from "@/components/Auth/ResetPassword";
import React from "react";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Reset Password | NextCommerce",
  description: "Set a new password for your account",
};

const ResetPasswordPage = () => {
  return (
    <main>
      <ResetPassword />
    </main>
  );
};

export default ResetPasswordPage;
