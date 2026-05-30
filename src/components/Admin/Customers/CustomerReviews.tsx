"use client";
import { useState } from "react";

interface Review {
  id: number;
  customerName: string;
  avatarBg: string;
  avatarInitials: string;
  rating: number;
  productName: string;
  comment: string;
  productImage: string; // emoji placeholder for product category
  status: "pending" | "approved" | "hidden";
}

const reviewsData: Review[] = [
  {
    id: 1,
    customerName: "Trần Minh Quân",
    avatarBg: "from-[#F27430] to-[#F59E0B]",
    avatarInitials: "TQ",
    rating: 5,
    productName: "MacBook Pro M3",
    comment:
      '"Máy dùng rất mượt, đóng gói cẩn thận. Nhân viên tư vấn nhiệt tình, giao hàng nhanh hơn dự kiến."',
    productImage: "💻",
    status: "pending",
  },
  {
    id: 2,
    customerName: "Hoàng Thu Thủy",
    avatarBg: "from-[#02AAA4] to-[#22AD5C]",
    avatarInitials: "HT",
    rating: 3,
    productName: "iPhone 15 Pro",
    comment:
      '"Màu Titan tự nhiên đẹp tuyệt vời. Tuy nhiên giá hơi cao so với các bên khác. Shop nên có thêm khuyến mãi."',
    productImage: "📱",
    status: "pending",
  },
  {
    id: 3,
    customerName: "Nguyễn Văn Bình",
    avatarBg: "from-[#3C50E0] to-[#5475E5]",
    avatarInitials: "NB",
    rating: 4,
    productName: "iPad Air M2",
    comment:
      '"Sản phẩm chính hãng, full box. Màn hình hiển thị rất đẹp, rất hài lòng với trải nghiệm mua hàng."',
    productImage: "📱",
    status: "approved",
  },
];

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <svg
          key={star}
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M8 1.33334L10.06 5.50667L14.6667 6.18001L11.3333 9.42667L12.12 14.0133L8 11.8467L3.88 14.0133L4.66667 9.42667L1.33333 6.18001L5.94 5.50667L8 1.33334Z"
            fill={star <= rating ? "#FBBF24" : "#E5E7EB"}
            stroke={star <= rating ? "#FBBF24" : "#E5E7EB"}
            strokeWidth="1"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      ))}
    </div>
  );
}

