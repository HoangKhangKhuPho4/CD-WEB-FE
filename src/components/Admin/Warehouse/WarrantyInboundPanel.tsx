"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import PrimaryButton from "@/components/Admin/shared/PrimaryButton";
import { adminWarrantyApi, type WarrantyLookupAdmin, type WarrantyTicket } from "@/utils/adminApi";
import { extractWarrantyError } from "@/components/Admin/Warranty/warrantyUtils";
import { formatDate } from "@/utils/adminFormat";

export default function WarrantyInboundPanel() {
  const [serial, setSerial] = useState("");
  const [lookingUp, setLookingUp] = useState(false);
  const [lookup, setLookup] = useState<WarrantyLookupAdmin | null>(null);
  const [pendingTickets, setPendingTickets] = useState<WarrantyTicket[]>([]);
  const [loadingList, setLoadingList] = useState(false);
  const [confirming, setConfirming] = useState<number | null>(null);

  const loadPending = async () => {
    setLoadingList(true);
    try {
      const res = await adminWarrantyApi.list({ status: "PENDING", page: 0, size: 20 });
      if (res.data.success) {
        setPendingTickets(res.data.data.content ?? []);
      }
    } catch {
      toast.error("Không tải danh sách phiếu chờ nhận");
    } finally {
      setLoadingList(false);
    }
  };

  const handleLookup = async () => {
    const code = serial.trim();
    if (!code) {
      toast.error("Nhập IMEI/Serial hoặc mã phiếu");
      return;
    }
    setLookingUp(true);
    setLookup(null);
    try {
      const res = await adminWarrantyApi.lookup(code);
      if (res.data.success) {
        setLookup(res.data.data);
        if (!res.data.data.found) toast.error(res.data.data.message || "Không tìm thấy");
      }
    } catch (e) {
      toast.error(extractWarrantyError(e, "Tra cứu thất bại"));
    } finally {
      setLookingUp(false);
    }
  };

  const confirmReceived = async (ticketId: number) => {
    setConfirming(ticketId);
    try {
      await adminWarrantyApi.updateStatus(ticketId, {
        status: "IN_PROGRESS",
        technicianNote: "Kho đã tiếp nhận thiết bị",
      });
      toast.success("Đã xác nhận tiếp nhận tại kho");
      setPendingTickets((prev) => prev.filter((t) => t.id !== ticketId));
    } catch (e) {
      toast.error(extractWarrantyError(e, "Không cập nhật được trạng thái"));
    } finally {
      setConfirming(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl border border-gray-3/50 p-6 space-y-4">
        <h2 className="text-lg font-bold text-dark">Tra cứu & tiếp nhận máy</h2>
        <p className="text-sm text-[#6C6F93]">
          Quét IMEI/Serial hoặc mã phiếu bảo hành khi khách gửi máy về kho.
        </p>
        <div className="flex flex-col sm:flex-row gap-3">
          <input
            value={serial}
            onChange={(e) => setSerial(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && void handleLookup()}
            placeholder="IMEI / Serial / Mã phiếu #WR-..."
            className="flex-1 px-4 py-2.5 border border-gray-3 rounded-lg text-sm font-mono"
          />
          <PrimaryButton onClick={() => void handleLookup()} disabled={lookingUp}>
            {lookingUp ? "Đang tra..." : "Tra cứu"}
          </PrimaryButton>
        </div>

        {lookup?.found && lookup.warranty && (
          <div className="rounded-lg bg-[#F7F9FC] p-4 text-sm space-y-1">
            <p className="font-semibold text-dark">
              {lookup.warranty.productName}
              {lookup.warranty.variantName ? ` · ${lookup.warranty.variantName}` : ""}
            </p>
            <p className="font-mono text-[#3C50E0]">
              {lookup.warranty.imei ?? lookup.warranty.serialNumber}
            </p>
            <p className={lookup.warranty.isValid ? "text-green" : "text-red"}>
              {lookup.warranty.message ?? (lookup.warranty.isValid ? "Còn bảo hành" : "Hết hạn BH")}
            </p>
            {lookup.purchase?.orderCode && (
              <p className="text-[#6C6F93]">Đơn mua: {lookup.purchase.orderCode}</p>
            )}
          </div>
        )}
      </div>

      <div className="flex items-center justify-between gap-4">
        <h2 className="text-lg font-bold text-dark">Phiếu chờ tiếp nhận</h2>
        <button
          type="button"
          onClick={() => void loadPending()}
          disabled={loadingList}
          className="text-sm font-semibold text-[#3C50E0] hover:underline disabled:opacity-50"
        >
          {loadingList ? "Đang tải..." : "Tải danh sách"}
        </button>
      </div>

      <div className="bg-white rounded-xl border border-gray-3/50 overflow-hidden">
        {pendingTickets.length === 0 ? (
          <p className="px-6 py-10 text-center text-sm text-[#8D93A5]">
            Nhấn &quot;Tải danh sách&quot; để xem phiếu PENDING hoặc tra cứu theo mã ở trên.
          </p>
        ) : (
          <table className="w-full min-w-[640px]">
            <thead>
              <tr className="bg-[#F7F9FC] border-b border-gray-3/50">
                <th className="text-left px-6 py-3 text-xs font-bold text-[#8D93A5] uppercase">Mã phiếu</th>
                <th className="text-left px-4 py-3 text-xs font-bold text-[#8D93A5] uppercase">Khách / SĐT</th>
                <th className="text-left px-4 py-3 text-xs font-bold text-[#8D93A5] uppercase">Thiết bị</th>
                <th className="text-left px-4 py-3 text-xs font-bold text-[#8D93A5] uppercase">Ngày</th>
                <th className="text-center px-6 py-3 text-xs font-bold text-[#8D93A5] uppercase">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-3/50">
              {pendingTickets.map((t) => (
                <tr key={t.id} className="hover:bg-[#F7F9FC]/60">
                  <td className="px-6 py-4 text-sm font-semibold text-[#3C50E0]">
                    {t.ticketCode ?? `#${t.id}`}
                  </td>
                  <td className="px-4 py-4 text-sm">
                    <p>{t.customerName}</p>
                    <p className="text-xs text-[#8D93A5]">{t.customerPhone}</p>
                  </td>
                  <td className="px-4 py-4 text-sm">
                    {t.productName}
                    <p className="text-xs font-mono text-[#8D93A5]">{t.imei ?? t.serialNumber}</p>
                  </td>
                  <td className="px-4 py-4 text-sm text-[#6C6F93]">
                    {t.receivedAt ? formatDate(t.receivedAt) : "—"}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <PrimaryButton
                      className="!px-3 !py-1.5 !text-xs"
                      disabled={confirming === t.id}
                      onClick={() => void confirmReceived(t.id)}
                    >
                      {confirming === t.id ? "..." : "Đã nhận máy"}
                    </PrimaryButton>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
