import Link from "next/link";
import React from "react";
import Image from "next/image";
import type { BlogItem } from "@/types/blogItem";

const LatestPosts = ({ blogs }: { blogs: BlogItem[] }) => {
  return (
    <div className="shadow-1 bg-white rounded-xl mt-7.5">
      <div className="px-4 sm:px-6 py-4.5 border-b border-gray-3">
        <h2 className="font-medium text-lg text-dark">Bài viết gần đây</h2>
      </div>

      <div className="p-4 sm:p-6">
        <div className="flex flex-col gap-6">
          {blogs.slice(0, 3).map((blog) => {
            const href = blog.id
              ? `/blogs/blog-details?id=${blog.id}`
              : "/blogs/blog-grid";
            return (
              <div className="flex items-center gap-4" key={blog.id ?? blog.title}>
                <Link
                  href={href}
                  className="max-w-[110px] w-full rounded-[10px] overflow-hidden shrink-0"
                >
                  <Image
                    src={blog.img}
                    alt={blog.title}
                    className="rounded-[10px] w-full object-cover"
                    width={110}
                    height={80}
                  />
                </Link>

                <div>
                  <h3 className="text-dark leading-[22px] ease-out duration-200 mb-1.5 hover:text-blue line-clamp-2">
                    <Link href={href}>{blog.title}</Link>
                  </h3>
                  {blog.date && (
                    <span className="text-custom-xs text-gray-500">{blog.date}</span>
                  )}
                </div>
              </div>
            );
          })}
          {blogs.length === 0 && (
            <p className="text-sm text-gray-500">Chưa có bài viết.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default LatestPosts;
