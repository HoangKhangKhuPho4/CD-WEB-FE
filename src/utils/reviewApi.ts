import api from "./api";
import type { ApiResponse } from "@/types/api";

export type PublicReview = {
  id: number;
  productId?: number;
  productName?: string;
  rating: number;
  title?: string;
  content?: string;
  createdAt?: string;
  user?: {
    id?: number;
    username?: string;
    name?: string;
  };
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
