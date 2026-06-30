"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import Modal from "@/components/Admin/shared/Modal";
import PrimaryButton from "@/components/Admin/shared/PrimaryButton";
import {
  IconCheck,
  IconCheckCircle,
  InventoryAuditStatusLabel,
} from "@/components/Admin/icons/AdminIcons";
import {
  adminInventoryAuditApi,
  type InventoryAuditFeStatus,
  type InventoryAuditSheet,
} from "@/utils/adminApi";

const statusChip: Record<
  InventoryAuditFeStatus,
  { label: string; className: string }
> = {
  pending_approval: {
    label: "Chờ duyệt",
    className: "bg-[#FEF3C7] text-yellow-dark-2",
  },
  submitted: {
    label: "Chờ duyệt",
    className: "bg-[#FEF3C7] text-yellow-dark-2",
  },
  approved: { label: "Đã duyệt", className: "bg-green-light-6 text-green" },
  rejected: { label: "Từ chối", className: "bg-red-light-6 text-red" },
  in_progress: { label: "Đang quét", className: "bg-blue-light-5 text-[#3C50E0]" },
  reconciled: { label: "Đã đối chiếu", className: "bg-[#E0E7FF] text-[#4338CA]" },
  draft: { label: "Nháp", className: "bg-gray-3 text-[#6C6F93]" },
};

