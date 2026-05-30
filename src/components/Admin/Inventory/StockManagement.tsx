"use client";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import AdminPagination from "@/components/Admin/shared/AdminPagination";
import { adminInventoryApi, type InventoryTransaction, type VariantSearchHit } from "@/utils/adminApi";
import { formatDateTime } from "@/utils/adminFormat";
import { useAppSelector } from "@/redux/store";
import {
  canInventoryStat,
  canManageImei,
  canStockImport,
  canStockReturn,
} from "@/utils/catalogPermissions";
import type { RbacUser } from "@/utils/rbac";

const STOCK_PAGE_SIZE = 15;
const TX_PAGE_SIZE = 15;

type StockTab = "Nhập kho" | "Trả hàng" | "Báo cáo tồn kho" | "Quản lý IMEI" | "Lịch sử";

function stockTabsForUser(user: RbacUser | null | undefined): StockTab[] {
  const tabs: StockTab[] = [];
  if (canStockImport(user)) tabs.push("Nhập kho");
  if (canStockReturn(user)) tabs.push("Trả hàng");
  if (canInventoryStat(user)) tabs.push("Báo cáo tồn kho");
  if (canManageImei(user)) tabs.push("Quản lý IMEI");
  if (canStockImport(user) || canInventoryStat(user)) tabs.push("Lịch sử");
  return tabs;
}

function stockLabel(current: number, threshold = 10): string {
  if (current === 0) return "HẾT HÀNG";
  if (current <= threshold) return "SẮP HẾT HÀNG";
  return "CÒN HÀNG";
}

const statusStyles: Record<string, string> = {
  "SẮP HẾT HÀNG": "bg-red-light-6 text-red font-semibold",
  "HẾT HÀNG": "bg-red-light-6 text-red font-semibold",
  "CÒN HÀNG": "bg-green-light-6 text-green font-semibold",
};

