import api from "./api";
import type { ApiResponse } from "@/types/api";

export type CmsPost = {
  id: number;
  title: string;
  subtitle?: string;
  linkUrl?: string;
  imageUrl?: string;
  body?: string;
  author?: string;
  active?: boolean;
  sortOrder?: number;
  createdAt?: string;
  updatedAt?: string;
};

export async function fetchActivePosts(): Promise<CmsPost[]> {
  try {
    const res = await api.get<ApiResponse<CmsPost[]>>("/cms/posts");
    if (res.data?.success && res.data.data) {
      return res.data.data;
    }
  } catch {
    /* ignore */
  }
  return [];
}

export async function fetchActivePost(id: number): Promise<CmsPost | null> {
  try {
    const res = await api.get<ApiResponse<CmsPost>>(`/cms/posts/${id}`);
    if (res.data?.success && res.data.data) {
      return res.data.data;
    }
  } catch {
    /* ignore */
  }
  return null;
}

export function cmsPostToBlogItem(post: CmsPost) {
  const date = post.createdAt
    ? new Date(post.createdAt).toLocaleDateString("vi-VN", {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    : "";
  return {
    id: post.id,
    date,
    views: 0,
    title: post.title,
    img: post.imageUrl || "/images/blog/blog-01.jpg",
    subtitle: post.subtitle,
    author: post.author,
  };
}
