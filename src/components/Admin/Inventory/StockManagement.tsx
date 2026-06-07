"use client";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import AdminTablePagination from "@/components/Admin/shared/AdminTablePagination";
import StockAdjustForm from "@/components/Admin/Inventory/StockAdjustForm";
import StockImportForm from "@/components/Admin/Inventory/StockImportForm";
import StockReturnForm from "@/components/Admin/Inventory/StockReturnForm";
import StockTransactionPanel from "@/components/Admin/Inventory/StockTransactionPanel";
import {
  downloadInventoryCsv,
  extractInventoryError,
} from "@/components/Admin/Inventory/inventoryUtils";
import { adminInventoryApi } from "@/utils/adminApi";
import { formatVnd } from "@/utils/adminFormat";
import { useAppSelector } from "@/redux/store";
import {
  canInventoryStat,
  canManageImei,
  canStockImport,
  canStockReturn,
} from "@/utils/catalogPermissions";
import type { RbacUser } from "@/utils/rbac";

const STOCK_PAGE_SIZE_OPTIONS = [10, 15, 20, 50];

type StockRow = {
  id: number;
  name: string;
  brand: string;
  stock: number;
  stockValue: number;
  status: string;
};

function mapInventoryStatus(status?: string, stock = 0, threshold = 10): string {
  if (status === "IN_STOCK" || stock > threshold) return "CÒN HÀNG";
  if (stock <= 0 || status === "OUT_OF_STOCK") return "HẾT HÀNG";
  return "SẮP HẾT HÀNG";
}

function formatProductLabel(row: {
  productName?: string;
  variantName?: string;
  skuCode?: string;
}): string {
  const product = row.productName?.trim() || "Sản phẩm";
  if (row.variantName?.trim()) {
    return `${product} (${row.variantName.trim()})`;
  }
  return product;
}

type StockTab =
  | "Nhập kho"
  | "Điều chỉnh kho"
  | "Trả hàng"
  | "Báo cáo tồn kho"
  | "Quản lý IMEI"
  | "Lịch sử";

function stockTabsForUser(user: RbacUser | null | undefined): StockTab[] {
  const tabs: StockTab[] = [];
  if (canStockImport(user)) {
    tabs.push("Nhập kho", "Điều chỉnh kho");
  }
  if (canStockReturn(user)) tabs.push("Trả hàng");
  if (canInventoryStat(user)) tabs.push("Báo cáo tồn kho");
  if (canManageImei(user)) tabs.push("Quản lý IMEI");
  if (canStockImport(user) || canInventoryStat(user)) tabs.push("Lịch sử");
  return tabs;
}

const statusStyles: Record<string, string> = {
  "SẮP HẾT HÀNG": "bg-[#FFF9EB] text-yellow-dark-2 font-semibold",
  "HẾT HÀNG": "bg-red-light-6 text-red font-semibold",
  "CÒN HÀNG": "bg-green-light-6 text-green font-semibold",
};

