"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import PrimaryButton from "@/components/Admin/shared/PrimaryButton";
import {
  returnInspectionApi,
  type ReturnInspectionSummary,
} from "@/utils/returnInspectionApi";

type Tab = "pending" | "draft" | "processed";

const statusStyle: Record<string, string> = {
  pending: "bg-[#FEF3C7] text-yellow-dark-2",
  draft: "bg-[#DBEAFE] text-[#1D4ED8]",
  processed: "bg-green-light-6 text-green",
  rejected: "bg-red-light-6 text-red",
  cancelled: "bg-gray-3 text-[#6C6F93]",
};

const statusLabel: Record<string, string> = {
  pending: "Chờ kiểm định",
  draft: "Lưu tạm",
  processed: "Đã xử lý",
  rejected: "Từ chối",
  cancelled: "Đã hủy",
};

export default function ReturnInspectionListPanel() {
  const router = useRouter();
  const intakeRef = useRef<HTMLInputElement>(null);
  const [tab, setTab] = useState<Tab>("pending");
  const [intakeCode, setIntakeCode] = useState("");
  const [pending, setPending] = useState<ReturnInspectionSummary[]>([]);
  const [drafts, setDrafts] = useState<ReturnInspectionSummary[]>([]);
  const [processed, setProcessed] = useState<ReturnInspectionSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [pRes, dRes, prRes] = await Promise.all([
        returnInspectionApi.pending(),
        returnInspectionApi.drafts(),
        returnInspectionApi.processed(),
      ]);
      setPending(pRes.data.data ?? []);
      setDrafts(dRes.data.data ?? []);
      setProcessed(prRes.data.data ?? []);
    } catch {
      toast.error("Không tải được danh sách phiếu hoàn");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const handleIntake = async () => {
    const code = intakeCode.trim();
    if (!code) {
      toast.error("Quét Serial/IMEI hoặc mã vận đơn");
      return;
    }
    setSubmitting(true);
    try {
      const res = await returnInspectionApi.intake(code);
      if (res.data.success) {
        const data = res.data.data;
        toast.success(data.message);
        setIntakeCode("");
        if (data.redirectSheetId) {
          router.push(`/admin/return/${data.redirectSheetId}`);
        } else {
          await load();
        }
      }
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        "Tiếp nhận thất bại";
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const rows =
    tab === "pending" ? pending : tab === "draft" ? drafts : processed;

  const emptyMessage =
    tab === "pending"
      ? "Không có phiếu chờ kiểm định — quét mã vận đơn hoặc Serial ở trên"
      : tab === "draft"
        ? "Không có phiếu lưu tạm"
        : "Chưa có phiếu đã xử lý";

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-red-200 bg-gradient-to-r from-[#fef2f2] to-white p-5 shadow-sm">
        <h2 className="text-lg font-bold text-[#991B1B]">Tiếp nhận nhanh hàng hoàn</h2>
        <p className="text-sm text-[#6C6F93] mt-1 mb-4">
          Quét mã vận đơn GHN/GHTK hoặc Serial/IMEI trên kiện hàng — hệ thống tạo phiếu kiểm định.
        </p>
        <div className="flex flex-col sm:flex-row gap-3">
          <input
            ref={intakeRef}
            value={intakeCode}
            onChange={(e) => setIntakeCode(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") void handleIntake();
            }}
            placeholder="Quét Serial / IMEI / Mã vận đơn..."
            className="flex-1 px-4 py-3 border-2 border-[#FCA5A5] rounded-xl text-sm font-mono focus:border-red outline-none bg-white"
            autoComplete="off"
          />
          <PrimaryButton type="button" disabled={submitting} onClick={() => void handleIntake()}>
            {submitting ? "Đang tiếp nhận..." : "+ Tiếp nhận phiếu"}
          </PrimaryButton>
        </div>
      </div>

      <div className="flex gap-2 border-b border-gray-3/50 pb-1 flex-wrap">
        {(
          [
            { id: "pending" as const, label: `Chờ kiểm định (${pending.length})` },
            { id: "draft" as const, label: `Lưu tạm (${drafts.length})` },
            { id: "processed" as const, label: `Đã xử lý (${processed.length})` },
          ] as const
        ).map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={`px-4 py-2 text-sm font-semibold rounded-t-lg ${
              tab === t.id
                ? "bg-white border border-gray-3/60 border-b-white -mb-px text-[#DC2626]"
                : "text-[#6C6F93]"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-gray-3/50 overflow-hidden">
        {loading ? (
          <p className="px-6 py-8 text-sm text-[#8D93A5]">Đang tải...</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[960px]">
              <thead>
                <tr className="bg-[#fef2f2] border-b border-red-100">
                  <th className="text-left px-4 py-3 text-xs font-bold text-[#991B1B] uppercase">
                    Mã phiếu
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-bold text-[#991B1B] uppercase">
                    Serial
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-bold text-[#991B1B] uppercase">
                    Đơn hàng
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-bold text-[#991B1B] uppercase">
                    Khách hàng
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-bold text-[#991B1B] uppercase">
                    Sản phẩm
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-bold text-[#991B1B] uppercase">
                    Trạng thái
                  </th>
                  <th className="text-center px-4 py-3 text-xs font-bold text-[#991B1B] uppercase">
                    Thao tác
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-3/40">
                {rows.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-10 text-center text-sm text-[#8D93A5]">
                      {emptyMessage}
                    </td>
                  </tr>
                ) : (
                  rows.map((row) => (
                    <tr key={row.id} className="hover:bg-[#F7F9FC]/60">
                      <td className="px-4 py-3 text-sm font-semibold text-[#3C50E0]">
                        {row.sheetCode}
                      </td>
                      <td className="px-4 py-3 font-mono text-sm">{row.serialCode ?? "—"}</td>
                      <td className="px-4 py-3 text-sm">{row.orderCode ?? "—"}</td>
                      <td className="px-4 py-3 text-sm">
                        <p>{row.customerName ?? "—"}</p>
                        {row.customerPhone && (
                          <p className="text-xs text-[#8D93A5]">{row.customerPhone}</p>
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <p className="font-medium">{row.productName ?? "—"}</p>
                        <p className="text-xs text-[#8D93A5]">
                          {row.variantName} · {row.skuCode}
                        </p>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                            statusStyle[row.status] ?? "bg-gray-3 text-[#6C6F93]"
                          }`}
                        >
                          {statusLabel[row.status] ?? row.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        {row.status === "pending" || row.status === "draft" ? (
                          <Link
                            href={`/admin/return/${row.id}`}
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold text-white bg-[#3C50E0] hover:bg-[#2E3FB0]"
                          >
                            {row.status === "draft" ? "▶ Tiếp tục" : "▶ Xử lý phiếu"}
                          </Link>
                        ) : (
                          <Link
                            href={`/admin/return/${row.id}`}
                            className="text-xs font-semibold text-[#3C50E0] hover:underline"
                          >
                            Xem
                          </Link>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
