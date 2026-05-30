"use client";
import ProductStatsCards from "@/components/Admin/Products/ProductStatsCards";
import ProductFilters from "@/components/Admin/Products/ProductFilters";
import ProductTable from "@/components/Admin/Products/ProductTable";
import ProductPagination from "@/components/Admin/Products/ProductPagination";
import { ProductsProvider } from "@/components/Admin/Products/productsStore";
import Link from "next/link";
import AdminCatalogSubNav from "@/components/Admin/AdminCatalogSubNav";
import { useAppSelector } from "@/redux/store";
import { canCreateProduct } from "@/utils/catalogPermissions";

export default function AdminProductsPage() {
  const user = useAppSelector((s) => s.authReducer.user);
  const showCreate = canCreateProduct(user);

  return (
    <ProductsProvider>
      <div className="space-y-6 relative pb-16">
        <AdminCatalogSubNav />
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-dark">Sản phẩm</h1>
            <p className="text-sm text-[#6C6F93] mt-1">
              Quản lý kho hàng và trạng thái kinh doanh của bạn
            </p>
          </div>
          {showCreate && (
            <Link
              href="/admin/products/new"
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-[#3C50E0] text-white text-sm font-semibold rounded-lg hover:bg-[#1C3FB7] shadow-lg shadow-[#3C50E0]/25 transition-all duration-200 flex-shrink-0"
            >
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M9 3.75V14.25" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M3.75 9H14.25" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Thêm sản phẩm
            </Link>
          )}
        </div>

        <ProductStatsCards />
        <ProductFilters />
        <ProductTable />
        <ProductPagination />

        <button
          type="button"
          className="fixed bottom-8 right-8 w-12 h-12 bg-[#3C50E0] text-white rounded-full shadow-lg shadow-[#3C50E0]/30 flex items-center justify-center hover:bg-[#1C3FB7] transition-colors z-10"
          title="Trợ giúp"
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M10 18.3333C14.6024 18.3333 18.3333 14.6024 18.3333 10C18.3333 5.39763 14.6024 1.66667 10 1.66667C5.39763 1.66667 1.66667 5.39763 1.66667 10C1.66667 14.6024 5.39763 18.3333 10 18.3333Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M7.575 7.5C7.77087 6.94306 8.1576 6.47341 8.66658 6.17428C9.17557 5.87515 9.77408 5.76578 10.3559 5.86559C10.9377 5.9654 11.4656 6.26792 11.8459 6.7196C12.2261 7.17127 12.4342 7.74295 12.4333 8.33333C12.4333 10 9.93333 10.8333 9.93333 10.8333" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M10 14.1667H10.0083" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      </div>
    </ProductsProvider>
  );
}
