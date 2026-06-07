"use client";
import React from "react";
import { AppDispatch } from "@/redux/store";
import { useDispatch } from "react-redux";
import { removeByWishlistId } from "@/redux/features/wishlist-slice";
import { addItemToCart } from "@/redux/features/cart-slice";
import { WishListItem } from "@/redux/features/wishlist-slice";
import Image from "next/image";
import Link from "next/link";
import toast from "react-hot-toast";
import { resolveBackendImageUrl } from "@/utils/productMapper";

const SingleItem = ({ item }: { item: WishListItem }) => {
  const dispatch = useDispatch<AppDispatch>();

  const productName = item.product?.name || "Sản phẩm";
  const productPrice = item.product?.price || 0;
  const productImage =
    resolveBackendImageUrl(item.product?.images?.[0]?.linkImage) ||
    "/images/no-image.png";
  const variantName = item.variant?.name || "";
  const createdAt = item.createdAt
    ? new Date(item.createdAt).toLocaleDateString("vi-VN", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      })
    : "";

  const handleRemoveFromWishlist = async () => {
    try {
      await dispatch(removeByWishlistId(item.id)).unwrap();
      toast.success("Đã xóa khỏi danh sách yêu thích");
    } catch (err: any) {
      toast.error(err || "Có lỗi xảy ra");
    }
  };

  const handleAddToCart = () => {
    dispatch(
      addItemToCart({
        id: item.product?.id,
        title: productName,
        price: productPrice,
        discountedPrice: item.product?.discountedPrice || productPrice,
        quantity: 1,
        imgs: {
          thumbnails: [productImage],
          previews: [productImage],
        },
      })
    );
    toast.success("Đã thêm vào giỏ hàng!");
  };

  return (
    <div className="flex items-center border-t border-gray-3 py-5 px-10">
      {/* Remove button */}
      <div className="min-w-[83px]">
        <button
          onClick={handleRemoveFromWishlist}
          aria-label="Xóa sản phẩm khỏi danh sách yêu thích"
          className="flex items-center justify-center rounded-lg max-w-[38px] w-full h-9.5 bg-gray-2 border border-gray-3 ease-out duration-200 hover:bg-red-light-6 hover:border-red-light-4 hover:text-red"
        >
          <svg
            className="fill-current"
            width="22"
            height="22"
            viewBox="0 0 22 22"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M9.19509 8.22222C8.92661 7.95374 8.49131 7.95374 8.22282 8.22222C7.95433 8.49071 7.95433 8.92601 8.22282 9.1945L10.0284 11L8.22284 12.8056C7.95435 13.074 7.95435 13.5093 8.22284 13.7778C8.49133 14.0463 8.92663 14.0463 9.19511 13.7778L11.0006 11.9723L12.8061 13.7778C13.0746 14.0463 13.5099 14.0463 13.7784 13.7778C14.0469 13.5093 14.0469 13.074 13.7784 12.8055L11.9729 11L13.7784 9.19451C14.0469 8.92603 14.0469 8.49073 13.7784 8.22224C13.5099 7.95376 13.0746 7.95376 12.8062 8.22224L11.0006 10.0278L9.19509 8.22222Z"
              fill=""
            />
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M11.0007 1.14587C5.55835 1.14587 1.14648 5.55773 1.14648 11C1.14648 16.4423 5.55835 20.8542 11.0007 20.8542C16.443 20.8542 20.8548 16.4423 20.8548 11C20.8548 5.55773 16.443 1.14587 11.0007 1.14587ZM2.52148 11C2.52148 6.31713 6.31774 2.52087 11.0007 2.52087C15.6836 2.52087 19.4798 6.31713 19.4798 11C19.4798 15.683 15.6836 19.4792 11.0007 19.4792C6.31774 19.4792 2.52148 15.683 2.52148 11Z"
              fill=""
            />
          </svg>
        </button>
      </div>

      {/* Product info */}
      <div className="min-w-[387px]">
        <div className="flex items-center gap-5.5">
          <div className="flex items-center justify-center rounded-[5px] bg-gray-2 max-w-[80px] w-full h-17.5 overflow-hidden">
            <Image
              src={productImage}
              alt={productName}
              width={80}
              height={70}
              className="object-cover"
            />
          </div>
          <div>
            <h3 className="text-dark ease-out duration-200 hover:text-blue">
              <Link
                href={
                  item.product?.id
                    ? `/shop-details/${item.product.id}`
                    : "/shop-without-sidebar"
                }
              >
                {productName}
              </Link>
            </h3>
            {variantName && (
              <p className="text-sm text-gray-500 mt-1">{variantName}</p>
            )}
          </div>
        </div>
      </div>

      {/* Price */}
      <div className="min-w-[205px]">
        <p className="text-dark font-medium">
          {productPrice.toLocaleString("vi-VN")}₫
        </p>
      </div>

      {/* Date added */}
      <div className="min-w-[265px]">
        <p className="text-dark-4">{createdAt}</p>
      </div>

      {/* Action */}
      <div className="min-w-[150px] flex justify-end">
        <button
          onClick={handleAddToCart}
          className="inline-flex text-dark hover:text-white bg-gray-1 border border-gray-3 py-2.5 px-6 rounded-md ease-out duration-200 hover:bg-blue hover:border-blue"
        >
          Thêm vào giỏ
        </button>
      </div>
    </div>
  );
};

export default SingleItem;