function SheetListItem({
  sheet,
  selected,
  onSelect,
}: {
  sheet: InventoryAuditSheet;
  selected: boolean;
  onSelect: () => void;
}) {
  const chip = statusChip[sheet.status] ?? statusChip.pending_approval;
  return (
    <button
      type="button"
      onClick={onSelect}
      className={`w-full text-left px-4 py-3 rounded-lg border transition-colors ${
        selected
          ? "border-[#7C3AED] bg-[#F5F3FF]"
          : "border-gray-3/50 hover:bg-[#F7F9FC]"
      }`}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="font-semibold text-[#3C50E0] text-sm">{sheet.code}</span>
        <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${chip.className}`}>
          {chip.label}
        </span>
      </div>
      <p className="text-xs text-[#8D93A5] mt-1 truncate">
        {sheet.categoryName ?? "—"} · {sheet.createdAt}
      </p>
    </button>
  );
}

function AuditDetailView({ sheet }: { sheet: InventoryAuditSheet }) {
  const chip = statusChip[sheet.status] ?? statusChip.pending_approval;
  const isPending =
    sheet.status === "pending_approval" || sheet.status === "submitted";

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center gap-2">
        <h3 className="text-lg font-bold text-dark">{sheet.code}</h3>
        <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${chip.className}`}>
          {chip.label}
        </span>
        <span className="text-sm text-[#6C6F93]">· {sheet.categoryName}</span>
      </div>

      {sheet.note && (
        <div className="rounded-lg border border-[#BBF7D0] bg-[#F0FDF4] px-4 py-3">
          <p className="text-xs font-bold text-[#166534] uppercase mb-1">Ghi chú kho</p>
          <p className="text-sm text-[#166534]">{sheet.note}</p>
        </div>
      )}

      {sheet.rejectReason && sheet.status === "rejected" && (
        <div className="rounded-lg border border-red-200 bg-[#fef2f2] px-4 py-3">
          <p className="text-xs font-bold text-red uppercase mb-1">Lý do từ chối</p>
          <p className="text-sm text-red">{sheet.rejectReason}</p>
        </div>
      )}

      <div className="flex flex-wrap gap-3 text-sm">
        <span className="px-3 py-1 rounded-full bg-green-light-6 text-green font-semibold">
          Khớp: {sheet.matched}
        </span>
        <span className="px-3 py-1 rounded-full bg-red-light-6 text-red font-semibold">
          Thiếu: {sheet.missing}
        </span>
        <span className="px-3 py-1 rounded-full bg-[#FFF7ED] text-orange-600 font-semibold">
          Thừa: {sheet.surplus}
        </span>
        <span className="px-3 py-1 rounded-full bg-[#F7F9FC] text-[#6C6F93]">
          Hệ thống: {sheet.expected} serial
        </span>
      </div>

      <div className="overflow-x-auto border border-gray-3/50 rounded-lg">
        <table className="w-full text-sm min-w-[560px]">
          <thead>
            <tr className="bg-[#F7F9FC]">
              <th className="text-left px-4 py-3 text-xs text-[#8D93A5]">Sản phẩm</th>
              <th className="text-center px-4 py-3 text-xs text-[#8D93A5]">SL hệ thống</th>
              <th className="text-center px-4 py-3 text-xs text-[#8D93A5]">SL thực tế</th>
              <th className="text-center px-4 py-3 text-xs text-[#8D93A5]">Chênh lệch</th>
              <th className="text-center px-4 py-3 text-xs text-[#8D93A5]">Trạng thái</th>
            </tr>
          </thead>
          <tbody>
            {(sheet.lines ?? []).length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-[#8D93A5] text-xs">
                  Chưa có dữ liệu đối chiếu
                </td>
              </tr>
            ) : (
              (sheet.lines ?? []).map((line, i) => {
                const rowBg =
                  line.variance === 0
                    ? "bg-[#f0fdf4]"
                    : line.variance < 0
                      ? "bg-[#fef2f2]"
                      : "bg-[#fff7ed]";
                return (
                  <tr key={i} className={`border-t border-gray-3/30 ${rowBg}`}>
                    <td className="px-4 py-3">
                      <p className="font-semibold text-xs">{line.productName}</p>
                      <p className="text-[10px] text-[#8D93A5]">{line.skuCode}</p>
                    </td>
                    <td className="px-4 py-3 text-center font-medium">{line.systemQty}</td>
                    <td className="px-4 py-3 text-center font-medium">{line.actualQty}</td>
                    <td
                      className={`px-4 py-3 text-center font-bold ${
                        line.variance < 0
                          ? "text-red"
                          : line.variance > 0
                            ? "text-orange-600"
                            : "text-green"
                      }`}
                    >
                      {line.variance > 0 ? `+${line.variance}` : line.variance}
                    </td>
                    <td className="px-4 py-3 text-center text-xs font-semibold">
                      <InventoryAuditStatusLabel status={line.status} />
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {(sheet.missingCodes?.length ?? 0) > 0 && (
        <div className="rounded-xl border border-red-200 bg-[#fef2f2] p-5">
          <h4 className="text-red font-bold mb-3 text-sm">
            Serial hệ thống có nhưng không quét ra ({sheet.missingCodes?.length})
          </h4>
          <div className="flex flex-wrap gap-2">
            {sheet.missingCodes?.map((code) => (
              <code
                key={code}
                className="px-2 py-1 bg-white rounded text-xs font-mono text-red border border-red-100"
              >
                {code}
              </code>
            ))}
          </div>
        </div>
      )}

      {(sheet.discrepancies?.length ?? 0) > 0 && (
        <div className="bg-white rounded-xl border border-gray-3/50 overflow-hidden">
          <h4 className="px-5 py-3 font-bold text-dark border-b border-gray-3/50 text-sm">
            Chi tiết mã lệch
          </h4>
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-[#F7F9FC]">
                <th className="text-left px-4 py-2 text-xs">Serial</th>
                <th className="text-left px-4 py-2 text-xs">Loại</th>
                <th className="text-left px-4 py-2 text-xs">Ghi chú</th>
              </tr>
            </thead>
            <tbody>
              {sheet.discrepancies?.map((d, i) => (
                <tr key={i} className="border-t border-gray-3/30">
                  <td className="px-4 py-2 font-mono text-xs">{d.serial}</td>
                  <td className="px-4 py-2">
                    <span
                      className={`px-2 py-0.5 rounded text-xs font-semibold ${
                        d.type === "MISSING"
                          ? "bg-red-light-6 text-red"
                          : "bg-[#FFF7ED] text-orange-600"
                      }`}
                    >
                      {d.type === "MISSING" ? "Thiếu" : "Thừa/Lệch"}
                    </span>
                  </td>
                  <td className="px-4 py-2 text-xs">{d.productName ?? d.message}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {sheet.status === "approved" && (
        <p className="text-sm text-green font-semibold inline-flex items-center gap-1.5">
          <IconCheck size={16} className="shrink-0" />
          Đã duyệt{sheet.approvedByName ? ` bởi ${sheet.approvedByName}` : ""} — tồn kho đã cân
          bằng.
        </p>
      )}

      {!isPending && sheet.status !== "approved" && sheet.status !== "rejected" && (
        <p className="text-sm text-[#6C6F93]">Phiếu này không ở trạng thái chờ duyệt.</p>
      )}
    </div>
  );
}

export default function InventoryAuditApprovalPanel() {
  const [pending, setPending] = useState<InventoryAuditSheet[]>([]);
  const [processed, setProcessed] = useState<InventoryAuditSheet[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [detail, setDetail] = useState<InventoryAuditSheet | null>(null);
  const [loading, setLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [rejectOpen, setRejectOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState("");

  const loadLists = useCallback(async () => {
    setLoading(true);
    try {
      const [pendingRes, processedRes] = await Promise.all([
        adminInventoryAuditApi.pending(),
        adminInventoryAuditApi.processed(),
      ]);
      const pendingRows = pendingRes.data.data ?? [];
      const processedRows = processedRes.data.data ?? [];
      setPending(pendingRows);
      setProcessed(processedRows);
      return { pendingRows, processedRows };
    } catch {
      toast.error("Không tải được danh sách phiếu kiểm kê");
      setPending([]);
      setProcessed([]);
      return { pendingRows: [] as InventoryAuditSheet[], processedRows: [] as InventoryAuditSheet[] };
    } finally {
      setLoading(false);
    }
  }, []);

  const loadDetail = useCallback(async (id: number) => {
    setDetailLoading(true);
    try {
      const res = await adminInventoryAuditApi.get(id);
      if (res.data.success) {
        setDetail(res.data.data);
      }
    } catch {
      toast.error("Không tải được chi tiết phiếu");
      setDetail(null);
    } finally {
      setDetailLoading(false);
    }
  }, []);

  useEffect(() => {
    void (async () => {
      const { pendingRows } = await loadLists();
      if (pendingRows.length > 0) {
        setSelectedId(pendingRows[0].id);
      } else {
        setSelectedId(null);
        setDetail(null);
      }
    })();
  }, [loadLists]);

  useEffect(() => {
    if (selectedId != null) {
      void loadDetail(selectedId);
    } else {
      setDetail(null);
    }
  }, [selectedId, loadDetail]);

  const selectSheet = (id: number) => setSelectedId(id);

  const refreshAfterAction = async () => {
    const { pendingRows, processedRows } = await loadLists();
    if (pendingRows.some((p) => p.id === selectedId)) {
      if (selectedId != null) await loadDetail(selectedId);
      return;
    }
    if (processedRows.length > 0) {
      setSelectedId(processedRows[0].id);
    } else if (pendingRows.length > 0) {
      setSelectedId(pendingRows[0].id);
    } else {
      setSelectedId(null);
      setDetail(null);
    }
  };

  const handleApprove = async () => {
    if (!detail) return;
    setActionLoading(true);
    try {
      const res = await adminInventoryAuditApi.approve(detail.id);
      if (res.data.success) {
        toast.success("Đã phê duyệt và cân bằng kho");
        await refreshAfterAction();
      }
    } catch (err: unknown) {
      const msg =
        err && typeof err === "object" && "response" in err
          ? (err as { response?: { data?: { message?: string } } }).response?.data?.message
          : null;
      toast.error(msg ?? "Phê duyệt thất bại");
    } finally {
      setActionLoading(false);
    }
  };

  const confirmReject = async () => {
    if (!detail) return;
    if (!rejectReason.trim()) {
      toast.error("Vui lòng nhập lý do từ chối");
      return;
    }
    setActionLoading(true);
    try {
      const res = await adminInventoryAuditApi.reject(detail.id, {
        reason: rejectReason.trim(),
      });
      if (res.data.success) {
        toast.success(`Đã từ chối phiếu ${detail.code}`);
        setRejectOpen(false);
        setRejectReason("");
        await refreshAfterAction();
      }
    } catch (err: unknown) {
      const msg =
        err && typeof err === "object" && "response" in err
          ? (err as { response?: { data?: { message?: string } } }).response?.data?.message
          : null;
      toast.error(msg ?? "Từ chối thất bại");
    } finally {
      setActionLoading(false);
    }
  };

  const canActOnDetail =
    detail &&
    (detail.status === "pending_approval" || detail.status === "submitted");

  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-white rounded-xl border border-gray-3/50 p-4 space-y-3">
            <div className="px-1">
              <h2 className="text-sm font-bold text-[#C2410C] uppercase tracking-wide">
                Chờ duyệt
              </h2>
              <p className="text-xs text-[#8D93A5] mt-0.5">
                Phiếu kho đã gửi báo cáo chênh lệch
              </p>
            </div>
            {loading ? (
              <p className="text-sm text-[#8D93A5] px-2 py-4">Đang tải...</p>
            ) : pending.length === 0 ? (
              <p className="text-sm text-[#8D93A5] px-2 py-4">Không có phiếu chờ duyệt</p>
            ) : (
              <div className="space-y-2 max-h-72 overflow-y-auto">
                {pending.map((s) => (
                  <SheetListItem
                    key={s.id}
                    sheet={s}
                    selected={selectedId === s.id}
                    onSelect={() => selectSheet(s.id)}
                  />
                ))}
              </div>
            )}
          </div>

          <div className="bg-white rounded-xl border border-gray-3/50 p-4 space-y-3">
            <div className="px-1">
              <h2 className="text-sm font-bold text-[#6C6F93] uppercase tracking-wide">
                Đã xử lý gần đây
              </h2>
            </div>
            {loading ? (
              <p className="text-sm text-[#8D93A5] px-2 py-4">...</p>
            ) : processed.length === 0 ? (
              <p className="text-sm text-[#8D93A5] px-2 py-4">Chưa có phiếu đã xử lý</p>
            ) : (
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {processed.map((s) => (
                  <SheetListItem
                    key={s.id}
                    sheet={s}
                    selected={selectedId === s.id}
                    onSelect={() => selectSheet(s.id)}
                  />
                ))}
              </div>
            )}
          </div>

          <p className="text-xs text-[#8D93A5] px-1">
            Nhân viên kho thao tác tại{" "}
            <Link href="/admin/inventory-audit" className="text-[#3C50E0] font-semibold hover:underline">
              Kiểm kê kho
            </Link>
          </p>
        </div>

        <div className="lg:col-span-8 bg-white rounded-xl border border-gray-3/50 p-5 min-h-[480px] flex flex-col">
          {!selectedId ? (
            <div className="flex-1 flex items-center justify-center text-[#8D93A5] text-sm">
              Chọn phiếu bên trái để xem biên bản đối chiếu
            </div>
          ) : detailLoading ? (
            <div className="flex-1 flex items-center justify-center text-[#8D93A5] text-sm">
              Đang tải chi tiết...
            </div>
          ) : detail ? (
            <>
              <AuditDetailView sheet={detail} />
              {canActOnDetail && (
                <div className="flex flex-wrap gap-3 mt-6 pt-5 border-t border-gray-3/50">
                  <PrimaryButton
                    type="button"
                    className="bg-green hover:bg-[#15803D] shadow-none inline-flex items-center gap-2"
                    onClick={() => void handleApprove()}
                    disabled={actionLoading}
                  >
                    <IconCheckCircle size={18} className="shrink-0" />
                    Duyệt điều chỉnh tồn kho
                  </PrimaryButton>
                  <button
                    type="button"
                    onClick={() => {
                      setRejectOpen(true);
                      setRejectReason("");
                    }}
                    disabled={actionLoading}
                    className="px-5 py-2.5 rounded-lg border border-red text-red text-sm font-semibold hover:bg-red-light-6 disabled:opacity-60"
                  >
                    ✖ Từ chối
                  </button>
                </div>
              )}
            </>
          ) : null}
        </div>
      </div>

      <Modal
        open={rejectOpen}
        onClose={() => {
          if (!actionLoading) {
            setRejectOpen(false);
            setRejectReason("");
          }
        }}
        title="Từ chối phiếu kiểm kê"
        subtitle={detail?.code}
        footer={
          <div className="flex gap-2 justify-end w-full">
            <button
              type="button"
              disabled={actionLoading}
              onClick={() => {
                setRejectOpen(false);
                setRejectReason("");
              }}
              className="px-4 py-2 rounded-lg border border-gray-3 text-sm font-semibold text-[#6C6F93]"
            >
              Hủy
            </button>
            <button
              type="button"
              disabled={actionLoading}
              onClick={() => void confirmReject()}
              className="px-4 py-2 rounded-lg text-sm font-bold text-white bg-[#DC2626] hover:bg-[#B91C1C] disabled:opacity-60"
            >
              {actionLoading ? "Đang xử lý..." : "Xác nhận từ chối"}
            </button>
          </div>
        }
      >
        <div className="space-y-3">
          <p className="text-sm text-[#6C6F93]">
            Phiếu <strong>{detail?.code}</strong> — {detail?.categoryName}
          </p>
          <label className="block text-sm">
            <span className="font-medium text-dark">
              Lý do từ chối <span className="text-red">*</span>
            </span>
            <textarea
              className="mt-2 w-full border border-gray-3 rounded-lg px-3 py-2 text-sm min-h-[100px]"
              placeholder="Ví dụ: Chênh lệch quá lớn, yêu cầu kiểm đếm lại kệ B..."
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
            />
          </label>
        </div>
      </Modal>
    </>
  );
}
