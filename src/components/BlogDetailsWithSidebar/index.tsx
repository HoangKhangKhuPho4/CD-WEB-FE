"use client";

import React, { useEffect, useState } from "react";
import Breadcrumb from "../Common/Breadcrumb";
import SearchForm from "../Blog/SearchForm";
import LatestPosts from "../Blog/LatestPosts";
import LatestProducts from "../Blog/LatestProducts";
import shopData from "../Shop/shopData";
import { cmsPostToBlogItem, fetchActivePosts } from "@/utils/cmsApi";
import type { BlogItem } from "@/types/blogItem";
import Link from "next/link";

const BlogDetailsWithSidebar = () => {
  const [posts, setPosts] = useState<BlogItem[]>([]);

  useEffect(() => {
    void fetchActivePosts().then((rows) => setPosts(rows.map(cmsPostToBlogItem)));
  }, []);

  return (
    <>
      <Breadcrumb title="Tin tức" pages={["blog"]} />
      <section className="overflow-hidden py-20 bg-gray-2">
        <div className="site-container">
          <p className="text-center text-gray-600 mb-8">
            Chọn bài viết từ{" "}
            <Link href="/blogs/blog-grid" className="text-blue hover:underline">
              danh sách tin tức
            </Link>
            .
          </p>
          <div className="flex flex-col lg:flex-row gap-7.5 xl:gap-12.5 max-w-5xl mx-auto">
            <div className="lg:max-w-[370px] w-full mx-auto lg:mx-0">
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

export default BlogDetailsWithSidebar;
