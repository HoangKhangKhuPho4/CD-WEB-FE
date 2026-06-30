"use client";

import { useState } from "react";
import ProcurementOrderForm from "@/components/Admin/Procurement/ProcurementOrderForm";
import ProcurementPoList from "@/components/Admin/Procurement/ProcurementPoList";

type TabKey = "create" | "list";

const tabs: { key: TabKey; label: string }[] = [
  { key: "create", label: "Tạo PO mới" },
  { key: "list", label: "Danh sách PO đã tạo" },
];

export default function ProcurementWorkspace() {
  const [activeTab, setActiveTab] = useState<TabKey>("create");
  const [listRefreshKey, setListRefreshKey] = useState(0);

  const handleCreated = () => {
    setListRefreshKey((k) => k + 1);
    setActiveTab("list");
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-1 p-1 bg-[#F7F9FC] rounded-xl border border-gray-3/50 w-fit">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
              activeTab === tab.key
                ? "bg-white text-[#3C50E0] shadow-sm"
                : "text-[#6C6F93] hover:text-dark"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === "create" ? (
        <ProcurementOrderForm onCreated={handleCreated} />
      ) : (
        <ProcurementPoList refreshKey={listRefreshKey} />
      )}
    </div>
  );
}
