"use client";
import Breadcrumb from "@/components/Common/Breadcrumb";
import Link from "next/link";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  checkEmail,
  checkUsername,
  getAuthErrorMessage,
  getAuthValidationError,
  register,
  type RegisterPayload,
} from "@/utils/authApi";
import { toast } from "react-hot-toast";

const USERNAME_MIN_LEN = 3;
const DEBOUNCE_MS = 400;

type Availability = "idle" | "loading" | "ok" | "taken" | "error";

const Signup = () => {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    name: "",
    phone: "",
    birth: "",
    gender: "Nam",
    address: "",
    roleId: 4,
  });
  const [loading, setLoading] = useState(false);
  const [usernameAvail, setUsernameAvail] = useState<Availability>("idle");
  const [emailAvail, setEmailAvail] = useState<Availability>("idle");
  const debounceUser = useRef<ReturnType<typeof setTimeout> | null>(null);
  const debounceMail = useRef<ReturnType<typeof setTimeout> | null>(null);
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const runCheckUsername = useCallback(async (username: string) => {
    if (username.length < USERNAME_MIN_LEN) {
      setUsernameAvail("idle");
      return;
    }
    setUsernameAvail("loading");
    try {
      const body = await checkUsername(username);
      setUsernameAvail(body.data === true ? "ok" : "taken");
    } catch {
      setUsernameAvail("error");
    }
  }, []);

  const runCheckEmail = useCallback(async (email: string) => {
    const trimmed = email.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      setEmailAvail("idle");
      return;
    }
    setEmailAvail("loading");
    try {
      const body = await checkEmail(trimmed);
      setEmailAvail(body.data === true ? "ok" : "taken");
    } catch {
      setEmailAvail("error");
    }
  }, []);

  useEffect(() => {
    const u = formData.username.trim();
    if (debounceUser.current) clearTimeout(debounceUser.current);
    if (u.length < USERNAME_MIN_LEN) {
      setUsernameAvail("idle");
      return;
    }
    debounceUser.current = setTimeout(() => {
      void runCheckUsername(u);
    }, DEBOUNCE_MS);
    return () => {
      if (debounceUser.current) clearTimeout(debounceUser.current);
    };
  }, [formData.username, runCheckUsername]);

  useEffect(() => {
    const em = formData.email.trim();
    if (debounceMail.current) clearTimeout(debounceMail.current);
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(em)) {
      setEmailAvail("idle");
      return;
    }
    debounceMail.current = setTimeout(() => {
      void runCheckEmail(em);
    }, DEBOUNCE_MS);
    return () => {
      if (debounceMail.current) clearTimeout(debounceMail.current);
    };
  }, [formData.email, runCheckEmail]);

  const buildPayload = (): RegisterPayload => {
    const payload: RegisterPayload = {
      username: formData.username.trim(),
      email: formData.email.trim(),
      password: formData.password,
      name: formData.name.trim(),
      roleId: formData.roleId,
    };
    if (formData.phone.trim()) payload.phone = formData.phone.trim();
    if (formData.birth) payload.birth = formData.birth;
    if (formData.gender) payload.gender = formData.gender;
    if (formData.address.trim()) payload.address = formData.address.trim();
    return payload;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      toast.error("Mật khẩu nhập lại không khớp.");
      return;
    }
    if (formData.password.length < 6) {
      toast.error("Mật khẩu phải có ít nhất 6 ký tự.");
      return;
    }
    if (usernameAvail === "taken") {
      toast.error("Tên đăng nhập đã được sử dụng.");
      return;
    }
    if (emailAvail === "taken") {
      toast.error("Email đã được đăng ký.");
      return;
    }

    setLoading(true);

    try {
      await register(buildPayload());
      toast.success("Đăng ký thành công! Vui lòng đăng nhập.");
      router.push(`/signin?email=${encodeURIComponent(formData.email.trim())}`);
    } catch (err) {
      const validation = getAuthValidationError(err);
      if (validation) {
        const first = Object.values(validation)[0];
        toast.error(first || getAuthErrorMessage(err));
      } else {
        toast.error(getAuthErrorMessage(err));
      }
    } finally {
      setLoading(false);
    }
  };

  const availIcon = (state: Availability, idleLabel: string) => {
    if (state === "idle") return <span className="text-xs text-dark-4">{idleLabel}</span>;
    if (state === "loading") return <span className="text-xs text-dark-4">Đang kiểm tra…</span>;
    if (state === "ok") return <span className="text-green text-sm font-medium">✓ Khả dụng</span>;
    if (state === "taken") return <span className="text-red text-sm font-medium">✗ Đã dùng</span>;
    return <span className="text-red text-sm">Lỗi kiểm tra</span>;
  };

  return (
    <>
      <Breadcrumb title={"Đăng Ký"} pages={["Đăng Ký"]} />
      <section className="overflow-hidden py-20 bg-gray-2">
        <div className="site-container">
          <div className="max-w-[800px] w-full mx-auto rounded-xl bg-white shadow-1 p-4 sm:p-7.5 xl:p-11">
            <div className="text-center mb-11">
              <h2 className="font-semibold text-xl sm:text-2xl xl:text-heading-5 text-dark mb-1.5">
                Tạo tài khoản mới
              </h2>
              <p>Nhập thông tin bên dưới để đăng ký</p>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
                <div>
                  <label htmlFor="username" className="block mb-2.5">
                    Tên đăng nhập <span className="text-red">*</span>
                  </label>
                  <input
                    type="text"
                    name="username"
                    id="username"
                    placeholder="Tối thiểu 3 ký tự"
                    value={formData.username}
                    onChange={handleChange}
                    required
                    minLength={3}
                    maxLength={100}
                    autoComplete="username"
                    className="rounded-lg border border-gray-3 bg-gray-1 placeholder:text-dark-5 w-full py-3 px-5 outline-none duration-200 focus:border-transparent focus:shadow-input focus:ring-2 focus:ring-blue/20"
                  />
                  <div className="mt-1.5 min-h-[1.25rem]">{availIcon(usernameAvail, "≥3 ký tự để kiểm tra")}</div>
                </div>
                <div>
                  <label htmlFor="name" className="block mb-2.5">
                    Họ và tên <span className="text-red">*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    id="name"
                    placeholder="Nhập họ và tên"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="rounded-lg border border-gray-3 bg-gray-1 placeholder:text-dark-5 w-full py-3 px-5 outline-none duration-200 focus:border-transparent focus:shadow-input focus:ring-2 focus:ring-blue/20"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
                <div>
                  <label htmlFor="email" className="block mb-2.5">
                    Email <span className="text-red">*</span>
                  </label>
                  <input
                    type="email"
                    name="email"
                    id="email"
                    placeholder="Nhập email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    autoComplete="email"
                    className="rounded-lg border border-gray-3 bg-gray-1 placeholder:text-dark-5 w-full py-3 px-5 outline-none duration-200 focus:border-transparent focus:shadow-input focus:ring-2 focus:ring-blue/20"
                  />
                  <div className="mt-1.5 min-h-[1.25rem]">{availIcon(emailAvail, "Định dạng hợp lệ để kiểm tra")}</div>
                </div>
                <div>
                  <label htmlFor="phone" className="block mb-2.5">
                    Số điện thoại
                  </label>
                  <input
                    type="text"
                    name="phone"
                    id="phone"
                    placeholder="Tùy chọn"
                    value={formData.phone}
                    onChange={handleChange}
                    className="rounded-lg border border-gray-3 bg-gray-1 placeholder:text-dark-5 w-full py-3 px-5 outline-none duration-200 focus:border-transparent focus:shadow-input focus:ring-2 focus:ring-blue/20"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
                <div>
                  <label htmlFor="birth" className="block mb-2.5">
                    Ngày sinh
                  </label>
                  <input
                    type="date"
                    name="birth"
                    id="birth"
                    value={formData.birth}
                    onChange={handleChange}
                    className="rounded-lg border border-gray-3 bg-gray-1 placeholder:text-dark-5 w-full py-3 px-5 outline-none duration-200 focus:border-transparent focus:shadow-input focus:ring-2 focus:ring-blue/20"
                  />
                </div>
                <div>
                  <label htmlFor="gender" className="block mb-2.5">
                    Giới tính
                  </label>
                  <select
                    name="gender"
                    id="gender"
                    value={formData.gender}
                    onChange={handleChange}
                    className="rounded-lg border border-gray-3 bg-gray-1 w-full py-3 px-5 outline-none duration-200 focus:border-transparent focus:shadow-input focus:ring-2 focus:ring-blue/20"
                  >
                    <option value="Nam">Nam</option>
                    <option value="Nữ">Nữ</option>
                    <option value="Khác">Khác</option>
                  </select>
                </div>
              </div>

              <div className="mb-5">
                <label htmlFor="address" className="block mb-2.5">
                  Địa chỉ
                </label>
                <textarea
                  name="address"
                  id="address"
                  placeholder="Nếu có, sẽ lưu làm địa chỉ mặc định"
                  value={formData.address}
                  onChange={handleChange}
                  rows={2}
                  className="rounded-lg border border-gray-3 bg-gray-1 placeholder:text-dark-5 w-full py-3 px-5 outline-none duration-200 focus:border-transparent focus:shadow-input focus:ring-2 focus:ring-blue/20"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5.5">
                <div>
                  <label htmlFor="password" className="block mb-2.5">
                    Mật khẩu <span className="text-red">*</span>
                  </label>
                  <input
                    type="password"
                    name="password"
                    id="password"
                    placeholder="Tối thiểu 6 ký tự"
                    autoComplete="new-password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    minLength={6}
                    className="rounded-lg border border-gray-3 bg-gray-1 placeholder:text-dark-5 w-full py-3 px-5 outline-none duration-200 focus:border-transparent focus:shadow-input focus:ring-2 focus:ring-blue/20"
                  />
                </div>
                <div>
                  <label htmlFor="confirmPassword" className="block mb-2.5">
                    Nhập lại mật khẩu <span className="text-red">*</span>
                  </label>
                  <input
                    type="password"
                    name="confirmPassword"
                    id="confirmPassword"
                    placeholder="Khớp với mật khẩu"
                    autoComplete="new-password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required
                    className="rounded-lg border border-gray-3 bg-gray-1 placeholder:text-dark-5 w-full py-3 px-5 outline-none duration-200 focus:border-transparent focus:shadow-input focus:ring-2 focus:ring-blue/20"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center font-medium text-white bg-dark py-3 px-6 rounded-lg ease-out duration-200 hover:bg-blue mt-7.5 disabled:opacity-50"
              >
                {loading ? "Đang tạo tài khoản…" : "Đăng ký"}
              </button>

              <p className="text-center mt-6">
                Đã có tài khoản?
                <Link href="/signin" className="text-dark ease-out duration-200 hover:text-blue pl-2">
                  Đăng nhập
                </Link>
              </p>
            </form>
          </div>
        </div>
      </section>
    </>
  );
};

export default Signup;
