"use client";
import Breadcrumb from "@/components/Common/Breadcrumb";
import React, { useState } from "react";
import api from "@/utils/api";
import { toast } from "react-hot-toast";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await api.post("/auth/forgot-password", { email });
      const { success, message } = response.data;

      if (success) {
        toast.success("Reset link sent to your email!");
      } else {
        toast.error(message);
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || "Something went wrong. Please try again.";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Breadcrumb title={"Forgot Password"} pages={["Forgot Password"]} />
      <section className="overflow-hidden py-20 bg-gray-2">
        <div className="max-w-[1170px] w-full mx-auto px-4 sm:px-8 xl:px-0">
          <div className="max-w-[570px] w-full mx-auto rounded-xl bg-white shadow-1 p-4 sm:p-7.5 xl:p-11">
            <div className="text-center mb-11">
              <h2 className="font-semibold text-xl sm:text-2xl xl:text-heading-5 text-dark mb-1.5">
                Forgot Your Password?
              </h2>
              <p>Enter your email address to receive a reset link</p>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="mb-5">
                <label htmlFor="email" className="block mb-2.5">
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="rounded-lg border border-gray-3 bg-gray-1 placeholder:text-dark-5 w-full py-3 px-5 outline-none duration-200 focus:border-transparent focus:shadow-input focus:ring-2 focus:ring-blue/20"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center font-medium text-white bg-dark py-3 px-6 rounded-lg ease-out duration-200 hover:bg-blue mt-7.5 disabled:opacity-50"
              >
                {loading ? "Sending..." : "Send Reset Link"}
              </button>
            </form>
          </div>
        </div>
      </section>
    </>
  );
};

export default ForgotPassword;
