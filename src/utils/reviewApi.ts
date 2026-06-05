import api, { type PageResponse } from "./api";
import type { ApiResponse } from "@/types/api";

export type PublicReview = {
  id: number;
  productId?: number;
  productName?: string;
  rating: number;
  title?: string;
  content?: string;
  pros?: string;
  cons?: string;
  isVerifiedPurchase?: boolean;
  helpfulCount?: number;
  createdAt?: string;
  replyContent?: string;
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

export type CreateReviewPayload = {
  productId: number;
  variantId?: number;
  rating: number;
  title?: string;
  content?: string;
};

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
  size = 10
): Promise<PageResponse<PublicReview> | null> {
  try {
    const res = await api.get<ApiResponse<PageResponse<PublicReview>>>("/reviews", {
      params: { product_id: productId, page, size, sort: "createdAt", direction: "desc" },
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
    const msg =
      (err as { response?: { data?: { message?: string } } })?.response?.data
        ?.message || "Gửi đánh giá thất bại";
    return { ok: false, message: msg };
  }
}
