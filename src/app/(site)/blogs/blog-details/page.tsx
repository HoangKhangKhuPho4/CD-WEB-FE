import BlogDetailsClient from "@/components/Blog/BlogDetailsClient";
import React, { Suspense } from "react";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Chi tiết bài viết | Bảo Khang Gadget",
  description: "Tin tức và bài viết - Bảo Khang Gadget",
};

const BlogDetailsPage = () => {
  return (
    <main>
      <Suspense
        fallback={
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue" />
          </div>
        }
      >
        <BlogDetailsClient />
      </Suspense>
    </main>
  );
};

export default BlogDetailsPage;
