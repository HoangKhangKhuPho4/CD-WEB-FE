import Link from "next/link";
import { adminFormatMoneyVND, useProducts, type ProductStatus } from "@/components/Admin/Products/productsStore";
import { useAppSelector } from "@/redux/store";
import {
  canDeleteProduct,
  canUpdateProduct,
} from "@/utils/catalogPermissions";
import { hasPermission } from "@/utils/rbac";

const statusConfig: Record<
  ProductStatus,
  { label: string; dotColor: string; textColor: string }
> = {
  selling: {
    label: "Đang bán",
    dotColor: "bg-green",
    textColor: "text-dark",
  },
  stopped: {
    label: "Ngừng bán",
    dotColor: "bg-[#3C50E0]",
    textColor: "text-dark",
  },
  out_of_stock: {
    label: "Hết hàng",
    dotColor: "bg-red",
    textColor: "text-dark",
  },
};

function categoryPillClass(category: string) {
  const map: Record<string, string> = {
    "Điện tử": "bg-[#EEF2FF] text-[#3C50E0]",
    "Âm thanh": "bg-[#F3E8FF] text-[#9333EA]",
    "Nhiếp ảnh": "bg-[#FEF3C7] text-[#B45309]",
    "Phụ kiện": "bg-[#ECFDF5] text-[#22AD5C]",
  };
  return map[category] ?? "bg-[#F7F9FC] text-[#6C6F93]";
}

