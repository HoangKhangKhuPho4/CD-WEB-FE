"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import Breadcrumb from "@/components/Common/Breadcrumb";
import { paymentService } from "@/utils/api";
import { useAppSelector } from "@/redux/store";

function parseSuccess(value: string | null): boolean | null {
  if (value === null) return null;
  if (value === "true" || value === "1") return true;
  if (value === "false" || value === "0") return false;
  return null;
}

export default function CheckoutResultPage() {
  const searchParams = useSearchParams();
  const { isAuthenticated } = useAppSelector((state) => state.authReducer);

  const vnpCode = searchParams.get("vnp_ResponseCode");
  const successParam = searchParams.get("success");
  const orderCode =
    searchParams.get("orderCode") ||
    searchParams.get("vnp_TxnRef") ||
    "";
  const urlMessage = searchParams.get("message");
  const urlPaymentStatus = searchParams.get("paymentStatus");

  const [verifying, setVerifying] = useState(false);
  const [serverStatus, setServerStatus] = useState<string | null>(null);
  const [serverMessage, setServerMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!orderCode || !isAuthenticated) return;
    setVerifying(true);
    void paymentService
      .getStatus(orderCode)
      .then((res) => {
        if (res.data?.success && res.data.data) {
          setServerStatus(res.data.data.paymentStatus);
          setServerMessage(res.data.data.message ?? null);
        }
      })
      .catch(() => {
        /* URL params vẫn dùng được */
      })
      .finally(() => setVerifying(false));
  }, [orderCode, isAuthenticated]);

  const success = useMemo(() => {
    if (serverStatus === "PAID") return true;
    if (serverStatus === "FAILED" || serverStatus === "REFUNDED") return false;
    const parsed = parseSuccess(successParam);
    if (parsed !== null) return parsed;
    if (vnpCode === "00") return true;
    if (vnpCode) return false;
    return false;
  }, [successParam, vnpCode, serverStatus]);

  const paymentStatus = serverStatus ?? urlPaymentStatus;
  const message = serverMessage ?? urlMessage;

  return (
    <>
      <Breadcrumb title="Kết quả thanh toán" pages={["checkout", "kết quả"]} />
      <section className="py-20 bg-gray-2">
        <div className="site-container max-w-lg mx-auto text-center bg-white rounded-xl shadow-1 p-10">
          {verifying && (
            <p className="text-sm text-gray-500 mb-4">Đang xác nhận thanh toán...</p>
          )}
          {success ? (
            <>
              <div className="w-16 h-16 rounded-full bg-green-light-6 text-green flex items-center justify-center mx-auto mb-6 text-2xl">
                ✓
              </div>
              <h1 className="text-2xl font-semibold text-dark mb-3">
                {paymentStatus === "PAID" || vnpCode === "00"
                  ? "Thanh toán thành công"
                  : "Đặt hàng thành công"}
              </h1>
              {orderCode && (
                <p className="text-dark-5 mb-6">
                  Mã đơn hàng: <strong className="text-dark">{orderCode}</strong>
                </p>
              )}
              {paymentStatus && (
                <p className="text-xs text-gray-500 mb-2">
                  Trạng thái: <strong>{paymentStatus}</strong>
                </p>
              )}
              <p className="text-sm text-dark-5 mb-8">
                {message ||
                  "Cảm ơn bạn đã mua sắm tại Bảo Khang Gadget. Bạn có thể theo dõi đơn trong mục Tài khoản."}
              </p>
            </>
          ) : (
            <>
              <div className="w-16 h-16 rounded-full bg-red-light-6 text-red flex items-center justify-center mx-auto mb-6 text-2xl">
                ✕
              </div>
              <h1 className="text-2xl font-semibold text-dark mb-3">
                Thanh toán chưa hoàn tất
              </h1>
              {orderCode && (
                <p className="text-dark-5 mb-4">
                  Mã đơn hàng: <strong className="text-dark">{orderCode}</strong>
                </p>
              )}
              {paymentStatus && (
                <p className="text-xs text-gray-500 mb-2">
                  Trạng thái: <strong>{paymentStatus}</strong>
                </p>
              )}
              <p className="text-sm text-dark-5 mb-8">
                {message ||
                  "Giao dịch bị hủy hoặc thất bại. Bạn có thể thử lại từ đơn hàng hoặc chọn COD."}
              </p>
            </>
          )}
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/my-account"
              className="inline-flex justify-center px-6 py-3 bg-blue text-white rounded-md hover:bg-blue-dark"
            >
              Xem đơn hàng
            </Link>
            <Link
              href="/shop-with-sidebar"
              className="inline-flex justify-center px-6 py-3 border border-gray-3 rounded-md hover:border-blue"
            >
              Tiếp tục mua sắm
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
