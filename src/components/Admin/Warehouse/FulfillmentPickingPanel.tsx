"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import PrimaryButton from "@/components/Admin/shared/PrimaryButton";
import { IconCheck } from "@/components/Admin/icons/AdminIcons";
import ShippingLabelDialog from "@/components/Admin/Warehouse/ShippingLabelDialog";
import { formatDateTime, formatVnd } from "@/utils/adminFormat";
import {
  warehouseFulfillmentApi,
  type FulfillmentDetail,
  type PickingLine,
  type ValidateScanResult,
} from "@/utils/warehouseFulfillmentApi";

const STATUS_LABELS: Record<string, string> = {
  CONFIRMED: "Chờ xuất",
  PROCESSING: "Đang gom hàng",
  SHIPPING: "Đang giao",
  DELIVERED: "Đã giao",
  COMPLETED: "Hoàn tất",
};

function displaySerial(hint?: { imei?: string; serialNumber?: string } | null) {
  if (!hint) return "—";
  if (hint.imei) return hint.imei;
  return hint.serialNumber ?? "—";
}

export default function FulfillmentPickingPanel({ orderId }: { orderId: number }) {
  const router = useRouter();
  const scanInputRef = useRef<HTMLInputElement>(null);
  const [detail, setDetail] = useState<FulfillmentDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeLineId, setActiveLineId] = useState<number | null>(null);
  const [scanCode, setScanCode] = useState("");
  const [scanResult, setScanResult] = useState<ValidateScanResult | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [overrideFifo, setOverrideFifo] = useState(false);
  const [overrideReason, setOverrideReason] = useState("");
  const [labelOpen, setLabelOpen] = useState(false);
  const [dispatchInfo, setDispatchInfo] = useState<{
    trackingCode?: string;
    ghnOrderCode?: string;
    printUrl?: string;
  } | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await warehouseFulfillmentApi.detail(orderId);
      if (res.data.success) {
        setDetail(res.data.data);
        const nextLine =
          res.data.data.progress.lines.find((l) => l.assignedCount < l.quantity) ??
          res.data.data.progress.lines[0];
        if (nextLine) setActiveLineId(nextLine.orderDetailId);
      }
    } catch {
      toast.error("Không tải được chi tiết xuất kho");
    } finally {
      setLoading(false);
    }
  }, [orderId]);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    if (detail?.canScan) {
      scanInputRef.current?.focus();
    }
  }, [detail?.canScan, activeLineId]);

  const activeLine: PickingLine | undefined = detail?.progress.lines.find(
    (l) => l.orderDetailId === activeLineId
  );

  const handleStartPicking = async () => {
    setSubmitting(true);
    try {
      const res = await warehouseFulfillmentApi.startPicking(orderId);
      if (res.data.success) {
        setDetail(res.data.data);
        toast.success("Đã bắt đầu gom hàng — đơn đã khóa cho bạn");
      }
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        "Không thể bắt đầu gom hàng";
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleValidateAndAssign = async () => {
    if (!activeLineId || !scanCode.trim()) {
      toast.error("Nhập hoặc quét mã serial/IMEI");
      return;
    }
    setSubmitting(true);
    try {
      const validateRes = await warehouseFulfillmentApi.validateScan(orderId, {
        orderDetailId: activeLineId,
        scannedCode: scanCode.trim(),
        overrideFifo,
        overrideReason: overrideReason.trim() || undefined,
      });
      const result = validateRes.data.data;
      setScanResult(result);

      if (!result.valid) {
        toast.error(result.message);
        return;
      }

      const assignRes = await warehouseFulfillmentApi.assignSerial(orderId, {
        orderDetailId: activeLineId,
        scannedCode: scanCode.trim(),
        overrideFifo,
        overrideReason: overrideReason.trim() || undefined,
      });

      if (assignRes.data.success) {
        toast.success("Đã gán serial vào đơn");
        setScanCode("");
        setScanResult(null);
        setOverrideFifo(false);
        setOverrideReason("");
        await load();
      }
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        "Gán serial thất bại";
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDispatch = async () => {
    setSubmitting(true);
    try {
      const res = await warehouseFulfillmentApi.dispatch(orderId);
      if (res.data.success) {
        toast.success("Đã bàn giao vận chuyển");
        setDispatchInfo({
          trackingCode: res.data.data.trackingCode,
          ghnOrderCode: res.data.data.ghnOrderCode,
          printUrl: res.data.data.printUrl,
        });
        setLabelOpen(true);
        await load();
      }
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        "Bàn giao thất bại";
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading || !detail) {
    return (
      <div className="rounded-xl border border-gray-3/50 bg-white p-10 text-center text-sm text-[#8D93A5]">
        Đang tải thông tin soạn hàng...
      </div>
    );
  }

  const progress = detail.progress;

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl border border-gray-3/50 p-6">
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
          <div>
            <p className="text-xs text-[#8D93A5]">Mã đơn</p>
            <h2 className="text-xl font-bold text-dark">{detail.orderCode}</h2>
            <p className="text-sm text-[#606882] mt-1">
              {detail.customerName} · {detail.customerPhone}
            </p>
            <p className="text-sm text-[#606882]">{detail.shippingAddress}</p>
            <p className="text-sm text-[#8D93A5] mt-2">
              Đặt {formatDateTime(detail.orderDate)} · {formatVnd(Number(detail.total))} ·{" "}
              {STATUS_LABELS[detail.status] ?? detail.status}
            </p>
            {detail.pickedByName && (
              <p className="text-xs text-[#3C50E0] mt-2">
                Người soạn: {detail.pickedByName}
                {detail.pickedAt ? ` · ${formatDateTime(detail.pickedAt)}` : ""}
              </p>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            {detail.canStartPicking && (
              <PrimaryButton type="button" disabled={submitting} onClick={() => void handleStartPicking()}>
                Bắt đầu gom hàng
              </PrimaryButton>
            )}
            <button
              type="button"
              onClick={() => router.push("/admin/warehouse-fulfillment")}
              className="px-4 py-2.5 text-sm font-semibold text-[#6C6F93] border border-gray-3 rounded-lg"
            >
              ← Danh sách
            </button>
          </div>
        </div>
      </div>

      {progress.totalRequired > 0 && (
        <div className="bg-white rounded-xl border border-gray-3/50 p-5">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-semibold text-dark">Tiến độ quét serial</p>
            <p className="text-sm font-bold text-[#3C50E0]">
              {progress.totalAssigned}/{progress.totalRequired}
            </p>
          </div>
          <div className="h-2 rounded-full bg-[#F7F9FC] overflow-hidden">
            <div
              className="h-full bg-[#3C50E0] transition-all"
              style={{
                width: `${progress.totalRequired ? (progress.totalAssigned / progress.totalRequired) * 100 : 0}%`,
              }}
            />
          </div>
        </div>
      )}

      {detail.canScan && progress.lines.length > 0 && (
        <div className="space-y-4">
          {progress.lines.map((line) => (
            <div
              key={line.orderDetailId}
              className={`bg-white rounded-xl border p-5 ${
                activeLineId === line.orderDetailId
                  ? "border-[#3C50E0] shadow-sm"
                  : "border-gray-3/50"
              }`}
            >
              <button
                type="button"
                onClick={() => setActiveLineId(line.orderDetailId)}
                className="w-full text-left"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold text-dark">{line.productName}</p>
                    <p className="text-xs text-[#8D93A5]">
                      {line.variantName} · SKU {line.skuCode}
                    </p>
                  </div>
                  <span className="text-sm font-bold text-[#3C50E0]">
                    {line.assignedCount}/{line.quantity}
                  </span>
                </div>
              </button>

              {activeLineId === line.orderDetailId && line.assignedCount < line.quantity && (
                <div className="mt-4 space-y-4 border-t border-gray-3/50 pt-4">
                  {line.nextFifoHint && (
                    <div className="rounded-lg bg-[#F0FDFA] border border-[#02AAA4]/30 p-4">
                      <p className="text-xs font-bold text-[#02AAA4] uppercase mb-2">
                        Chỉ dẫn FIFO — lấy máy cũ nhất
                      </p>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
                        <div>
                          <p className="text-[#8D93A5] text-xs">Serial / IMEI</p>
                          <p className="font-mono font-bold text-dark">
                            {displaySerial(line.nextFifoHint)}
                          </p>
                        </div>
                        <div>
                          <p className="text-[#8D93A5] text-xs">Vị trí kệ</p>
                          <p className="font-semibold">{line.nextFifoHint.location ?? "—"}</p>
                        </div>
                        <div>
                          <p className="text-[#8D93A5] text-xs">Lô hàng</p>
                          <p className="font-semibold">{line.nextFifoHint.batchNumber ?? "—"}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  <div>
                    <label className="text-xs font-semibold text-[#6C6F93]">
                      Quét mã vạch Serial / IMEI
                    </label>
                    <input
                      ref={scanInputRef}
                      value={scanCode}
                      onChange={(e) => {
                        setScanCode(e.target.value);
                        setScanResult(null);
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") void handleValidateAndAssign();
                      }}
                      placeholder="Đặt con trỏ vào đây và quét tem..."
                      className="mt-1 w-full px-4 py-3 border-2 border-[#3C50E0]/30 rounded-lg text-sm font-mono focus:border-[#3C50E0] outline-none"
                      autoComplete="off"
                    />
                  </div>

                  {scanResult && (
                    <p
                      className={`text-sm font-medium ${
                        scanResult.valid ? "text-green" : "text-red"
                      }`}
                    >
                      {scanResult.message}
                    </p>
                  )}

                  <label className="flex items-center gap-2 text-sm text-dark">
                    <input
                      type="checkbox"
                      checked={overrideFifo}
                      onChange={(e) => setOverrideFifo(e.target.checked)}
                    />
                    Override FIFO (tem hỏng / không tìm thấy máy)
                  </label>
                  {overrideFifo && (
                    <input
                      value={overrideReason}
                      onChange={(e) => setOverrideReason(e.target.value)}
                      placeholder="Lý do override..."
                      className="w-full px-3 py-2 border border-gray-3 rounded-lg text-sm"
                    />
                  )}

                  <PrimaryButton
                    type="button"
                    disabled={submitting}
                    onClick={() => void handleValidateAndAssign()}
                  >
                    {submitting ? "Đang xử lý..." : "Xác nhận quét & gán serial"}
                  </PrimaryButton>
                </div>
              )}

              {line.assignedSerials.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {line.assignedSerials.map((s) => (
                    <span
                      key={s}
                      className="px-2 py-1 bg-green-light-6 text-green text-xs font-mono rounded inline-flex items-center gap-1"
                    >
                      <IconCheck size={12} className="shrink-0" />
                      {s}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {detail.canDispatch && (
        <div className="bg-white rounded-xl border border-green-light-5 p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <p className="font-semibold text-dark">Sẵn sàng bàn giao</p>
            <p className="text-sm text-[#6C6F93]">
              Đã quét đủ serial — in tem và chuyển sang vận chuyển (GHN).
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {(detail.trackingCode || detail.ghnOrderCode) && (
              <button
                type="button"
                onClick={() => {
                  setDispatchInfo({
                    trackingCode: detail.trackingCode,
                    ghnOrderCode: detail.ghnOrderCode,
                  });
                  setLabelOpen(true);
                }}
                className="px-4 py-2.5 border border-[#3C50E0] text-[#3C50E0] text-sm font-semibold rounded-lg"
              >
                In nhãn dán
              </button>
            )}
            <PrimaryButton type="button" disabled={submitting} onClick={() => void handleDispatch()}>
              Xác nhận xuất kho & Bàn giao
            </PrimaryButton>
          </div>
        </div>
      )}

      <ShippingLabelDialog
        open={labelOpen}
        onClose={() => setLabelOpen(false)}
        orderCode={detail.orderCode}
        trackingCode={dispatchInfo?.trackingCode ?? detail.trackingCode}
        ghnOrderCode={dispatchInfo?.ghnOrderCode ?? detail.ghnOrderCode}
        printUrl={dispatchInfo?.printUrl}
      />
    </div>
  );
}
