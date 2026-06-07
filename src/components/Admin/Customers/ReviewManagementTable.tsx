"use client";

import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { adminReviewApi, type AdminReviewStats } from "@/utils/adminApi";
import { formatDateTime } from "@/utils/adminFormat";

type ReviewStatus = "pending" | "approved" | "rejected";
type StatusFilter = "all" | "pending" | "approved";

interface ReviewItem {
  id: number;
  productName: string;
  customerName: string;
  rating: number;
  title: string;
  content: string;
  reply?: string;
  date: string;
  time: string;
  status: ReviewStatus;
  verified: boolean;
}

const statusStyles: Record<ReviewStatus, string> = {
  pending: "bg-yellow-light-2 text-yellow-dark-2",
  approved: "bg-green-light-6 text-green",
  rejected: "bg-red-light-6 text-red",
};

const statusLabels: Record<ReviewStatus, string> = {
  pending: "Chờ duyệt",
  approved: "Đã duyệt",
  rejected: "Đã ẩn",
};

function mapStatus(isApproved?: boolean | null): ReviewStatus {
  if (isApproved === true) return "approved";
  if (isApproved === false) return "rejected";
  return "pending";
}

function reviewText(title?: string, content?: string): string {
  const t = title?.trim();
  const c = content?.trim();
  if (t && c) return `${t} — ${c}`;
  return t || c || "—";
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
  const [stats, setStats] = useState<AdminReviewStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);
  const [replyId, setReplyId] = useState<number | null>(null);
  const [replyText, setReplyText] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [keyword, setKeyword] = useState("");
  const [ratingFilter, setRatingFilter] = useState<number | "">("");
  const [selected, setSelected] = useState<number[]>([]);

  const loadStats = useCallback(async () => {
    try {
      const res = await adminReviewApi.stats();
      if (res.data.success) setStats(res.data.data);
    } catch {
      /* optional */
    }
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params: Parameters<typeof adminReviewApi.list>[0] = {
        page,
        size: 10,
        keyword: keyword.trim() || undefined,
        rating: ratingFilter === "" ? undefined : ratingFilter,
      };
      if (statusFilter === "pending") params.isApproved = false;
      if (statusFilter === "approved") params.isApproved = true;

      const res = await adminReviewApi.list(params);
      if (res.data.success) {
        const pageData = res.data.data;
        setTotalPages(pageData.totalPages);
        setTotalElements(pageData.totalElements);
        setReviews(
          pageData.content.map((r) => {
            const full = r.createdAt ? formatDateTime(r.createdAt) : "—";
            const [date = "—", time = ""] = full.includes(",")
              ? full.split(",").map((s) => s.trim())
              : [full, ""];
            return {
              id: r.id,
              productName: r.productName ?? "—",
              customerName: r.user?.name ?? r.user?.username ?? "Khách",
              rating: r.rating ?? 0,
              title: r.title ?? "",
              content: reviewText(r.title, r.content),
              reply: r.replyContent,
              date,
              time,
              status: mapStatus(r.isApproved),
              verified: !!r.isVerifiedPurchase,
            };
          })
        );
        setSelected([]);
      } else {
        toast.error(res.data.message || "Không tải được đánh giá");
      }
    } catch {
      toast.error("Không tải được đánh giá");
    } finally {
      setLoading(false);
    }
  }, [page, statusFilter, keyword, ratingFilter]);

  useEffect(() => {
    void loadStats();
  }, [loadStats]);

  useEffect(() => {
    void load();
  }, [load]);

  const setApproval = async (id: number, approved: boolean) => {
    try {
      await adminReviewApi.updateStatus(id, approved);
      toast.success(approved ? "Đã duyệt đánh giá" : "Đã ẩn đánh giá");
      await load();
      await loadStats();
    } catch {
      toast.error("Cập nhật trạng thái thất bại");
    }
  };

  const bulkApprove = async (approved: boolean) => {
    if (!selected.length) return;
    try {
      await adminReviewApi.bulkStatus(selected, approved);
      toast.success(approved ? "Đã duyệt hàng loạt" : "Đã ẩn hàng loạt");
      await load();
      await loadStats();
    } catch {
      toast.error("Cập nhật hàng loạt thất bại");
    }
  };

  const submitReply = async () => {
    if (!replyId || !replyText.trim()) return;
    try {
      const existing = reviews.find((r) => r.id === replyId)?.reply;
      if (existing) {
        await adminReviewApi.updateReply(replyId, replyText.trim());
      } else {
        await adminReviewApi.reply(replyId, replyText.trim());
      }
      toast.success("Đã gửi phản hồi");
      setReplyId(null);
      setReplyText("");
      await load();
      await loadStats();
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
      await loadStats();
    } catch {
      toast.error("Xóa đánh giá thất bại");
    }
  };

  const toggleSelect = (id: number) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl border border-gray-3/50 p-4">
            <p className="text-xs text-[#8D93A5]">Tổng đánh giá</p>
            <p className="text-2xl font-bold text-dark">{stats.total}</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-3/50 p-4">
            <p className="text-xs text-[#8D93A5]">Chờ duyệt</p>
            <p className="text-2xl font-bold text-yellow-dark-2">{stats.pending}</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-3/50 p-4">
            <p className="text-xs text-[#8D93A5]">Đã duyệt</p>
            <p className="text-2xl font-bold text-green">{stats.approved}</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-3/50 p-4">
            <p className="text-xs text-[#8D93A5]">Chưa trả lời</p>
            <p className="text-2xl font-bold text-[#3C50E0]">{stats.unrepliedCount}</p>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl border border-gray-3/50 p-4 flex flex-wrap gap-3 items-end">
        <div>
          <label className="text-xs text-[#8D93A5] block mb-1">Trạng thái</label>
          <select
            value={statusFilter}
            onChange={(e) => {
              setPage(0);
              setStatusFilter(e.target.value as StatusFilter);
            }}
            className="px-3 py-2 border border-gray-3 rounded-lg text-sm"
          >
            <option value="all">Tất cả</option>
            <option value="pending">Chờ duyệt</option>
            <option value="approved">Đã duyệt</option>
          </select>
        </div>
        <div>
          <label className="text-xs text-[#8D93A5] block mb-1">Số sao</label>
          <select
            value={ratingFilter}
            onChange={(e) => {
              setPage(0);
              setRatingFilter(e.target.value === "" ? "" : Number(e.target.value));
            }}
            className="px-3 py-2 border border-gray-3 rounded-lg text-sm"
          >
            <option value="">Tất cả</option>
            {[5, 4, 3, 2, 1].map((s) => (
              <option key={s} value={s}>
                {s} sao
              </option>
            ))}
          </select>
        </div>
        <div className="flex-1 min-w-[200px]">
          <label className="text-xs text-[#8D93A5] block mb-1">Tìm kiếm</label>
          <input
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && setPage(0)}
            placeholder="Sản phẩm, khách, nội dung..."
            className="w-full px-3 py-2 border border-gray-3 rounded-lg text-sm"
          />
        </div>
        <button
          type="button"
          onClick={() => {
            setPage(0);
            void load();
          }}
          className="px-4 py-2 text-sm font-semibold text-white bg-[#3C50E0] rounded-lg"
        >
          Lọc
        </button>
        {selected.length > 0 && (
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => void bulkApprove(true)}
              className="px-3 py-2 text-xs font-medium text-green bg-green-light-6 rounded-lg"
            >
              Duyệt ({selected.length})
            </button>
            <button
              type="button"
              onClick={() => void bulkApprove(false)}
              className="px-3 py-2 text-xs font-medium text-red bg-red-light-6 rounded-lg"
            >
              Ẩn ({selected.length})
            </button>
          </div>
        )}
      </div>

      <div className="bg-white rounded-xl border border-gray-3/50 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          {loading ? (
            <p className="px-6 py-10 text-sm text-[#8D93A5]">Đang tải...</p>
          ) : reviews.length === 0 ? (
            <p className="px-6 py-10 text-sm text-[#8D93A5] text-center">
              Chưa có đánh giá phù hợp bộ lọc.
            </p>
          ) : (
            <table className="w-full min-w-[800px]">
              <thead>
                <tr className="border-b border-gray-3/50">
                  <th className="px-4 py-4 w-10" />
                  <th className="text-left px-6 py-4 text-xs font-bold text-dark tracking-wide">
                    Sản phẩm & Khách hàng
                  </th>
                  <th className="text-left px-6 py-4 text-xs font-bold text-dark tracking-wide w-[120px]">
                    Đánh giá
                  </th>
                  <th className="text-left px-6 py-4 text-xs font-bold text-dark tracking-wide">
                    Nội dung
                  </th>
                  <th className="text-left px-6 py-4 text-xs font-bold text-dark tracking-wide w-[130px]">
                    Ngày gửi
                  </th>
                  <th className="text-left px-6 py-4 text-xs font-bold text-dark tracking-wide w-[120px]">
                    Trạng thái
                  </th>
                  <th className="text-center px-6 py-4 text-xs font-bold text-dark tracking-wide w-[160px]">
                    Hành động
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-3/50">
                {reviews.map((review) => (
                  <tr key={review.id} className="hover:bg-[#F7F9FC]/50 transition-colors">
                    <td className="px-4 py-5 align-top">
                      <input
                        type="checkbox"
                        checked={selected.includes(review.id)}
                        onChange={() => toggleSelect(review.id)}
                      />
                    </td>
                    <td className="px-6 py-5 align-top">
                      <p className="text-sm font-semibold text-dark">{review.productName}</p>
                      <p className="text-xs text-[#6C6F93] mt-1">{review.customerName}</p>
                      {review.verified && (
                        <span className="inline-block mt-1 text-[10px] px-2 py-0.5 rounded bg-green-light-6 text-green">
                          Đã mua
                        </span>
                      )}
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
                      <span
                        className={`inline-block px-2.5 py-1 rounded text-xs font-medium ${statusStyles[review.status]}`}
                      >
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