export default function ProductTable() {
  const { pagedProducts, toggleFeatured, deleteProduct } = useProducts();
  const user = useAppSelector((s) => s.authReducer.user);
  const canEdit = canUpdateProduct(user);
  const canDelete = canDeleteProduct(user);
  const canToggleFeatured = hasPermission(user, "PRODUCT_MANAGE");
  const showActions = canEdit || canDelete;

  return (
    <div className="bg-white rounded-xl border border-gray-3/50 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[1000px]">
          <thead>
            <tr className="bg-[#F7F9FC] border-b border-gray-3/50">
              <th className="text-left px-5 py-3.5 text-xs font-bold text-[#8D93A5] uppercase tracking-wider">
                Sản phẩm
              </th>
              <th className="text-left px-4 py-3.5 text-xs font-bold text-[#8D93A5] uppercase tracking-wider">
                SKU
              </th>
              <th className="text-left px-4 py-3.5 text-xs font-bold text-[#8D93A5] uppercase tracking-wider">
                Danh mục
              </th>
              <th className="text-right px-4 py-3.5 text-xs font-bold text-[#8D93A5] uppercase tracking-wider">
                Giá
              </th>
              <th className="text-center px-4 py-3.5 text-xs font-bold text-[#8D93A5] uppercase tracking-wider">
                Tồn kho
              </th>
              <th className="text-left px-4 py-3.5 text-xs font-bold text-[#8D93A5] uppercase tracking-wider">
                Trạng thái
              </th>
              <th className="text-center px-4 py-3.5 text-xs font-bold text-[#8D93A5] uppercase tracking-wider">
                Nổi bật
              </th>
              <th className="text-left px-4 py-3.5 text-xs font-bold text-[#8D93A5] uppercase tracking-wider">
                Ngày tạo
              </th>
              {showActions && (
              <th className="text-center px-5 py-3.5 text-xs font-bold text-[#8D93A5] uppercase tracking-wider">
                Hành động
              </th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-3/50">
            {pagedProducts.map((product) => {
              const status = statusConfig[product.status];
              return (
                <tr
                  key={product.id}
                  className="hover:bg-[#F7F9FC]/60 transition-colors"
                >
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-lg bg-gradient-to-br from-[#3C50E0] to-[#5475E5] flex-shrink-0 flex items-center justify-center overflow-hidden">
                        {product.imageUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={product.imageUrl}
                            alt={product.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M6.66667 7.5H13.3333V12.5H6.66667V7.5Z" stroke="white" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M8.33333 7.5V6.66667C8.33333 6.20643 8.70643 5.83333 9.16667 5.83333H10.8333C11.2936 5.83333 11.6667 6.20643 11.6667 6.66667V7.5" stroke="white" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-dark truncate">
                          {product.name}
                        </p>
                        <p className="text-xs text-[#8D93A5] truncate">
                          {product.description}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <span className="text-sm text-[#6C6F93] font-mono">
                      {product.sku}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    <span
                      className={`inline-flex px-2.5 py-1 rounded-md text-xs font-medium ${categoryPillClass(product.category)}`}
                    >
                      {product.category}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-right">
                    <span className="text-sm font-semibold text-dark">
                      {adminFormatMoneyVND(product.price)}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-center">
                    <span
                      className={`text-sm font-medium ${
                        product.stock === 0 ? "text-red" : "text-dark"
                      }`}
                    >
                      {product.stock}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${status.dotColor}`} />
                      <span className={`text-sm ${status.textColor}`}>
                        {status.label}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-center">
                    {canToggleFeatured ? (
                    <button
                      type="button"
                      onClick={() => toggleFeatured(product.id)}
                      className="p-1 hover:scale-110 transition-transform"
                      title={product.featured ? "Bỏ nổi bật" : "Đặt nổi bật"}
                    >
                      {product.featured ? (
                        <svg width="18" height="18" viewBox="0 0 18 18" fill="#F59E0B" xmlns="http://www.w3.org/2000/svg">
                          <path d="M9 1.5L11.3175 6.195L16.5 6.9525L12.75 10.605L13.635 15.765L9 13.2675L4.365 15.765L5.25 10.605L1.5 6.9525L6.6825 6.195L9 1.5Z"/>
                        </svg>
                      ) : (
                        <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M9 1.5L11.3175 6.195L16.5 6.9525L12.75 10.605L13.635 15.765L9 13.2675L4.365 15.765L5.25 10.605L1.5 6.9525L6.6825 6.195L9 1.5Z" stroke="#8D93A5" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      )}
                    </button>
                    ) : (
                      <span className="text-xs text-[#8D93A5]">{product.featured ? "★" : "—"}</span>
                    )}
                  </td>
                  <td className="px-4 py-4">
                    <span className="text-sm text-[#6C6F93]">{product.createdAt}</span>
                  </td>
                  {showActions && (
                  <td className="px-5 py-4">
                    <div className="flex items-center justify-center gap-2">
                      {canEdit && (
                      <Link
                        href={`/admin/products/${product.id}/edit`}
                        className="p-2 rounded-lg text-[#3C50E0] hover:bg-[#3C50E0]/10 transition-colors"
                        title="Chỉnh sửa"
                      >
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M11.3333 2.00001C11.5084 1.8249 11.7163 1.68698 11.9451 1.59431C12.1739 1.50164 12.4189 1.45605 12.6667 1.45605C12.9144 1.45605 13.1594 1.50164 13.3882 1.59431C13.617 1.68698 13.825 1.8249 14 2.00001C14.1751 2.17512 14.313 2.38308 14.4057 2.61188C14.4984 2.84068 14.544 3.08567 14.544 3.33334C14.544 3.58101 14.4984 3.826 14.4057 4.0548C14.313 4.2836 14.1751 4.49156 14 4.66668L5.00001 13.6667L1.33334 14.6667L2.33334 11L11.3333 2.00001Z" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </Link>
                      )}
                      {canDelete && (
                      <button
                        type="button"
                        onClick={() => {
                          const ok = window.confirm(`Xóa sản phẩm "${product.name}"?`);
                          if (ok) deleteProduct(product.id);
                        }}
                        className="p-2 rounded-lg text-red hover:bg-red-light-6 transition-colors"
                        title="Xóa"
                      >
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M2 4H14M12.6667 4V13.3333C12.6667 14 12 14.6667 11.3333 14.6667H4.66667C4 14.6667 3.33334 14 3.33334 13.3333V4M5.33334 4V2.66667C5.33334 2 6 2 6.66667 2H9.33334C10 2 10.6667 2 10.6667 2.66667V4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                          <path d="M6.66667 7.33334V11.3333" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                          <path d="M9.33334 7.33334V11.3333" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </button>
                      )}
                    </div>
                  </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
