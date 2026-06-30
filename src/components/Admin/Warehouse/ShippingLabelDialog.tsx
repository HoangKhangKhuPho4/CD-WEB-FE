"use client";

import Modal from "@/components/Admin/shared/Modal";

export default function ShippingLabelDialog({
  open,
  onClose,
  orderCode,
  trackingCode,
  ghnOrderCode,
  printUrl,
}: {
  open: boolean;
  onClose: () => void;
  orderCode: string;
  trackingCode?: string;
  ghnOrderCode?: string;
  printUrl?: string;
}) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Tem vận chuyển"
      subtitle={`Đơn ${orderCode} — dán lên thùng hàng trước khi bàn giao shipper`}
      footer={
        <>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 text-sm font-semibold text-[#6C6F93]"
          >
            Đóng
          </button>
          {printUrl && (
            <a
              href={printUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-5 py-2.5 bg-[#3C50E0] text-white text-sm font-semibold rounded-lg hover:bg-[#1C3FB7]"
            >
              In nhãn dán
            </a>
          )}
        </>
      }
    >
      <div className="space-y-4 py-2">
        {trackingCode && (
          <div className="rounded-lg bg-[#F7F9FC] p-4">
            <p className="text-xs text-[#8D93A5]">Mã tracking</p>
            <p className="text-lg font-bold text-dark font-mono">{trackingCode}</p>
          </div>
        )}
        {ghnOrderCode && (
          <div className="rounded-lg bg-[#F7F9FC] p-4">
            <p className="text-xs text-[#8D93A5]">Mã vận đơn GHN</p>
            <p className="text-lg font-bold text-dark font-mono">{ghnOrderCode}</p>
          </div>
        )}
        {!printUrl && (
          <p className="text-sm text-[#8D93A5]">
            Link in tem sẽ có sau khi GHN xử lý vận đơn. Bạn có thể in lại từ chi tiết đơn.
          </p>
        )}
      </div>
    </Modal>
  );
}
