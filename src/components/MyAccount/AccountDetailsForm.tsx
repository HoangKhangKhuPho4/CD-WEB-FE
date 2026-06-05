"use client";

import React, { useState } from "react";
import { useDispatch } from "react-redux";
import toast from "react-hot-toast";
import { useAppSelector } from "@/redux/store";
import { loginSuccess } from "@/redux/features/auth-slice";
import {
  updateMyProfile,
  changeMyPassword,
  normalizeAuthUser,
} from "@/utils/userApi";

const AccountDetailsForm = () => {
  const { user } = useAppSelector((state) => state.authReducer);
  const dispatch = useDispatch();
  const [name, setName] = useState(user?.name || "");
  const [phone, setPhone] = useState(user?.phone || "");
  const [savingProfile, setSavingProfile] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [savingPassword, setSavingPassword] = useState(false);

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      const updated = await updateMyProfile({ fullName: name, phone });
      const token =
        localStorage.getItem("token") || sessionStorage.getItem("token") || "";
      dispatch(
        loginSuccess({
          user: normalizeAuthUser(updated),
          token,
          rememberMe: !!localStorage.getItem("token"),
        })
      );
      toast.success("Đã cập nhật hồ sơ");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Cập nhật thất bại";
      toast.error(msg);
    } finally {
      setSavingProfile(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error("Mật khẩu xác nhận không khớp");
      return;
    }
    setSavingPassword(true);
    try {
      await changeMyPassword({
        currentPassword,
        newPassword,
        confirmPassword,
      });
      toast.success("Đã đổi mật khẩu");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Đổi mật khẩu thất bại";
      toast.error(msg);
    } finally {
      setSavingPassword(false);
    }
  };

  return (
    <div className="xl:max-w-[770px] w-full">
      <form onSubmit={handleProfileSubmit}>
        <div className="bg-white shadow-1 rounded-xl p-4 sm:p-8.5">
          <p className="font-medium text-xl text-dark mb-5">Thông tin cá nhân</p>
          <div className="mb-5">
            <label htmlFor="email" className="block mb-2.5">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={user?.email || ""}
              readOnly
              className="rounded-md border border-gray-3 bg-gray-1 text-dark-5 w-full py-2.5 px-5 outline-none"
            />
          </div>
          <div className="mb-5">
            <label htmlFor="name" className="block mb-2.5">
              Họ tên <span className="text-red">*</span>
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="rounded-md border border-gray-3 bg-gray-1 w-full py-2.5 px-5 outline-none duration-200 focus:border-transparent focus:shadow-input focus:ring-2 focus:ring-blue/20"
            />
          </div>
          <div className="mb-5">
            <label htmlFor="phone" className="block mb-2.5">
              Số điện thoại
            </label>
            <input
              id="phone"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="rounded-md border border-gray-3 bg-gray-1 w-full py-2.5 px-5 outline-none duration-200 focus:border-transparent focus:shadow-input focus:ring-2 focus:ring-blue/20"
            />
          </div>
          <button
            type="submit"
            disabled={savingProfile}
            className="inline-flex font-medium text-white bg-blue py-3 px-7 rounded-md ease-out duration-200 hover:bg-blue-dark disabled:opacity-60"
          >
            {savingProfile ? "Đang lưu..." : "Lưu thay đổi"}
          </button>
        </div>
      </form>

      <form onSubmit={handlePasswordSubmit} className="mt-7.5">
        <div className="bg-white shadow-1 rounded-xl p-4 sm:p-8.5">
          <p className="font-medium text-xl sm:text-2xl text-dark mb-7">Đổi mật khẩu</p>
          <div className="mb-5">
            <label htmlFor="oldPassword" className="block mb-2.5">
              Mật khẩu hiện tại
            </label>
            <input
              id="oldPassword"
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
              className="rounded-md border border-gray-3 bg-gray-1 w-full py-2.5 px-5 outline-none duration-200 focus:border-transparent focus:shadow-input focus:ring-2 focus:ring-blue/20"
            />
          </div>
          <div className="mb-5">
            <label htmlFor="newPassword" className="block mb-2.5">
              Mật khẩu mới
            </label>
            <input
              id="newPassword"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              minLength={6}
              className="rounded-md border border-gray-3 bg-gray-1 w-full py-2.5 px-5 outline-none duration-200 focus:border-transparent focus:shadow-input focus:ring-2 focus:ring-blue/20"
            />
          </div>
          <div className="mb-5">
            <label htmlFor="confirmNewPassword" className="block mb-2.5">
              Xác nhận mật khẩu mới
            </label>
            <input
              id="confirmNewPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              className="rounded-md border border-gray-3 bg-gray-1 w-full py-2.5 px-5 outline-none duration-200 focus:border-transparent focus:shadow-input focus:ring-2 focus:ring-blue/20"
            />
          </div>
          <button
            type="submit"
            disabled={savingPassword}
            className="inline-flex font-medium text-white bg-blue py-3 px-7 rounded-md ease-out duration-200 hover:bg-blue-dark disabled:opacity-60"
          >
            {savingPassword ? "Đang xử lý..." : "Đổi mật khẩu"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AccountDetailsForm;
