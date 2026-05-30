"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import AdminSubNav from "@/components/Admin/AdminSubNav";
import { contentLinks } from "@/components/Admin/adminNavConfig";
import PageHeader from "@/components/Admin/shared/PageHeader";
import PrimaryButton from "@/components/Admin/shared/PrimaryButton";
import { adminCmsApi } from "@/utils/adminApi";

export default function AdminPostNewPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams.get("id");

  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("Tin tức");
  const [content, setContent] = useState("");
  const [published, setPublished] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!editId) return;
    void adminCmsApi.listPosts().then((res) => {
      if (!res.data.success) return;
      const post = res.data.data.find((p) => String(p.id) === editId);
      if (!post) return;
      setTitle(post.title);
      setCategory(post.subtitle ?? "Tin tức");
      setContent(post.body ?? "");
      setPublished(!!post.active);
    });
  }, [editId]);

  const save = async () => {
    if (!title.trim()) {
      toast.error("Nhập tiêu đề bài viết");
      return;
    }
    setSaving(true);
    try {
      const body = {
        title: title.trim(),
        subtitle: category,
        body: content,
        author: "Admin",
        active: published,
      };
      if (editId) {
        await adminCmsApi.updatePost(Number(editId), body);
        toast.success("Đã cập nhật bài viết");
      } else {
        await adminCmsApi.createPost(body);
        toast.success("Đã tạo bài viết");
      }
      router.push("/admin/posts");
    } catch {
      toast.error("Lưu bài viết thất bại");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <AdminSubNav links={contentLinks} />
      <PageHeader title={editId ? "Sửa bài viết" : "Viết bài mới"} subtitle="Soạn thảo nội dung blog / tin tức" />
      <div className="bg-white rounded-xl border border-gray-3/50 p-6 space-y-4">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Tiêu đề bài viết *"
          className="w-full px-4 py-3 border border-gray-3 rounded-lg text-lg font-semibold"
        />
        <div className="flex flex-wrap gap-4">
          <select value={category} onChange={(e) => setCategory(e.target.value)} className="px-3 py-2 border border-gray-3 rounded-lg text-sm">
            <option>Tin tức</option>
            <option>Hướng dẫn</option>
            <option>Khuyến mãi</option>
          </select>
          <select
            value={published ? "published" : "draft"}
            onChange={(e) => setPublished(e.target.value === "published")}
            className="px-3 py-2 border border-gray-3 rounded-lg text-sm"
          >
            <option value="draft">Nháp</option>
            <option value="published">Xuất bản</option>
          </select>
        </div>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={14}
          placeholder="Nội dung bài viết..."
          className="w-full px-4 py-3 border border-gray-3 rounded-lg text-sm resize-none"
        />
        <div className="flex gap-3 pt-2">
          <PrimaryButton onClick={() => void save()} disabled={saving}>
            {saving ? "Đang lưu..." : "Lưu bài viết"}
          </PrimaryButton>
          <button type="button" onClick={() => router.back()} className="px-5 py-2.5 text-sm font-semibold text-[#6C6F93]">
            Hủy
          </button>
        </div>
      </div>
    </div>
  );
}
