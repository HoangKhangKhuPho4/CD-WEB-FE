"use client";
import Breadcrumb from "@/components/Common/Breadcrumb";
import Link from "next/link";
import React, { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { getAuthErrorMessage, resetPassword } from "@/utils/authApi";
import { toast } from "react-hot-toast";

const ResetPassword = () => {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!token) {
      toast.error("Link không hợp lệ hoặc thiếu mã. Hãy mở đúng link trong email hoặc yêu cầu gửi lại.");
      return;
    }

    if (newPassword.length < 6) {
      toast.error("Mật khẩu mới phải có ít nhất 6 ký tự.");
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error("Mật khẩu xác nhận không khớp.");
      return;
    }

    setLoading(true);

    try {
      const body = await resetPassword(token, newPassword, confirmPassword);
      toast.success(body.message || "Mật khẩu đã được cập nhật. Vui lòng đăng nhập.");
      router.push("/signin");
    } catch (err) {
      toast.error(getAuthErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Breadcrumb title={"Đặt lại mật khẩu"} pages={["Đặt lại mật khẩu"]} />
      <section className="overflow-hidden py-20 bg-gray-2">
        <div className="max-w-[1170px] w-full mx-auto px-4 sm:px-8 xl:px-0">
          <div className="max-w-[570px] w-full mx-auto rounded-xl bg-white shadow-1 p-4 sm:p-7.5 xl:p-11">
            <div className="text-center mb-11">
              <h2 className="font-semibold text-xl sm:text-2xl xl:text-heading-5 text-dark mb-1.5">
                Đặt lại mật khẩu
              </h2>
              <p>Nhập mật khẩu mới cho tài khoản của bạn</p>
            </div>

            {!token ? (
              <div className="rounded-lg border border-red/30 bg-red/5 text-dark p-4 mb-6 text-sm">
                Không tìm thấy mã khôi phục trong đường dẫn. Hãy dùng đúng link từ email (dạng{" "}
                <code className="text-xs">/reset-password?token=…</code>) hoặc{" "}
                <Link href="/forgot-password" className="text-blue underline">
                  gửi lại email
                </Link>
                .
              </div>
            ) : null}

            <form onSubmit={handleSubmit}>
              <div className="mb-5">
                <label htmlFor="newPassword" className="block mb-2.5">
                  Mật khẩu mới
                </label>
                <div className="relative">
                  <input
                    type={showPw ? "text" : "password"}
                    id="newPassword"
                    placeholder="Tối thiểu 6 ký tự"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    minLength={6}
                    autoComplete="new-password"
                    disabled={!token}
                    className="rounded-lg border border-gray-3 bg-gray-1 placeholder:text-dark-5 w-full py-3 pr-12 pl-5 outline-none duration-200 focus:border-transparent focus:shadow-input focus:ring-2 focus:ring-blue/20 disabled:opacity-50"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPw((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-dark-4 hover:text-dark"
                    aria-label={showPw ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                  >
                    {showPw ? "Ẩn" : "Hiện"}
                  </button>
                </div>
              </div>

              <div className="mb-5">
                <label htmlFor="confirmPassword" className="block mb-2.5">
                  Nhập lại mật khẩu
                </label>
                <input
                  type={showPw ? "text" : "password"}
                  id="confirmPassword"
                  placeholder="Nhập lại mật khẩu mới"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  autoComplete="new-password"
                  disabled={!token}
                  className="rounded-lg border border-gray-3 bg-gray-1 placeholder:text-dark-5 w-full py-3 px-5 outline-none duration-200 focus:border-transparent focus:shadow-input focus:ring-2 focus:ring-blue/20 disabled:opacity-50"
                />
              </div>

              <button
                type="submit"
                disabled={loading || !token}
                aria-busy={loading}
                className="w-full flex justify-center font-medium text-white bg-dark py-3 px-6 rounded-lg ease-out duration-200 hover:bg-blue mt-7.5 disabled:opacity-50"
              >
                {loading ? "Đang cập nhật…" : "Đổi mật khẩu"}
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

export default ResetPassword;
