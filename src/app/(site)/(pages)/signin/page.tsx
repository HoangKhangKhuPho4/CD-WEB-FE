import Signin from "@/components/Auth/Signin";
import React, { Suspense } from "react";
import { Metadata } from "next";
export const metadata: Metadata = {
  title: "Signin Page | Bảo Khang Gadget",
  description: "This is Signin Page - Bảo Khang Gadget",
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