export default function CustomerReviews() {
  const [reviews, setReviews] = useState<Review[]>(reviewsData);
  const [replyTexts, setReplyTexts] = useState<Record<number, string>>({});

  const handleApprove = (id: number) => {
    setReviews(
      reviews.map((r) => (r.id === id ? { ...r, status: "approved" as const } : r))
    );
  };

  const handleHide = (id: number) => {
    setReviews(
      reviews.map((r) => (r.id === id ? { ...r, status: "hidden" as const } : r))
    );
  };

  const handleReplyChange = (id: number, text: string) => {
    setReplyTexts({ ...replyTexts, [id]: text });
  };

  const handleSendReply = (id: number) => {
    if (replyTexts[id]?.trim()) {
      // In real app, send to API
      setReplyTexts({ ...replyTexts, [id]: "" });
    }
  };

  return (
    <div>
      {/* Header */}
      <h3 className="text-lg font-bold text-dark mb-5">
        Đánh giá từ khách hàng
      </h3>

      {/* Review Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {reviews.map((review) => (
          <div
            key={review.id}
            className="bg-white rounded-xl border border-gray-3/50 overflow-hidden hover:shadow-2 transition-all duration-300 flex flex-col"
          >
            {/* Card Header */}
            <div className="p-5 pb-3">
              <div className="flex items-start gap-3 mb-3">
                {/* Avatar */}
                <div
                  className={`w-11 h-11 rounded-full bg-gradient-to-br ${review.avatarBg} flex items-center justify-center text-white text-sm font-bold flex-shrink-0 ring-2 ring-white shadow-1`}
                >
                  {review.avatarInitials}
                </div>

                {/* Name & Product */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-dark leading-snug">
                    {review.customerName}
                  </p>
                  <p className="text-xs text-[#8D93A5] mt-0.5">
                    <span className="text-[#3C50E0] font-medium">Sản phẩm:</span>{" "}
                    {review.productName}
                  </p>
                </div>

                {/* Stars */}
                <StarRating rating={review.rating} />
              </div>

              {/* Comment */}
              <p className="text-sm text-[#6C6F93] leading-relaxed italic">
                {review.comment}
              </p>
            </div>

            {/* Product Image Placeholder */}
            <div className="mx-5 mb-4 h-[140px] rounded-xl bg-gradient-to-br from-gray-1 to-gray-2 flex items-center justify-center text-5xl">
              {review.productImage}
            </div>

            {/* Action Buttons */}
            <div className="px-5 pb-3">
              <div className="flex gap-2">
                {review.status === "pending" ? (
                  <>
                    <button
                      onClick={() => handleApprove(review.id)}
                      className="flex-1 py-2 rounded-lg text-sm font-semibold bg-green text-white hover:bg-green-dark transition-colors"
                    >
                      Duyệt
                    </button>
                    <button
                      onClick={() => handleHide(review.id)}
                      className="flex-1 py-2 rounded-lg text-sm font-medium text-[#6C6F93] border border-gray-3 hover:bg-gray-1 transition-all"
                    >
                      Ẩn
                    </button>
                  </>
                ) : review.status === "approved" ? (
                  <div className="flex items-center gap-2 w-full">
                    <span className="flex items-center gap-1.5 text-xs font-medium text-green">
                      <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M11.6667 3.5L5.25 9.91667L2.33333 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      Đã duyệt
                    </span>
                    <button
                      onClick={() => handleHide(review.id)}
                      className="ml-auto text-xs text-[#8D93A5] hover:text-red transition-colors"
                    >
                      Ẩn đánh giá
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 w-full">
                    <span className="flex items-center gap-1.5 text-xs font-medium text-[#8D93A5]">
                      <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M1.16667 7.58333C1.16667 7.58333 2.91667 3.5 7 3.5C11.0833 3.5 12.8333 7.58333 12.8333 7.58333" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M1.16667 7.58333L3.5 10.5M12.8333 7.58333L10.5 10.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      Đã ẩn
                    </span>
                    <button
                      onClick={() => handleApprove(review.id)}
                      className="ml-auto text-xs text-[#3C50E0] hover:text-[#1C3FB7] transition-colors font-medium"
                    >
                      Hiển thị lại
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Reply Section */}
            <div className="px-5 pb-5 pt-2 border-t border-gray-3/50">
              <p className="text-xs font-medium text-dark mb-2">Trả lời của bạn:</p>
              <textarea
                value={replyTexts[review.id] || ""}
                onChange={(e) => handleReplyChange(review.id, e.target.value)}
                placeholder="Viết phản hồi..."
                rows={2}
                className="w-full px-3 py-2 bg-[#F7F9FC] border border-gray-3 rounded-lg text-sm text-dark placeholder:text-[#8D93A5] focus:outline-none focus:border-[#3C50E0] focus:shadow-input transition-all resize-none"
              />
              <button
                onClick={() => handleSendReply(review.id)}
                className="w-full mt-2 py-2.5 bg-[#3C50E0] text-white rounded-lg text-sm font-semibold hover:bg-[#1C3FB7] transition-colors shadow-lg shadow-[#3C50E0]/20"
              >
                Gửi phản hồi
              </button>
            </div>
          </div>
        ))}

        {/* Loading More Placeholder Card */}
        <div className="bg-white rounded-xl border-2 border-dashed border-gray-3 flex flex-col items-center justify-center p-8 min-h-[400px]">
          <div className="w-16 h-16 rounded-full bg-[#F7F9FC] flex items-center justify-center mb-4">
            <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M21 15.1667V19.8333C21 20.4522 20.7542 21.0457 20.3166 21.4833C19.879 21.9208 19.2855 22.1667 18.6667 22.1667H5.83333C5.21449 22.1667 4.621 21.9208 4.18342 21.4833C3.74583 21.0457 3.5 20.4522 3.5 19.8333V7C3.5 6.38116 3.74583 5.78767 4.18342 5.35009C4.621 4.9125 5.21449 4.66667 5.83333 4.66667H10.5" stroke="#8D93A5" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M17.5 2.33334H24.5V9.33334" stroke="#8D93A5" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M11.6667 16.3333L24.5 3.5" stroke="#8D93A5" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <p className="text-sm font-medium text-[#8D93A5] mb-1">Đang tải thêm...</p>
          <p className="text-xs text-[#BBBEC9] text-center max-w-[200px]">
            Các đánh giá mới sẽ xuất hiện ở đây sau khi được cập nhật.
          </p>
        </div>
      </div>
    </div>
  );
}
