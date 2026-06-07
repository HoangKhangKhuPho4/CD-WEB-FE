"use client";

import React, { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import toast from "react-hot-toast";
import {
  deleteReview,
  fetchMyReviews,
  fetchReviewableProducts,
  reviewStatusClass,
  reviewStatusLabel,
  updateReview,
  type PublicReview,
  type ReviewableProduct,
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

function formatDate(iso?: string) {
  if (!iso) return "—";
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

type EditForm = {
  rating: number;
  title: string;
  content: string;
  pros: string;
  cons: string;
};

export default function MyReviewsPanel() {
  const [section, setSection] = useState<"reviewable" | "my">("reviewable");

  const [reviewable, setReviewable] = useState<ReviewableProduct[]>([]);
  const [reviewableLoading, setReviewableLoading] = useState(true);

  const [myReviews, setMyReviews] = useState<PublicReview[]>([]);
  const [myPage, setMyPage] = useState(0);
  const [myTotalPages, setMyTotalPages] = useState(0);
  const [myLoading, setMyLoading] = useState(true);

  const [editId, setEditId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<EditForm>({
    rating: 5,
    title: "",
    content: "",
    pros: "",
    cons: "",
  });
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const loadReviewable = useCallback(async () => {
    setReviewableLoading(true);
    try {
      const data = await fetchReviewableProducts(0, 20);
      setReviewable(data?.content ?? []);
    } finally {
      setReviewableLoading(false);
    }
  }, []);

  const loadMyReviews = useCallback(async () => {
    setMyLoading(true);
    try {
      const data = await fetchMyReviews(myPage, 8);
      if (data) {
        setMyReviews(data.content ?? []);
        setMyTotalPages(data.totalPages ?? 0);
      } else {
        setMyReviews([]);
        setMyTotalPages(0);
      }
    } finally {
      setMyLoading(false);
    }
  }, [myPage]);

  useEffect(() => {
    void loadReviewable();
  }, [loadReviewable]);

  useEffect(() => {
    if (section === "my") {
      void loadMyReviews();
    }
  }, [section, loadMyReviews]);

  const openEdit = (review: PublicReview) => {
    setEditId(review.id);
    setEditForm({
      rating: review.rating,
      title: review.title ?? "",
      content: review.content ?? "",
      pros: review.pros ?? "",
      cons: review.cons ?? "",
    });
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editId) return;
    if (!editForm.content.trim() && !editForm.title.trim()) {
      toast.error("Vui lòng nhập tiêu đề hoặc nội dung");
      return;
    }
    setSaving(true);
    try {
      const result = await updateReview(editId, {
        rating: editForm.rating,
        title: editForm.title.trim() || undefined,
        content: editForm.content.trim() || undefined,
        pros: editForm.pros.trim() || undefined,
        cons: editForm.cons.trim() || undefined,
      });
      if (result.ok) {
        toast.success(result.message || "Đã cập nhật — chờ duyệt lại");
        setEditId(null);
        await loadMyReviews();
      } else {
        toast.error(result.message || "Cập nhật thất bại");
      }
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Bạn có chắc muốn xóa đánh giá này?")) return;
    setDeletingId(id);
    try {
      const result = await deleteReview(id);
      if (result.ok) {
        toast.success("Đã xóa đánh giá");
        if (editId === id) setEditId(null);
        await Promise.all([loadMyReviews(), loadReviewable()]);
      } else {
        toast.error(result.message || "Xóa thất bại");
      }
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="flex-1 min-w-0 w-full bg-white rounded-xl shadow-1 py-9.5 px-4 sm:px-7.5 xl:px-10">
      <h2 className="font-medium text-2xl text-dark mb-2">Đánh giá của tôi</h2>
      <p className="text-custom-sm text-gray-500 mb-6">
        Quản lý đánh giá sản phẩm — xem trạng thái duyệt, chỉnh sửa hoặc đánh giá sản phẩm đã mua.
      </p>

      <div className="flex flex-wrap gap-2 mb-8">
        <button
          type="button"
          onClick={() => setSection("reviewable")}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            section === "reviewable"
              ? "bg-blue text-white"
              : "bg-gray-1 text-dark-2 hover:bg-gray-2"
          }`}
        >
          Sản phẩm chờ đánh giá
        </button>
        <button
          type="button"
          onClick={() => setSection("my")}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            section === "my"
              ? "bg-blue text-white"
              : "bg-gray-1 text-dark-2 hover:bg-gray-2"
          }`}
        >
          Đánh giá đã gửi
        </button>
      </div>

      {section === "reviewable" && (
        <div>
          {reviewableLoading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue" />
            </div>
          ) : reviewable.length === 0 ? (
            <div className="text-center py-12 rounded-xl bg-gray-1">
              <p className="text-dark font-medium">Không có sản phẩm chờ đánh giá</p>
              <p className="text-sm text-gray-500 mt-2">
                Bạn sẽ thấy sản phẩm tại đây sau khi đơn hàng được giao thành công.
              </p>
              <p className="text-sm text-gray-500 mt-4">
                Kiểm tra mục <strong>Đơn Hàng</strong> bên menu để theo dõi trạng thái giao hàng.
              </p>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {reviewable.map((item) => (
                <div
                  key={`${item.orderId}-${item.productId}`}
                  className="flex gap-4 p-4 rounded-xl border border-gray-3 bg-gray-1/50"
                >
                  <div className="w-20 h-20 shrink-0 rounded-lg overflow-hidden bg-white">
                    {item.imageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={item.imageUrl}
                        alt={item.productName}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
                        No img
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-dark text-sm line-clamp-2">
                      {item.productName}
                    </p>
                    {item.variantName && (
                      <p className="text-xs text-gray-500 mt-0.5">{item.variantName}</p>
                    )}
                    <p className="text-xs text-gray-500 mt-1">
                      Giao: {formatDate(item.deliveredAt)}
                    </p>
                    <Link
                      href={`/shop-details/${item.productId}?tab=reviews`}
                      className="inline-block mt-3 text-sm font-medium text-blue hover:underline"
                    >
                      Viết đánh giá →
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {section === "my" && (
        <div>
          {myLoading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue" />
            </div>
          ) : myReviews.length === 0 ? (
            <div className="text-center py-12 rounded-xl bg-gray-1">
              <p className="text-dark font-medium">Bạn chưa gửi đánh giá nào</p>
              <p className="text-sm text-gray-500 mt-2">
                Mua sắm và đánh giá sản phẩm để chia sẻ trải nghiệm.
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-5">
              {myReviews.map((review) => (
                <div
                  key={review.id}
                  className="rounded-xl border border-gray-3 p-4 sm:p-5"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <Link
                          href={`/shop-details/${review.productId}`}
                          className="font-medium text-dark hover:text-blue"
                        >
                          {review.productName || `Sản phẩm #${review.productId}`}
                        </Link>
                        <span
                          className={`text-xs px-2 py-0.5 rounded-full ${reviewStatusClass(review.isApproved)}`}
                        >
                          {reviewStatusLabel(review.isApproved)}
                        </span>
                        {review.isVerifiedPurchase && (
                          <span className="text-xs text-green">Đã mua hàng</span>
                        )}
                      </div>
                      <StarRating rating={review.rating} />
                      <p className="text-xs text-gray-500 mt-1">
                        {formatDate(review.createdAt)}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => openEdit(review)}
                        className="text-sm text-blue hover:underline"
                      >
                        Sửa
                      </button>
                      <button
                        type="button"
                        disabled={deletingId === review.id}
                        onClick={() => void handleDelete(review.id)}
                        className="text-sm text-red hover:underline disabled:opacity-50"
                      >
                        {deletingId === review.id ? "Đang xóa..." : "Xóa"}
                      </button>
                    </div>
                  </div>

                  {review.title && (
                    <p className="font-medium text-dark mt-3">{review.title}</p>
                  )}
                  {review.content && (
                    <p className="text-sm text-dark-2 mt-1">{review.content}</p>
                  )}
                  {(review.pros || review.cons) && (
                    <div className="mt-2 text-sm text-gray-500 space-y-0.5">
                      {review.pros && <p>Ưu điểm: {review.pros}</p>}
                      {review.cons && <p>Nhược điểm: {review.cons}</p>}
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

                  {editId === review.id && (
                    <form
                      onSubmit={(e) => void handleSaveEdit(e)}
                      className="mt-4 pt-4 border-t border-gray-3 space-y-4"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-sm">Số sao</span>
                        <StarRating
                          rating={editForm.rating}
                          interactive
                          onChange={(n) =>
                            setEditForm((f) => ({ ...f, rating: n }))
                          }
                        />
                      </div>
                      <input
                        type="text"
                        value={editForm.title}
                        onChange={(e) =>
                          setEditForm((f) => ({ ...f, title: e.target.value }))
                        }
                        placeholder="Tiêu đề"
                        className="w-full rounded-md border border-gray-3 bg-gray-1 py-2.5 px-4 text-sm outline-none focus:border-blue"
                      />
                      <textarea
                        rows={4}
                        value={editForm.content}
                        onChange={(e) =>
                          setEditForm((f) => ({ ...f, content: e.target.value }))
                        }
                        placeholder="Nội dung đánh giá"
                        className="w-full rounded-md border border-gray-3 bg-gray-1 p-4 text-sm outline-none focus:border-blue"
                      />
                      <div className="grid sm:grid-cols-2 gap-3">
                        <input
                          type="text"
                          value={editForm.pros}
                          onChange={(e) =>
                            setEditForm((f) => ({ ...f, pros: e.target.value }))
                          }
                          placeholder="Ưu điểm (tùy chọn)"
                          className="rounded-md border border-gray-3 bg-gray-1 py-2.5 px-4 text-sm outline-none focus:border-blue"
                        />
                        <input
                          type="text"
                          value={editForm.cons}
                          onChange={(e) =>
                            setEditForm((f) => ({ ...f, cons: e.target.value }))
                          }
                          placeholder="Nhược điểm (tùy chọn)"
                          className="rounded-md border border-gray-3 bg-gray-1 py-2.5 px-4 text-sm outline-none focus:border-blue"
                        />
                      </div>
                      <div className="flex gap-3">
                        <button
                          type="submit"
                          disabled={saving}
                          className="px-5 py-2.5 bg-blue text-white text-sm rounded-md hover:bg-blue-dark disabled:opacity-50"
                        >
                          {saving ? "Đang lưu..." : "Lưu thay đổi"}
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditId(null)}
                          className="px-5 py-2.5 border border-gray-3 text-sm rounded-md"
                        >
                          Hủy
                        </button>
                      </div>
                      <p className="text-xs text-gray-500">
                        Sau khi sửa, đánh giá sẽ chuyển về trạng thái chờ duyệt lại.
                      </p>
                    </form>
                  )}
                </div>
              ))}
            </div>
          )}

          {myTotalPages > 1 && (
            <div className="flex gap-2 mt-6 justify-center">
              <button
                type="button"
                disabled={myPage <= 0}
                onClick={() => setMyPage((p) => p - 1)}
                className="px-4 py-2 text-sm border border-gray-3 rounded-md disabled:opacity-40"
              >
                Trước
              </button>
              <span className="px-3 py-2 text-sm text-gray-500">
                {myPage + 1} / {myTotalPages}
              </span>
              <button
                type="button"
                disabled={myPage >= myTotalPages - 1}
                onClick={() => setMyPage((p) => p + 1)}
                className="px-4 py-2 text-sm border border-gray-3 rounded-md disabled:opacity-40"
              >
                Sau
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
