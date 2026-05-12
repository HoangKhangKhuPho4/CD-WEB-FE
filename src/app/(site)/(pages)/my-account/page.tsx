import MyAccount from "@/components/MyAccount";
import ProtectedRoute from "@/components/Auth/ProtectedRoute";
import React from "react";

import { Metadata } from "next";
export const metadata: Metadata = {
  title: "My Account | NextCommerce Nextjs E-commerce template",
  description: "This is My Account page for NextCommerce Template",
  // other metadata
};

const MyAccountPage = () => {
  return (
    <ProtectedRoute>
      <main>
        <MyAccount />
      </main>
    </ProtectedRoute>
  );
};

export default MyAccountPage;
