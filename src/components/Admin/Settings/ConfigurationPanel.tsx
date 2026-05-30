"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import {
  systemConfigApi,
  type AiConfig,
  type GeneralSettings,
} from "@/utils/adminApi";

type TabId = "general" | "ai";

function Toggle({
  checked,
  onChange,
  disabled,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={`relative w-11 h-6 rounded-full transition-colors ${
        checked ? "bg-[#3C50E0]" : "bg-gray-3"
      } ${disabled ? "opacity-50" : ""}`}
    >
      <span
        className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
          checked ? "translate-x-5" : ""
        }`}
      />
    </button>
  );
}

export default function ConfigurationPanel() {
  const [activeTab, setActiveTab] = useState<TabId>("general");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [general, setGeneral] = useState<GeneralSettings | null>(null);
  const [ai, setAi] = useState<AiConfig | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const [gRes, aRes] = await Promise.all([
        systemConfigApi.getGeneral(),
        systemConfigApi.getAi(),
      ]);
      if (gRes.data.success) setGeneral(gRes.data.data);
      if (aRes.data.success) setAi(aRes.data.data);
    } catch {
      toast.error("Không tải được cấu hình hệ thống");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const saveGeneral = async () => {
    if (!general) return;
    setSaving(true);
    try {
      const res = await systemConfigApi.updateGeneral(general);
      if (res.data.success) {
        setGeneral(res.data.data);
        toast.success("Đã lưu cấu hình chung");
      } else toast.error(res.data.message);
    } catch {
      toast.error("Lưu cấu hình thất bại");
    } finally {
      setSaving(false);
    }
  };

  const saveAi = async () => {
    if (!ai) return;
    setSaving(true);
    try {
      const res = await systemConfigApi.updateAi({
        recommendationWeight: ai.recommendationWeight,
        svdRank: ai.svdRank,
        svdEpochs: ai.svdEpochs,
        cacheTtlSeconds: ai.cacheTtlSeconds,
        aiServiceBaseUrl: ai.aiServiceBaseUrl,
      });
      if (res.data.success) {
        setAi(res.data.data);
        toast.success("Đã lưu cấu hình AI");
      } else toast.error(res.data.message);
    } catch {
      toast.error("Lưu cấu hình AI thất bại");
    } finally {
      setSaving(false);
    }
  };

  const retrain = async () => {
    try {
      const res = await systemConfigApi.retrain();
      if (res.data.success) {
        toast.success(res.data.message);
        void load();
      }
    } catch {
      toast.error("Không gửi được yêu cầu huấn luyện");
    }
  };

  if (loading || !general || !ai) {
    return (
      <div className="bg-white rounded-xl border border-gray-3/50 p-12 text-center text-[#8D93A5]">
        Đang tải cấu hình...
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-gray-3/50 overflow-hidden">
      <div className="flex gap-6 px-6 border-b border-gray-3/50">
        {[
          { id: "general" as const, label: "Cấu hình chung" },
          { id: "ai" as const, label: "AI & Gợi ý (SVD)" },
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={`py-4 text-sm font-semibold border-b-2 ${
              activeTab === tab.id
                ? "border-[#3C50E0] text-[#3C50E0]"
                : "border-transparent text-[#8D93A5]"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="p-6">
        {activeTab === "general" ? (
          <div className="grid lg:grid-cols-2 gap-6">
            <div className="space-y-4 rounded-xl border border-gray-3/50 p-5">
              <h4 className="font-bold text-dark">Vận chuyển & liên hệ</h4>
              <label className="block text-xs text-[#606882]">
                Phí ship mặc định (VNĐ)
                <input
                  type="number"
                  className="mt-1 w-full px-3 py-2.5 bg-[#F9FAFB] border border-gray-3 rounded-lg text-sm"
                  value={general.defaultShippingFee}
                  onChange={(e) =>
                    setGeneral({ ...general, defaultShippingFee: Number(e.target.value) })
                  }
                />
              </label>
              <label className="block text-xs text-[#606882]">
                Ngưỡng freeship (VNĐ)
                <input
                  type="number"
                  className="mt-1 w-full px-3 py-2.5 bg-[#F9FAFB] border border-gray-3 rounded-lg text-sm"
                  value={general.freeShippingThreshold}
                  onChange={(e) =>
                    setGeneral({ ...general, freeShippingThreshold: Number(e.target.value) })
                  }
                />
              </label>
              <label className="block text-xs text-[#606882]">
                Hotline
                <input
                  className="mt-1 w-full px-3 py-2.5 bg-[#F9FAFB] border border-gray-3 rounded-lg text-sm"
                  value={general.supportHotline}
                  onChange={(e) =>
                    setGeneral({ ...general, supportHotline: e.target.value })
                  }
                />
              </label>
              <label className="block text-xs text-[#606882]">
                Email hỗ trợ
                <input
                  type="email"
                  className="mt-1 w-full px-3 py-2.5 bg-[#F9FAFB] border border-gray-3 rounded-lg text-sm"
                  value={general.supportEmail}
                  onChange={(e) =>
                    setGeneral({ ...general, supportEmail: e.target.value })
                  }
                />
              </label>
            </div>
            <div className="rounded-xl border border-gray-3/50 p-5 space-y-4">
              <h4 className="font-bold text-dark">Cổng thanh toán</h4>
              {[
                { key: "codEnabled" as const, label: "COD" },
                { key: "vnpayEnabled" as const, label: "VNPay" },
                { key: "momoEnabled" as const, label: "MoMo" },
                { key: "zalopayEnabled" as const, label: "ZaloPay" },
              ].map((g) => (
                <div key={g.key} className="flex justify-between items-center">
                  <span className="text-sm text-dark">{g.label}</span>
                  <Toggle
                    checked={!!general[g.key]}
                    onChange={(v) => setGeneral({ ...general, [g.key]: v })}
                  />
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="max-w-xl space-y-4">
            <div className="p-4 rounded-xl bg-[#D0E9F3]/50 text-sm">
              Trạng thái retrain: <strong>{ai.retrainStatus}</strong>
              {ai.retrainMessage ? ` — ${ai.retrainMessage}` : null}
            </div>
            <label className="block text-xs text-[#606882]">
              URL AI Service (Flask)
              <input
                className="mt-1 w-full px-3 py-2.5 bg-[#F9FAFB] border border-gray-3 rounded-lg text-sm"
                value={ai.aiServiceBaseUrl}
                onChange={(e) => setAi({ ...ai, aiServiceBaseUrl: e.target.value })}
              />
            </label>
            <div className="grid grid-cols-2 gap-4">
              <label className="block text-xs text-[#606882]">
                SVD Rank
                <input
                  type="number"
                  className="mt-1 w-full px-3 py-2.5 bg-[#F9FAFB] border border-gray-3 rounded-lg text-sm"
                  value={ai.svdRank}
                  onChange={(e) => setAi({ ...ai, svdRank: Number(e.target.value) })}
                />
              </label>
              <label className="block text-xs text-[#606882]">
                Epochs
                <input
                  type="number"
                  className="mt-1 w-full px-3 py-2.5 bg-[#F9FAFB] border border-gray-3 rounded-lg text-sm"
                  value={ai.svdEpochs}
                  onChange={(e) => setAi({ ...ai, svdEpochs: Number(e.target.value) })}
                />
              </label>
            </div>
            <button
              type="button"
              onClick={retrain}
              disabled={ai.retrainStatus === "RUNNING"}
              className="px-4 py-2 rounded-lg border border-orange text-orange text-sm font-semibold hover:bg-[#FFECE1] disabled:opacity-50"
            >
              Huấn luyện lại model
            </button>
          </div>
        )}

        <div className="flex justify-end mt-6 pt-6 border-t border-gray-3/50">
          <button
            type="button"
            disabled={saving}
            onClick={activeTab === "general" ? saveGeneral : saveAi}
            className="px-5 py-2.5 rounded-lg bg-[#3C50E0] text-white text-sm font-semibold hover:bg-[#1C3FB7] disabled:opacity-50"
          >
            {saving ? "Đang lưu..." : "Lưu cấu hình"}
          </button>
        </div>
      </div>
    </div>
  );
}
