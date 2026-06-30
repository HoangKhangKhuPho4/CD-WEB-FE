"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import toast from "react-hot-toast";
import PrimaryButton from "@/components/Admin/shared/PrimaryButton";
import {
  IconBox,
  IconChartBar,
  IconCheckCircle,
  IconChip,
  IconClipboard,
  IconImport,
  IconScanBarcode,
  IconUpload,
  IconAlertTriangle,
} from "@/components/Admin/icons/AdminIcons";
import { parseImeiList } from "@/components/Admin/Imei/imeiUtils";
import { parseSerialsFromExcelFile } from "@/utils/parseSerialsFromExcelFile";
import {
  purchaseOrderReceiveApi,
  type PurchaseOrderReceiveDetail,
  type PurchaseOrderSummary,
  type ReceiveLineProgress,
  type StockLotSummary,
} from "@/utils/purchaseOrderReceiveApi";

const DEFAULT_SHELF = "Kệ A1-02";

const PO_STATUS_LABEL: Record<string, string> = {
  pending: "CHỜ NHẬP",
  receiving: "ĐANG QUÉT",
  completed: "HOÀN TẤT",
};

function statusLabel(status: string) {
  return PO_STATUS_LABEL[status] ?? status.toUpperCase();
}

const IMEI_TABS = [
  { id: 0, label: "Nhập Thủ Công / Quét Súng", Icon: IconScanBarcode },
  { id: 1, label: "Upload Excel", Icon: IconUpload },
  { id: 2, label: "Báo Cáo Tồn Kho", Icon: IconChartBar, href: "/admin/inventory" as const },
] as const;

function TabLabel({ Icon, label }: { Icon: typeof IconScanBarcode; label: string }) {
  return (
    <span className="inline-flex items-center gap-2">
      <Icon size={16} className="shrink-0 opacity-80" />
      {label}
    </span>
  );
}

