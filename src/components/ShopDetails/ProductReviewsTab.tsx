"use client";

import React, { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import toast from "react-hot-toast";
import {
  fetchProductReviews,
  fetchReviewById,
  fetchReviewEligibility,
  fetchReviewSummary,
  markReviewHelpful,
  submitReview,
  updateReview,
  type PublicReview,
  type ReviewEligibility,
  type ReviewSummary,
} from "@/utils/reviewApi";

function StarRating({
  rating,
  interactive,
  onChange,
}: {
  rating: number;
  interactive?: boolean;
  onChange?: (n: number) => void;
}) {
  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: 5 }).map((_, i) => {
        const filled = i < rating;
        return (
          <button
            key={i}
            type="button"
            disabled={!interactive}
            onClick={() => interactive && onChange?.(i + 1)}
            className={interactive ? "cursor-pointer" : "cursor-default"}
            aria-label={`${i + 1} sao`}
          >
            <Image
              src="/images/icons/icon-star.svg"
              alt=""
              width={15}
              height={15}
              className={filled ? "opacity-100" : "opacity-25"}
            />
          </button>
        );
      })}
    </div>
  );
}

function formatReviewDate(iso?: string) {
  if (!iso) return "";
  try {
    return new Date(iso).toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
  } catch {
    return iso;
  }
}

type FormMode = "create" | "edit" | "hidden";