export default function StockManagement() {
  const user = useAppSelector((s) => s.authReducer.user);
  const stockTabs = useMemo(() => stockTabsForUser(user), [user]);
  const [activeTab, setActiveTab] = useState<StockTab>("Báo cáo tồn kho");
  const [stockRows, setStockRows] = useState<StockRow[]>([]);
  const [loadingStock, setLoadingStock] = useState(false);
  const [stockPage, setStockPage] = useState(1);
  const [stockPageSize, setStockPageSize] = useState(15);
  const [lowStockThreshold, setLowStockThreshold] = useState(10);
  const [exportingStats, setExportingStats] = useState(false);
  const [adjustPreset, setAdjustPreset] = useState<{ id: number; label: string } | null>(null);

  const loadStock = useCallback(async () => {
    setLoadingStock(true);
    try {
      const res = await adminInventoryApi.stats(lowStockThreshold);
      if (res.data.success) {
        setStockRows(
          res.data.data.map((row) => {
            const stock = row.stockQuantity ?? row.currentStock ?? 0;
            const threshold = row.lowStockThreshold ?? lowStockThreshold;
            return {
              id: row.variantId,
              name: formatProductLabel(row),
              brand: row.skuCode ?? "—",
              stock,
              stockValue: row.stockValue ?? (row.unitPrice ?? 0) * stock,
              status: mapInventoryStatus(row.status, stock, threshold),
            };
          })
        );
      }
    } catch {
      toast.error("Không tải được báo cáo tồn kho");
    } finally {
      setLoadingStock(false);
    }
  }, [lowStockThreshold]);

  useEffect(() => {
    if (activeTab === "Báo cáo tồn kho") void loadStock();
  }, [activeTab, loadStock]);

  useEffect(() => {
    setStockPage(1);
  }, [stockRows.length]);

  useEffect(() => {
    if (stockTabs.length > 0 && !stockTabs.includes(activeTab)) {
      setActiveTab(stockTabs[0]);
    }
  }, [stockTabs, activeTab]);

  const totalItems = stockRows.length;
  const inStock = stockRows.filter((r) => r.status === "CÒN HÀNG").length;
  const lowStock = stockRows.filter((r) => r.status === "SẮP HẾT HÀNG").length;
  const outOfStock = stockRows.filter((r) => r.status === "HẾT HÀNG").length;
  const totalStockValue = stockRows.reduce((sum, r) => sum + r.stockValue, 0);

  const stockTotalPages = Math.max(1, Math.ceil(stockRows.length / stockPageSize));
  const pagedStockRows = useMemo(() => {
    const start = (stockPage - 1) * stockPageSize;
    return stockRows.slice(start, start + stockPageSize);
  }, [stockRows, stockPage, stockPageSize]);

  const exportStats = async () => {
    setExportingStats(true);
    try {
      const res = await adminInventoryApi.exportStatsCsv(lowStockThreshold);
      downloadInventoryCsv(res.data, "inventory-stats.csv");
      toast.success("Đã tải báo cáo CSV");
    } catch (err) {
      toast.error(extractInventoryError(err, "Export thất bại"));
    } finally {
      setExportingStats(false);
    }
  };

  const openAdjustForRow = (row: StockRow) => {
    setAdjustPreset({ id: row.id, label: row.name });
    setActiveTab("Điều chỉnh kho");
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-xl border border-gray-3/50 shadow-sm">
        <h1 className="text-2xl font-bold text-dark">Quản lý kho</h1>
        {canStockImport(user) && (
          <button
            type="button"
            onClick={() => setActiveTab("Nhập kho")}
            className="flex items-center gap-2 px-5 py-2.5 bg-[#3C50E0] text-white rounded-lg text-sm font-semibold hover:bg-[#1C3FB7] transition-colors shadow-lg shadow-[#3C50E0]/25 w-fit"
          >
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M9 3.75V14.25M3.75 9H14.25" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Tạo phiếu mới
          </button>
        )}
      </div>

      <div className="bg-white rounded-xl border border-gray-3/50 shadow-sm overflow-hidden">
        <div className="flex items-center gap-6 px-6 pt-4 border-b border-gray-3/50 overflow-x-auto no-scrollbar">
          {stockTabs.map((tab) => (
            <button
              key={tab}
              type="button"
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
            <StockImportForm
              onSuccess={() => {
                if (canInventoryStat(user)) void loadStock();
              }}
            />
          )}

          {activeTab === "Điều chỉnh kho" && (
            <StockAdjustForm
              presetVariantId={adjustPreset?.id}
              presetLabel={adjustPreset?.label}
              onSuccess={() => {
                if (canInventoryStat(user)) void loadStock();
              }}
            />
          )}

          {activeTab === "Trả hàng" && (
            <StockReturnForm
              onSuccess={() => {
                if (canInventoryStat(user)) void loadStock();
              }}
            />
          )}

          {activeTab === "Quản lý IMEI" && (
            <div className="text-center py-8">
              <p className="text-sm text-[#6C6F93] mb-4">Quản lý IMEI chi tiết trên trang riêng.</p>
              <Link href="/admin/imei" className="text-sm font-semibold text-[#3C50E0] hover:underline">
                Mở trang Quản lý IMEI →
              </Link>
            </div>
          )}

          {activeTab === "Lịch sử" && <StockTransactionPanel />}

          {activeTab === "Báo cáo tồn kho" && (
            <>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <label className="text-sm text-[#6C6F93]">Ngưỡng tồn thấp:</label>
                  <input
                    type="number"
                    min={1}
                    value={lowStockThreshold}
                    onChange={(e) => setLowStockThreshold(Number(e.target.value) || 10)}
                    className="w-20 px-3 py-2 border border-gray-3 rounded-lg text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => void loadStock()}
                    className="px-3 py-2 text-sm font-semibold text-[#3C50E0] hover:underline"
                  >
                    Áp dụng
                  </button>
                </div>
                <button
                  type="button"
                  onClick={() => void exportStats()}
                  disabled={exportingStats}
                  className="px-4 py-2 border border-gray-3 rounded-lg text-sm font-semibold hover:bg-[#F7F9FC]"
                >
                  {exportingStats ? "Đang export..." : "Export CSV"}
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard title="Tổng mặt hàng" value={totalItems.toLocaleString("vi-VN")} subtitle={`Còn hàng: ${inStock}`} tone="blue" />
                <StatCard title="Giá trị tồn kho" value={formatVnd(totalStockValue)} subtitle="Giá bán × tồn" tone="green" />
                <StatCard title="Tồn kho thấp" value={String(lowStock)} subtitle="Cần nhập thêm" tone="yellow" />
                <StatCard title="Hết hàng" value={outOfStock.toLocaleString("vi-VN")} subtitle="Cần xử lý ngay" tone="red" />
              </div>

              <div className="border border-gray-3/50 rounded-xl overflow-hidden">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border-b border-gray-3/50 bg-white gap-3">
                  <h3 className="text-lg font-bold text-dark">Danh sách tồn kho</h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-[#F7F9FC]">
                        <th className="text-left px-6 py-4 text-xs font-bold text-[#8D93A5] uppercase">Sản phẩm</th>
                        <th className="text-center px-6 py-4 text-xs font-bold text-[#8D93A5] uppercase">Tồn kho</th>
                        <th className="text-right px-6 py-4 text-xs font-bold text-[#8D93A5] uppercase">Giá trị</th>
                        <th className="text-center px-6 py-4 text-xs font-bold text-[#8D93A5] uppercase">Trạng thái</th>
                        {canStockImport(user) ? <th className="px-6 py-4" /> : null}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-3/50 bg-white">
                      {loadingStock ? (
                        <tr>
                          <td colSpan={5} className="px-6 py-8 text-sm text-[#8D93A5]">Đang tải...</td>
                        </tr>
                      ) : stockRows.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="px-6 py-8 text-sm text-[#8D93A5]">Chưa có dữ liệu tồn kho</td>
                        </tr>
                      ) : null}
                      {pagedStockRows.map((item) => (
                        <tr key={item.id} className="hover:bg-[#F7F9FC]/50">
                          <td className="px-6 py-4">
                            <p className="text-sm font-semibold text-dark">{item.name}</p>
                            <p className="text-xs text-[#8D93A5]">{item.brand}</p>
                          </td>
                          <td className="px-6 py-4 text-center">
                            <span className={`text-sm font-bold ${item.stock <= 5 ? "text-red" : "text-dark"}`}>
                              {item.stock}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right text-sm font-semibold">
                            {item.stockValue > 0 ? formatVnd(item.stockValue) : "—"}
                          </td>
                          <td className="px-6 py-4 text-center">
                            <span className={`inline-block px-3 py-1.5 rounded-md text-[11px] uppercase ${statusStyles[item.status]}`}>
                              {item.status}
                            </span>
                          </td>
                          {canStockImport(user) ? (
                            <td className="px-6 py-4 text-right">
                              <button
                                type="button"
                                onClick={() => openAdjustForRow(item)}
                                className="text-xs font-semibold text-[#3C50E0] hover:underline"
                              >
                                Điều chỉnh
                              </button>
                            </td>
                          ) : null}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="p-4 border-t border-gray-3/50 bg-[#F7F9FC]">
                  {totalItems > 0 && (
                    <AdminTablePagination
                      page={stockPage}
                      totalPages={stockTotalPages}
                      totalElements={totalItems}
                      pageSize={stockPageSize}
                      onPageChange={setStockPage}
                      onPageSizeChange={(size) => {
                        setStockPageSize(size);
                        setStockPage(1);
                      }}
                      pageSizeOptions={STOCK_PAGE_SIZE_OPTIONS}
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

function StatCard({
  title,
  value,
  subtitle,
  tone,
}: {
  title: string;
  value: string;
  subtitle: string;
  tone: "blue" | "green" | "yellow" | "red";
}) {
  const box: Record<string, string> = {
    blue: "bg-blue-light-5 border-blue-light-4",
    green: "bg-green-light-6 border-green-light-5",
    yellow: "bg-[#FFF9EB] border-yellow-light-1",
    red: "bg-red-light-6 border-red-light-4",
  };
  const valueColor: Record<string, string> = {
    blue: "text-[#3C50E0]",
    green: "text-green",
    yellow: "text-yellow-dark-2",
    red: "text-red",
  };
  return (
    <div className={`rounded-xl p-5 border ${box[tone]}`}>
      <p className="text-xs font-bold text-[#6C6F93] uppercase tracking-wider mb-2">{title}</p>
      <p className={`text-2xl font-bold mb-1 ${valueColor[tone]}`}>{value}</p>
      <p className="text-xs font-medium text-[#6C6F93]">{subtitle}</p>
    </div>
  );
}