export default function StockManagement() {
  const user = useAppSelector((s) => s.authReducer.user);
  const stockTabs = useMemo(() => stockTabsForUser(user), [user]);
  const [activeTab, setActiveTab] = useState<StockTab>("Báo cáo tồn kho");
  const [stockRows, setStockRows] = useState<
    { id: number; name: string; brand: string; stock: number; status: string }[]
  >([]);
  const [loadingStock, setLoadingStock] = useState(false);
  const [transactions, setTransactions] = useState<InventoryTransaction[]>([]);
  const [loadingTx, setLoadingTx] = useState(false);
  const [stockPage, setStockPage] = useState(1);
  const [txPage, setTxPage] = useState(1);

  const loadStock = useCallback(async () => {
    setLoadingStock(true);
    try {
      const res = await adminInventoryApi.stats(10);
      if (res.data.success) {
        setStockRows(
          res.data.data.map((row) => ({
            id: row.variantId,
            name: row.variantName ? `${row.productName} (${row.variantName})` : row.productName,
            brand: row.skuCode ?? "—",
            stock: row.currentStock ?? 0,
            status: stockLabel(row.currentStock ?? 0, row.lowStockThreshold ?? 10),
          }))
        );
      }
    } catch {
      toast.error("Không tải được báo cáo tồn kho");
    } finally {
      setLoadingStock(false);
    }
  }, []);

  useEffect(() => {
    if (activeTab === "Báo cáo tồn kho") void loadStock();
  }, [activeTab, loadStock]);

  useEffect(() => {
    setStockPage(1);
  }, [stockRows.length]);

  useEffect(() => {
    setTxPage(1);
  }, [transactions.length]);

  const totalItems = stockRows.length;
  const lowStock = stockRows.filter((r) => r.status === "SẮP HẾT HÀNG").length;
  const outOfStock = stockRows.filter((r) => r.status === "HẾT HÀNG").length;

  const [importVariantId, setImportVariantId] = useState<number | null>(null);
  const [importVariantLabel, setImportVariantLabel] = useState("");
  const [importQty, setImportQty] = useState("1");
  const [importSupplier, setImportSupplier] = useState("");
  const [importNote, setImportNote] = useState("");
  const [variantHits, setVariantHits] = useState<VariantSearchHit[]>([]);
  const [returnImei, setReturnImei] = useState("");
  const [returnReason, setReturnReason] = useState("");

  useEffect(() => {
    if (stockTabs.length > 0 && !stockTabs.includes(activeTab)) {
      setActiveTab(stockTabs[0]);
    }
  }, [stockTabs, activeTab]);

  const stockTotalPages = Math.max(1, Math.ceil(stockRows.length / STOCK_PAGE_SIZE));
  const txTotalPages = Math.max(1, Math.ceil(transactions.length / TX_PAGE_SIZE));

  const pagedStockRows = useMemo(() => {
    const start = (stockPage - 1) * STOCK_PAGE_SIZE;
    return stockRows.slice(start, start + STOCK_PAGE_SIZE);
  }, [stockRows, stockPage]);

  const pagedTransactions = useMemo(() => {
    const start = (txPage - 1) * TX_PAGE_SIZE;
    return transactions.slice(start, start + TX_PAGE_SIZE);
  }, [transactions, txPage]);

  const searchVariant = async (keyword: string) => {
    setImportVariantLabel(keyword);
    if (keyword.length < 2) {
      setVariantHits([]);
      return;
    }
    try {
      const res = await adminInventoryApi.searchVariants(keyword);
      if (res.data.success) setVariantHits(res.data.data);
    } catch {
      setVariantHits([]);
    }
  };

  const submitImport = async () => {
    if (!importVariantId) {
      toast.error("Chọn biến thể sản phẩm");
      return;
    }
    const quantity = Number(importQty);
    if (!quantity || quantity < 1) {
      toast.error("Số lượng không hợp lệ");
      return;
    }
    try {
      await adminInventoryApi.importStock({
        items: [{ variantId: importVariantId, quantity }],
        supplier: importSupplier || undefined,
        note: importNote || undefined,
      });
      toast.success("Nhập kho thành công");
      setImportQty("1");
      if (activeTab === "Báo cáo tồn kho") void loadStock();
    } catch {
      toast.error("Nhập kho thất bại");
    }
  };

  const submitReturn = async () => {
    if (!returnImei.trim()) {
      toast.error("Nhập IMEI/Serial");
      return;
    }
    try {
      await adminInventoryApi.returnStock({
        imei: returnImei.trim(),
        reason: returnReason || undefined,
      });
      toast.success("Đã ghi nhận hàng trả");
      setReturnImei("");
      setReturnReason("");
    } catch {
      toast.error("Xử lý trả hàng thất bại");
    }
  };

  const loadTransactions = useCallback(async () => {
    setLoadingTx(true);
    try {
      const res = await adminInventoryApi.transactions();
      if (res.data.success) setTransactions(res.data.data);
    } catch {
      toast.error("Không tải lịch sử kho");
    } finally {
      setLoadingTx(false);
    }
  }, []);

  useEffect(() => {
    if (activeTab === "Lịch sử") void loadTransactions();
  }, [activeTab, loadTransactions]);

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-xl border border-gray-3/50 shadow-sm">
        <h1 className="text-2xl font-bold text-dark">Quản lý kho</h1>
        {canStockImport(user) && (
        <button className="flex items-center gap-2 px-5 py-2.5 bg-[#3C50E0] text-white rounded-lg text-sm font-semibold hover:bg-[#1C3FB7] transition-colors shadow-lg shadow-[#3C50E0]/25 w-fit">
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M9 3.75V14.25M3.75 9H14.25" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Tạo phiếu mới
        </button>
        )}
      </div>

      {/* Main Content Area */}
      <div className="bg-white rounded-xl border border-gray-3/50 shadow-sm overflow-hidden">
        {/* Navigation Tabs */}
        <div className="flex items-center gap-6 px-6 pt-4 border-b border-gray-3/50 overflow-x-auto no-scrollbar">
          {stockTabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-4 text-sm font-semibold whitespace-nowrap transition-all border-b-2 ${
                activeTab === tab
                  ? "border-[#3C50E0] text-[#3C50E0]"
                  : "border-transparent text-[#6C6F93] hover:text-dark hover:border-gray-3"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="p-6 space-y-6">
          {activeTab === "Nhập kho" && (
            <div className="max-w-xl space-y-4">
              <h3 className="text-lg font-bold text-dark">Phiếu nhập kho</h3>
              <input
                value={importVariantLabel}
                onChange={(e) => void searchVariant(e.target.value)}
                placeholder="Tìm SKU / tên sản phẩm..."
                className="w-full px-4 py-2.5 border border-gray-3 rounded-lg text-sm"
              />
              {variantHits.length > 0 && (
                <ul className="border border-gray-3 rounded-lg max-h-36 overflow-auto">
                  {variantHits.map((v) => (
                    <li key={v.id}>
                      <button
                        type="button"
                        className="w-full text-left px-3 py-2 text-sm hover:bg-[#F7F9FC]"
                        onClick={() => {
                          setImportVariantId(v.id);
                          setImportVariantLabel(`${v.productName} — ${v.skuCode ?? v.variantName}`);
                          setVariantHits([]);
                        }}
                      >
                        {v.productName} ({v.skuCode ?? v.variantName})
                      </button>
                    </li>
                  ))}
                </ul>
              )}
              <input
                type="number"
                min={1}
                value={importQty}
                onChange={(e) => setImportQty(e.target.value)}
                placeholder="Số lượng"
                className="w-full px-4 py-2.5 border border-gray-3 rounded-lg text-sm"
              />
              <input
                value={importSupplier}
                onChange={(e) => setImportSupplier(e.target.value)}
                placeholder="Nhà cung cấp"
                className="w-full px-4 py-2.5 border border-gray-3 rounded-lg text-sm"
              />
              <textarea
                value={importNote}
                onChange={(e) => setImportNote(e.target.value)}
                placeholder="Ghi chú"
                rows={2}
                className="w-full px-4 py-2.5 border border-gray-3 rounded-lg text-sm resize-none"
              />
              <button
                type="button"
                onClick={() => void submitImport()}
                className="px-5 py-2.5 bg-[#3C50E0] text-white rounded-lg text-sm font-semibold"
              >
                Lập phiếu nhập
              </button>
            </div>
          )}

          {activeTab === "Trả hàng" && (
            <div className="max-w-xl space-y-4">
              <h3 className="text-lg font-bold text-dark">Nhập kho hàng trả lại</h3>
              <input
                value={returnImei}
                onChange={(e) => setReturnImei(e.target.value)}
                placeholder="IMEI / Serial *"
                className="w-full px-4 py-2.5 border border-gray-3 rounded-lg text-sm font-mono"
              />
              <textarea
                value={returnReason}
                onChange={(e) => setReturnReason(e.target.value)}
                placeholder="Lý do trả hàng"
                rows={3}
                className="w-full px-4 py-2.5 border border-gray-3 rounded-lg text-sm resize-none"
              />
              <button
                type="button"
                onClick={() => void submitReturn()}
                className="px-5 py-2.5 bg-[#3C50E0] text-white rounded-lg text-sm font-semibold"
              >
                Ghi nhận trả hàng
              </button>
            </div>
          )}

          {activeTab === "Quản lý IMEI" && (
            <div className="text-center py-8">
              <p className="text-sm text-[#6C6F93] mb-4">Quản lý IMEI chi tiết trên trang riêng.</p>
              <Link href="/admin/imei" className="text-sm font-semibold text-[#3C50E0] hover:underline">
                Mở trang Quản lý IMEI →
              </Link>
            </div>
          )}

          {activeTab === "Lịch sử" && (
            <div className="border border-gray-3/50 rounded-xl overflow-hidden">
              {loadingTx ? (
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
                    {pagedTransactions.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-4 py-8 text-sm text-[#8D93A5] text-center">
                          Chưa có giao dịch
                        </td>
                      </tr>
                    ) : null}
                    {pagedTransactions.map((tx) => (
                      <tr key={tx.id}>
                        <td className="px-4 py-3 text-sm">{tx.transactionType}</td>
                        <td className="px-4 py-3 text-sm">{tx.variantName ?? tx.skuCode ?? "—"}</td>
                        <td className="px-4 py-3 text-sm text-center">{tx.quantity}</td>
                        <td className="px-4 py-3 text-sm text-[#6C6F93]">{tx.reason ?? "—"}</td>
                        <td className="px-4 py-3 text-sm text-[#6C6F93]">{formatDateTime(tx.createdAt)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
              {!loadingTx && transactions.length > 0 && (
                <div className="p-4 border-t border-gray-3/50">
                  <AdminPagination
                    page={txPage}
                    totalPages={txTotalPages}
                    totalElements={transactions.length}
                    pageSize={TX_PAGE_SIZE}
                    onPageChange={setTxPage}
                    label="giao dịch"
                  />
                </div>
              )}
            </div>
          )}

          {activeTab === "Báo cáo tồn kho" && (
          <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Total Items */}
            <div className="bg-blue-light-5 rounded-xl p-5 border border-blue-light-4 relative overflow-hidden group hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-2">
                <p className="text-xs font-bold text-[#6C6F93] uppercase tracking-wider">
                  Tổng mặt hàng
                </p>
                <div className="w-8 h-8 rounded-lg bg-white/60 flex items-center justify-center text-[#3C50E0]">
                  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M3.75 5.25H14.25V14.25H3.75V5.25Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M6 5.25V3.75H12V5.25" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M9 8.25V11.25" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M7.5 9.75H10.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
              </div>
              <p className="text-3xl font-bold text-[#3C50E0] mb-3">{totalItems.toLocaleString("vi-VN")}</p>
              <div className="flex items-center gap-1.5 text-xs font-semibold text-green">
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M1 8.5L4.5 5L7 7.5L11 3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M8 3.5H11V6.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                +12% <span className="text-[#6C6F93] font-medium">so với tháng trước</span>
              </div>
            </div>

            {/* In Transit */}
            <div className="bg-green-light-6 rounded-xl p-5 border border-green-light-5 relative overflow-hidden group hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-2">
                <p className="text-xs font-bold text-[#6C6F93] uppercase tracking-wider">
                  Hàng đang chuyển
                </p>
                <div className="w-8 h-8 rounded-lg bg-white/60 flex items-center justify-center text-green">
                  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M3 12.75H2.25V5.25H12.75V12.75H12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M12.75 6.75H15L16.5 9V12.75H15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    <circle cx="4.5" cy="12.75" r="1.5" stroke="currentColor" strokeWidth="1.5"/>
                    <circle cx="13.5" cy="12.75" r="1.5" stroke="currentColor" strokeWidth="1.5"/>
                    <path d="M6 12.75H12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
              </div>
              <p className="text-3xl font-bold text-green mb-3">42</p>
              <p className="text-xs font-medium text-green">Dự kiến nhập kho trong 48h</p>
            </div>

            {/* Low Stock */}
            <div className="bg-[#FFF9EB] rounded-xl p-5 border border-yellow-light-1 relative overflow-hidden group hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-2">
                <p className="text-xs font-bold text-[#6C6F93] uppercase tracking-wider">
                  Tồn kho thấp
                </p>
                <div className="w-8 h-8 rounded-lg bg-white/60 flex items-center justify-center text-yellow-dark-2">
                  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M9 6V9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M9 12H9.0075" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M9 2.25L1.5 15H16.5L9 2.25Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
              </div>
              <p className="text-3xl font-bold text-yellow-dark-2 mb-3">{lowStock}</p>
              <p className="text-xs font-medium text-yellow-dark-2">Yêu cầu nhập hàng gấp</p>
            </div>

            {/* Out of Stock */}
            <div className="bg-red-light-6 rounded-xl p-5 border border-red-light-4 relative overflow-hidden group hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-2">
                <p className="text-xs font-bold text-[#6C6F93] uppercase tracking-wider">
                  Hết hàng
                </p>
                <div className="w-8 h-8 rounded-lg bg-white/60 flex items-center justify-center text-red">
                  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="9" cy="9" r="7.5" stroke="currentColor" strokeWidth="1.5"/>
                    <path d="M9 6V9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M9 12H9.0075" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
              </div>
              <p className="text-3xl font-bold text-red mb-3">{outOfStock.toLocaleString("vi-VN")}</p>
              <p className="text-xs font-medium text-red">Cần xử lý ngay</p>
            </div>
          </div>

          {/* Table Area */}
          <div className="border border-gray-3/50 rounded-xl overflow-hidden">
            {/* Table Toolbar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border-b border-gray-3/50 bg-white gap-3">
              <h3 className="text-lg font-bold text-dark">Danh sách tồn kho</h3>
              <div className="flex items-center gap-3">
                <button className="flex items-center gap-2 px-4 py-2 border border-gray-3 rounded-lg text-sm font-medium text-dark hover:bg-gray-1 transition-colors">
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M2 4H14M4.66667 8H11.3333M7.33333 12H8.66667" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  Bộ lọc
                </button>
                <button className="flex items-center gap-2 px-4 py-2 border border-gray-3 rounded-lg text-sm font-medium text-dark hover:bg-gray-1 transition-colors">
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M14 10V12.6667C14 13.0203 13.8595 13.3594 13.6095 13.6095C13.3594 13.8595 13.0203 14 12.6667 14H3.33333C2.97971 14 2.64057 13.8595 2.39052 13.6095C2.14048 13.3594 2 13.0203 2 12.6667V10M11.3333 7.33333L8 10.6667M8 10.6667L4.66667 7.33333M8 10.6667V2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  Xuất Excel
                </button>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-[#F7F9FC]">
                    <th className="text-left px-6 py-4 text-xs font-bold text-[#8D93A5] uppercase tracking-wider">Sản phẩm</th>
                    <th className="text-center px-6 py-4 text-xs font-bold text-[#8D93A5] uppercase tracking-wider">Tồn kho</th>
                    <th className="text-center px-6 py-4 text-xs font-bold text-[#8D93A5] uppercase tracking-wider">Đang chuyển</th>
                    <th className="text-right px-6 py-4 text-xs font-bold text-[#8D93A5] uppercase tracking-wider">Giá trị</th>
                    <th className="text-center px-6 py-4 text-xs font-bold text-[#8D93A5] uppercase tracking-wider">Trạng thái</th>
                    <th className="px-6 py-4"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-3/50 bg-white">
                  {loadingStock ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-8 text-sm text-[#8D93A5]">
                        Đang tải...
                      </td>
                    </tr>
                  ) : stockRows.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-8 text-sm text-[#8D93A5]">
                        Chưa có dữ liệu tồn kho
                      </td>
                    </tr>
                  ) : null}
                  {pagedStockRows.map((item) => (
                    <tr key={item.id} className="hover:bg-[#F7F9FC]/50 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-lg bg-[#F7F9FC] border border-gray-3/50 flex items-center justify-center text-[#3C50E0] text-xs font-bold">
                            {item.stock}
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-dark">{item.name}</p>
                            <p className="text-xs text-[#8D93A5]">{item.brand}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className={`text-sm font-bold ${item.stock <= 5 ? "text-red" : "text-dark"}`}>
                          {item.stock.toString().padStart(2, '0')}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="text-sm font-semibold text-[#8D93A5]">—</span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span className="text-sm font-semibold text-dark whitespace-nowrap">—</span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className={`inline-block px-3 py-1.5 rounded-md text-[11px] uppercase tracking-wider ${statusStyles[item.status]}`}>
                          {item.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button className="p-2 text-[#8D93A5] hover:text-dark transition-colors rounded-lg hover:bg-gray-1">
                          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M10 10.8333C10.4602 10.8333 10.8333 10.4602 10.8333 10C10.8333 9.53976 10.4602 9.16667 10 9.16667C9.53976 9.16667 9.16667 9.53976 9.16667 10C9.16667 10.4602 9.53976 10.8333 10 10.8333Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M10 4.16667C10.4602 4.16667 10.8333 3.79357 10.8333 3.33333C10.8333 2.8731 10.4602 2.5 10 2.5C9.53976 2.5 9.16667 2.8731 9.16667 3.33333C9.16667 3.79357 9.53976 4.16667 10 4.16667Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M10 17.5C10.4602 17.5 10.8333 17.1269 10.8333 16.6667C10.8333 16.2064 10.4602 15.8333 10 15.8333C9.53976 15.8333 9.16667 16.2064 9.16667 16.6667C9.16667 17.1269 9.53976 17.5 10 17.5Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="p-4 border-t border-gray-3/50 bg-[#F7F9FC] space-y-3">
              <p className="text-sm text-[#8D93A5]">
                Tổng <span className="font-semibold text-dark">{totalItems}</span> biến thể · Sắp hết:{" "}
                {lowStock}
              </p>
              {totalItems > 0 && (
                <AdminPagination
                  page={stockPage}
                  totalPages={stockTotalPages}
                  totalElements={totalItems}
                  pageSize={STOCK_PAGE_SIZE}
                  onPageChange={setStockPage}
                  label="biến thể"
                />
              )}
            </div>
          </div>
          </>
          )}
        </div>
      </div>
    </div>
  );
}
