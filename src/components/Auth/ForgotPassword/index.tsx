"use client";
import Breadcrumb from "@/components/Common/Breadcrumb";
import Link from "next/link";
import React, { useState } from "react";
import { forgotPassword, getAuthErrorMessage } from "@/utils/authApi";
import { toast } from "react-hot-toast";
import axios from "axios";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSent(false);

    try {
      const body = await forgotPassword(email.trim());
      toast.success(body.message || "Email khôi phục đã được gửi. Vui lòng kiểm tra hộp thư (cả mục Spam).");
      setSent(true);
    } catch (err) {
      const status = axios.isAxiosError(err) ? err.response?.status : undefined;
      const msg = getAuthErrorMessage(err);
      if (status === 404) {
        toast.error("Không tìm thấy tài khoản với email này.");
      } else {
        toast.error(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Breadcrumb title={"Quên mật khẩu"} pages={["Quên mật khẩu"]} />
      <section className="overflow-hidden py-20 bg-gray-2">
        <div className="site-container">
          <div className="max-w-[570px] w-full mx-auto rounded-xl bg-white shadow-1 p-4 sm:p-7.5 xl:p-11">
            <div className="text-center mb-11">
              <h2 className="font-semibold text-xl sm:text-2xl xl:text-heading-5 text-dark mb-1.5">
                Quên mật khẩu?
              </h2>
              <p>Nhập email đã đăng ký để nhận link đặt lại mật khẩu</p>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="mb-5">
                <label htmlFor="email" className="block mb-2.5">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                  className="rounded-lg border border-gray-3 bg-gray-1 placeholder:text-dark-5 w-full py-3 px-5 outline-none duration-200 focus:border-transparent focus:shadow-input focus:ring-2 focus:ring-blue/20"
                />
              </div>

              {sent ? (
                <p className="text-sm text-dark-4 mb-4">
                  Nếu không thấy email trong vài phút, hãy kiểm tra thư mục Spam hoặc thử lại.
                </p>
              ) : null}

              <button
                type="submit"
                disabled={loading}
                aria-busy={loading}
                className="w-full flex justify-center font-medium text-white bg-dark py-3 px-6 rounded-lg ease-out duration-200 hover:bg-blue mt-2 disabled:opacity-50"
              >
                {loading ? "Đang gửi…" : "Gửi link khôi phục"}
              </button>

              <p className="text-center mt-6">
                <Link href="/signin" className="text-dark ease-out duration-200 hover:text-blue">
                  ← Quay lại đăng nhập
                </Link>
              </p>
            </form>
          </div>
        </div>
      </section>
    </>
  );
};

export default ForgotPassword;
