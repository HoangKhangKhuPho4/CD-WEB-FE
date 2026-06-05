"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import Breadcrumb from "@/components/Common/Breadcrumb";
import { qrService } from "@/utils/api";
import { parseQrTokenFromScan } from "@/utils/qrToken";
import { useAppSelector } from "@/redux/store";

type ScanStep = "idle" | "scanning" | "scanned" | "confirmed" | "error";
type QrMode = "QR_LOGIN" | "QR_ORDER_CONFIRMATION";

export default function QrScanPage() {
  const router = useRouter();
  const { isAuthenticated } = useAppSelector((state) => state.authReducer);
  const [step, setStep] = useState<ScanStep>("idle");
  const [qrMode, setQrMode] = useState<QrMode>("QR_LOGIN");
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [orderCode, setOrderCode] = useState<string | null>(null);
  const [confirming, setConfirming] = useState(false);
  const scannerRef = useRef<{ stop: () => Promise<void> } | null>(null);
  const handledRef = useRef(false);

  const stopScanner = useCallback(async () => {
    if (scannerRef.current) {
      try {
        await scannerRef.current.stop();
      } catch {
        /* ignore */
      }
      scannerRef.current = null;
    }
  }, []);

  const handleScanSuccess = useCallback(
    async (decodedText: string) => {
      if (handledRef.current) return;
      const token = parseQrTokenFromScan(decodedText);
      if (!token) {
        toast.error("Mã QR không hợp lệ");
        return;
      }

      handledRef.current = true;
      await stopScanner();
      setStep("scanning");

      try {
        const res = await qrService.scan(token);
        if (!res.data.success) {
          throw new Error(res.data.message || "Quét thất bại");
        }
        const data = res.data.data;
        setSessionId(data.sessionId);
        const mode =
          data.qrType === "QR_ORDER_CONFIRMATION"
            ? "QR_ORDER_CONFIRMATION"
            : "QR_LOGIN";
        setQrMode(mode);
        setOrderCode(data.orderCode ?? null);
        setStep("scanned");
        toast.success(
          mode === "QR_ORDER_CONFIRMATION"
            ? "Đã quét mã xác nhận đơn — nhấn xác nhận để hoàn tất"
            : "Đã quét mã — nhấn xác nhận để hoàn tất đăng nhập trên máy tính"
        );
      } catch (err: unknown) {
        handledRef.current = false;
        setStep("error");
        const msg =
          (err as { response?: { data?: { message?: string } } })?.response?.data
            ?.message ||
          (err instanceof Error ? err.message : "Quét QR thất bại");
        toast.error(msg);
      }
    },
    [stopScanner]
  );

  const startScanner = useCallback(async () => {
    if (!isAuthenticated) {
      toast.error("Vui lòng đăng nhập trên thiết bị này trước khi quét");
      router.push("/signin?redirect=/qr-scan");
      return;
    }

    handledRef.current = false;
    setSessionId(null);
    setOrderCode(null);
    setQrMode("QR_LOGIN");
    setStep("scanning");

    try {
      const { Html5Qrcode } = await import("html5-qrcode");
      const scanner = new Html5Qrcode("qr-reader", { verbose: false });
      scannerRef.current = scanner;

      await scanner.start(
        { facingMode: "environment" },
        { fps: 10, qrbox: { width: 260, height: 260 } },
        (decodedText) => {
          void handleScanSuccess(decodedText);
        },
        () => {}
      );
    } catch (err) {
      console.error(err);
      setStep("error");
      toast.error("Không mở được camera. Kiểm tra quyền truy cập.");
    }
  }, [handleScanSuccess, isAuthenticated, router]);

  const handleConfirm = async () => {
    if (!sessionId) return;
    setConfirming(true);
    try {
      const res = await qrService.confirm(sessionId);
      if (!res.data.success) {
        throw new Error(res.data.message || "Xác nhận thất bại");
      }
      const data = res.data.data;
      setStep("confirmed");
      if (qrMode === "QR_ORDER_CONFIRMATION") {
        toast.success(
          data.orderCode
            ? `Đã xác nhận đơn #${data.orderCode}`
            : "Đã xác nhận đơn hàng"
        );
      } else {
        toast.success("Đã xác nhận! Máy tính sẽ đăng nhập trong giây lát.");
      }
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ||
        (err instanceof Error ? err.message : "Xác nhận thất bại");
      toast.error(msg);
    } finally {
      setConfirming(false);
    }
  };

  useEffect(() => {
    if (!isAuthenticated) return;
    void startScanner();
    return () => {
      void stopScanner();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated]);

  const title =
    qrMode === "QR_ORDER_CONFIRMATION" ? "Quét QR xác nhận đơn" : "Quét mã QR";

  return (
    <>
      <Breadcrumb title={title} pages={["qr-scan"]} />
      <section className="py-16 bg-gray-2">
        <div className="site-container max-w-lg mx-auto">
          <div className="bg-white rounded-xl shadow-1 p-6 sm:p-8">
            <h1 className="text-xl font-bold text-dark mb-2 text-center">{title}</h1>
            <p className="text-sm text-dark-5 text-center mb-6">
              {qrMode === "QR_ORDER_CONFIRMATION"
                ? "Quét mã trên màn hình đặt hàng (máy tính), sau đó xác nhận trên điện thoại."
                : "Dùng điện thoại đã đăng nhập để quét mã trên màn hình máy tính, sau đó xác nhận."}
            </p>

            {!isAuthenticated ? (
              <div className="text-center py-8">
                <p className="text-dark-5 mb-4">Bạn cần đăng nhập trước khi quét.</p>
                <Link
                  href="/signin?redirect=/qr-scan"
                  className="inline-flex px-6 py-3 bg-blue text-white rounded-md hover:bg-blue-dark"
                >
                  Đăng nhập
                </Link>
              </div>
            ) : (
              <>
                <div
                  id="qr-reader"
                  className="w-full overflow-hidden rounded-lg border border-gray-3 min-h-[280px] bg-black/5"
                />
                
                {/* DEBUG HOOKS FOR AUTOMATED TESTING */}
                <div className="mt-4 p-4 bg-gray-100 rounded">
                  <p className="text-xs text-gray-500 mb-2">Debug Simulator:</p>
                  <input id="debug-scan-input" type="text" className="w-full p-2 border mb-2 text-xs" placeholder="Paste cdweb://qr?token=..." />
                  <button id="debug-scan-btn" type="button" onClick={() => handleScanSuccess((document.getElementById('debug-scan-input') as HTMLInputElement).value)} className="w-full bg-gray-800 text-white p-2 rounded text-sm">Simulate Scan</button>
                </div>

                {step === "scanned" && sessionId && (
                  <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    {orderCode && (
                      <p className="text-sm font-medium text-dark mb-2">
                        Đơn hàng: #{orderCode}
                      </p>
                    )}
                    <p className="text-sm text-dark mb-3">
                      {qrMode === "QR_ORDER_CONFIRMATION"
                        ? "Nhấn xác nhận để xác nhận đơn hàng."
                        : "Nhấn xác nhận để hoàn tất đăng nhập trên máy tính."}
                    </p>
                    <button
                      type="button"
                      onClick={handleConfirm}
                      disabled={confirming}
                      className="w-full py-3 bg-blue text-white font-medium rounded-md hover:bg-blue-dark disabled:opacity-60"
                    >
                      {confirming
                        ? "Đang xác nhận..."
                        : qrMode === "QR_ORDER_CONFIRMATION"
                          ? "Xác nhận đơn hàng"
                          : "Xác nhận đăng nhập"}
                    </button>
                  </div>
                )}

                {step === "confirmed" && (
                  <div className="mt-6 p-4 bg-green-light-6 rounded-lg text-center text-sm text-green space-y-2">
                    <p>Xác nhận thành công.</p>
                    {qrMode === "QR_ORDER_CONFIRMATION" ? (
                      <Link href="/my-account" className="text-blue underline block">
                        Xem đơn hàng của tôi
                      </Link>
                    ) : (
                      <p>Bạn có thể quay lại máy tính.</p>
                    )}
                  </div>
                )}

                <div className="mt-6 flex flex-col gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      void stopScanner().then(() => startScanner());
                    }}
                    className="w-full py-2.5 border border-gray-3 rounded-md text-sm hover:border-blue"
                  >
                    Quét lại
                  </button>
                  <Link
                    href="/qr-login"
                    className="block text-center text-sm text-blue hover:underline"
                  >
                    Tôi muốn hiển thị mã QR (máy tính)
                  </Link>
                </div>
              </>
            )}
          </div>
        </div>
      </section>
    </>
  );
}
