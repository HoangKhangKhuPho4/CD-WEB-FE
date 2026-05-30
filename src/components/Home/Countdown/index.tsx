"use client";
import React, { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { fetchFeaturedProducts } from "@/utils/productApi";
import { mapBackendProductToFrontend } from "@/utils/productMapper";
import type { Product } from "@/types/product";

function formatVnd(amount: number) {
  return amount.toLocaleString("vi-VN") + "₫";
}

const CounDown = () => {
  const [days, setDays] = useState(0);
  const [hours, setHours] = useState(0);
  const [minutes, setMinutes] = useState(0);
  const [seconds, setSeconds] = useState(0);
  const [product, setProduct] = useState<Product | null>(null);

  const deadline = useMemo(() => {
    const end = new Date();
    end.setDate(end.getDate() + 7);
    end.setHours(23, 59, 59, 0);
    return end.getTime();
  }, []);

  useEffect(() => {
    void fetchFeaturedProducts(0, 1).then(async (rows) => {
      if (rows[0]) {
        setProduct(mapBackendProductToFrontend(rows[0]));
      }
    });
  }, []);

  useEffect(() => {
    const tick = () => {
      const time = deadline - Date.now();
      if (time <= 0) {
        setDays(0);
        setHours(0);
        setMinutes(0);
        setSeconds(0);
        return;
      }
      setDays(Math.floor(time / (1000 * 60 * 60 * 24)));
      setHours(Math.floor((time / (1000 * 60 * 60)) % 24));
      setMinutes(Math.floor((time / 1000 / 60) % 60));
      setSeconds(Math.floor((time / 1000) % 60));
    };
    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [deadline]);

  const title = product?.title ?? "Ưu đãi sản phẩm nổi bật";
  const price = product?.discountedPrice ?? 0;
  const oldPrice = product?.price ?? 0;
  const productLink = product ? `/shop-details/${product.id}` : "/shop-with-sidebar";
  const productImg =
    product?.imgs?.previews?.[0] ?? "/images/countdown/countdown-01.png";

  return (
    <section className="overflow-hidden py-20">
      <div className="site-container">
        <div className="relative overflow-hidden z-1 rounded-lg bg-[#D0E9F3] p-4 sm:p-7.5 lg:p-10 xl:p-15">
          <div className="max-w-[422px] w-full">
            <span className="block font-medium text-custom-1 text-blue mb-2.5">
              Đừng Bỏ Lỡ!!
            </span>

            <h2 className="font-bold text-dark text-xl lg:text-heading-4 xl:text-heading-3 mb-3">
              {title}
            </h2>

            {product && (
              <p className="text-dark font-semibold">
                {formatVnd(price)}
                {oldPrice > price && (
                  <span className="ml-2 text-gray-500 line-through font-normal text-sm">
                    {formatVnd(oldPrice)}
                  </span>
                )}
              </p>
            )}

            <div className="flex flex-wrap gap-6 mt-6">
              {[
                { v: days, label: "Ngày" },
                { v: hours, label: "Giờ" },
                { v: minutes, label: "Phút" },
                { v: seconds, label: "Giây" },
              ].map(({ v, label }) => (
                <div key={label}>
                  <span className="min-w-[64px] h-14.5 font-semibold text-xl lg:text-3xl text-dark rounded-lg flex items-center justify-center bg-white shadow-2 px-4 mb-2">
                    {v < 10 ? `0${v}` : v}
                  </span>
                  <span className="block text-custom-sm text-dark text-center">{label}</span>
                </div>
              ))}
            </div>

            <Link
              href={productLink}
              className="inline-flex font-medium text-custom-sm text-white bg-blue py-3 px-9.5 rounded-md ease-out duration-200 hover:bg-blue-dark mt-7.5"
            >
              Xem Ngay!
            </Link>
          </div>

          <Image
            src="/images/countdown/countdown-bg.png"
            alt=""
            className="hidden sm:block absolute right-0 bottom-0 -z-1"
            width={737}
            height={482}
          />
          <Image
            src={productImg}
            alt={title}
            className="hidden lg:block absolute right-4 xl:right-33 bottom-4 xl:bottom-10 -z-1 object-contain"
            width={411}
            height={376}
          />
        </div>
      </div>
    </section>
  );
};

export default CounDown;
