"use client";
import Breadcrumb from "@/components/Common/Breadcrumb";
import React, { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import api from "@/utils/api";
import { toast } from "react-hot-toast";

const ResetPassword = () => {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!token) {
      toast.error("Invalid or missing reset token.");
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match!");
      return;
    }

    setLoading(true);

    try {
      const response = await api.post("/auth/reset-password", { token, newPassword });
      const { success, message } = response.data;

      if (success) {
        toast.success("Password reset successful! Please sign in.");
        router.push("/signin");
      } else {
        toast.error(message);
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || "Reset failed. Link may be expired.";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Breadcrumb title={"Reset Password"} pages={["Reset Password"]} />
      <section className="overflow-hidden py-20 bg-gray-2">
        <div className="max-w-[1170px] w-full mx-auto px-4 sm:px-8 xl:px-0">
          <div className="max-w-[570px] w-full mx-auto rounded-xl bg-white shadow-1 p-4 sm:p-7.5 xl:p-11">
            <div className="text-center mb-11">
              <h2 className="font-semibold text-xl sm:text-2xl xl:text-heading-5 text-dark mb-1.5">
                Reset Your Password
              </h2>
              <p>Enter your new password below</p>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="mb-5">
                <label htmlFor="newPassword" className="block mb-2.5">
                  New Password
                </label>
                <input
                  type="password"
                  id="newPassword"
                  placeholder="Enter new password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  className="rounded-lg border border-gray-3 bg-gray-1 placeholder:text-dark-5 w-full py-3 px-5 outline-none duration-200 focus:border-transparent focus:shadow-input focus:ring-2 focus:ring-blue/20"
                />
              </div>

              <div className="mb-5">
                <label htmlFor="confirmPassword" className="block mb-2.5">
                  Confirm Password
                </label>
                <input
                  type="password"
                  id="confirmPassword"
                  placeholder="Confirm new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className="rounded-lg border border-gray-3 bg-gray-1 placeholder:text-dark-5 w-full py-3 px-5 outline-none duration-200 focus:border-transparent focus:shadow-input focus:ring-2 focus:ring-blue/20"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center font-medium text-white bg-dark py-3 px-6 rounded-lg ease-out duration-200 hover:bg-blue mt-7.5 disabled:opacity-50"
              >
                {loading ? "Resetting..." : "Reset Password"}
              </button>
            </form>
          </div>
        </div>
      </section>
    </>
  );
};

export default ResetPassword;
