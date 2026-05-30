"use client";

import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import Modal from "@/components/Admin/shared/Modal";
import PrimaryButton from "@/components/Admin/shared/PrimaryButton";
import { adminCmsApi, type CmsItem } from "@/utils/adminApi";

const gradients = [
  "from-[#3C50E0] to-[#1C3FB7]",
  "from-[#1C274C] to-[#495270]",
  "from-[#F27430] to-[#FB923C]",
  "from-[#9333EA] to-[#A855F7]",
];

export default function BannerManagement() {
  const [banners, setBanners] = useState<CmsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [form, setForm] = useState({ title: "", position: "Trang chủ - Hero", link: "" });

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminCmsApi.listBanners();
      if (res.data.success) setBanners(res.data.data);
    } catch {
      toast.error("Không tải được banner");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const openCreate = () => {
    setEditId(null);
    setForm({ title: "", position: "Trang chủ - Hero", link: "" });
    setModalOpen(true);
  };

  const saveBanner = async () => {
    if (!form.title.trim()) return;
    try {
      const body = {
        title: form.title.trim(),
        subtitle: form.position,
        linkUrl: form.link,
        active: true,
      };
      if (editId) {
        await adminCmsApi.updateBanner(editId, body);
        toast.success("Đã cập nhật banner");
      } else {
        await adminCmsApi.createBanner(body);
        toast.success("Đã thêm banner");
      }
      setModalOpen(false);
      await load();
    } catch {
      toast.error("Lưu banner thất bại");
    }
  };

  const toggle = async (id: number) => {
    try {
      await adminCmsApi.toggleBanner(id);
      await load();
    } catch {
      toast.error("Không đổi được trạng thái");
    }
  };

  const remove = async (id: number) => {
    if (!window.confirm("Xóa banner này?")) return;
    try {
      await adminCmsApi.deleteBanner(id);
      toast.success("Đã xóa banner");
      await load();
    } catch {
      toast.error("Xóa banner thất bại");
    }
  };

  if (loading) {
    return <p className="text-sm text-[#8D93A5] py-8">Đang tải banner...</p>;
  }

  return (
    <>
      <div className="flex justify-end">
        <PrimaryButton onClick={openCreate}>Thêm banner</PrimaryButton>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {banners.map((b, i) => (
          <div key={b.id} className="bg-white rounded-xl border border-gray-3/50 overflow-hidden">
            <div
              className={`h-32 bg-gradient-to-r ${gradients[i % gradients.length]} flex items-center justify-center text-white font-bold text-lg px-4 text-center`}
            >
              {b.title}
            </div>
            <div className="p-4 space-y-2">
              <p className="text-xs text-[#8D93A5]">{b.subtitle ?? "—"}</p>
              <p className="text-sm text-[#3C50E0] truncate">{b.linkUrl || "—"}</p>
              <div className="flex items-center justify-between pt-2 gap-2">
                <span
                  className={`text-xs font-medium px-2 py-1 rounded-full ${b.active ? "bg-green-light-6 text-green" : "bg-gray-3 text-[#6C6F93]"}`}
                >
                  {b.active ? "Đang hiển thị" : "Ẩn"}
                </span>
                <div className="flex gap-2">
                  <button type="button" onClick={() => void toggle(b.id)} className="text-sm font-semibold text-[#3C50E0]">
                    {b.active ? "Tắt" : "Bật"}
                  </button>
                  <button type="button" onClick={() => void remove(b.id)} className="text-sm text-red">
                    Xóa
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editId ? "Sửa banner" : "Thêm banner"}
        footer={<PrimaryButton onClick={() => void saveBanner()}>Lưu banner</PrimaryButton>}
      >
        <div className="space-y-4">
          <input
            value={form.title}
            onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
            placeholder="Tiêu đề *"
            className="w-full px-3 py-2.5 border border-gray-3 rounded-lg text-sm"
          />
          <select
            value={form.position}
            onChange={(e) => setForm((p) => ({ ...p, position: e.target.value }))}
            className="w-full px-3 py-2.5 border border-gray-3 rounded-lg text-sm"
          >
            <option>Trang chủ - Hero</option>
            <option>Danh mục Điện thoại</option>
            <option>Sidebar</option>
          </select>
          <input
            value={form.link}
            onChange={(e) => setForm((p) => ({ ...p, link: e.target.value }))}
            placeholder="Liên kết"
            className="w-full px-3 py-2.5 border border-gray-3 rounded-lg text-sm"
          />
        </div>
      </Modal>
    </>
  );
}
