"use client";

import React, { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Breadcrumb from "../Common/Breadcrumb";
import Image from "next/image";
import Link from "next/link";
import { fetchActivePost } from "@/utils/cmsApi";
import type { CmsPost } from "@/utils/cmsApi";

export default function BlogDetailsClient() {
  const searchParams = useSearchParams();
  const idParam = searchParams.get("id");
  const postId = idParam ? Number(idParam) : NaN;

  const [post, setPost] = useState<CmsPost | null>(null);
  const [loading, setLoading] = useState(!!idParam);

  useEffect(() => {
    if (!Number.isFinite(postId) || postId <= 0) {
      setLoading(false);
      return;
    }
    void fetchActivePost(postId).then((p) => {
      setPost(p);
      setLoading(false);
    });
  }, [postId]);

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue" />
      </div>
    );
  }

  if (!post) {
    return (
      <>
        <Breadcrumb title="Chi tiết bài viết" pages={["blog"]} />
        <section className="py-20 bg-gray-2 text-center">
          <p className="text-gray-500 mb-6">
            {idParam
              ? "Không tìm thấy bài viết hoặc bài đã bị ẩn."
              : "Chọn bài viết từ trang tin tức."}
          </p>
          <Link href="/blogs/blog-grid" className="text-blue hover:underline">
            ← Quay lại tin tức
          </Link>
        </section>
      </>
    );
  }

  const date = post.createdAt
    ? new Date(post.createdAt).toLocaleDateString("vi-VN", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "";

  return (
    <>
      <Breadcrumb title={post.title} pages={["blog", "chi tiết"]} />
      <section className="overflow-hidden py-20 bg-gray-2">
        <div className="max-w-[750px] w-full mx-auto px-4 sm:px-8 xl:px-0">
          {post.imageUrl && (
            <div className="rounded-[10px] overflow-hidden mb-7.5">
              <Image
                className="rounded-[10px] w-full object-cover"
                src={post.imageUrl}
                alt={post.title}
                width={750}
                height={477}
              />
            </div>
          )}

          <div>
            <span className="flex flex-wrap items-center gap-3 mb-4 text-sm text-gray-500">
              {date && <span>{date}</span>}
              {post.author && (
                <>
                  <span className="block w-px h-4 bg-gray-4" />
                  <span>{post.author}</span>
                </>
              )}
            </span>

            <h1 className="font-medium text-dark text-xl lg:text-2xl xl:text-custom-4xl mb-4">
              {post.title}
            </h1>

            {post.subtitle && (
              <p className="text-lg text-gray-600 mb-6">{post.subtitle}</p>
            )}

            <div
              className="prose prose-sm max-w-none text-dark"
              dangerouslySetInnerHTML={{
                __html: post.body?.replace(/\n/g, "<br />") || "",
              }}
            />
          </div>

          <div className="mt-10">
            <Link href="/blogs/blog-grid" className="text-blue hover:underline">
              ← Quay lại tin tức
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
