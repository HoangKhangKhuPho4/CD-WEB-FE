"use client";
import React, { useEffect, useState } from "react";
import SingleItem from "./SingleItem";
import Image from "next/image";
import Link from "next/link";
import { fetchBestSellers } from "@/utils/productApi";
import { mapBackendProductToFrontend } from "@/utils/productMapper";
import { Product } from "@/types/product";

const BestSeller = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadBestSellers = async () => {
      try {
        const data = await fetchBestSellers(0, 6);
        if (data && data.length > 0) {
          const mappedProducts = data.map(mapBackendProductToFrontend);
          setProducts(mappedProducts);
        }
      } catch (error) {
        console.error("Failed to load best sellers:", error);
      } finally {
        setLoading(false);
      }
    };

    loadBestSellers();
  }, []);

  return (
    <section className="overflow-hidden">
      <div className="site-container">
        {/* <!-- section title --> */}
        <div className="mb-10 flex items-center justify-between">
          <div>
            <span className="flex items-center gap-2.5 font-medium text-dark mb-1.5">
              <Image
                src="/images/icons/icon-07.svg"
                alt="icon"
                width={17}
                height={17}
              />
              Tháng Này
            </span>
            <h2 className="font-semibold text-xl xl:text-heading-5 text-dark">
              Bán Chạy Nhất
            </h2>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-10">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-7.5 sm:grid-cols-2 lg:grid-cols-3 2xl:gap-9">
            {products.map((item, key) => (
              <SingleItem item={item} key={item.id || key} />
            ))}
          </div>
        )}

        <div className="text-center mt-12.5">
          <Link
            href="/shop-without-sidebar"
            className="inline-flex font-medium text-custom-sm py-3 px-7 sm:px-12.5 rounded-md border-gray-3 border bg-gray-1 text-dark ease-out duration-200 hover:bg-dark hover:text-white hover:border-transparent"
          >
            Xem Tất Cả
          </Link>
        </div>
      </div>
    </section>
  );
};

export default BestSeller;
