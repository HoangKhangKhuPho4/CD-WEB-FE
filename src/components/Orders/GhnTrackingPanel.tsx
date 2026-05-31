"use client";

import React, { useEffect, useState } from "react";
import { trackGhnShipment, type GhnTrackingResponse } from "@/utils/shippingApi";

export default function GhnTrackingPanel({
  trackingCode,
  ghnOrderCode,
}: {
  trackingCode?: string | null;
  ghnOrderCode?: string | null;
}) {
  const code = (ghnOrderCode || trackingCode)?.trim();
  const [tracking, setTracking] = useState<GhnTrackingResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    if (!expanded || !code) return;
    setLoading(true);
    void trackGhnShipment(code).then((data) => {
      setTracking(data);
      setLoading(false);
    });
  }, [expanded, code]);

  if (!code) return null;

  return (
    <div className="mb-6 rounded-xl border border-gray-3 bg-gray-1/50 p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h4 className="font-medium text-dark mb-1">Vận chuyển GHN</h4>
          <p className="text-sm text-gray-600">
            Mã vận đơn:{" "}
            <span className="font-mono font-medium text-dark">{code}</span>
          </p>
        </div>
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="text-sm font-medium text-blue hover:underline"
        >
          {expanded ? "Ẩn chi tiết" : "Theo dõi GHN"}
        </button>
      </div>

      {expanded && (
        <div className="mt-4 border-t border-gray-3 pt-4">
          {loading ? (
            <p className="text-sm text-gray-500">Đang tra cứu vận đơn...</p>
          ) : !tracking ? (
            <p className="text-sm text-gray-500">
              Không lấy được thông tin từ GHN. Mã có thể chưa kích hoạt trên hệ
              thống vận chuyển.
            </p>
          ) : (
            <>
              <p className="text-sm font-medium text-dark mb-1">
                {tracking.statusDisplay || tracking.status}
              </p>
              {tracking.currentLocation && (
                <p className="text-xs text-gray-500 mb-3">
                  Vị trí: {tracking.currentLocation}
                </p>
              )}
              {tracking.expectedDeliveryTime && (
                <p className="text-xs text-gray-500 mb-3">
                  Dự kiến giao: {tracking.expectedDeliveryTime}
                </p>
              )}
              {tracking.logs && tracking.logs.length > 0 && (
                <ol className="relative border-l border-gray-3 ml-2 space-y-4 mt-3">
                  {tracking.logs.map((log, idx) => (
                    <li key={`${log.status}-${idx}`} className="ml-4">
                      <span className="absolute -left-1 flex h-2 w-2 rounded-full bg-blue" />
                      <p className="text-sm text-dark">
                        {log.statusDisplay || log.status}
                      </p>
                      {log.updatedDate && (
                        <p className="text-xs text-gray-500">{log.updatedDate}</p>
                      )}
                      {log.location && (
                        <p className="text-xs text-gray-500">{log.location}</p>
                      )}
                    </li>
                  ))}
                </ol>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
