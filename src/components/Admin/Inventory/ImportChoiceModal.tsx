"use client";

import Link from "next/link";
import Modal from "@/components/Admin/shared/Modal";

export default function ImportChoiceModal({
  open,
  onClose,
  onManual,
}: {
  open: boolean;
  onClose: () => void;
  onManual: () => void;
}) {
  return (
    <Modal open={open} onClose={onClose} title="Lập phiếu nhập kho" subtitle="Chọn loại phiếu">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Link
          href="/admin/purchase-orders"
          onClick={onClose}
          className="block p-5 rounded-xl border-2 border-[#3C50E0]/30 hover:border-[#3C50E0] hover:bg-[#EEF2FF] transition-colors"
        >
          <p className="font-bold text-[#3C50E0]">Nhập theo PO (chuẩn ERP)</p>
          <p className="text-xs text-[#6C6F93] mt-2">
            Kiểm đếm đơn mua hàng đã duyệt — quét serial, LOT, kệ, báo hàng lỗi
          </p>
        </Link>
        <button
          type="button"
          onClick={() => {
            onClose();
            onManual();
          }}
          className="text-left p-5 rounded-xl border-2 border-gray-3/50 hover:border-[#6C6F93] hover:bg-[#F7F9FC] transition-colors"
        >
          <p className="font-bold text-dark">Nhập lẻ / thủ công</p>
          <p className="text-xs text-[#6C6F93] mt-2">
            Phiếu nhập trực tiếp không qua PO — phụ kiện, điều chỉnh nhanh
          </p>
        </button>
      </div>
    </Modal>
  );
}
