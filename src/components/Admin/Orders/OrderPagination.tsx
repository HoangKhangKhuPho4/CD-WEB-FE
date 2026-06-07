"use client";

import AdminTablePagination from "@/components/Admin/shared/AdminTablePagination";
import { useOrdersAdmin } from "@/components/Admin/Orders/ordersAdminStore";

const PAGE_SIZE_OPTIONS = [10, 15, 20, 50];

export default function OrderPagination() {
  const {
    page,
    pageSize,
    totalPages,
    totalElements,
    setPage,
    setPageSize,
    orders,
  } = useOrdersAdmin();

  if (totalElements === 0 && orders.length === 0) {
    return null;
  }

  return (
    <AdminTablePagination
      page={page + 1}
      totalPages={Math.max(1, totalPages)}
      totalElements={totalElements}
      pageSize={pageSize}
      onPageChange={(p) => setPage(p - 1)}
      onPageSizeChange={(size) => {
        setPageSize(size);
        setPage(0);
      }}
      pageSizeOptions={PAGE_SIZE_OPTIONS}
      label="đơn hàng"
    />
  );
}
