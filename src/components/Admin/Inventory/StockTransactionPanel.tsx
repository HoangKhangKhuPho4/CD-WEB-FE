"use client";

import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import AdminPagination from "@/components/Admin/shared/AdminPagination";
import PrimaryButton from "@/components/Admin/shared/PrimaryButton";
import StockTransactionDrawer from "@/components/Admin/Inventory/StockTransactionDrawer";
import VariantSearchInput from "@/components/Admin/Inventory/VariantSearchInput";
import {
  downloadInventoryCsv,
  extractInventoryError,
  formatVariantLabel,
  TX_TYPE_OPTIONS,
  txTypeLabel,
} from "@/components/Admin/Inventory/inventoryUtils";
import {
  adminInventoryApi,
  type InventoryTransaction,
  type InventoryTransactionType,
  type VariantSearchHit,
} from "@/utils/adminApi";
import { formatDateTime } from "@/utils/adminFormat";
import type { PageResponse } from "@/utils/api";

const PAGE_SIZE = 15;

function isPage(data: unknown): data is PageResponse<InventoryTransaction> {
  return typeof data === "object" && data != null && "content" in data;
}

export default function StockTransactionPanel() {
  const [rows, setRows] = useState<InventoryTransaction[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);
  const [exporting, setExporting] = useState(false);
  const [detailId, setDetailId] = useState<number | null>(null);

  const [txType, setTxType] = useState<InventoryTransactionType | "">("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [variantId, setVariantId] = useState<number | null>(null);
  const [variantLabel, setVariantLabel] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminInventoryApi.transactions({
        variantId: variantId ?? undefined,
        transactionType: txType || undefined,
        fromDate: fromDate || undefined,
        toDate: toDate || undefined,
        page: page - 1,
        size: PAGE_SIZE,
        sortBy: "createdAt",
        sortDir: "desc",
      });
      if (res.data.success) {
        const data = res.data.data;
        if (isPage(data)) {
          setRows(data.content);
          setTotalPages(Math.max(1, data.totalPages));
          setTotalElements(data.totalElements);
        } else {
          setRows(data);
          setTotalPages(Math.max(1, Math.ceil(data.length / PAGE_SIZE)));
          setTotalElements(data.length);
        }
      }
    } catch {
      toast.error("Không tải lịch sử kho");
    } finally {
      setLoading(false);
    }
  }, [page, txType, fromDate, toDate, variantId]);

  useEffect(() => {
    void load();
  }, [load]);

  const exportCsv = async () => {
    setExporting(true);
    try {
      const res = await adminInventoryApi.exportTransactionsCsv({
        variantId: variantId ?? undefined,
        transactionType: txType || undefined,
        fromDate: fromDate || undefined,
        toDate: toDate || undefined,
      });
      downloadInventoryCsv(res.data, "inventory-transactions.csv");
      toast.success("Đã tải file CSV");
    } catch (err) {
      toast.error(extractInventoryError(err, "Export thất bại"));
    } finally {
      setExporting(false);
    }
  };

  const applyFilters = () => {
    setPage(1);
    void load();
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col lg:flex-row lg:items-end gap-3 p-4 bg-[#F7F9FC] rounded-xl border border-gray-3/50">
        <div className="flex-1 min-w-[200px]">
          <VariantSearchInput
            label="Lọc theo biến thể"
            value={variantLabel}
            variantId={variantId}
            onChange={(text) => {
              setVariantLabel(text);
              setVariantId(null);
            }}
            onSelect={(hit: VariantSearchHit) => {
              setVariantId(hit.id);
              setVariantLabel(formatVariantLabel(hit));
            }}
          />
        </div>
        <div>
          <label className="text-xs font-bold text-[#8D93A5] uppercase block mb-1">Loại</label>
          <select
            value={txType}
            onChange={(e) => setTxType(e.target.value as InventoryTransactionType | "")}
            className="px-3 py-2.5 border border-gray-3 rounded-lg text-sm min-w-[140px]"
          >
            {TX_TYPE_OPTIONS.map((o) => (
              <option key={o.value || "all"} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-xs font-bold text-[#8D93A5] uppercase block mb-1">Từ ngày</label>
          <input
            type="date"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
            className="px-3 py-2.5 border border-gray-3 rounded-lg text-sm"
          />
        </div>
        <div>
          <label className="text-xs font-bold text-[#8D93A5] uppercase block mb-1">Đến ngày</label>
          <input
            type="date"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
            className="px-3 py-2.5 border border-gray-3 rounded-lg text-sm"
          />
        </div>
        <div className="flex gap-2">
          <PrimaryButton type="button" onClick={applyFilters}>
            Lọc
          </PrimaryButton>
          <button
            type="button"
            onClick={() => void exportCsv()}
            disabled={exporting}
            className="px-4 py-2.5 border border-gray-3 rounded-lg text-sm font-semibold text-dark hover:bg-white"
          >
            {exporting ? "Đang export..." : "Export CSV"}
          </button>
        </div>
      </div>

      <div className="border border-gray-3/50 rounded-xl overflow-hidden">
        {loading ? (
          <p className="px-6 py-8 text-sm text-[#8D93A5]">Đang tải...</p>
        ) : (
          <table className="w-full min-w-[700px]">
            <thead>
              <tr className="bg-[#F7F9FC]">
                <th className="text-left px-4 py-3 text-xs font-bold text-[#8D93A5] uppercase">Loại</th>
                <th className="text-left px-4 py-3 text-xs font-bold text-[#8D93A5] uppercase">SKU / SP</th>
                <th className="text-center px-4 py-3 text-xs font-bold text-[#8D93A5] uppercase">SL</th>
                <th className="text-left px-4 py-3 text-xs font-bold text-[#8D93A5] uppercase">Lý do</th>
                <th className="text-left px-4 py-3 text-xs font-bold text-[#8D93A5] uppercase">Thời gian</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-3/50">
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-sm text-[#8D93A5] text-center">
                    Chưa có giao dịch
                  </td>
                </tr>
              ) : null}
              {rows.map((tx) => (
                <tr
                  key={tx.id}
                  className="hover:bg-[#F7F9FC]/50 cursor-pointer"
                  onClick={() => setDetailId(tx.id)}
                >
                  <td className="px-4 py-3 text-sm">{txTypeLabel(tx.transactionType)}</td>
                  <td className="px-4 py-3 text-sm">{tx.variantName ?? tx.skuCode ?? "—"}</td>
                  <td className="px-4 py-3 text-sm text-center">{tx.quantity}</td>
                  <td className="px-4 py-3 text-sm text-[#6C6F93] max-w-[200px] truncate">
                    {tx.reason ?? "—"}
                  </td>
                  <td className="px-4 py-3 text-sm text-[#6C6F93]">{formatDateTime(tx.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        {!loading && totalElements > 0 && (
          <div className="p-4 border-t border-gray-3/50">
            <AdminPagination
              page={page}
              totalPages={totalPages}
              totalElements={totalElements}
              pageSize={PAGE_SIZE}
              onPageChange={setPage}
              label="giao dịch"
            />
          </div>
        )}
      </div>

      <StockTransactionDrawer id={detailId} onClose={() => setDetailId(null)} />
    </div>
  );
}
