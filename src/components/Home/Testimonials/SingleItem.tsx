import React from "react";
import Image from "next/image";
import Link from "next/link";
import type { PublicReview } from "@/utils/reviewApi";

const SingleItem = ({ review }: { review: PublicReview }) => {
  const text = review.content || review.title || "Khách hàng hài lòng với sản phẩm.";
  const authorName = review.user?.name || review.user?.username || "Khách hàng";
  const rating = Math.min(5, Math.max(1, review.rating ?? 5));

  return (
    <div className="shadow-testimonial bg-white rounded-[10px] py-7.5 px-4 sm:px-8.5 m-1 h-full flex flex-col">
      <div className="flex items-center gap-1 mb-5">
        {Array.from({ length: 5 }).map((_, i) => (
          <Image
            key={i}
            src="/images/icons/icon-star.svg"
            alt=""
            width={15}
            height={15}
            className={i < rating ? "opacity-100" : "opacity-25"}
          />
        ))}
      </div>

      <p className="text-dark mb-4 flex-1 line-clamp-4">{text}</p>

      <div className="flex items-center gap-4 mt-auto">
        <div className="w-12.5 h-12.5 rounded-full overflow-hidden bg-blue/10 flex items-center justify-center text-blue font-semibold">
          {authorName.charAt(0).toUpperCase()}
        </div>
        <div>
          <h3 className="font-medium text-dark">{authorName}</h3>
          {review.productName && (
            <Link
              href={`/shop-details/${review.productId}`}
              className="text-custom-sm text-blue hover:underline line-clamp-1"
            >
              {review.productName}
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};

export default SingleItem;
