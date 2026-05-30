"use client";

import Image from "next/image";
import Link from "next/link";
import { FormEvent, useState } from "react";
import toast from "react-hot-toast";
import Breadcrumb from "@/components/Common/Breadcrumb";
import {
  createPublicWarrantyTicket,
  lookupWarrantyByCode,
  type WarrantyLookupResult,
} from "@/utils/warrantyApi";

function formatDateVi(iso?: string) {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatMoney(n?: number) {
  if (n == null) return "—";
  return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(n);
}

const DEVICE_STATUS_LABEL: Record<string, string> = {
  AVAILABLE: "Trong kho",
  RESERVED: "Đã giữ",
  SOLD: "Đã bán",
  DEFECTIVE: "Lỗi kho",
  RETURNED: "Trả hàng",
  IN_REPAIR: "Đang bảo hành",
};

const steps = [
  {
    title: "Chuẩn bị mã thiết bị",
    desc: "Lấy IMEI (15 số) hoặc số serial in trên hộp / phiếu bảo hành.",
  },
  {
    title: "Tra cứu trực tuyến",
    desc: "Xem thời hạn bảo hành, đơn mua hàng và tiến độ sửa chữa.",
  },
  {
    title: "Gửi yêu cầu BH",
    desc: "Điền form tiếp nhận hoặc mang máy và hóa đơn đến cửa hàng.",
  },
];

export default function WarrantyLookup() {
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<WarrantyLookupResult | null>(null);

  const [ticketForm, setTicketForm] = useState({
    customerName: "",
    customerPhone: "",
    issueDescription: "",
  });
  const [ticketSending, setTicketSending] = useState(false);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setResult(null);
    setLoading(true);
    try {
      const data = await lookupWarrantyByCode(code);
      setResult(data);
      setTicketForm((f) => ({
        ...f,
        issueDescription: "",
      }));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Tra cứu thất bại");
    } finally {
      setLoading(false);
    }
  };

  const onSubmitTicket = async (e: FormEvent) => {
    e.preventDefault();
    if (!code.trim()) return;
    setTicketSending(true);
    try {
      const res = await createPublicWarrantyTicket({
        imeiOrSerial: code.trim(),
        customerName: ticketForm.customerName.trim(),
        customerPhone: ticketForm.customerPhone.trim(),
        issueDescription: ticketForm.issueDescription.trim(),
      });
      toast.success(res.message ?? `Đã tạo phiếu ${res.ticketCode ?? ""}`);
      const refreshed = await lookupWarrantyByCode(code);
      setResult(refreshed);
      setTicketForm({ customerName: "", customerPhone: "", issueDescription: "" });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Gửi yêu cầu thất bại");
    } finally {
      setTicketSending(false);
    }
  };

  const w = result?.warranty;

  return (
    <>
      <Breadcrumb title="Tra cứu bảo hành" pages={["tra cứu bảo hành"]} />

      <section className="bg-gradient-to-b from-[#EEF2FF] to-gray-2 py-12 xl:py-16">
        <div className="site-container">
          <div className="max-w-3xl mx-auto text-center">
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/80 text-[#3C50E0] text-xs font-semibold border border-[#3C50E0]/20 mb-4">
              Dịch vụ chính hãng Bảo Khang Gadget
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-dark mb-3">
              Tra cứu bảo hành &amp; lịch sử mua hàng
            </h2>
            <p className="text-[#6C6F93] text-sm sm:text-base leading-relaxed">
              Nhập IMEI hoặc serial để xem thông tin bảo hành, đơn hàng liên quan và phiếu sửa chữa.
            </p>
          </div>

          <form
            onSubmit={(e) => void onSubmit(e)}
            className="mt-8 max-w-2xl mx-auto bg-white rounded-2xl shadow-1 border border-gray-3/60 p-4 sm:p-6"
          >
            <label htmlFor="warranty-code" className="block text-sm font-medium text-dark mb-2">
              IMEI / Số serial
            </label>
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                id="warranty-code"
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="Ví dụ: 356789012345678"
                className="flex-1 px-4 py-3.5 bg-[#F7F9FC] border border-gray-3 rounded-xl text-sm font-mono text-dark placeholder:text-[#8D93A5] focus:outline-none focus:border-[#3C50E0] focus:ring-2 focus:ring-[#3C50E0]/15"
                autoComplete="off"
                spellCheck={false}
              />
              <button
                type="submit"
                disabled={loading || !code.trim()}
                className="px-8 py-3.5 rounded-xl bg-[#3C50E0] text-white text-sm font-semibold hover:bg-[#1C3FB7] transition-colors disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
              >
                {loading ? "Đang kiểm tra..." : "Tra cứu"}
              </button>
            </div>
          </form>
        </div>
      </section>

      <section className="site-container py-10 xl:py-14 space-y-8">
        {error && (
          <div
            className="max-w-3xl mx-auto flex gap-3 p-4 rounded-xl border border-red-light-4 bg-red-light-6 text-red"
            role="alert"
          >
            <p className="text-sm font-medium">{error}</p>
          </div>
        )}

        {result && w && (
          <div className="max-w-3xl mx-auto space-y-6">
            {/* Bảo hành */}
            <div
              className={`rounded-2xl border overflow-hidden shadow-1 ${
                w.valid ? "border-green-light-5" : "border-yellow-light"
              }`}
            >
              <div
                className={`px-5 py-4 flex flex-wrap items-center justify-between gap-3 ${
                  w.valid ? "bg-green-light-6" : "bg-[#FEF3C7]"
                }`}
              >
                <p className={`text-sm font-semibold ${w.valid ? "text-green" : "text-yellow-dark-2"}`}>
                  {result.message || w.message}
                </p>
                <span
                  className={`text-xs font-bold uppercase px-3 py-1 rounded-full ${
                    w.valid ? "bg-green text-white" : "bg-yellow-dark-2 text-white"
                  }`}
                >
                  {w.valid ? "Còn bảo hành" : "Cần xác minh"}
                </span>
              </div>

              <div className="p-5 sm:p-6 flex flex-col sm:flex-row gap-6">
                <div className="relative w-full sm:w-36 h-36 shrink-0 rounded-xl bg-[#F7F9FC] border border-gray-3/50 overflow-hidden flex items-center justify-center">
                  {w.imageUrl ? (
                    <Image
                      src={w.imageUrl}
                      alt={w.productName ?? "Sản phẩm"}
                      fill
                      className="object-contain p-2"
                      sizes="144px"
                      unoptimized
                    />
                  ) : (
                    <span className="text-[#8D93A5] text-sm">Không có ảnh</span>
                  )}
                </div>
                <div className="flex-1 space-y-3">
                  <h3 className="text-lg font-bold text-dark">{w.productName ?? "Thiết bị"}</h3>
                  {w.variantName && <p className="text-sm text-[#6C6F93]">{w.variantName}</p>}
                  <dl className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                    <div className="rounded-lg bg-[#F7F9FC] px-3 py-2">
                      <dt className="text-xs text-[#8D93A5]">IMEI</dt>
                      <dd className="font-mono font-medium break-all">{w.imei ?? "—"}</dd>
                    </div>
                    <div className="rounded-lg bg-[#F7F9FC] px-3 py-2">
                      <dt className="text-xs text-[#8D93A5]">Serial</dt>
                      <dd className="font-mono font-medium break-all">{w.serialNumber ?? "—"}</dd>
                    </div>
                    <div className="rounded-lg bg-[#F7F9FC] px-3 py-2">
                      <dt className="text-xs text-[#8D93A5]">Bắt đầu BH</dt>
                      <dd>{formatDateVi(w.warrantyStartDate)}</dd>
                    </div>
                    <div className="rounded-lg bg-[#F7F9FC] px-3 py-2">
                      <dt className="text-xs text-[#8D93A5]">Hết hạn BH</dt>
                      <dd>{formatDateVi(w.warrantyEndDate)}</dd>
                    </div>
                    {w.status && (
                      <div className="rounded-lg bg-[#F7F9FC] px-3 py-2 sm:col-span-2">
                        <dt className="text-xs text-[#8D93A5]">Trạng thái thiết bị</dt>
                        <dd>{DEVICE_STATUS_LABEL[w.status] ?? w.status}</dd>
                      </div>
                    )}
                  </dl>
                </div>
              </div>
            </div>

            {/* Lịch sử mua hàng */}
            <div className="rounded-2xl border border-gray-3/50 bg-white shadow-1 overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-3/50 bg-[#F7F9FC]">
                <h3 className="font-bold text-dark">Lịch sử mua hàng</h3>
              </div>
              <div className="p-5">
                {result.purchase?.orderCode ? (
                  <dl className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                    <div>
                      <dt className="text-xs text-[#8D93A5]">Mã đơn hàng</dt>
                      <dd className="font-semibold text-[#3C50E0]">{result.purchase.orderCode}</dd>
                    </div>
                    <div>
                      <dt className="text-xs text-[#8D93A5]">Ngày đặt</dt>
                      <dd>{formatDateVi(result.purchase.orderDate)}</dd>
                    </div>
                    <div>
                      <dt className="text-xs text-[#8D93A5]">Trạng thái đơn</dt>
                      <dd>{result.purchase.orderStatusDisplay ?? result.purchase.orderStatus}</dd>
                    </div>
                    <div>
                      <dt className="text-xs text-[#8D93A5]">Thanh toán</dt>
                      <dd>{result.purchase.paymentMethod ?? "—"}</dd>
                    </div>
                    {result.purchase.lineTotal != null && (
                      <div>
                        <dt className="text-xs text-[#8D93A5]">Giá dòng hàng</dt>
                        <dd>{formatMoney(result.purchase.lineTotal)}</dd>
                      </div>
                    )}
                    <div>
                      <dt className="text-xs text-[#8D93A5]">Ngày giao</dt>
                      <dd>{formatDateVi(result.purchase.deliveredAt)}</dd>
                    </div>
                  </dl>
                ) : result.purchase?.soldAt ? (
                  <p className="text-sm text-[#6C6F93]">
                    Thiết bị đã bán ngày {formatDateVi(result.purchase.soldAt)}. Chưa liên kết mã đơn
                    chi tiết trên hệ thống.
                  </p>
                ) : (
                  <p className="text-sm text-[#6C6F93]">
                    Chưa có thông tin đơn bán lẻ cho thiết bị này (có thể chưa xuất kho bán hoặc nhập
                    IMEI thủ công).
                  </p>
                )}
              </div>
            </div>

            {/* Phiếu sửa chữa */}
            <div className="rounded-2xl border border-gray-3/50 bg-white shadow-1 overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-3/50 bg-[#F7F9FC]">
                <h3 className="font-bold text-dark">Phiếu bảo hành / sửa chữa</h3>
              </div>
              <div className="p-5">
                {result.repairTickets.length === 0 ? (
                  <p className="text-sm text-[#6C6F93]">Chưa có phiếu tiếp nhận cho thiết bị này.</p>
                ) : (
                  <ul className="space-y-3">
                    {result.repairTickets.map((t) => (
                      <li
                        key={t.ticketCode}
                        className="rounded-xl border border-gray-3/40 p-4 hover:bg-[#F7F9FC]/50"
                      >
                        <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                          <span className="font-semibold text-[#3C50E0]">{t.ticketCode}</span>
                          <span className="text-xs font-medium px-2 py-1 rounded-full bg-[#EEF2FF] text-[#3C50E0]">
                            {t.statusDisplay ?? t.status}
                          </span>
                        </div>
                        <p className="text-xs text-[#8D93A5] mb-1">
                          Tiếp nhận: {formatDateVi(t.receivedAt)}
                          {t.resolvedAt ? ` · Hoàn tất: ${formatDateVi(t.resolvedAt)}` : ""}
                        </p>
                        <p className="text-sm text-dark">{t.issueDescription}</p>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>

            {/* Gửi yêu cầu BH */}
            <div className="rounded-2xl border border-gray-3/50 bg-white shadow-1 overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-3/50 bg-[#F7F9FC]">
                <h3 className="font-bold text-dark">Gửi yêu cầu tiếp nhận bảo hành</h3>
                <p className="text-xs text-[#8D93A5] mt-1">
                  IMEI/serial đã nhập ở trên sẽ được dùng cho phiếu mới.
                </p>
              </div>
              <form className="p-5 space-y-4" onSubmit={(e) => void onSubmitTicket(e)}>
                <input
                  value={ticketForm.customerName}
                  onChange={(e) => setTicketForm((f) => ({ ...f, customerName: e.target.value }))}
                  placeholder="Họ và tên *"
                  className="w-full px-4 py-3 border border-gray-3 rounded-xl text-sm"
                  required
                />
                <input
                  value={ticketForm.customerPhone}
                  onChange={(e) => setTicketForm((f) => ({ ...f, customerPhone: e.target.value }))}
                  placeholder="Số điện thoại *"
                  className="w-full px-4 py-3 border border-gray-3 rounded-xl text-sm"
                  required
                />
                <textarea
                  value={ticketForm.issueDescription}
                  onChange={(e) =>
                    setTicketForm((f) => ({ ...f, issueDescription: e.target.value }))
                  }
                  placeholder="Mô tả tình trạng lỗi *"
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-3 rounded-xl text-sm resize-none"
                  required
                />
                <button
                  type="submit"
                  disabled={ticketSending}
                  className="w-full sm:w-auto px-8 py-3 rounded-xl bg-[#3C50E0] text-white text-sm font-semibold hover:bg-[#1C3FB7] disabled:opacity-50"
                >
                  {ticketSending ? "Đang gửi..." : "Gửi yêu cầu bảo hành"}
                </button>
              </form>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link
                href="/contact"
                className="inline-flex px-5 py-2.5 rounded-lg bg-[#3C50E0] text-white text-sm font-semibold"
              >
                Liên hệ hỗ trợ
              </Link>
              <button
                type="button"
                onClick={() => {
                  setResult(null);
                  setCode("");
                  setError(null);
                }}
                className="inline-flex px-5 py-2.5 rounded-lg border border-gray-3 text-sm font-medium text-[#6C6F93]"
              >
                Tra cứu mã khác
              </button>
            </div>
          </div>
        )}

        {!result && !error && !loading && (
          <div className="max-w-3xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-4">
            {steps.map((step, i) => (
              <div
                key={step.title}
                className="bg-white rounded-xl border border-gray-3/50 p-5"
              >
                <div className="w-10 h-10 rounded-full bg-[#3C50E0] text-white flex items-center justify-center text-sm font-bold mb-4">
                  {i + 1}
                </div>
                <h4 className="font-semibold text-dark mb-2">{step.title}</h4>
                <p className="text-sm text-[#6C6F93]">{step.desc}</p>
              </div>
            ))}
          </div>
        )}
      </section>
    </>
  );
}
