"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import Modal from "@/components/Admin/shared/Modal";
import PrimaryButton from "@/components/Admin/shared/PrimaryButton";
import {
  adminUserApi,
  CUSTOMER_ROLE_ID,
  type AdminUser,
} from "@/utils/adminApi";
import { authService } from "@/utils/api";

const emptyCreate = {
  username: "",
  email: "",
  password: "",
  fullName: "",
  phone: "",
  gender: "",
  birth: "",
};

const emptyEdit = {
  fullName: "",
  phone: "",
  gender: "",
  birth: "",
  address: "",
};

export default function CustomerFormModal({
  open,
  onClose,
  customer,
  onSaved,
}: {
  open: boolean;
  onClose: () => void;
  customer: AdminUser | null;
  onSaved: () => void;
}) {
  const isEdit = customer != null;
  const [createForm, setCreateForm] = useState(emptyCreate);
  const [editForm, setEditForm] = useState(emptyEdit);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    if (customer) {
      setEditForm({
        fullName: customer.fullName ?? customer.name ?? "",
        phone: customer.phone ?? "",
        gender: customer.gender ?? "",
        birth: customer.birth?.slice(0, 10) ?? "",
        address: customer.address ?? "",
      });
    } else {
      setCreateForm(emptyCreate);
    }
  }, [open, customer]);

  const saveCreate = async () => {
    const { username, email, password, fullName, phone, gender, birth } = createForm;
    if (!username.trim() || !email.trim() || !password.trim() || !fullName.trim()) {
      toast.error("Vui lòng điền đủ thông tin bắt buộc");
      return;
    }
    if (password.length < 6) {
      toast.error("Mật khẩu tối thiểu 6 ký tự");
      return;
    }
    setSaving(true);
    try {
      const [uCheck, eCheck] = await Promise.all([
        authService.checkUsername(username.trim()),
        authService.checkEmail(email.trim()),
      ]);
      if (!uCheck.data.data) {
        toast.error("Tên đăng nhập đã được sử dụng");
        return;
      }
      if (!eCheck.data.data) {
        toast.error("Email đã được sử dụng");
        return;
      }
      const res = await adminUserApi.create({
        username: username.trim(),
        email: email.trim(),
        password,
        fullName: fullName.trim(),
        phone: phone.trim() || undefined,
        gender: gender.trim() || undefined,
        birth: birth || undefined,
        roleId: CUSTOMER_ROLE_ID,
      });
      if (res.data.success) {
        toast.success("Đã tạo khách hàng");
        onClose();
        onSaved();
      }
    } catch {
      toast.error("Tạo khách hàng thất bại");
    } finally {
      setSaving(false);
    }
  };

  const saveEdit = async () => {
    if (!customer) return;
    if (!editForm.fullName.trim()) {
      toast.error("Họ tên không được trống");
      return;
    }
    setSaving(true);
    try {
      const res = await adminUserApi.update(customer.id, {
        fullName: editForm.fullName.trim(),
        phone: editForm.phone.trim() || undefined,
        gender: editForm.gender.trim() || undefined,
        birth: editForm.birth || undefined,
        address: editForm.address.trim() || undefined,
      });
      if (res.data.success) {
        toast.success("Đã cập nhật khách hàng");
        onClose();
        onSaved();
      }
    } catch {
      toast.error("Cập nhật thất bại");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEdit ? "Chỉnh sửa khách hàng" : "Thêm khách hàng"}
      subtitle={
        isEdit
          ? `Tài khoản: ${customer?.username}`
          : "Tạo tài khoản vai trò Khách hàng (CUSTOMER)"
      }
      footer={
        <PrimaryButton
          onClick={() => void (isEdit ? saveEdit() : saveCreate())}
          disabled={saving}
        >
          {saving ? "Đang lưu..." : "Lưu"}
        </PrimaryButton>
      }
    >
      {isEdit ? (
        <div className="space-y-4">
          <input
            value={editForm.fullName}
            onChange={(e) => setEditForm((p) => ({ ...p, fullName: e.target.value }))}
            placeholder="Họ và tên *"
            className="w-full px-3 py-2.5 border border-gray-3 rounded-lg text-sm"
          />
          <input
            value={editForm.phone}
            onChange={(e) => setEditForm((p) => ({ ...p, phone: e.target.value }))}
            placeholder="Số điện thoại"
            className="w-full px-3 py-2.5 border border-gray-3 rounded-lg text-sm"
          />
          <select
            value={editForm.gender}
            onChange={(e) => setEditForm((p) => ({ ...p, gender: e.target.value }))}
            className="w-full px-3 py-2.5 border border-gray-3 rounded-lg text-sm"
          >
            <option value="">Giới tính</option>
            <option value="Nam">Nam</option>
            <option value="Nữ">Nữ</option>
            <option value="Khác">Khác</option>
          </select>
          <input
            type="date"
            value={editForm.birth}
            onChange={(e) => setEditForm((p) => ({ ...p, birth: e.target.value }))}
            className="w-full px-3 py-2.5 border border-gray-3 rounded-lg text-sm"
          />
          <textarea
            value={editForm.address}
            onChange={(e) => setEditForm((p) => ({ ...p, address: e.target.value }))}
            placeholder="Địa chỉ mặc định"
            rows={2}
            className="w-full px-3 py-2.5 border border-gray-3 rounded-lg text-sm resize-none"
          />
        </div>
      ) : (
        <div className="space-y-4">
          <input
            value={createForm.username}
            onChange={(e) => setCreateForm((p) => ({ ...p, username: e.target.value }))}
            placeholder="Tên đăng nhập *"
            className="w-full px-3 py-2.5 border border-gray-3 rounded-lg text-sm"
          />
          <input
            value={createForm.fullName}
            onChange={(e) => setCreateForm((p) => ({ ...p, fullName: e.target.value }))}
            placeholder="Họ và tên *"
            className="w-full px-3 py-2.5 border border-gray-3 rounded-lg text-sm"
          />
          <input
            type="email"
            value={createForm.email}
            onChange={(e) => setCreateForm((p) => ({ ...p, email: e.target.value }))}
            placeholder="Email *"
            className="w-full px-3 py-2.5 border border-gray-3 rounded-lg text-sm"
          />
          <input
            value={createForm.phone}
            onChange={(e) => setCreateForm((p) => ({ ...p, phone: e.target.value }))}
            placeholder="Số điện thoại"
            className="w-full px-3 py-2.5 border border-gray-3 rounded-lg text-sm"
          />
          <input
            type="password"
            value={createForm.password}
            onChange={(e) => setCreateForm((p) => ({ ...p, password: e.target.value }))}
            placeholder="Mật khẩu (tối thiểu 6 ký tự) *"
            className="w-full px-3 py-2.5 border border-gray-3 rounded-lg text-sm"
          />
        </div>
      )}
    </Modal>
  );
}
