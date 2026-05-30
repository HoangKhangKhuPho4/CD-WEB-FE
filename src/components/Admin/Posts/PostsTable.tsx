"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { adminCmsApi, type CmsItem } from "@/utils/adminApi";
import { formatDate } from "@/utils/adminFormat";

export default function PostsTable() {
  const [posts, setPosts] = useState<CmsItem[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminCmsApi.listPosts();
      if (res.data.success) setPosts(res.data.data);
    } catch {
      toast.error("Không tải được bài viết");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const remove = async (id: number) => {
    if (!window.confirm("Xóa bài viết này?")) return;
    try {
      await adminCmsApi.deletePost(id);
      toast.success("Đã xóa");
      await load();
    } catch {
      toast.error("Xóa thất bại");
    }
  };

  const togglePublish = async (post: CmsItem) => {
    try {
      await adminCmsApi.togglePost(post.id);
      await load();
    } catch {
      toast.error("Cập nhật trạng thái thất bại");
    }
  };

  if (loading) {
    return <p className="px-6 py-8 text-sm text-[#8D93A5]">Đang tải...</p>;
  }

  return (
    <div className="bg-white rounded-xl border border-gray-3/50 overflow-hidden">
      <table className="w-full min-w-[700px]">
        <thead>
          <tr className="bg-[#F7F9FC] border-b border-gray-3/50">
            <th className="text-left px-6 py-3 text-xs font-bold text-[#8D93A5] uppercase">Tiêu đề</th>
            <th className="text-left px-4 py-3 text-xs font-bold text-[#8D93A5] uppercase">Danh mục</th>
            <th className="text-left px-4 py-3 text-xs font-bold text-[#8D93A5] uppercase">Tác giả</th>
            <th className="text-left px-4 py-3 text-xs font-bold text-[#8D93A5] uppercase">Trạng thái</th>
            <th className="text-left px-4 py-3 text-xs font-bold text-[#8D93A5] uppercase">Ngày</th>
            <th className="text-right px-6 py-3 text-xs font-bold text-[#8D93A5] uppercase">Thao tác</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-3/50">
          {posts.map((p) => (
            <tr key={p.id} className="hover:bg-[#F7F9FC]/60">
              <td className="px-6 py-4 text-sm font-semibold">{p.title}</td>
              <td className="px-4 py-4 text-sm text-[#6C6F93]">{p.subtitle ?? "—"}</td>
              <td className="px-4 py-4 text-sm">{p.author ?? "Admin"}</td>
              <td className="px-4 py-4">
                <button
                  type="button"
                  onClick={() => void togglePublish(p)}
                  className={`px-2.5 py-1 rounded-full text-xs font-medium ${p.active ? "bg-green-light-6 text-green" : "bg-gray-3 text-[#6C6F93]"}`}
                >
                  {p.active ? "Đã xuất bản" : "Nháp"}
                </button>
              </td>
              <td className="px-4 py-4 text-sm text-[#6C6F93]">{formatDate(p.createdAt)}</td>
              <td className="px-6 py-4 text-right">
                <button type="button" className="text-sm text-[#6C6F93] hover:text-red mr-3" onClick={() => void remove(p.id)}>
                  Xóa
                </button>
                <Link href={`/admin/posts/new?id=${p.id}`} className="text-sm font-semibold text-[#3C50E0] hover:underline">
                  Sửa
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
