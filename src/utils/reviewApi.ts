import api, { type PageResponse } from "./api";
import type { ApiResponse } from "@/types/api";

export type PublicReview = {
  id: number;
  productId?: number;
  productName?: string;
  variantId?: number;
  variantName?: string;
  orderId?: number;
  rating: number;
  title?: string;
  content?: string;
  pros?: string;
  cons?: string;
  isVerifiedPurchase?: boolean;
  isApproved?: boolean;
  helpfulCount?: number;
  createdAt?: string;
  updatedAt?: string;
  replyContent?: string;
  repliedAt?: string;
  images?: string[];
  user?: {
    id?: number;
    username?: string;
    name?: string;
  };
};

export type ReviewSummary = {
  productId: number;
  averageRating: number;
  totalReviews: number;
  ratingDistribution?: Record<number, number>;
};

export type ReviewEligibility = {
  productId: number;
  canReview: boolean;
  alreadyReviewed: boolean;
  existingReviewId?: number;
  isVerifiedEligible?: boolean;
  eligibleOrderId?: number;
  eligibleVariantId?: number;
  reason?: string;
};

export type ReviewableProduct = {
  orderId: number;
  productId: number;
  productName: string;
  variantId?: number;
  variantName?: string;
  imageUrl?: string;
  deliveredAt?: string;
};

export type CreateReviewPayload = {
  productId: number;
  variantId?: number;
  orderId?: number;
  rating: number;
  title?: string;
  content?: string;
  pros?: string;
  cons?: string;
  images?: string[];
};

export type UpdateReviewPayload = {
  rating: number;
  title?: string;
  content?: string;
  pros?: string;
  cons?: string;
  images?: string[];
};

function extractError(err: unknown, fallback: string): string {
  return (
    (err as { response?: { data?: { message?: string } } })?.response?.data
      ?.message || fallback
  );
}

export async function fetchRecentReviews(size = 8): Promise<PublicReview[]> {
  try {
    const res = await api.get<ApiResponse<PublicReview[]>>("/reviews/recent", {
      params: { size },
    });
    if (res.data?.success && res.data.data) {
      return res.data.data;
    }
  } catch {
    /* ignore */
  }
  return [];
}

export async function fetchProductReviews(
  productId: number,
  page = 0,
  size = 10,
  rating?: number
): Promise<PageResponse<PublicReview> | null> {
  try {
    const res = await api.get<ApiResponse<PageResponse<PublicReview>>>("/reviews", {
      params: {
        product_id: productId,
        page,
        size,
        sort: "createdAt",
        direction: "desc",
        ...(rating != null ? { rating } : {}),
      },
    });
    if (res.data?.success && res.data.data) {
      return res.data.data;
    }
  } catch {
    /* ignore */
  }
  return null;
}

export async function fetchReviewSummary(
  productId: number
): Promise<ReviewSummary | null> {
  try {
    const res = await api.get<ApiResponse<ReviewSummary>>("/reviews/summary", {
      params: { product_id: productId },
    });
    if (res.data?.success && res.data.data) {
      return res.data.data;
    }
  } catch {
    /* ignore */
  }
  return null;
}

export async function fetchReviewEligibility(
  productId: number
): Promise<ReviewEligibility | null> {
  try {
    const res = await api.get<ApiResponse<ReviewEligibility>>("/reviews/eligibility", {
      params: { product_id: productId },
    });
    if (res.data?.success && res.data.data) {
      return res.data.data;
    }
  } catch {
    /* ignore */
  }
  return null;
}

export async function fetchReviewableProducts(
  page = 0,
  size = 10
): Promise<PageResponse<ReviewableProduct> | null> {
  try {
    const res = await api.get<ApiResponse<PageResponse<ReviewableProduct>>>(
      "/reviews/reviewable",
      { params: { page, size } }
    );
    if (res.data?.success && res.data.data) {
      return res.data.data;
    }
  } catch {
    /* ignore */
  }
  return null;
}

export async function fetchMyReviews(
  page = 0,
  size = 10
): Promise<PageResponse<PublicReview> | null> {
  try {
    const res = await api.get<ApiResponse<PageResponse<PublicReview>>>("/reviews/my", {
      params: { page, size },
    });
    if (res.data?.success && res.data.data) {
      return res.data.data;
    }
  } catch {
    /* ignore */
  }
  return null;
}

export async function fetchReviewById(id: number): Promise<PublicReview | null> {
  try {
    const res = await api.get<ApiResponse<PublicReview>>(`/reviews/${id}`);
    if (res.data?.success && res.data.data) {
      return res.data.data;
    }
  } catch {
    /* ignore */
  }
  return null;
}

export async function submitReview(
  payload: CreateReviewPayload
): Promise<{ ok: boolean; message?: string; review?: PublicReview }> {
  try {
    const res = await api.post<ApiResponse<PublicReview>>("/reviews", payload);
    if (res.data?.success && res.data.data) {
      return { ok: true, review: res.data.data, message: res.data.message };
    }
    return { ok: false, message: res.data?.message || "Gửi đánh giá thất bại" };
  } catch (err: unknown) {
    return { ok: false, message: extractError(err, "Gửi đánh giá thất bại") };
  }
}

export async function updateReview(
  id: number,
  payload: UpdateReviewPayload
): Promise<{ ok: boolean; message?: string; review?: PublicReview }> {
  try {
    const res = await api.put<ApiResponse<PublicReview>>(`/reviews/${id}`, payload);
    if (res.data?.success && res.data.data) {
      return { ok: true, review: res.data.data, message: res.data.message };
    }
    return { ok: false, message: res.data?.message || "Cập nhật đánh giá thất bại" };
  } catch (err: unknown) {
    return { ok: false, message: extractError(err, "Cập nhật đánh giá thất bại") };
  }
}

export async function deleteReview(
  id: number
): Promise<{ ok: boolean; message?: string }> {
  try {
    const res = await api.delete<ApiResponse<void>>(`/reviews/${id}`);
    if (res.data?.success) {
      return { ok: true, message: res.data.message };
    }
    return { ok: false, message: res.data?.message || "Xóa đánh giá thất bại" };
  } catch (err: unknown) {
    return { ok: false, message: extractError(err, "Xóa đánh giá thất bại") };
  }
}

export async function markReviewHelpful(
  id: number
): Promise<{ ok: boolean; message?: string; review?: PublicReview }> {
  try {
    const res = await api.post<ApiResponse<PublicReview>>(`/reviews/${id}/helpful`);
    if (res.data?.success && res.data.data) {
      return { ok: true, review: res.data.data, message: res.data.message };
    }
    return { ok: false, message: res.data?.message || "Không thể đánh dấu hữu ích" };
  } catch (err: unknown) {
    return { ok: false, message: extractError(err, "Không thể đánh dấu hữu ích") };
  }
}

export function reviewStatusLabel(isApproved?: boolean | null): string {
  if (isApproved === true) return "Đã duyệt";
  if (isApproved === false) return "Chờ duyệt";
  return "Chờ duyệt";
}

export function reviewStatusClass(isApproved?: boolean | null): string {
  if (isApproved === true) return "bg-green-light-6 text-green";
  return "bg-yellow-light-2 text-yellow-dark-2";
}