export default function ImeiWarehousePanel() {
  const [activeTab, setActiveTab] = useState(0);
  const [poOptions, setPoOptions] = useState<PurchaseOrderSummary[]>([]);
  const [selectedPoId, setSelectedPoId] = useState<number | null>(null);
  const [poDetail, setPoDetail] = useState<PurchaseOrderReceiveDetail | null>(null);
  const [selectedLot, setSelectedLot] = useState<StockLotSummary | null>(null);
  const [selectedLine, setSelectedLine] = useState<ReceiveLineProgress | null>(null);
  const [imeiText, setImeiText] = useState("");
  const [shelfLocation, setShelfLocation] = useState(DEFAULT_SHELF);
  const [note, setNote] = useState("Nhập Serial từ đơn mua hàng PO");
  const [loadingQueue, setLoadingQueue] = useState(true);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [excelParsing, setExcelParsing] = useState(false);
  const excelInputRef = useRef<HTMLInputElement>(null);

  const loadQueue = useCallback(async () => {
    setLoadingQueue(true);
    try {
      const res = await purchaseOrderReceiveApi.imeiQueue();
      if (res.data.success) {
        setPoOptions(res.data.data ?? []);
      }
    } catch {
      toast.error("Không tải được danh sách PO chờ quét Serial");
    } finally {
      setLoadingQueue(false);
    }
  }, []);

  const loadPoDetail = useCallback(async (poId: number, autoStart = true) => {
    setLoadingDetail(true);
    try {
      let res = await purchaseOrderReceiveApi.receiveDetail(poId);
      let data = res.data.data;
      if (autoStart && data.canStartReceiving) {
        await purchaseOrderReceiveApi.startReceiving(poId);
        res = await purchaseOrderReceiveApi.receiveDetail(poId);
        data = res.data.data;
      }
      setPoDetail(data);
      const lots = data.stockLots ?? [];
      const openLot = lots.find((l) => l.status === "OPEN") ?? lots[lots.length - 1] ?? null;
      setSelectedLot(openLot);
      const nextLine =
        data.progress.lines.find((l) => l.remaining > 0) ?? data.progress.lines[0] ?? null;
      setSelectedLine(nextLine);
      return data;
    } catch {
      toast.error("Không tải được chi tiết PO");
      setPoDetail(null);
      return null;
    } finally {
      setLoadingDetail(false);
    }
  }, []);

  useEffect(() => {
    void loadQueue();
  }, [loadQueue]);

  const handleSelectPo = async (poId: number | "") => {
    if (!poId) {
      setSelectedPoId(null);
      setPoDetail(null);
      setSelectedLot(null);
      setSelectedLine(null);
      setImeiText("");
      return;
    }
    setSelectedPoId(poId);
    setImeiText("");
    await loadPoDetail(poId);
  };

  const parsedImeis = useMemo(() => parseImeiList(imeiText), [imeiText]);
  const uniqueImeis = useMemo(() => Array.from(new Set(parsedImeis)), [parsedImeis]);
  const hasDuplicates = parsedImeis.length > uniqueImeis.length;

  const poTotalRequired = poDetail?.progress.totalOrdered ?? 0;
  const poTotalScanned = poDetail?.progress.totalReceived ?? 0;
  const poProgressPct =
    poTotalRequired > 0 ? Math.min(100, Math.round((poTotalScanned / poTotalRequired) * 100)) : 0;

  const lineRemaining = selectedLine?.remaining ?? 0;
  const exceedsPoLimit = uniqueImeis.length > lineRemaining;

  const batchNumber =
    selectedLot?.lotNumber ?? poDetail?.defaultBatchNumber ?? "";

  const canSubmit =
    !submitLoading &&
    uniqueImeis.length > 0 &&
    !exceedsPoLimit &&
    selectedPoId != null &&
    selectedLine != null &&
    poDetail?.canScan;

  const handleManualSubmit = async () => {
    if (!selectedPoId || !selectedLine) {
      toast.error("Chọn PO và dòng sản phẩm trước khi nhập");
      return;
    }
    if (uniqueImeis.length === 0) {
      toast.error("Nhập ít nhất một mã Serial");
      return;
    }
    if (exceedsPoLimit) {
      toast.error(`Vượt quá SL còn lại (${lineRemaining})`);
      return;
    }

    setSubmitLoading(true);
    try {
      const res = await purchaseOrderReceiveApi.receiveSerialBulk(selectedPoId, {
        poLineId: selectedLine.poLineId,
        serials: uniqueImeis,
        batchNumber: batchNumber || undefined,
        shelfLocation: shelfLocation.trim() || undefined,
      });
      if (res.data.success) {
        const payload = res.data.data;
        setPoDetail(payload.detail);
        const lots = payload.detail.stockLots ?? [];
        const openLot = lots.find((l) => l.status === "OPEN") ?? lots[lots.length - 1] ?? null;
        setSelectedLot(openLot);
        const nextLine =
          payload.detail.progress.lines.find((l) => l.remaining > 0) ??
          payload.detail.progress.lines[0] ??
          null;
        setSelectedLine(nextLine);
        setImeiText("");

        if (payload.autoCompleted) {
          toast.success("PO đã quét đủ 100% — tự động hoàn tất!", {
            icon: <IconCheckCircle size={20} className="text-green" />,
          });
          setSelectedPoId(null);
          setPoDetail(null);
          setSelectedLot(null);
          setSelectedLine(null);
          await loadQueue();
        } else if (payload.failCount > 0) {
          toast.error(`${payload.message} — xem chi tiết lỗi bên phải`);
        } else {
          toast.success(payload.message || `Đã nhập ${payload.successCount} serial`);
        }
      }
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        "Nhập serial thất bại";
      toast.error(msg);
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleExcelFile = async (file: File) => {
    setExcelParsing(true);
    try {
      const { codes, sheetName, columnLabel } = await parseSerialsFromExcelFile(file);
      setImeiText(codes.join("\n"));
      setActiveTab(0);
      toast.success(
        `Đã đọc ${codes.length} mã từ sheet "${sheetName}" (cột ${columnLabel})`
      );
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Không đọc được file Excel");
    } finally {
      setExcelParsing(false);
    }
  };

  const selectedPo = poOptions.find((p) => p.id === selectedPoId) ?? null;

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="rounded-2xl border border-[#ffd8a8] bg-gradient-to-r from-[#fff8ef] to-white p-5">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#ff9f1a] to-[#ffb74d] text-white">
            <IconChip size={22} className="text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-dark">Quản Lý Kho &amp; Serial</h2>
            <p className="text-sm text-[#6C6F93] mt-0.5">
              Quét Serial theo Đơn mua hàng (PO) — đối chiếu số lượng đã nhập kho
            </p>
          </div>
        </div>
        <div className="mt-4 rounded-xl border border-[#3C50E0]/20 bg-[#EEF2FF] px-4 py-3 text-sm text-[#1e3a8a]">
          Nhân viên Kho <strong>bắt buộc</strong> chọn PO đã nhập kho trước khi quét Serial. Không
          nhập kho tự do.
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-gray-3/60 pb-1">
        {IMEI_TABS.map((tab) =>
          "href" in tab && tab.href ? (
            <Link
              key={tab.id}
              href={tab.href}
              className="px-4 py-2 text-sm font-semibold text-[#6C6F93] hover:text-[#3C50E0] inline-flex items-center"
            >
              <TabLabel Icon={tab.Icon} label={tab.label} />
            </Link>
          ) : (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 text-sm font-semibold rounded-t-lg transition-colors inline-flex items-center ${
                activeTab === tab.id
                  ? "bg-white border border-gray-3/60 border-b-white -mb-px text-[#ff9f1a]"
                  : "text-[#6C6F93] hover:text-dark"
              }`}
            >
              <TabLabel Icon={tab.Icon} label={tab.label} />
            </button>
          )
        )}
      </div>

      {activeTab === 1 ? (
        <div className="bg-white rounded-2xl border border-gray-3/50 p-8 text-center">
          <p className="text-sm text-[#6C6F93] mb-4">
            Chọn file Excel — hệ thống đọc trên trình duyệt, không upload server.
          </p>
          <input
            ref={excelInputRef}
            type="file"
            accept=".xlsx,.xls,.csv"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) void handleExcelFile(f);
              e.target.value = "";
            }}
          />
          <PrimaryButton
            onClick={() => excelInputRef.current?.click()}
            disabled={excelParsing || !selectedPoId}
          >
            {excelParsing ? "Đang đọc file..." : "Chọn file Excel"}
          </PrimaryButton>
          {!selectedPoId && (
            <p className="text-xs text-amber-700 mt-3">Chọn PO ở tab Quét súng trước khi import.</p>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Cột trái */}
          <div className="bg-white rounded-2xl border border-gray-3/50 shadow-sm p-6 space-y-5">
            <h3 className="font-bold text-dark flex items-center gap-2">
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-[#fff8ef] text-[#ff9f1a]">
                <IconBox size={18} />
              </span>
              Nhập Serial theo PO
            </h3>
            <hr className="border-gray-3/40" />

            <div>
              <p className="text-xs font-bold text-[#8D93A5] uppercase mb-2">
                Bước 1: Chọn Đơn mua hàng (PO)
              </p>
              <select
                value={selectedPoId ?? ""}
                onChange={(e) =>
                  void handleSelectPo(e.target.value ? Number(e.target.value) : "")
                }
                disabled={loadingQueue || loadingDetail}
                className="w-full px-3 py-2.5 border border-gray-3 rounded-xl text-sm"
              >
                <option value="">
                  {loadingQueue ? "Đang tải PO..." : "Chọn PO đã nhập kho, chờ quét Serial..."}
                </option>
                {poOptions.map((po) => (
                  <option key={po.id} value={po.id}>
                    {po.code} — {po.supplier} ({statusLabel(po.status)})
                  </option>
                ))}
              </select>
              {poOptions.length === 0 && !loadingQueue && (
                <p className="text-xs text-[#6C6F93] mt-2">
                  Không có PO chờ quét.{" "}
                  <Link href="/admin/purchase-orders" className="text-[#3C50E0] hover:underline">
                    Xem đơn mua hàng
                  </Link>
                </p>
              )}
            </div>

            {(poDetail?.stockLots?.length ?? 0) > 0 && (
              <div>
                <p className="text-xs font-bold text-[#8D93A5] uppercase mb-2">
                  Bước 1b: Chọn Mã lô hàng (đợt giao)
                </p>
                <div className="flex flex-wrap gap-2">
                  {poDetail!.stockLots!.map((lot) => (
                    <button
                      key={lot.lotNumber}
                      type="button"
                      onClick={() => setSelectedLot(lot)}
                      className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors ${
                        selectedLot?.lotNumber === lot.lotNumber
                          ? "bg-[#ff9f1a] text-white border-[#ff9f1a]"
                          : "bg-white text-[#6C6F93] border-gray-3 hover:border-[#ff9f1a]"
                      }`}
                    >
                      {lot.lotNumber} · {lot.itemsScanned}/{lot.itemsRequired} · {lot.status}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {poDetail && poDetail.progress.lines.length > 0 && (
              <div>
                <p className="text-xs font-bold text-[#8D93A5] uppercase mb-2">
                  Bước 2: Chọn sản phẩm cần quét Serial
                </p>
                <div className="overflow-x-auto rounded-xl border border-gray-3/50">
                  <table className="w-full min-w-[400px] text-sm">
                    <thead className="bg-[#fafafa]">
                      <tr>
                        <th className="text-left px-3 py-2 font-bold text-xs text-[#8D93A5]">
                          Sản phẩm
                        </th>
                        <th className="text-center px-2 py-2 font-bold text-xs text-[#8D93A5]">
                          Cần
                        </th>
                        <th className="text-center px-2 py-2 font-bold text-xs text-[#8D93A5]">
                          Đã
                        </th>
                        <th className="text-center px-2 py-2 font-bold text-xs text-[#8D93A5]">
                          Còn
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-3/40">
                      {poDetail.progress.lines.map((item) => {
                        const done = item.remaining === 0;
                        const active = selectedLine?.poLineId === item.poLineId;
                        return (
                          <tr
                            key={item.poLineId}
                            onClick={() => !done && setSelectedLine(item)}
                            className={`cursor-pointer ${
                              active
                                ? "bg-[#fff8ef]"
                                : done
                                  ? "bg-green-light-6/30"
                                  : "hover:bg-[#F7F9FC]"
                            }`}
                          >
                            <td className="px-3 py-2.5">
                              <p className="font-semibold text-dark text-xs">{item.productName}</p>
                              <p className="text-[10px] text-[#8D93A5]">
                                {item.variantName} · {item.skuCode}
                              </p>
                            </td>
                            <td className="text-center px-2">{item.quantityOrdered}</td>
                            <td className="text-center px-2">
                              <span
                                className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${
                                  done ? "bg-green-light-6 text-green" : "bg-gray-3 text-[#6C6F93]"
                                }`}
                              >
                                {item.quantityReceived}
                              </span>
                            </td>
                            <td className="text-center px-2">
                              {done ? (
                                <IconCheckCircle size={14} className="inline text-green" />
                              ) : (
                                item.remaining
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
                {selectedLine && selectedLine.remaining > 0 && (
                  <p className="text-xs text-[#ff9f1a] font-semibold mt-2 inline-flex items-center gap-1.5">
                    <IconCheckCircle size={14} className="shrink-0" />
                    Đang quét: {selectedLine.productName} {selectedLine.variantName}
                  </p>
                )}
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-[#8D93A5] uppercase">Mã lô hàng</label>
                <input
                  value={batchNumber}
                  readOnly
                  className="mt-1 w-full px-3 py-2 border border-gray-3 rounded-lg text-sm bg-[#fafafa] font-mono"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-[#8D93A5] uppercase">Vị trí kệ</label>
                <input
                  value={shelfLocation}
                  onChange={(e) => setShelfLocation(e.target.value)}
                  className="mt-1 w-full px-3 py-2 border border-gray-3 rounded-lg text-sm"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-[#8D93A5] uppercase">Ghi chú</label>
              <input
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className="mt-1 w-full px-3 py-2 border border-gray-3 rounded-lg text-sm"
              />
            </div>

            <div>
              <p className="text-xs font-bold text-[#8D93A5] uppercase mb-2">
                Bước 3: Nhập / Quét Serial (mỗi dòng 1 mã)
              </p>
              <textarea
                rows={10}
                value={imeiText}
                onChange={(e) => setImeiText(e.target.value)}
                disabled={!poDetail?.canScan}
                placeholder={`SN-F2LDN3K4N741\nSN-H8K9M2P5Q123\nSN-J3L6N9R2T456`}
                className="w-full px-3 py-2 border border-gray-3 rounded-xl font-mono text-sm bg-[#fafafa] disabled:opacity-60"
              />
            </div>

            <div className="flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => setImeiText("")}
                className="text-sm font-semibold text-red hover:underline"
              >
                Xóa tất cả
              </button>
              <PrimaryButton onClick={() => void handleManualSubmit()} disabled={!canSubmit}>
                <span className="inline-flex items-center gap-2">
                  <IconImport size={16} />
                  {submitLoading
                    ? "Đang nhập..."
                    : `Nhập (${uniqueImeis.length}/${lineRemaining} còn lại)`}
                </span>
              </PrimaryButton>
            </div>
            {exceedsPoLimit && (
              <p className="text-xs text-red">
                Vượt quá SL còn lại trên dòng đang chọn ({lineRemaining}).
              </p>
            )}
          </div>

          {/* Cột phải — preview */}
          <div className="bg-white rounded-2xl border border-gray-3/50 shadow-sm p-6 space-y-4">
            <h3 className="font-bold text-dark flex items-center gap-2">
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-[#fff8ef] text-[#ff9f1a]">
                <IconClipboard size={18} />
              </span>
              Tiến độ &amp; Xem trước
            </h3>
            <hr className="border-gray-3/40" />

            {poDetail && (
              <div className="rounded-xl border border-[#ffd8a8] bg-[#fff8ef] p-4">
                <p className="font-extrabold text-[#e65100] text-sm">
                  {poDetail.code} — {poDetail.supplier}
                </p>
                <div className="flex justify-between text-xs text-[#6C6F93] mt-2 mb-1">
                  <span>Tiến độ quét Serial toàn PO</span>
                  <span className="font-bold text-dark">
                    {poTotalScanned}/{poTotalRequired} ({poProgressPct}%)
                  </span>
                </div>
                <div className="h-2 rounded-full bg-[#ffe0b2] overflow-hidden">
                  <div
                    className="h-full bg-[#ff9f1a] rounded-full transition-all"
                    style={{ width: `${poProgressPct}%` }}
                  />
                </div>
                {selectedLine && (
                  <>
                    <p className="text-xs text-[#6C6F93] mt-3 mb-1">
                      Dòng đang quét: {selectedLine.productName} {selectedLine.variantName}
                    </p>
                    <div className="h-1.5 rounded-full bg-[#ffe0b2] overflow-hidden">
                      <div
                        className="h-full bg-[#ff9f1a]/70 rounded-full"
                        style={{
                          width: `${
                            selectedLine.quantityOrdered > 0
                              ? Math.round(
                                  (selectedLine.quantityReceived / selectedLine.quantityOrdered) *
                                    100
                                )
                              : 0
                          }%`,
                        }}
                      />
                    </div>
                  </>
                )}
              </div>
            )}

            {parsedImeis.length > 0 && (
              <div className="flex flex-wrap gap-2">
                <span className="px-2.5 py-1 rounded-full text-xs border border-[#3C50E0]/30 text-[#3C50E0]">
                  Tổng dòng: {parsedImeis.length}
                </span>
                <span className="px-2.5 py-1 rounded-full text-xs border border-green/30 text-green">
                  Unique: {uniqueImeis.length}
                </span>
                {hasDuplicates && (
                  <span className="px-2.5 py-1 rounded-full text-xs border border-amber-400/50 text-amber-800 bg-amber-50 inline-flex items-center gap-1.5">
                    <IconAlertTriangle size={12} className="shrink-0" />
                    Trùng lặp: {parsedImeis.length - uniqueImeis.length}
                  </span>
                )}
              </div>
            )}

            {hasDuplicates && (
              <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
                Có Serial trùng lặp! Hệ thống sẽ tự động loại bỏ trùng và chỉ gửi{" "}
                <strong>{uniqueImeis.length}</strong> mã duy nhất.
              </div>
            )}

            <div className="max-h-[420px] overflow-y-auto space-y-1 pr-1">
              {parsedImeis.length === 0 ? (
                <p className="text-sm text-[#8D93A5] text-center py-8">
                  {selectedPo
                    ? "Quét hoặc dán mã Serial để xem trước..."
                    : "Chọn PO để bắt đầu quét Serial"}
                </p>
              ) : (
                parsedImeis.map((imei, index) => {
                  const isDuplicate = parsedImeis.indexOf(imei) !== index;
                  return (
                    <div
                      key={`${imei}-${index}`}
                      className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-sm ${
                        isDuplicate
                          ? "bg-[#fef9c3] border-[#fde047] text-[#92400e]"
                          : "bg-green-light-6/40 border-green/30 text-[#166534]"
                      }`}
                    >
                      <span className="text-xs font-bold text-[#8D93A5] w-7 text-center">
                        #{index + 1}
                      </span>
                      <span className="font-mono flex-1">{imei}</span>
                      {isDuplicate && (
                        <span className="text-[10px] font-bold bg-amber-400 text-white px-2 py-0.5 rounded-full">
                          Trùng
                        </span>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
