"use client";

import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { adminReviewApi } from "@/utils/adminApi";
import { formatDateTime } from "@/utils/adminFormat";

type ReviewStatus = "pending" | "approved" | "rejected";

interface ReviewItem {
  id: number;
  productName: string;
  customerName: string;
  rating: number;
  content: string;
  reply?: string;
  date: string;
  time: string;
  status: ReviewStatus;
}

const statusStyles: Record<ReviewStatus, string> = {
  pending: "bg-yellow-light-2 text-yellow-dark-2",
  approved: "bg-green-light-6 text-green",
  rejected: "bg-red-light-6 text-red",
};

const statusLabels: Record<ReviewStatus, string> = {
  pending: "Chờ duyệt",
  approved: "Đã duyệt",
  rejected: "Từ chối",
};

function mapStatus(isApproved?: boolean | null): ReviewStatus {
  if (isApproved === true) return "approved";
  if (isApproved === false) return "rejected";
  return "pending";
}

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <svg key={star} width="14" height="14" viewBox="0 0 16 16" fill="none">
          <path
            d="M8 1.33334L10.06 5.50667L14.6667 6.18001L11.3333 9.42667L12.12 14.0133L8 11.8467L3.88 14.0133L4.66667 9.42667L1.33333 6.18001L5.94 5.50667L8 1.33334Z"
            fill={star <= rating ? "#FBBF24" : "transparent"}
            stroke={star <= rating ? "#FBBF24" : "#D1D5DB"}
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      ))}
    </div>
  );
}

