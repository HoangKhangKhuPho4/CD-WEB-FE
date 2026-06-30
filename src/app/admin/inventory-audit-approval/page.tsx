"use client";

import PageHeader from "@/components/Admin/shared/PageHeader";
import InventoryAuditApprovalPanel from "@/components/Admin/Warehouse/InventoryAuditApprovalPanel";

export default function InventoryAuditApprovalPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Duyệt phiếu kiểm kê"
        subtitle="Admin giám định biên bản chênh lệch — phê duyệt hoặc từ chối để cân bằng tồn kho"
      />
      <InventoryAuditApprovalPanel />
    </div>
  );
}
