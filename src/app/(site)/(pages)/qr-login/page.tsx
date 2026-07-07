"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useDispatch } from "react-redux";
import QRCode from "react-qr-code";
import toast from "react-hot-toast";
import { qrService, QrGenerateResponse } from "@/utils/api";
import { loginSuccess } from "@/redux/features/auth-slice";

type QrStatus = "PENDING" | "SCANNED" | "CONFIRMED" | "EXPIRED" | "loading";

export default function QrLoginPage() {
  const router = useRouter();
  const dispatch = useDispatch();

  const [qrData, setQrData] = useState<QrGenerateResponse | null>(null);
  const [status, setStatus] = useState<QrStatus>("loading");
  const [countdown, setCountdown] = useState(120);
  const pollingRef = useRef<NodeJS.Timeout | null>(null);
  const countdownRef = useRef<NodeJS.Timeout | null>(null);

  const generateQr = useCallback(async () => {
    setStatus("loading");
    setCountdown(120);
    try {
      const res = await qrService.generate("QR_LOGIN");
      setQrData(res.data.data);
      setStatus("PENDING");
    } catch {
      toast.error("Không thể tạo mã QR, thử lại sau");
    }
  }, []);

  // Polling mỗi 2 giây
  const startPolling = useCallback((sessionId: string) => {
    if (pollingRef.current) clearInterval(pollingRef.current);
    pollingRef.current = setInterval(async () => {
      try {
        const res = await qrService.getStatus(sessionId);
        const { status: s, jwtToken, user } = res.data.data;
        setStatus(s);

        if (s === "CONFIRMED" && jwtToken && user) {
          clearInterval(pollingRef.current!);
          clearInterval(countdownRef.current!);
          localStorage.setItem("token", jwtToken);
          localStorage.setItem("user", JSON.stringify(user));
          dispatch(loginSuccess({ token: jwtToken, user: { ...user, email: user.email ?? "" } }));
          toast.success(`Xin chào, ${user.name}!`);
          router.push("/");
        } else if (s === "EXPIRED") {
          clearInterval(pollingRef.current!);
          clearInterval(countdownRef.current!);
        }
      } catch {}
    }, 2000);
  }, [dispatch, router]);

  // Countdown
  useEffect(() => {
    if (status === "PENDING" || status === "SCANNED") {
      countdownRef.current = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(countdownRef.current!);
            setStatus("EXPIRED");
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => { if (countdownRef.current) clearInterval(countdownRef.current); };
  }, [status]);

  useEffect(() => {
    generateQr();
    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
      if (countdownRef.current) clearInterval(countdownRef.current);
    };
  }, [generateQr]);

  useEffect(() => {
    if (qrData?.sessionId && status === "PENDING") {
      startPolling(qrData.sessionId);
    }
  }, [qrData, status, startPolling]);

  const formatCountdown = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;

  return (
    <section className="overflow-hidden py-20 bg-gray-2">
      <div className="max-w-[570px] mx-auto px-4">
        <div className="bg-white rounded-xl shadow-1 p-8 text-center">
          <h2 className="font-bold text-2xl text-dark mb-2">Đăng nhập bằng QR Code</h2>
          <p className="text-gray-500 text-sm mb-8">
            Mở ứng dụng trên điện thoại và quét mã để đăng nhập
          </p>

          {/* QR Box */}
          <div className="relative inline-flex items-center justify-center mb-6">
            <div className={`p-5 border-2 rounded-2xl transition-all ${
              status === "SCANNED" ? "border-yellow-400" :
              status === "CONFIRMED" ? "border-green-500" :
              status === "EXPIRED" ? "border-red-400 opacity-40" :
              "border-blue/30"
            }`}>
              {status === "loading" ? (
                <div className="w-48 h-48 flex items-center justify-center">
                  <div className="w-10 h-10 border-4 border-blue border-t-transparent rounded-full animate-spin" />
                </div>
              ) : (
                <>
                <QRCode
                  value={qrData?.qrContent || "loading"}
                  size={192}
                  level="M"
                  className={status === "EXPIRED" ? "opacity-30" : ""}
                />
              
                <div id="debug-qr-token" style={{ display: 'none' }}>
                  {qrData?.qrContent}</div>
                  </>
              )}
            </div>

            {/* Overlay messages */}
            {status === "SCANNED" && (
              <div className="absolute inset-0 flex flex-col items-center justify-center rounded-2xl bg-yellow-50/80 backdrop-blur-sm">
                <div className="text-4xl mb-2"></div>
                <p className="font-semibold text-yellow-700 text-sm">Đang chờ xác nhận...</p>
                <p className="text-yellow-600 text-xs mt-1">Xác nhận trên điện thoại</p>
              </div>
            )}
            {status === "EXPIRED" && (
              <div className="absolute inset-0 flex flex-col items-center justify-center rounded-2xl bg-red-50/90 backdrop-blur-sm">
                <div className="text-4xl mb-2"></div>
                <p className="font-semibold text-red-600 text-sm">Mã QR đã hết hạn</p>
              </div>
            )}
          </div>

          {/* Status + Countdown */}
          <div className="mb-6">
            {(status === "PENDING" || status === "SCANNED") && (
              <p className="text-sm text-gray-400">
                Mã hết hạn sau:{" "}
                <span className={`font-semibold ${countdown < 30 ? "text-red-500" : "text-dark"}`}>
                  {formatCountdown(countdown)}
                </span>
              </p>
            )}
            {status === "PENDING" && (
              <p className="text-xs text-gray-400 mt-1">Đang chờ quét mã...</p>
            )}
          </div>

          {/* Steps */}
          <div className="bg-gray-50 rounded-xl p-5 text-left mb-6">
            <p className="text-xs font-semibold text-dark uppercase tracking-wide mb-3">Hướng dẫn</p>
            {[
              "Mở ứng dụng Bảo Khang Gadget trên điện thoại",
              "Đăng nhập vào tài khoản của bạn",
              "Nhấn biểu tượng QR và quét mã",
              "Xác nhận đăng nhập trên điện thoại",
            ].map((step, i) => (
              <div key={i} className="flex items-start gap-3 mb-2 last:mb-0">
                <span className="w-5 h-5 rounded-full bg-blue text-white text-xs flex items-center justify-center shrink-0 mt-0.5">
                  {i + 1}
                </span>
                <p className="text-sm text-gray-600">{step}</p>
              </div>
            ))}
          </div>

          {/* Actions */}
          <div className="space-y-3">
            {status === "EXPIRED" && (
              <button
                onClick={generateQr}
                className="w-full bg-blue text-white font-semibold py-3 rounded-lg hover:bg-blue-dark transition"
              >
                Tạo mã QR mới
              </button>
            )}
            <a
              href="/qr-scan"
              className="block text-sm text-blue hover:underline"
            >
              Đã có mã trên màn hình khác? Quét bằng điện thoại →
            </a>
            <a
              href="/signin"
              className="block text-sm text-gray-500 hover:text-blue"
            >
              ← Đăng nhập bằng mật khẩu
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}