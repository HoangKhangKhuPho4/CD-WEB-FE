"use client";

import React, { useCallback, useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import toast from "react-hot-toast";
import { useAppSelector } from "@/redux/store";
import { updateUser } from "@/redux/features/auth-slice";
import type { User } from "@/types/auth";
import {
  getMe,
  updateMyProfile,
  changeMyPassword,
  normalizeAuthUser,
} from "@/utils/userApi";

function formatBirthForInput(value?: string | null): string {
  if (!value) return "";
  return value.slice(0, 10);
}

function providerLabel(provider?: string | null): string {
  switch (provider?.toUpperCase()) {
    case "GOOGLE":
      return "Google";
    case "FACEBOOK":
      return "Facebook";
    default:
      return "Email / mật khẩu";
  }
}

function isOAuthProvider(provider?: string | null): boolean {
  const p = provider?.toUpperCase();
  return p === "GOOGLE" || p === "FACEBOOK";
}

const AccountDetailsForm = () => {
  const { user } = useAppSelector((state) => state.authReducer);
  const dispatch = useDispatch();
  const [profileLoading, setProfileLoading] = useState(true);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [birth, setBirth] = useState("");
  const [gender, setGender] = useState("");
  const [address, setAddress] = useState("");
  const [savingProfile, setSavingProfile] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [savingPassword, setSavingPassword] = useState(false);

  const applyUserToForm = useCallback((u: User) => {
    setName(u.name || "");
    setPhone(u.phone || "");
    setBirth(formatBirthForInput(u.birth));
    setGender(u.gender || "");
    setAddress(u.address || "");
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const fresh = await getMe();
        if (!cancelled) {
          dispatch(updateUser(fresh));
          applyUserToForm(fresh);
        }
      } catch {
        /* giữ dữ liệu Redux hiện có */
      } finally {
        if (!cancelled) {
          setProfileLoading(false);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [dispatch, applyUserToForm]);

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      const updated = await updateMyProfile({
        fullName: name,
        phone: phone || undefined,
        birth: birth || undefined,
        gender: gender || undefined,
        address: address || undefined,
      });
      dispatch(updateUser(normalizeAuthUser(updated)));
      applyUserToForm(updated);
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

  const inputClass =
    "rounded-md border border-gray-3 bg-gray-1 w-full py-2.5 px-5 outline-none duration-200 focus:border-transparent focus:shadow-input focus:ring-2 focus:ring-blue/20";
  const readonlyClass =
    "rounded-md border border-gray-3 bg-gray-1 text-dark-5 w-full py-2.5 px-5 outline-none";

  if (profileLoading) {
    return (
      <div className="xl:max-w-[770px] w-full bg-white shadow-1 rounded-xl p-8.5">
        <p className="text-dark-3">Đang tải thông tin tài khoản...</p>
      </div>
    );
  }

  return (
    <div className="xl:max-w-[770px] w-full">
      <form onSubmit={handleProfileSubmit}>
        <div className="bg-white shadow-1 rounded-xl p-4 sm:p-8.5">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
            <p className="font-medium text-xl text-dark">Thông tin cá nhân</p>
            <span className="text-custom-xs px-3 py-1 rounded-full bg-gray-1 text-dark-2">
              Đăng nhập qua: {providerLabel(user?.provider)}
            </span>
          </div>

          <div className="mb-5">
            <label htmlFor="username" className="block mb-2.5">
              Tên đăng nhập
            </label>
            <input
              id="username"
              type="text"
              value={user?.username || ""}
              readOnly
              className={readonlyClass}
            />
          </div>

          <div className="mb-5">
            <label htmlFor="email" className="block mb-2.5">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={user?.email || ""}
              readOnly
              className={readonlyClass}
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
              className={inputClass}
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
              className={inputClass}
            />
          </div>

          <div className="mb-5">
            <label htmlFor="birth" className="block mb-2.5">
              Ngày sinh
            </label>
            <input
              id="birth"
              type="date"
              value={birth}
              onChange={(e) => setBirth(e.target.value)}
              className={inputClass}
            />
          </div>

          <div className="mb-5">
            <label htmlFor="gender" className="block mb-2.5">
              Giới tính
            </label>
            <select
              id="gender"
              value={gender}
              onChange={(e) => setGender(e.target.value)}
              className={inputClass}
            >
              <option value="">— Chọn —</option>
              <option value="Nam">Nam</option>
              <option value="Nữ">Nữ</option>
              <option value="Khác">Khác</option>
            </select>
          </div>

          <div className="mb-5">
            <label htmlFor="address" className="block mb-2.5">
              Địa chỉ mặc định
            </label>
            <textarea
              id="address"
              rows={3}
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Địa chỉ giao hàng mặc định"
              className={inputClass}
            />
            <p className="text-custom-xs text-dark-3 mt-2">
              Bạn cũng có thể quản lý nhiều địa chỉ ở tab &quot;Địa Chỉ&quot;.
            </p>
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

      {!isOAuthProvider(user?.provider) ? (
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
                className={inputClass}
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
                className={inputClass}
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
                className={inputClass}
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
      ) : (
        <div className="mt-7.5 bg-white shadow-1 rounded-xl p-4 sm:p-8.5">
          <p className="font-medium text-xl text-dark mb-2">Đổi mật khẩu</p>
          <p className="text-custom-sm text-dark-3">
            Tài khoản đăng nhập qua {providerLabel(user?.provider)} không dùng mật khẩu cục bộ.
            Vui lòng tiếp tục đăng nhập bằng {providerLabel(user?.provider)}.
          </p>
        </div>
      )}
    </div>
  );
};

export default AccountDetailsForm;
