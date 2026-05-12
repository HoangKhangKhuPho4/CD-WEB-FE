"use client";
import Breadcrumb from "@/components/Common/Breadcrumb";
import Link from "next/link";
import Script from "next/script";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useDispatch } from "react-redux";
import { loginStart, loginSuccess, loginFailure } from "@/redux/features/auth-slice";
import { getAuthErrorMessage, login, loginFacebook, loginGoogle } from "@/utils/authApi";
import { toast } from "react-hot-toast";

const Signin = () => {
  const [formData, setFormData] = useState({
    usernameOrEmail: "",
    password: "",
  });
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleScriptReady, setGoogleScriptReady] = useState(false);
  const [fbReady, setFbReady] = useState(false);
  const googleBtnContainerRef = useRef<HTMLDivElement>(null);
  const googleRenderedRef = useRef(false);
  const rememberMeRef = useRef(rememberMe);
  const router = useRouter();
  const searchParams = useSearchParams();
  const dispatch = useDispatch();

  const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
  const facebookAppId = process.env.NEXT_PUBLIC_FACEBOOK_APP_ID;

  rememberMeRef.current = rememberMe;

  useEffect(() => {
    const pre = searchParams.get("email");
    if (pre) {
      setFormData((fd) => ({ ...fd, usernameOrEmail: pre }));
    }
  }, [searchParams]);

  const handleGoogleCredential = useCallback(
    async (credentialResponse: { credential: string }) => {
      const idToken = credentialResponse.credential;
      if (!idToken) return;
      setLoading(true);
      dispatch(loginStart());
      try {
        const body = await loginGoogle(idToken);
        if (body.data) {
          dispatch(
            loginSuccess({
              user: body.data.user,
              token: body.data.token,
              rememberMe: rememberMeRef.current,
            })
          );
          toast.success("Đăng nhập thành công!");
          router.push("/");
        }
      } catch (err) {
        const msg = getAuthErrorMessage(err);
        dispatch(loginFailure(msg));
        toast.error(msg);
      } finally {
        setLoading(false);
      }
    },
    [dispatch, router]
  );

  useEffect(() => {
    if (!googleScriptReady || !googleClientId || !googleBtnContainerRef.current) return;
    if (googleRenderedRef.current) return;
    const container = googleBtnContainerRef.current;
    if (container.childNodes.length > 0) return;
    const g = window.google;
    if (!g?.accounts?.id) return;
    g.accounts.id.initialize({
      client_id: googleClientId,
      callback: handleGoogleCredential,
    });
    g.accounts.id.renderButton(container, {
      theme: "outline",
      size: "large",
      width: "100%",
      locale: "vi",
    });
    googleRenderedRef.current = true;
  }, [googleScriptReady, googleClientId, handleGoogleCredential]);

  useEffect(() => {
    if (!facebookAppId || typeof window === "undefined") return;
    if (document.getElementById("facebook-jssdk")) {
      if (window.FB) setFbReady(true);
      return;
    }
    window.fbAsyncInit = () => {
      window.FB?.init({
        appId: facebookAppId,
        cookie: true,
        xfbml: true,
        version: "v21.0",
      });
      setFbReady(true);
    };
    const script = document.createElement("script");
    script.id = "facebook-jssdk";
    script.async = true;
    script.defer = true;
    script.src = "https://connect.facebook.net/vi_VN/sdk.js";
    document.body.appendChild(script);
  }, [facebookAppId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    dispatch(loginStart());

    try {
      const body = await login(formData.usernameOrEmail, formData.password);
      if (body.data) {
        dispatch(
          loginSuccess({
            user: body.data.user,
            token: body.data.token,
            rememberMe,
          })
        );
        toast.success("Đăng nhập thành công!");
        router.push("/");
      }
    } catch (err) {
      const friendly =
        getAuthErrorMessage(err) === "Invalid credentials"
          ? "Tên đăng nhập hoặc mật khẩu không đúng."
          : getAuthErrorMessage(err);
      dispatch(loginFailure(friendly));
      toast.error(friendly);
    } finally {
      setLoading(false);
    }
  };

  const handleFacebookLogin = () => {
    if (!facebookAppId) {
      toast.error("Chưa cấu hình NEXT_PUBLIC_FACEBOOK_APP_ID.");
      return;
    }
    if (!fbReady || !window.FB) {
      toast.error("Facebook SDK đang tải, vui lòng thử lại sau vài giây.");
      return;
    }
    setLoading(true);
    dispatch(loginStart());
    window.FB.login(
      async (response) => {
        const accessToken = response.authResponse?.accessToken;
        if (!accessToken) {
          setLoading(false);
          dispatch(loginFailure(""));
          return;
        }
        try {
          const body = await loginFacebook(accessToken);
          if (body.data) {
            dispatch(
              loginSuccess({
                user: body.data.user,
                token: body.data.token,
                rememberMe: rememberMeRef.current,
              })
            );
            toast.success("Đăng nhập thành công!");
            router.push("/");
          }
        } catch (err) {
          const msg = getAuthErrorMessage(err);
          dispatch(loginFailure(msg));
          toast.error(msg);
        } finally {
          setLoading(false);
        }
      },
      { scope: "email,public_profile" }
    );
  };

  return (
    <>
      {googleClientId ? (
        <Script
          src="https://accounts.google.com/gsi/client"
          strategy="lazyOnload"
          onLoad={() => setGoogleScriptReady(true)}
        />
      ) : null}
      <div id="fb-root" />
      <Breadcrumb title={"Đăng Nhập"} pages={["Đăng Nhập"]} />
      <section className="overflow-hidden py-20 bg-gray-2">
        <div className="max-w-[1170px] w-full mx-auto px-4 sm:px-8 xl:px-0">
          <div className="max-w-[570px] w-full mx-auto rounded-xl bg-white shadow-1 p-4 sm:p-7.5 xl:p-11">
            <div className="text-center mb-11">
              <h2 className="font-semibold text-xl sm:text-2xl xl:text-heading-5 text-dark mb-1.5">
                Đăng Nhập Vào Tài Khoản
              </h2>
              <p>Nhập thông tin của bạn dưới đây</p>
            </div>

            <div>
              <form onSubmit={handleSubmit} aria-busy={loading}>
                <div className="mb-5">
                  <label htmlFor="usernameOrEmail" className="block mb-2.5">
                    Tên đăng nhập hoặc Email
                  </label>

                  <input
                    type="text"
                    name="usernameOrEmail"
                    id="usernameOrEmail"
                    placeholder="Ví dụ: nguyenvana hoặc a@b.com"
                    value={formData.usernameOrEmail}
                    onChange={handleChange}
                    required
                    autoComplete="username"
                    className="rounded-lg border border-gray-3 bg-gray-1 placeholder:text-dark-5 w-full py-3 px-5 outline-none duration-200 focus:border-transparent focus:shadow-input focus:ring-2 focus:ring-blue/20"
                  />
                </div>

                <div className="mb-5">
                  <label htmlFor="password" className="block mb-2.5">
                    Mật khẩu
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      id="password"
                      placeholder="Nhập mật khẩu"
                      autoComplete="current-password"
                      value={formData.password}
                      onChange={handleChange}
                      required
                      className="rounded-lg border border-gray-3 bg-gray-1 placeholder:text-dark-5 w-full py-3 pr-12 pl-5 outline-none duration-200 focus:border-transparent focus:shadow-input focus:ring-2 focus:ring-blue/20"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((v) => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-dark-4 hover:text-dark"
                      aria-label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                    >
                      {showPassword ? "Ẩn" : "Hiện"}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between gap-3 mb-2">
                  <label className="inline-flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="rounded border-gray-3"
                    />
                    <span className="text-sm">Ghi nhớ đăng nhập</span>
                  </label>
                  <Link
                    href="/forgot-password"
                    className="text-sm text-dark-4 ease-out duration-200 hover:text-dark"
                  >
                    Quên mật khẩu?
                  </Link>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  aria-busy={loading}
                  className="w-full flex justify-center font-medium text-white bg-dark py-3 px-6 rounded-lg ease-out duration-200 hover:bg-blue mt-5 disabled:opacity-50"
                >
                  {loading ? "Đang đăng nhập..." : "Đăng nhập"}
                </button>

                <span className="relative z-1 block font-medium text-center mt-6">
                  <span className="block absolute -z-1 left-0 top-1/2 h-px w-full bg-gray-3"></span>
                  <span className="inline-block px-3 bg-white">Hoặc đăng nhập với</span>
                </span>

                <div className="flex flex-col gap-4.5 mt-4.5">
                  {googleClientId ? (
                    <div ref={googleBtnContainerRef} className="min-h-[40px] w-full flex justify-center" />
                  ) : (
                    <p className="text-center text-sm text-dark-4">
                      Đăng nhập Google: thiếu NEXT_PUBLIC_GOOGLE_CLIENT_ID trong môi trường.
                    </p>
                  )}

                  <button
                    type="button"
                    onClick={handleFacebookLogin}
                    disabled={loading || !facebookAppId}
                    className="flex justify-center items-center gap-3.5 rounded-lg border border-gray-3 bg-gray-1 p-3 ease-out duration-200 hover:bg-gray-2 disabled:opacity-50"
                  >
                    <svg
                      width="22"
                      height="22"
                      viewBox="0 0 22 22"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      aria-hidden
                    >
                      <path
                        d="M22 11C22 4.92487 17.0751 0 11 0C4.92487 0 0 4.92487 0 11C0 16.4912 4.0215 21.0425 9.28125 21.8688V14.1797H6.49219V11H9.28125V8.58047C9.28125 5.82891 10.9195 4.30469 13.4355 4.30469C14.6406 4.30469 15.9016 4.52187 15.9016 4.52187V7.22656H14.5148C13.1516 7.22656 12.7266 8.07266 12.7266 8.94062V11H15.7766L15.2883 14.1797H12.7266V21.8688C17.9785 21.0425 22 16.4912 22 11Z"
                        fill="#1877F2"
                      />
                    </svg>
                    Đăng nhập với Facebook
                  </button>
                  {!facebookAppId ? (
                    <p className="text-center text-sm text-dark-4">
                      Facebook: thêm NEXT_PUBLIC_FACEBOOK_APP_ID để bật nút.
                    </p>
                  ) : null}
                </div>

                <p className="text-center mt-6">
                  Chưa có tài khoản?
                  <Link
                    href="/signup"
                    className="text-dark ease-out duration-200 hover:text-blue pl-2"
                  >
                    Đăng ký ngay
                  </Link>
                </p>
              </form>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default Signin;
