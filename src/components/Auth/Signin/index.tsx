"use client";
import Breadcrumb from "@/components/Common/Breadcrumb";
import Link from "next/link";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useDispatch } from "react-redux";
import { loginStart, loginSuccess, loginFailure } from "@/redux/features/auth-slice";
import api from "@/utils/api";
import { toast } from "react-hot-toast";

const Signin = () => {
  const [formData, setFormData] = useState({
    usernameOrEmail: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const dispatch = useDispatch();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    dispatch(loginStart());

    try {
      const response = await api.post("/auth/login", formData);
      const { success, message, data } = response.data;

      if (success) {
        dispatch(loginSuccess({ user: data.user, token: data.token }));
        toast.success("Login successful!");
        router.push("/");
      } else {
        dispatch(loginFailure(message));
        toast.error(message);
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || "Invalid Username or Password";
      dispatch(loginFailure(errorMessage));
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleSocialLogin = async (provider: 'google' | 'facebook') => {
    // This is a placeholder for social login integration
    // Usually involves a client-side SDK to get the idToken
    toast.error(`${provider} login is not yet fully configured with client SDK.`);
  };

  return (
    <>
      <Breadcrumb title={"Signin"} pages={["Signin"]} />
      <section className="overflow-hidden py-20 bg-gray-2">
        <div className="max-w-[1170px] w-full mx-auto px-4 sm:px-8 xl:px-0">
          <div className="max-w-[570px] w-full mx-auto rounded-xl bg-white shadow-1 p-4 sm:p-7.5 xl:p-11">
            <div className="text-center mb-11">
              <h2 className="font-semibold text-xl sm:text-2xl xl:text-heading-5 text-dark mb-1.5">
                Sign In to Your Account
              </h2>
              <p>Enter your detail below</p>
            </div>

            <div>
              <form onSubmit={handleSubmit}>
                <div className="mb-5">
                  <label htmlFor="usernameOrEmail" className="block mb-2.5">
                    Username or Email
                  </label>

                  <input
                    type="text"
                    name="usernameOrEmail"
                    id="usernameOrEmail"
                    placeholder="Enter your username or email"
                    value={formData.usernameOrEmail}
                    onChange={handleChange}
                    required
                    className="rounded-lg border border-gray-3 bg-gray-1 placeholder:text-dark-5 w-full py-3 px-5 outline-none duration-200 focus:border-transparent focus:shadow-input focus:ring-2 focus:ring-blue/20"
                  />
                </div>

                <div className="mb-5">
                  <label htmlFor="password" className="block mb-2.5">
                    Password
                  </label>

                  <input
                    type="password"
                    name="password"
                    id="password"
                    placeholder="Enter your password"
                    autoComplete="on"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    className="rounded-lg border border-gray-3 bg-gray-1 placeholder:text-dark-5 w-full py-3 px-5 outline-none duration-200 focus:border-transparent focus:shadow-input focus:ring-2 focus:ring-blue/20"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex justify-center font-medium text-white bg-dark py-3 px-6 rounded-lg ease-out duration-200 hover:bg-blue mt-7.5 disabled:opacity-50"
                >
                  {loading ? "Signing in..." : "Sign in to account"}
                </button>

                <Link
                  href="/forgot-password"
                  className="block text-center text-dark-4 mt-4.5 ease-out duration-200 hover:text-dark"
                >
                  Forget your password?
                </Link>

                <span className="relative z-1 block font-medium text-center mt-4.5">
                  <span className="block absolute -z-1 left-0 top-1/2 h-px w-full bg-gray-3"></span>
                  <span className="inline-block px-3 bg-white">Or</span>
                </span>

                <div className="flex flex-col gap-4.5 mt-4.5">
                  <button 
                    type="button"
                    onClick={() => handleSocialLogin('google')}
                    className="flex justify-center items-center gap-3.5 rounded-lg border border-gray-3 bg-gray-1 p-3 ease-out duration-200 hover:bg-gray-2"
                  >
                    {/* Google SVG */}
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M19.999 10.2218C20.0111 9.53429 19.9387 8.84791 19.7834 8.17737H10.2031V11.8884H15.8267C15.7201 12.5391 15.4804 13.162 15.1219 13.7195C14.7634 14.2771 14.2935 14.7578 13.7405 15.1328L13.7209 15.2571L16.7502 17.5568L16.96 17.5774C18.8873 15.8329 19.999 13.2661 19.999 10.2218Z" fill="#4285F4"/>
                      <path d="M10.2036 20C12.9586 20 15.2715 19.1111 16.9609 17.5777L13.7409 15.1332C12.8793 15.7223 11.7229 16.1333 10.2036 16.1333C8.91317 16.126 7.65795 15.7206 6.61596 14.9746C5.57397 14.2287 4.79811 13.1802 4.39848 11.9777L4.2789 11.9877L1.12906 14.3766L1.08789 14.4888C1.93622 16.1457 3.23812 17.5386 4.84801 18.512C6.45791 19.4852 8.31194 20.0005 10.2036 20Z" fill="#34A853"/>
                      <path d="M4.39899 11.9776C4.1758 11.3411 4.06063 10.673 4.05807 9.9999C4.06218 9.3279 4.1731 8.66067 4.38684 8.02221L4.38115 7.88959L1.1927 5.46234L1.0884 5.51095C0.372762 6.90337 0 8.44075 0 9.99983C0 11.5589 0.372762 13.0962 1.0884 14.4887L4.39899 11.9776Z" fill="#FBBC05"/>
                      <path d="M10.2039 3.86663C11.6661 3.84438 13.0802 4.37803 14.1495 5.35558L17.0294 2.59997C15.1823 0.90185 12.7364 -0.0298855 10.2039 -3.67839e-05C8.31239 -0.000477835 6.45795 0.514733 4.84805 1.48799C3.23816 2.46123 1.93624 3.85417 1.08789 5.51101L4.38751 8.02225C4.79107 6.82005 5.5695 5.77231 6.61303 5.02675C7.65655 4.28119 8.91254 3.87541 10.2039 3.86663Z" fill="#EB4335"/>
                    </svg>
                    Sign In with Google
                  </button>

                  <button 
                    type="button"
                    onClick={() => handleSocialLogin('facebook')}
                    className="flex justify-center items-center gap-3.5 rounded-lg border border-gray-3 bg-gray-1 p-3 ease-out duration-200 hover:bg-gray-2"
                  >
                    {/* Facebook SVG - Placeholder for simplicity or use brand icons */}
                    <svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
                       <path d="M22 11C22 4.92487 17.0751 0 11 0C4.92487 0 0 4.92487 0 11C0 16.4912 4.0215 21.0425 9.28125 21.8688V14.1797H6.49219V11H9.28125V8.58047C9.28125 5.82891 10.9195 4.30469 13.4355 4.30469C14.6406 4.30469 15.9016 4.52187 15.9016 4.52187V7.22656H14.5148C13.1516 7.22656 12.7266 8.07266 12.7266 8.94062V11H15.7766L15.2883 14.1797H12.7266V21.8688C17.9785 21.0425 22 16.4912 22 11Z" fill="#1877F2"/>
                    </svg>
                    Sign In with Facebook
                  </button>
                </div>

                <p className="text-center mt-6">
                  Don&apos;t have an account?
                  <Link
                    href="/signup"
                    className="text-dark ease-out duration-200 hover:text-blue pl-2"
                  >
                    Sign Up Now!
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
