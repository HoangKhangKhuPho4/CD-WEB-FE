"use client";

import React, { useEffect, useState } from "react";
import Breadcrumb from "../Common/Breadcrumb";
import BlogItemCard from "../Blog/BlogItem";
import { cmsPostToBlogItem, fetchActivePosts } from "@/utils/cmsApi";
import type { BlogItem } from "@/types/blogItem";

const BlogGrid = () => {
  const [posts, setPosts] = useState<BlogItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void fetchActivePosts().then((rows) => {
      setPosts(rows.map(cmsPostToBlogItem));
      setLoading(false);
    });
  }, []);

  return (
    <>
      <Breadcrumb title="Tin tức" pages={["blog"]} />
      <section className="overflow-hidden py-20 bg-gray-2">
        <div className="site-container">
          {loading ? (
            <div className="flex justify-center py-16">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue" />
            </div>
          ) : posts.length === 0 ? (
            <p className="text-center text-gray-500 py-16">
              Chưa có bài viết nào. Quản trị viên có thể thêm tại Admin → Bài viết.
            </p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-y-10 gap-x-7.5">
              {posts.map((blog) => (
                <BlogItemCard blog={blog} key={blog.id ?? blog.title} />
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
};

export default BlogGrid;
