"use client";

import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import Modal from "@/components/Admin/shared/Modal";
import PrimaryButton from "@/components/Admin/shared/PrimaryButton";
import ProducerSidebarPanel from "@/components/Admin/Producers/ProducerSidebarPanel";
import { adminCategoryApi } from "@/utils/adminApi";

interface Category {
  id: string;
  name: string;
  slug: string;
  position: number;
  parent: string;
  active: boolean;
}

function slugify(name: string) {
  return name
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");
}

export default function CategoryManagement() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({
    name: "",
    slug: "",
    position: "1",
    parent: "",
    active: true,
  });

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const cRes = await adminCategoryApi.listAll();
      if (cRes.data.success) {
        setCategories(
          cRes.data.data.map((c, i) => ({
            id: String(c.id),
            name: c.name,
            slug: c.code ?? slugify(c.name),
            position: i + 1,
            parent: "",
            active: c.isActive !== false,
          }))
        );
      }
    } catch {
      toast.error("Không tải được danh mục");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const saveCategory = async () => {
    if (!form.name.trim()) return;
    try {
      const res = await adminCategoryApi.create({
        name: form.name.trim(),
        code: form.slug.trim() || slugify(form.name),
        description: form.parent ? `Parent: ${form.parent}` : undefined,
      });
      if (!res.data.success) throw new Error(res.data.message);
      toast.success("Đã thêm danh mục");
      setModalOpen(false);
      setForm({ name: "", slug: "", position: "1", parent: "", active: true });
      await load();
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Lưu danh mục thất bại");
    }
  };

  const toggleCategory = async (id: string) => {
    try {
      await adminCategoryApi.toggle(Number(id));
      await load();
    } catch {
      toast.error("Không đổi được trạng thái danh mục");
    }
  };

  return (
    <>
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        <div className="xl:col-span-8 bg-white rounded-xl border border-gray-3/50 overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-3/50">
            <h3 className="font-bold text-dark">Danh mục sản phẩm</h3>
            <PrimaryButton onClick={() => setModalOpen(true)}>+ Thêm danh mục</PrimaryButton>
          </div>
          <div className="overflow-x-auto">
            {loading ? (
              <p className="px-6 py-8 text-sm text-[#8D93A5]">Đang tải...</p>
            ) : (
              <table className="w-full min-w-[600px]">
                <thead>
                  <tr className="bg-[#F7F9FC]">
                    <th className="text-left px-6 py-3 text-xs font-bold text-[#8D93A5] uppercase">
                      Tên danh mục
                    </th>
                    <th className="text-left px-4 py-3 text-xs font-bold text-[#8D93A5] uppercase">
                      Slug
                    </th>
                    <th className="text-center px-4 py-3 text-xs font-bold text-[#8D93A5] uppercase">
                      Vị trí
                    </th>
                    <th className="text-left px-4 py-3 text-xs font-bold text-[#8D93A5] uppercase">
                      Trạng thái
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-3/50">
                  {categories.map((c) => (
                    <tr key={c.id} className="hover:bg-[#F7F9FC]/50">
                      <td className="px-6 py-3.5 text-sm font-semibold text-dark">{c.name}</td>
                      <td className="px-4 py-3.5 text-sm text-[#6C6F93] font-mono">{c.slug}</td>
                      <td className="px-4 py-3.5 text-sm text-center">{c.position}</td>
                      <td className="px-4 py-3.5">
                        <button
                          type="button"
                          onClick={() => void toggleCategory(c.id)}
                          className={`text-xs px-2 py-1 rounded-full ${
                            c.active ? "bg-green-light-6 text-green" : "bg-red-light-6 text-red"
                          }`}
                        >
                          {c.active ? "Kích hoạt" : "Ẩn"}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        <div className="xl:col-span-4">
          <ProducerSidebarPanel limit={10} />
        </div>
      </div>

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Tạo danh mục mới"
        subtitle="Điền thông tin chi tiết để thêm danh mục vào hệ thống"
        footer={
          <>
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="px-4 py-2.5 text-sm font-semibold text-[#6C6F93] hover:text-dark"
            >
              Hủy bỏ
            </button>
            <PrimaryButton onClick={() => void saveCategory()}>Lưu thông tin</PrimaryButton>
          </>
        }
      >
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-[#6C6F93] mb-1.5">Tên danh mục *</label>
            <input
              value={form.name}
              onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
              placeholder="Nhập tên danh mục..."
              className="w-full px-3 py-2.5 bg-[#F7F9FC] border border-gray-3 rounded-lg text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-[#6C6F93] mb-1.5">Slug / Mã</label>
            <input
              value={form.slug}
              onChange={(e) => setForm((p) => ({ ...p, slug: e.target.value }))}
              placeholder="danh-muc-moi"
              className="w-full px-3 py-2.5 bg-[#F7F9FC] border border-gray-3 rounded-lg text-sm"
            />
          </div>
        </div>
      </Modal>
    </>
  );
}
