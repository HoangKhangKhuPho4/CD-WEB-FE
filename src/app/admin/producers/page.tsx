"use client";

import { useState } from "react";
import BrandGrid from "@/components/Admin/Producers/BrandGrid";
import BrandFormModal, { type BrandFormData } from "@/components/Admin/Producers/BrandFormModal";
import AdminCatalogSubNav from "@/components/Admin/AdminCatalogSubNav";
import PageHeader from "@/components/Admin/shared/PageHeader";
import PrimaryButton from "@/components/Admin/shared/PrimaryButton";

export default function AdminProducersPage() {
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editInitial, setEditInitial] = useState<BrandFormData | undefined>();
  const [saveTick, setSaveTick] = useState(0);
  const [pendingSave, setPendingSave] = useState<{ id: string | null; data: BrandFormData } | null>(null);

  const openCreate = () => {
    setEditingId(null);
    setEditInitial(undefined);
    setModalOpen(true);
  };

  const openEdit = (id: string, data: BrandFormData) => {
    setEditingId(id);
    setEditInitial(data);
    setModalOpen(true);
  };

  const handleSave = (data: BrandFormData) => {
    setPendingSave({ id: editingId, data });
    setSaveTick((n) => n + 1);
    setModalOpen(false);
  };

  return (
    <div className="space-y-6">
      <AdminCatalogSubNav />
      <PageHeader
        title="Quản lý thương hiệu"
        subtitle="Quản lý danh sách các thương hiệu và nhà cung cấp sản phẩm"
        action={
          <PrimaryButton onClick={openCreate}>
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path d="M9 3.75V14.25" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M3.75 9H14.25" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Thêm thương hiệu
          </PrimaryButton>
        }
      />
      <BrandGrid saveTick={saveTick} pendingSave={pendingSave} onEdit={openEdit} />
      <BrandFormModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={handleSave}
        initial={editInitial}
      />
    </div>
  );
}
