"use client";

import Link from "next/link";
import AdminSubNav from "@/components/Admin/AdminSubNav";
import { contentLinks } from "@/components/Admin/adminNavConfig";
import PageHeader from "@/components/Admin/shared/PageHeader";
import PrimaryButton from "@/components/Admin/shared/PrimaryButton";
import PostsTable from "@/components/Admin/Posts/PostsTable";

export default function AdminPostsPage() {
  return (
    <div className="space-y-6">
      <AdminSubNav links={contentLinks} />
      <PageHeader
        title="Quản lý bài viết"
        subtitle="Blog, tin tức và nội dung SEO cho cửa hàng"
        action={
          <Link href="/admin/posts/new">
            <PrimaryButton>Viết bài mới</PrimaryButton>
          </Link>
        }
      />
      <PostsTable />
    </div>
  );
}
