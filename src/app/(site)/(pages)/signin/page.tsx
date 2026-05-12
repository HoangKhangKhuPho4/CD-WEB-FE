import Signin from "@/components/Auth/Signin";
import React, { Suspense } from "react";
import { Metadata } from "next";
export const metadata: Metadata = {
  title: "Signin Page | NextCommerce Nextjs E-commerce template",
  description: "This is Signin Page for NextCommerce Template",
  // other metadata
};

const SigninPage = () => {
  return (
    <main>
      <Suspense fallback={null}>
        <Signin />
      </Suspense>
    </main>
  );
};

export default SigninPage;
