import WarrantyLookup from "@/components/WarrantyLookup";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Tra cứu bảo hành | Bảo Khang Gadget",
  description:
    "Tra cứu bảo hành, lịch sử mua hàng và phiếu sửa chữa bằng IMEI hoặc số serial thiết bị tại Bảo Khang Gadget.",
};

export default function BaoHanhPage() {
  return (
    <main>
      <WarrantyLookup />
    </main>
  );
}
