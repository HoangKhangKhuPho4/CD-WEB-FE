"use client";

import React, { useEffect, useState } from "react";
import Breadcrumb from "../Common/Breadcrumb";
import { fetchStoreSettings, type StoreSettings } from "@/utils/settingsApi";
import { BRAND } from "@/config/brand";

const Contact = () => {
  const [settings, setSettings] = useState<StoreSettings | null>(null);

  useEffect(() => {
    void fetchStoreSettings().then(setSettings);
  }, []);

  const hotline = settings?.supportHotline || "1900 xxxx";
  const email = settings?.supportEmail || "support@baokhanggadget.vn";

  return (
    <>
      <Breadcrumb title="Liên hệ" pages={["contact"]} />

      <section className="overflow-hidden py-20 bg-gray-2">
        <div className="site-container">
          <div className="flex flex-col xl:flex-row gap-7.5">
            <div className="xl:max-w-[370px] w-full bg-white rounded-xl shadow-1">
              <div className="py-5 px-4 sm:px-7.5 border-b border-gray-3">
                <p className="font-medium text-xl text-dark">Thông tin liên hệ</p>
              </div>

              <div className="p-4 sm:p-7.5">
                <div className="flex flex-col gap-4 text-sm text-dark">
                  <p>
                    <span className="font-medium">{BRAND.name}</span>
                  </p>
                  <p>
                    Hotline:{" "}
                    <a href={`tel:${hotline.replace(/\s/g, "")}`} className="text-blue">
                      {hotline}
                    </a>
                  </p>
                  <p>
                    Email:{" "}
                    <a href={`mailto:${email}`} className="text-blue">
                      {email}
                    </a>
                  </p>
                  {settings?.siteFooterText && (
                    <p className="text-gray-500">{settings.siteFooterText}</p>
                  )}
                </div>
              </div>
            </div>

            <div className="xl:max-w-[770px] w-full bg-white rounded-xl shadow-1 p-4 sm:p-10">
              <h2 className="font-medium text-xl text-dark mb-2">Gửi tin nhắn</h2>
              <p className="text-sm text-gray-500 mb-6">
                Form liên hệ đang được hoàn thiện. Vui lòng gọi hotline hoặc email hỗ trợ
                phía trên.
              </p>
              <form
                onSubmit={(e) => e.preventDefault()}
                className="grid grid-cols-1 sm:grid-cols-2 gap-4 opacity-60 pointer-events-none"
              >
                <input
                  placeholder="Họ tên"
                  className="border border-gray-3 rounded-md px-4 py-2.5"
                />
                <input
                  placeholder="Email"
                  type="email"
                  className="border border-gray-3 rounded-md px-4 py-2.5"
                />
                <textarea
                  placeholder="Nội dung"
                  rows={5}
                  className="sm:col-span-2 border border-gray-3 rounded-md px-4 py-2.5"
                />
                <button
                  type="submit"
                  className="sm:col-span-2 py-3 bg-blue text-white rounded-md"
                >
                  Gửi
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default Contact;
