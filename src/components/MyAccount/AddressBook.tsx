"use client";

import React, { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import {
  addressService,
  Address,
  AddressPayload,
  shippingService,
  GhnProvince,
  GhnDistrict,
  GhnWard,
} from "@/utils/api";

type AddressFormState = AddressPayload & {
  provinceId?: number;
  districtId?: number;
  wardCode?: string;
};

const emptyForm: AddressFormState = {
  receiverName: "",
  phone: "",
  province: "",
  district: "",
  ward: "",
  addressDetail: "",
  label: "Nhà",
  isDefault: false,
};

const AddressBook = () => {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<AddressFormState>(emptyForm);
  const [provinces, setProvinces] = useState<GhnProvince[]>([]);
  const [districts, setDistricts] = useState<GhnDistrict[]>([]);
  const [wards, setWards] = useState<GhnWard[]>([]);
  const [saving, setSaving] = useState(false);

  const loadAddresses = useCallback(async () => {
    setLoading(true);
    try {
      const res = await addressService.getAll();
      if (res.data.success) {
        setAddresses(res.data.data || []);
      }
    } catch {
      toast.error("Không tải được sổ địa chỉ");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAddresses();
    shippingService
      .getProvinces()
      .then((res) => {
        if (res.data.success) setProvinces(res.data.data || []);
      })
      .catch(() => {});
  }, [loadAddresses]);

  const openCreate = () => {
    setEditingId(null);
    setForm(emptyForm);
    setDistricts([]);
    setWards([]);
    setModalOpen(true);
  };

  const openEdit = (addr: Address) => {
    setEditingId(addr.id);
    setForm({
      receiverName: addr.receiverName,
      phone: addr.phone,
      province: addr.province || "",
      district: addr.district || "",
      ward: addr.ward || "",
      addressDetail: addr.addressDetail,
      label: addr.label || "Nhà",
      isDefault: addr.isDefault,
    });
    setModalOpen(true);
  };

  const onProvinceChange = async (provinceId: number) => {
    const p = provinces.find((x) => x.provinceId === provinceId);
    setForm((f) => ({
      ...f,
      provinceId,
      province: p?.provinceName || "",
      districtId: undefined,
      district: "",
      wardCode: undefined,
      ward: "",
    }));
    setDistricts([]);
    setWards([]);
    if (provinceId) {
      const res = await shippingService.getDistricts(provinceId);
      if (res.data.success) setDistricts(res.data.data || []);
    }
  };

  const onDistrictChange = async (districtId: number) => {
    const d = districts.find((x) => x.districtId === districtId);
    setForm((f) => ({
      ...f,
      districtId,
      district: d?.districtName || "",
      wardCode: undefined,
      ward: "",
    }));
    setWards([]);
    if (districtId) {
      const res = await shippingService.getWards(districtId);
      if (res.data.success) setWards(res.data.data || []);
    }
  };

  const onWardChange = (wardCode: string) => {
    const w = wards.find((x) => x.wardCode === wardCode);
    setForm((f) => ({ ...f, wardCode, ward: w?.wardName || "" }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const payload: AddressPayload = {
      receiverName: form.receiverName,
      phone: form.phone,
      province: form.province,
      district: form.district,
      ward: form.ward,
      addressDetail: form.addressDetail,
      label: form.label,
      isDefault: form.isDefault,
    };
    try {
      if (editingId) {
        await addressService.update(editingId, payload);
        toast.success("Đã cập nhật địa chỉ");
      } else {
        await addressService.create(payload);
        toast.success("Đã thêm địa chỉ");
      }
      setModalOpen(false);
      loadAddresses();
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message || "Lưu địa chỉ thất bại";
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Xóa địa chỉ này?")) return;
    try {
      await addressService.delete(id);
      toast.success("Đã xóa địa chỉ");
      loadAddresses();
    } catch {
      toast.error("Không xóa được địa chỉ");
    }
  };

  const handleSetDefault = async (id: number) => {
    try {
      await addressService.setDefault(id);
      toast.success("Đã đặt làm địa chỉ mặc định");
      loadAddresses();
    } catch {
      toast.error("Không đặt được mặc định");
    }
  };

  return (
    <div className="xl:max-w-[770px] w-full">
      <div className="flex items-center justify-between mb-5">
        <p className="font-medium text-xl text-dark">Sổ địa chỉ giao hàng</p>
        <button
          type="button"
          onClick={openCreate}
          className="text-sm font-medium text-white bg-blue py-2.5 px-5 rounded-md hover:bg-blue-dark"
        >
          Thêm địa chỉ
        </button>
      </div>

      {loading ? (
        <p className="text-dark-5">Đang tải...</p>
      ) : addresses.length === 0 ? (
        <div className="bg-white shadow-1 rounded-xl p-8 text-center text-dark-5">
          Chưa có địa chỉ. Nhấn &quot;Thêm địa chỉ&quot; để tạo mới.
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {addresses.map((addr) => (
            <div
              key={addr.id}
              className="bg-white shadow-1 rounded-xl p-5 border border-gray-3"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-medium text-dark">
                    {addr.receiverName}{" "}
                    {addr.isDefault && (
                      <span className="text-xs bg-blue text-white px-2 py-0.5 rounded ml-2">
                        Mặc định
                      </span>
                    )}
                  </p>
                  <p className="text-sm text-dark-5 mt-1">{addr.phone}</p>
                  <p className="text-sm text-dark mt-2">
                    {addr.addressDetail}
                    {addr.ward ? `, ${addr.ward}` : ""}
                    {addr.district ? `, ${addr.district}` : ""}
                    {addr.province ? `, ${addr.province}` : ""}
                  </p>
                  {addr.label && (
                    <p className="text-xs text-gray-500 mt-1">Nhãn: {addr.label}</p>
                  )}
                </div>
                <div className="flex flex-wrap gap-2">
                  {!addr.isDefault && (
                    <button
                      type="button"
                      onClick={() => handleSetDefault(addr.id)}
                      className="text-xs text-blue border border-blue px-3 py-1.5 rounded hover:bg-blue hover:text-white"
                    >
                      Đặt mặc định
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => openEdit(addr)}
                    className="text-xs text-dark border border-gray-3 px-3 py-1.5 rounded hover:border-blue"
                  >
                    Sửa
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(addr.id)}
                    className="text-xs text-red border border-red px-3 py-1.5 rounded hover:bg-red hover:text-white"
                  >
                    Xóa
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {modalOpen && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/40 px-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold text-dark mb-4">
              {editingId ? "Sửa địa chỉ" : "Thêm địa chỉ"}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm mb-1">Người nhận *</label>
                <input
                  required
                  value={form.receiverName}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, receiverName: e.target.value }))
                  }
                  className="w-full border border-gray-3 rounded-md px-4 py-2.5"
                />
              </div>
              <div>
                <label className="block text-sm mb-1">Số điện thoại *</label>
                <input
                  required
                  value={form.phone}
                  onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                  className="w-full border border-gray-3 rounded-md px-4 py-2.5"
                />
              </div>
              <div>
                <label className="block text-sm mb-1">Tỉnh/Thành *</label>
                <select
                  required
                  value={form.provinceId || ""}
                  onChange={(e) => onProvinceChange(Number(e.target.value))}
                  className="w-full border border-gray-3 rounded-md px-4 py-2.5"
                >
                  <option value="">Chọn tỉnh/thành</option>
                  {provinces.map((p) => (
                    <option key={p.provinceId} value={p.provinceId}>
                      {p.provinceName}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm mb-1">Quận/Huyện *</label>
                <select
                  required
                  value={form.districtId || ""}
                  onChange={(e) => onDistrictChange(Number(e.target.value))}
                  className="w-full border border-gray-3 rounded-md px-4 py-2.5"
                >
                  <option value="">Chọn quận/huyện</option>
                  {districts.map((d) => (
                    <option key={d.districtId} value={d.districtId}>
                      {d.districtName}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm mb-1">Phường/Xã *</label>
                <select
                  required
                  value={form.wardCode || ""}
                  onChange={(e) => onWardChange(e.target.value)}
                  className="w-full border border-gray-3 rounded-md px-4 py-2.5"
                >
                  <option value="">Chọn phường/xã</option>
                  {wards.map((w) => (
                    <option key={w.wardCode} value={w.wardCode}>
                      {w.wardName}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm mb-1">Địa chỉ chi tiết *</label>
                <input
                  required
                  value={form.addressDetail}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, addressDetail: e.target.value }))
                  }
                  className="w-full border border-gray-3 rounded-md px-4 py-2.5"
                />
              </div>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={!!form.isDefault}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, isDefault: e.target.checked }))
                  }
                />
                Đặt làm địa chỉ mặc định
              </label>
              <div className="flex gap-3 justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-5 py-2.5 border border-gray-3 rounded-md"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2.5 bg-blue text-white rounded-md disabled:opacity-60"
                >
                  {saving ? "Đang lưu..." : "Lưu"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AddressBook;