export default function ReviewManagementTable() {
  const [reviews, setReviews] = useState<ReviewItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);
  const [replyId, setReplyId] = useState<number | null>(null);
  const [replyText, setReplyText] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminReviewApi.list({ page, size: 10 });
      if (res.data.success) {
        const pageData = res.data.data;
        setTotalPages(pageData.totalPages);
        setTotalElements(pageData.totalElements);
        setReviews(
          pageData.content.map((r) => {
            const full = r.createdAt ? formatDateTime(r.createdAt) : "—";
            const [date = "—", time = ""] = full.includes(",") ? full.split(",").map((s) => s.trim()) : [full, ""];
            return {
              id: r.id,
              productName: r.productName ?? "—",
              customerName: r.user?.name ?? r.user?.username ?? "Khách",
              rating: r.rating ?? 0,
              content: r.content ?? "",
              reply: r.replyContent,
              date,
              time,
              status: mapStatus(r.isApproved),
            };
          })
        );
      }
    } catch {
      toast.error("Không tải được đánh giá");
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    void load();
  }, [load]);

  const setApproval = async (id: number, approved: boolean) => {
    try {
      await adminReviewApi.updateStatus(id, approved);
      toast.success(approved ? "Đã duyệt đánh giá" : "Đã ẩn đánh giá");
      await load();
    } catch {
      toast.error("Cập nhật trạng thái thất bại");
    }
  };

  const submitReply = async () => {
    if (!replyId || !replyText.trim()) return;
    try {
      await adminReviewApi.reply(replyId, replyText.trim());
      toast.success("Đã gửi phản hồi");
      setReplyId(null);
      setReplyText("");
      await load();
    } catch {
      toast.error("Gửi phản hồi thất bại");
    }
  };

  const removeReview = async (id: number) => {
    if (!window.confirm("Xóa vĩnh viễn đánh giá này?")) return;
    try {
      await adminReviewApi.remove(id);
      toast.success("Đã xóa đánh giá");
      await load();
    } catch {
      toast.error("Xóa đánh giá thất bại");
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-dark">Quản lý đánh giá</h1>
          <p className="text-sm text-[#6C6F93] mt-1">Kiểm duyệt và phản hồi đánh giá của khách hàng</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-3/50 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          {loading ? (
            <p className="px-6 py-10 text-sm text-[#8D93A5]">Đang tải...</p>
          ) : (
            <table className="w-full min-w-[800px]">
              <thead>
                <tr className="border-b border-gray-3/50">
                  <th className="text-left px-6 py-4 text-xs font-bold text-dark tracking-wide">Sản phẩm & Khách hàng</th>
                  <th className="text-left px-6 py-4 text-xs font-bold text-dark tracking-wide w-[120px]">Đánh giá</th>
                  <th className="text-left px-6 py-4 text-xs font-bold text-dark tracking-wide">Nội dung</th>
                  <th className="text-left px-6 py-4 text-xs font-bold text-dark tracking-wide w-[130px]">Ngày gửi</th>
                  <th className="text-left px-6 py-4 text-xs font-bold text-dark tracking-wide w-[120px]">Trạng thái</th>
                  <th className="text-center px-6 py-4 text-xs font-bold text-dark tracking-wide w-[160px]">Hành động</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-3/50">
                {reviews.map((review) => (
                  <tr key={review.id} className="hover:bg-[#F7F9FC]/50 transition-colors">
                    <td className="px-6 py-5 align-top">
                      <p className="text-sm font-semibold text-dark">{review.productName}</p>
                      <p className="text-xs text-[#6C6F93] mt-1">{review.customerName}</p>
                    </td>
                    <td className="px-6 py-5 align-top">
                      <StarRating rating={review.rating} />
                    </td>
                    <td className="px-6 py-5 align-top max-w-[300px]">
                      <p className="text-sm text-dark mb-2">{review.content}</p>
                      {review.reply && (
                        <div className="bg-[#F7F9FC] border-l-2 border-[#3C50E0] p-3 rounded-r-lg text-[13px] text-[#6C6F93]">
                          {review.reply}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-5 align-top">
                      <p className="text-sm text-dark">{review.date}</p>
                      <p className="text-xs text-[#8D93A5]">{review.time}</p>
                    </td>
                    <td className="px-6 py-5 align-top">
                      <span className={`inline-block px-2.5 py-1 rounded text-xs font-medium ${statusStyles[review.status]}`}>
                        {statusLabels[review.status]}
                      </span>
                    </td>
                    <td className="px-6 py-5 align-top">
                      <div className="flex items-center justify-center gap-1 flex-wrap">
                        {review.status !== "approved" && (
                          <button
                            type="button"
                            onClick={() => void setApproval(review.id, true)}
                            className="px-2 py-1 text-xs font-medium text-green bg-green-light-6 rounded"
                          >
                            Duyệt
                          </button>
                        )}
                        {review.status !== "rejected" && (
                          <button
                            type="button"
                            onClick={() => void setApproval(review.id, false)}
                            className="px-2 py-1 text-xs font-medium text-red bg-red-light-6 rounded"
                          >
                            Ẩn
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => {
                            setReplyId(review.id);
                            setReplyText(review.reply ?? "");
                          }}
                          className="px-2 py-1 text-xs font-medium text-[#3C50E0] bg-[#3C50E0]/10 rounded"
                        >
                          Trả lời
                        </button>
                        <button
                          type="button"
                          onClick={() => void removeReview(review.id)}
                          className="px-2 py-1 text-xs text-[#8D93A5] hover:text-red"
                        >
                          Xóa
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between p-6 border-t border-gray-3/50 gap-3">
          <p className="text-sm text-[#8D93A5]">
            Tổng <span className="font-semibold text-dark">{totalElements}</span> đánh giá
          </p>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              disabled={page === 0}
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              className="w-8 h-8 flex items-center justify-center rounded border border-gray-3 disabled:opacity-40"
            >
              ‹
            </button>
            <span className="text-sm text-dark px-2">
              {page + 1} / {Math.max(1, totalPages)}
            </span>
            <button
              type="button"
              disabled={page + 1 >= totalPages}
              onClick={() => setPage((p) => p + 1)}
              className="w-8 h-8 flex items-center justify-center rounded border border-gray-3 disabled:opacity-40"
            >
              ›
            </button>
          </div>
        </div>
      </div>

      {replyId !== null && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center">
          <div className="absolute inset-0 bg-dark/40" onClick={() => setReplyId(null)} />
          <div className="relative bg-white rounded-2xl shadow-3 w-full max-w-md mx-4 p-6">
            <h3 className="text-lg font-bold text-dark mb-3">Phản hồi khách hàng</h3>
            <textarea
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              rows={4}
              className="w-full px-3 py-2 border border-gray-3 rounded-lg text-sm"
              placeholder="Nhập nội dung phản hồi..."
            />
            <div className="flex justify-end gap-2 mt-4">
              <button type="button" onClick={() => setReplyId(null)} className="px-4 py-2 text-sm text-[#6C6F93]">
                Hủy
              </button>
              <button
                type="button"
                onClick={() => void submitReply()}
                className="px-4 py-2 text-sm font-semibold text-white bg-[#3C50E0] rounded-lg"
              >
                Gửi
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