export default function ProductReviewsTab({
  productId,
  isAuthenticated,
}: {
  productId: number;
  isAuthenticated: boolean;
}) {
  const [summary, setSummary] = useState<ReviewSummary | null>(null);
  const [reviews, setReviews] = useState<PublicReview[]>([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [helpfulLoadingId, setHelpfulLoadingId] = useState<number | null>(null);

  const [eligibility, setEligibility] = useState<ReviewEligibility | null>(null);
  const [eligibilityLoading, setEligibilityLoading] = useState(false);
  const [formMode, setFormMode] = useState<FormMode>("hidden");
  const [editReviewId, setEditReviewId] = useState<number | null>(null);

  const [rating, setRating] = useState(5);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [pros, setPros] = useState("");
  const [cons, setCons] = useState("");

  const loadReviews = useCallback(async () => {
    if (!productId) return;
    setLoading(true);
    try {
      const [sum, pageData] = await Promise.all([
        fetchReviewSummary(productId),
        fetchProductReviews(productId, page, 5),
      ]);
      setSummary(sum);
      if (pageData) {
        setReviews(pageData.content ?? []);
        setTotalPages(pageData.totalPages ?? 0);
      } else {
        setReviews([]);
        setTotalPages(0);
      }
    } finally {
      setLoading(false);
    }
  }, [productId, page]);

  const loadEligibility = useCallback(async () => {
    if (!productId || !isAuthenticated) {
      setEligibility(null);
      setFormMode("hidden");
      return;
    }
    setEligibilityLoading(true);
    try {
      const data = await fetchReviewEligibility(productId);
      setEligibility(data);
      if (!data) {
        setFormMode("create");
        return;
      }
      if (data.alreadyReviewed && data.existingReviewId) {
        setFormMode("edit");
        setEditReviewId(data.existingReviewId);
        const existing = await fetchReviewById(data.existingReviewId);
        if (existing) {
          setRating(existing.rating);
          setTitle(existing.title ?? "");
          setContent(existing.content ?? "");
          setPros(existing.pros ?? "");
          setCons(existing.cons ?? "");
        }
      } else if (data.canReview) {
        setFormMode("create");
        setEditReviewId(null);
        setRating(5);
        setTitle("");
        setContent("");
        setPros("");
        setCons("");
      } else {
        setFormMode("hidden");
      }
    } finally {
      setEligibilityLoading(false);
    }
  }, [productId, isAuthenticated]);

  useEffect(() => {
    void loadReviews();
  }, [loadReviews]);

  useEffect(() => {
    void loadEligibility();
  }, [loadEligibility]);

  const resetForm = () => {
    setRating(5);
    setTitle("");
    setContent("");
    setPros("");
    setCons("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated) {
      toast.error("Vui lòng đăng nhập để đánh giá");
      return;
    }
    if (!content.trim() && !title.trim()) {
      toast.error("Vui lòng nhập tiêu đề hoặc nội dung đánh giá");
      return;
    }
    setSubmitting(true);
    try {
      const payload = {
        rating,
        title: title.trim() || undefined,
        content: content.trim() || undefined,
        pros: pros.trim() || undefined,
        cons: cons.trim() || undefined,
      };

      if (formMode === "edit" && editReviewId) {
        const result = await updateReview(editReviewId, payload);
        if (result.ok) {
          toast.success(result.message || "Đã cập nhật — chờ duyệt lại");
          await Promise.all([loadReviews(), loadEligibility()]);
        } else {
          toast.error(result.message || "Cập nhật thất bại");
        }
      } else {
        const result = await submitReview({
          productId,
          ...payload,
          variantId: eligibility?.eligibleVariantId,
          orderId: eligibility?.eligibleOrderId,
        });
        if (result.ok) {
          toast.success(result.message || "Đã gửi đánh giá — chờ duyệt");
          resetForm();
          setPage(0);
          await Promise.all([loadReviews(), loadEligibility()]);
        } else {
          toast.error(result.message || "Gửi đánh giá thất bại");
        }
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleHelpful = async (reviewId: number) => {
    setHelpfulLoadingId(reviewId);
    try {
      const result = await markReviewHelpful(reviewId);
      if (result.ok && result.review) {
        setReviews((prev) =>
          prev.map((r) => (r.id === reviewId ? result.review! : r))
        );
        toast.success("Cảm ơn phản hồi của bạn!");
      } else {
        toast.error(result.message || "Không thể đánh dấu hữu ích");
      }
    } finally {
      setHelpfulLoadingId(null);
    }
  };

  const avg = summary?.averageRating ?? 0;
  const total = summary?.totalReviews ?? 0;
  const dist = summary?.ratingDistribution ?? {};

  const renderFormMessage = () => {
    if (!isAuthenticated) {
      return (
        <p className="mb-6 text-sm text-gray-500">
          <Link href="/signin" className="text-blue hover:underline">
            Đăng nhập
          </Link>{" "}
          để gửi đánh giá sản phẩm.
        </p>
      );
    }
    if (eligibilityLoading) {
      return (
        <p className="mb-6 text-sm text-gray-500">Đang kiểm tra quyền đánh giá...</p>
      );
    }
    if (formMode === "edit") {
      return (
        <p className="mb-6 text-sm text-amber-700 bg-amber-50 px-3 py-2 rounded-md">
          Bạn đã đánh giá sản phẩm này. Chỉnh sửa bên dưới — sau khi sửa sẽ chờ duyệt lại.
          {" "}
          <Link href="/my-account?tab=reviews" className="text-blue hover:underline">
            Xem tất cả đánh giá
          </Link>
        </p>
      );
    }
    if (formMode === "create") {
      return (
        <p className="mb-6 text-sm text-gray-500">
          {eligibility?.isVerifiedEligible
            ? "Đơn hàng đã giao — đánh giá được gắn nhãn mua hàng xác thực."
            : "Đánh giá sẽ hiển thị sau khi được duyệt."}
        </p>
      );
    }
    return (
      <p className="mb-6 text-sm text-gray-500">
        Bạn không thể đánh giá sản phẩm này lúc này.
      </p>
    );
  };

  const showForm = isAuthenticated && (formMode === "create" || formMode === "edit");

  return (
    <div className="flex-col sm:flex-row gap-7.5 xl:gap-12.5 mt-12.5 flex">
      <div className="max-w-[570px] w-full">
        <div className="flex flex-wrap items-end justify-between gap-4 mb-9">
          <h2 className="font-medium text-2xl text-dark">
            {total > 0 ? `${total} đánh giá` : "Chưa có đánh giá"}
          </h2>
          {total > 0 && (
            <div className="flex items-center gap-2">
              <StarRating rating={Math.round(avg)} />
              <span className="text-dark font-semibold">{avg.toFixed(1)}/5</span>
            </div>
          )}
        </div>

        {total > 0 && (
          <div className="mb-8 space-y-2">
            {[5, 4, 3, 2, 1].map((star) => {
              const count = dist[star] ?? 0;
              const pct = total > 0 ? Math.round((count / total) * 100) : 0;
              return (
                <div key={star} className="flex items-center gap-3 text-sm">
                  <span className="w-12 text-dark">{star} sao</span>
                  <div className="flex-1 h-2 bg-gray-2 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#FBB040] rounded-full"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <span className="w-10 text-right text-gray-500">{count}</span>
                </div>
              );
            })}
          </div>
        )}

        {loading ? (
          <div className="flex justify-center py-10">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue" />
          </div>
        ) : reviews.length === 0 ? (
          <p className="text-sm text-gray-500 py-6">
            Chưa có đánh giá nào được duyệt cho sản phẩm này.
          </p>
        ) : (
          <div className="flex flex-col gap-6">
            {reviews.map((review) => {
              const authorName =
                review.user?.name || review.user?.username || "Khách hàng";
              return (
                <div
                  key={review.id}
                  className="rounded-xl bg-white shadow-1 p-4 sm:p-6"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="w-12.5 h-12.5 rounded-full bg-blue/10 flex items-center justify-center text-blue font-semibold">
                        {authorName.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h3 className="font-medium text-dark">{authorName}</h3>
                        <p className="text-custom-sm text-gray-500">
                          {formatReviewDate(review.createdAt)}
                          {review.isVerifiedPurchase && (
                            <span className="ml-2 text-green">· Đã mua hàng</span>
                          )}
                        </p>
                      </div>
                    </div>
                    <StarRating rating={review.rating} />
                  </div>
                  {review.title && (
                    <p className="font-medium text-dark mt-4">{review.title}</p>
                  )}
                  {review.content && (
                    <p className="text-dark mt-2">{review.content}</p>
                  )}
                  {(review.pros || review.cons) && (
                    <div className="mt-2 text-sm text-gray-500">
                      {review.pros && <p>Ưu: {review.pros}</p>}
                      {review.cons && <p>Nhược: {review.cons}</p>}
                    </div>
                  )}
                  {review.replyContent && (
                    <div className="mt-4 pl-4 border-l-2 border-blue bg-blue/5 p-3 rounded-r-md">
                      <p className="text-xs font-medium text-blue mb-1">
                        Phản hồi cửa hàng
                      </p>
                      <p className="text-sm text-dark">{review.replyContent}</p>
                    </div>
                  )}
                  <div className="mt-4 flex items-center gap-3">
                    <button
                      type="button"
                      disabled={helpfulLoadingId === review.id}
                      onClick={() => void handleHelpful(review.id)}
                      className="text-xs text-gray-500 hover:text-blue disabled:opacity-50"
                    >
                      {helpfulLoadingId === review.id
                        ? "Đang gửi..."
                        : `Hữu ích (${review.helpfulCount ?? 0})`}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {totalPages > 1 && (
          <div className="flex gap-2 mt-6">
            <button
              type="button"
              disabled={page <= 0}
              onClick={() => setPage((p) => p - 1)}
              className="px-4 py-2 text-sm border border-gray-3 rounded-md disabled:opacity-40"
            >
              Trước
            </button>
            <span className="px-3 py-2 text-sm text-gray-500">
              {page + 1} / {totalPages}
            </span>
            <button
              type="button"
              disabled={page >= totalPages - 1}
              onClick={() => setPage((p) => p + 1)}
              className="px-4 py-2 text-sm border border-gray-3 rounded-md disabled:opacity-40"
            >
              Sau
            </button>
          </div>
        )}
      </div>

      <div className="max-w-[550px] w-full">
        <form onSubmit={(e) => void handleSubmit(e)}>
          <h2 className="font-medium text-2xl text-dark mb-3.5">
            {formMode === "edit" ? "Chỉnh sửa đánh giá" : "Viết đánh giá"}
          </h2>

          {renderFormMessage()}

          {showForm && (
            <>
              <div className="flex items-center gap-3 mb-7.5">
                <span className="text-sm">Đánh giá của bạn*</span>
                <StarRating rating={rating} interactive onChange={setRating} />
              </div>

              <div className="rounded-xl bg-white shadow-1 p-4 sm:p-6 space-y-5">
                <div>
                  <label htmlFor="review-title" className="block mb-2.5 text-sm">
                    Tiêu đề
                  </label>
                  <input
                    id="review-title"
                    type="text"
                    value={title}
                    disabled={submitting}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Tóm tắt trải nghiệm"
                    className="rounded-md border border-gray-3 bg-gray-1 placeholder:text-dark-5 w-full py-2.5 px-5 outline-none focus:border-blue disabled:opacity-50"
                  />
                </div>
                <div>
                  <label htmlFor="review-content" className="block mb-2.5 text-sm">
                    Nội dung*
                  </label>
                  <textarea
                    id="review-content"
                    rows={5}
                    value={content}
                    disabled={submitting}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Chia sẻ trải nghiệm của bạn..."
                    className="rounded-md border border-gray-3 bg-gray-1 placeholder:text-dark-5 w-full p-5 outline-none focus:border-blue disabled:opacity-50"
                  />
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="review-pros" className="block mb-2.5 text-sm">
                      Ưu điểm
                    </label>
                    <input
                      id="review-pros"
                      type="text"
                      value={pros}
                      disabled={submitting}
                      onChange={(e) => setPros(e.target.value)}
                      placeholder="Tùy chọn"
                      className="rounded-md border border-gray-3 bg-gray-1 w-full py-2.5 px-5 outline-none focus:border-blue disabled:opacity-50"
                    />
                  </div>
                  <div>
                    <label htmlFor="review-cons" className="block mb-2.5 text-sm">
                      Nhược điểm
                    </label>
                    <input
                      id="review-cons"
                      type="text"
                      value={cons}
                      disabled={submitting}
                      onChange={(e) => setCons(e.target.value)}
                      placeholder="Tùy chọn"
                      className="rounded-md border border-gray-3 bg-gray-1 w-full py-2.5 px-5 outline-none focus:border-blue disabled:opacity-50"
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex font-medium text-white bg-blue py-3 px-7.5 rounded-md hover:bg-blue-dark disabled:opacity-50"
                >
                  {submitting
                    ? "Đang gửi..."
                    : formMode === "edit"
                      ? "Cập nhật đánh giá"
                      : "Gửi đánh giá"}
                </button>
              </div>
            </>
          )}
        </form>
      </div>
    </div>
  );
}
