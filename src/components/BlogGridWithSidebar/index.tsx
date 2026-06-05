"use client";

import React, { useEffect, useState } from "react";
import Breadcrumb from "../Common/Breadcrumb";
import BlogItemCard from "../Blog/BlogItem";
import SearchForm from "../Blog/SearchForm";
import LatestPosts from "../Blog/LatestPosts";
import LatestProducts from "../Blog/LatestProducts";
import { cmsPostToBlogItem, fetchActivePosts } from "@/utils/cmsApi";
import type { BlogItem } from "@/types/blogItem";
import shopData from "../Shop/shopData";

const BlogGridWithSidebar = () => {
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
          <div className="flex flex-col lg:flex-row gap-7.5">
            <div className="lg:max-w-[770px] w-full">
              {loading ? (
                <div className="flex justify-center py-16">
                  <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue" />
                </div>
              ) : posts.length === 0 ? (
                <p className="text-gray-500 py-10">Chưa có bài viết.</p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-10 gap-x-7.5">
                  {posts.map((blog) => (
                    <BlogItemCard blog={blog} key={blog.id ?? blog.title} />
                  ))}
                </div>
              )}
            </div>

            <div className="lg:max-w-[370px] w-full">
              <SearchForm />
              <LatestPosts blogs={posts} />
              <LatestProducts products={shopData.slice(0, 3)} />
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default BlogGridWithSidebar;
