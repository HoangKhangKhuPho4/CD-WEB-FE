"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useDispatch } from "react-redux";
import { updateUser } from "@/redux/features/auth-slice";
import { canAccessAdminPanel } from "@/utils/adminApi";
import { getMe } from "@/utils/userApi";

export default function AdminAuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const dispatch = useDispatch();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function verify() {
      const token =
        localStorage.getItem("token") ?? sessionStorage.getItem("token");

      if (!token) {
        router.replace("/signin?redirect=/admin");
        return;
      }

      try {
        const user = await getMe();
        if (cancelled) return;
        dispatch(updateUser(user));
        if (!canAccessAdminPanel(user)) {
          router.replace("/");
          return;
        }
        setReady(true);
      } catch {
        if (!cancelled) router.replace("/signin?redirect=/admin");
      }
    }

    void verify();
    return () => {
      cancelled = true;
    };
  }, [router, dispatch]);

  if (!ready) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#F3F4F6]">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-[#3C50E0] border-t-transparent" />
      </div>
    );
  }

  return <>{children}</>;
}
