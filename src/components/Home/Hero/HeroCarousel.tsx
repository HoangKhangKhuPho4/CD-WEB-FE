"use client";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination } from "swiper/modules";
import { useEffect, useState } from "react";

import "swiper/css/pagination";
import "swiper/css";

import Image from "next/image";
import Link from "next/link";
import { fetchFeaturedProducts } from "@/utils/productApi";
import { mapBackendProductToFrontend } from "@/utils/productMapper";
import type { Product } from "@/types/product";

function formatVnd(amount: number) {
  return amount.toLocaleString("vi-VN") + "₫";
}

const FALLBACK_SLIDES: Product[] = [
  {
    id: 0,
    title: "True Wireless Noise Cancelling Headphone",
    price: 999000,
    discountedPrice: 699000,
    reviews: 0,
    imgs: {
      thumbnails: ["/images/hero/hero-01.png"],
      previews: ["/images/hero/hero-01.png"],
    },
  },
];

const HeroCarousal = () => {
  const [slides, setSlides] = useState<Product[]>(FALLBACK_SLIDES);

  useEffect(() => {
    void fetchFeaturedProducts(0, 4).then((rows) => {
      if (rows.length > 0) {
        setSlides(rows.map(mapBackendProductToFrontend));
      }
    });
  }, []);

  return (
    <Swiper
      spaceBetween={30}
      centeredSlides
      autoplay={{ delay: 3500, disableOnInteraction: false }}
      pagination={{ clickable: true }}
      modules={[Autoplay, Pagination]}
      className="hero-carousel"
    >
      {slides.map((item) => {
        const img = item.imgs?.previews?.[0] ?? "/images/hero/hero-01.png";
        const discount =
          item.price > item.discountedPrice
            ? Math.round((1 - item.discountedPrice / item.price) * 100)
            : 0;
        return (
          <SwiperSlide key={item.id}>
            <div className="flex items-center pt-6 sm:pt-0 flex-col-reverse sm:flex-row">
              <div className="max-w-[394px] py-10 sm:py-15 lg:py-24.5 pl-4 sm:pl-7.5 lg:pl-12.5">
                {discount > 0 && (
                  <div className="flex items-center gap-4 mb-7.5 sm:mb-10">
                    <span className="block font-semibold text-heading-3 sm:text-heading-1 text-blue">
                      {discount}%
                    </span>
                    <span className="block text-dark text-sm sm:text-custom-1 sm:leading-[24px]">
                      Giảm
                      <br />
                      Giá
                    </span>
                  </div>
                )}

                <h1 className="font-semibold text-dark text-xl sm:text-3xl mb-3">
                  <Link href={`/shop-details/${item.id}`}>{item.title}</Link>
                </h1>

                <p className="text-dark font-medium mb-2">
                  {formatVnd(item.discountedPrice)}
                  {item.price > item.discountedPrice && (
                    <span className="ml-2 text-gray-500 line-through text-sm">
                      {formatVnd(item.price)}
                    </span>
                  )}
                </p>

                <Link
                  href={`/shop-details/${item.id}`}
                  className="inline-flex font-medium text-white text-custom-sm rounded-md bg-dark py-3 px-9 ease-out duration-200 hover:bg-blue mt-6"
                >
                  Mua Ngay
                </Link>
              </div>

              <div>
                <Image src={img} alt={item.title} width={351} height={358} className="object-contain" />
              </div>
            </div>
          </SwiperSlide>
        );
      })}
    </Swiper>
  );
};

export default HeroCarousal;
