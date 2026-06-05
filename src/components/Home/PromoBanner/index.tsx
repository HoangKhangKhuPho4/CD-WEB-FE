"use client";
import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { fetchFeaturedProducts } from "@/utils/productApi";
import { mapBackendProductToFrontend } from "@/utils/productMapper";
import type { Product } from "@/types/product";

function formatVnd(amount: number) {
  return amount.toLocaleString("vi-VN") + "₫";
}

const PROMO_IMAGES = [
  "/images/promo/promo-01.png",
  "/images/promo/promo-02.png",
  "/images/promo/promo-03.png",
];

const PromoBanner = () => {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    void fetchFeaturedProducts(0, 3).then((rows) => {
      setProducts(rows.map(mapBackendProductToFrontend));
    });
  }, []);

  const main = products[0];
  const sideA = products[1];
  const sideB = products[2];

  return (
    <section className="overflow-hidden py-20">
      <div className="site-container">
        <div className="relative z-1 overflow-hidden rounded-lg bg-[#F5F5F7] py-12.5 lg:py-17.5 xl:py-22.5 px-4 sm:px-7.5 lg:px-14 xl:px-19 mb-7.5">
          <div className="max-w-[550px] w-full">
            <span className="block font-medium text-xl text-dark mb-3">
              {main?.title ?? "Sản phẩm nổi bật"}
            </span>

            <h2 className="font-bold text-xl lg:text-heading-4 xl:text-heading-3 text-dark mb-5">
              {main?.couponPercent
                ? `GIẢM ĐẾN ${main.couponPercent}%`
                : "ƯU ĐÃI HẤP DẪN"}
            </h2>

            <p className="line-clamp-3">
              {main?.detail?.replace(/<[^>]+>/g, "").slice(0, 160) ||
                "Khám phá sản phẩm công nghệ chính hãng tại Bảo Khang Gadget."}
            </p>

            <Link
              href={main ? `/shop-details/${main.id}` : "/shop-with-sidebar"}
              className="inline-flex font-medium text-custom-sm text-white bg-blue py-[11px] px-9.5 rounded-md ease-out duration-200 hover:bg-blue-dark mt-7.5"
            >
              Mua Ngay
            </Link>
          </div>

          <Image
            src={main?.imgs?.previews?.[0] ?? PROMO_IMAGES[0]}
            alt={main?.title ?? "promo"}
            className="absolute bottom-0 right-4 -z-1 lg:right-16 xl:right-24 2xl:right-32 object-contain max-h-[350px] w-auto"
            width={274}
            height={350}
          />
        </div>

        <div className="grid gap-7.5 grid-cols-1 lg:grid-cols-2">
          {[sideA, sideB].map((p, idx) => (
            <div
              key={p?.id ?? idx}
              className={`relative z-1 overflow-hidden rounded-lg py-10 xl:py-16 px-4 sm:px-7.5 xl:px-10 ${
                idx === 0 ? "bg-[#DBF4F3]" : "bg-[#FFECE1]"
              }`}
            >
              {idx === 0 && (
                <Image
                  src={p?.imgs?.previews?.[0] ?? PROMO_IMAGES[1]}
                  alt=""
                  className="absolute top-1/2 -translate-y-1/2 left-3 sm:left-10 -z-1 object-contain max-h-[200px]"
                  width={241}
                  height={241}
                />
              )}
              {idx === 1 && (
                <Image
                  src={p?.imgs?.previews?.[0] ?? PROMO_IMAGES[2]}
                  alt=""
                  className="absolute top-1/2 -translate-y-1/2 right-3 sm:right-8.5 -z-1 object-contain max-h-[200px]"
                  width={200}
                  height={200}
                />
              )}

              <div className={idx === 0 ? "text-right" : ""}>
                <span className="block text-lg text-dark mb-1.5">
                  {p?.title ?? "Sản phẩm hot"}
                </span>
                <h2 className="font-bold text-xl lg:text-heading-4 text-dark mb-2.5">
                  {p ? formatVnd(p.discountedPrice) : "Giá tốt mỗi ngày"}
                </h2>
                <Link
                  href={p ? `/shop-details/${p.id}` : "/shop-with-sidebar"}
                  className={`inline-flex font-medium text-custom-sm text-white py-2.5 px-8.5 rounded-md ease-out duration-200 mt-6 ${
                    idx === 0
                      ? "bg-teal hover:bg-teal-dark"
                      : "bg-orange hover:bg-orange-dark"
                  }`}
                >
                  Mua Ngay
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PromoBanner;
