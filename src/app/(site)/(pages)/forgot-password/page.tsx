import ForgotPassword from "@/components/Auth/ForgotPassword";
import React from "react";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Forgot Password | NextCommerce",
  description: "Reset your account password",
};

const ForgotPasswordPage = () => {
  return (
    <main>
      <ForgotPassword />
    </main>
  );
};

export default ForgotPasswordPage;
