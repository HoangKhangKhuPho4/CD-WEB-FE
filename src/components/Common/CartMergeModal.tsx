"use client";

import React from "react";
import type { CartItem } from "@/redux/features/cart-slice";

export type CartMergeChoice = "merge" | "keep_server" | "replace";

export default function CartMergeModal({
  open,
  guestCount,
  serverCount,
  onChoose,
  loading,
}: {
  open: boolean;
  guestCount: number;
  serverCount: number;
  loading?: boolean;
  onChoose: (choice: CartMergeChoice) => void;
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[999999] flex items-center justify-center bg-dark/60 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
        <h3 className="text-lg font-semibold text-dark mb-2">Đồng bộ giỏ hàng</h3>
        <p className="text-sm text-gray-600 mb-6">
          Bạn có <strong>{guestCount}</strong> sản phẩm trong giỏ trên thiết bị này
          {serverCount > 0 && (
            <>
              {" "}
              và <strong>{serverCount}</strong> sản phẩm trong giỏ tài khoản.
            </>
          )}
          . Chọn cách xử lý:
        </p>
        <div className="flex flex-col gap-2">
          <button
            type="button"
            disabled={loading}
            onClick={() => onChoose("merge")}
            className="w-full py-3 px-4 text-left rounded-lg border border-blue bg-blue/5 hover:bg-blue/10 disabled:opacity-50"
          >
            <span className="block font-medium text-dark">Gộp giỏ hàng</span>
            <span className="text-xs text-gray-500">
              Thêm sản phẩm hiện tại vào giỏ tài khoản
            </span>
          </button>
          {serverCount > 0 && (
            <button
              type="button"
              disabled={loading}
              onClick={() => onChoose("keep_server")}
              className="w-full py-3 px-4 text-left rounded-lg border border-gray-3 hover:bg-gray-1 disabled:opacity-50"
            >
              <span className="block font-medium text-dark">Giữ giỏ tài khoản</span>
              <span className="text-xs text-gray-500">Bỏ giỏ trên thiết bị này</span>
            </button>
          )}
          <button
            type="button"
            disabled={loading}
            onClick={() => onChoose("replace")}
            className="w-full py-3 px-4 text-left rounded-lg border border-gray-3 hover:bg-gray-1 disabled:opacity-50"
          >
            <span className="block font-medium text-dark">
              {serverCount > 0 ? "Thay bằng giỏ hiện tại" : "Lưu giỏ lên tài khoản"}
            </span>
            <span className="text-xs text-gray-500">
              {serverCount > 0
                ? "Xóa giỏ tài khoản và chỉ giữ sản phẩm trên thiết bị"
                : "Đưa sản phẩm đang chọn lên tài khoản"}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
