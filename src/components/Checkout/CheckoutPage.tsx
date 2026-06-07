"use client";

import React, { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import toast from "react-hot-toast";
import Breadcrumb from "../Common/Breadcrumb";
import {
  addressService,
  Address,
  cartService,
  checkoutService,
  shippingService,
  GhnProvince,
  GhnDistrict,
  GhnWard,
} from "@/utils/api";
import {
  fetchAvailableCoupons,
  formatCouponLabel,
  type PublicCoupon,
} from "@/utils/couponApi";
import { useAppSelector } from "@/redux/store";

type CartLine = {
  id: number;
  quantity: number;
  unitPrice: number;
  subtotal: number;
  productName: string;
  variantInfo?: string;
  imageUrl?: string;
};

const formatVnd = (n: number) => n.toLocaleString("vi-VN") + "₫";

const CheckoutPage = () => {
  const router = useRouter();
  const { isAuthenticated } = useAppSelector((state) => state.authReducer);
  const [lines, setLines] = useState<CartLine[]>([]);
  const [subtotal, setSubtotal] = useState(0);
  const [shippingFee, setShippingFee] = useState(0);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<number | "">("");
  const [paymentMethod, setPaymentMethod] = useState("COD");
  const [couponCode, setCouponCode] = useState("");
  const [appliedCouponCode, setAppliedCouponCode] = useState("");
  const [availableCoupons, setAvailableCoupons] = useState<PublicCoupon[]>([]);
  const [couponApplying, setCouponApplying] = useState(false);
  const [discount, setDiscount] = useState(0);
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [provinces, setProvinces] = useState<GhnProvince[]>([]);
  const [districts, setDistricts] = useState<GhnDistrict[]>([]);
  const [wards, setWards] = useState<GhnWard[]>([]);
  const [provinceId, setProvinceId] = useState<number | "">("");
  const [districtId, setDistrictId] = useState<number | "">("");
  const [wardCode, setWardCode] = useState("");
  const [shippingName, setShippingName] = useState("");
  const [shippingPhone, setShippingPhone] = useState("");
  const [shippingAddress, setShippingAddress] = useState("");
  const [provinceName, setProvinceName] = useState("");
  const [districtName, setDistrictName] = useState("");
  const [wardName, setWardName] = useState("");

  const loadCart = useCallback(async () => {
    try {
      const res = await cartService.getCart();
      if (!res.data.success || !res.data.data?.items?.length) {
        setLines([]);
        setSubtotal(0);
        return;
      }
      const items = res.data.data.items.map((item) => {
        const variant = item.variant as
          | {
              variantName?: string;
              imageUrl?: string;
              product?: { name?: string };
            }
          | undefined;
        return {
          id: item.id,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          subtotal: item.subtotal,
          productName: variant?.product?.name || item.productName || "Sản phẩm",
          variantInfo: variant?.variantName || item.variantInfo,
          imageUrl: variant?.imageUrl || item.imageUrl,
        };
      });
      setLines(items);
      setSubtotal(res.data.data.totalAmount || 0);
    } catch {
      toast.error("Không tải được giỏ hàng");
    }
  }, []);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/signin?redirect=/checkout");
      return;
    }
    setLoading(true);
    Promise.all([
      loadCart(),
      addressService.getAll().then((r) => {
        if (r.data.success) {
          const list = r.data.data || [];
          setAddresses(list);
          const def = list.find((a) => a.isDefault);
          if (def) setSelectedAddressId(def.id);
        }
      }),
      shippingService.getProvinces().then((r) => {
        if (r.data.success) setProvinces(r.data.data || []);
      }),
      fetchAvailableCoupons().then((r) => {
        if (r.ok) setAvailableCoupons(r.data);
      }),
    ]).finally(() => setLoading(false));
  }, [isAuthenticated, loadCart, router]);

  const recalcShipping = useCallback(
    async (dId: number, wCode: string, sub: number) => {
      if (!dId || !wCode) return;
      try {
        const res = await shippingService.getCheckoutShipping({
          toDistrictId: dId,
          toWardCode: wCode,
          orderSubtotal: sub,
        });
        if (res.data.success) {
          setShippingFee(res.data.data.shippingFee || 0);
        }
      } catch {
        setShippingFee(30000);
      }
    },
    []
  );

  useEffect(() => {
    const syncAddressDropdowns = async () => {
      if (!selectedAddressId) {
        setShippingName("");
        setShippingPhone("");
        setShippingAddress("");
        setProvinceName("");
        setDistrictName("");
        setWardName("");
        setProvinceId("");
        setDistrictId("");
        setWardCode("");
        setDistricts([]);
        setWards([]);
        setShippingFee(0);
        return;
      }

      if (selectedAddressId && addresses.length && provinces.length) {
        const addr = addresses.find((a) => a.id === selectedAddressId);
        if (addr) {
          setShippingName(addr.receiverName);
          setShippingPhone(addr.phone);
          setShippingAddress(addr.addressDetail);
          setProvinceName(addr.province || "");
          setDistrictName(addr.district || "");
          setWardName(addr.ward || "");
          if (addr.province) {
            const p = provinces.find((x) => x.provinceName === addr.province);
            if (p) {
              setProvinceId(p.provinceId);
              
              try {
                const resD = await shippingService.getDistricts(p.provinceId);
                const dData = resD.data?.data || resD.data;
                const districtList: GhnDistrict[] = Array.isArray(dData) ? dData : [];
                setDistricts(districtList);

                const d = districtList.find((x: GhnDistrict) => x.districtName === addr.district);
                if (d) {
                  setDistrictId(d.districtId);

                  const resW = await shippingService.getWards(d.districtId);
                  const wData = resW.data?.data || resW.data;
                  const wardList: GhnWard[] = Array.isArray(wData) ? wData : [];
                  setWards(wardList);

                  const w = wardList.find((x: GhnWard) => x.wardName === addr.ward);
                  if (w) {
                    setWardCode(w.wardCode);
                  }
                }
              } catch (err) {
                console.error("Lỗi tự động map địa chỉ GHN:", err);
              }
            }
          }
        }
      }
    };

    syncAddressDropdowns();
  }, [selectedAddressId, addresses, provinces]); 

  useEffect(() => {
    if (districtId && wardCode) {
      recalcShipping(Number(districtId), wardCode, subtotal);
    }
  }, [districtId, wardCode, subtotal, recalcShipping]);

  const onProvinceChange = async (id: number) => {
    const p = provinces.find((x) => x.provinceId === id);
    setProvinceId(id);
    setProvinceName(p?.provinceName || "");
    setDistrictId("");
    setWardCode("");
    setWards([]);
    const res = await shippingService.getDistricts(id);
    if (res.data.success) setDistricts(res.data.data || []);
  };

  const onDistrictChange = async (id: number) => {
    const d = districts.find((x) => x.districtId === id);
    setDistrictId(id);
    setDistrictName(d?.districtName || "");
    setWardCode("");
    const res = await shippingService.getWards(id);
    if (res.data.success) setWards(res.data.data || []);
  };

  const applyCoupon = async (codeOverride?: string) => {
    const code = (codeOverride ?? couponCode).trim().toUpperCase();
    if (!code) return;
    setCouponApplying(true);
    try {
      const res = await checkoutService.previewCoupon(code);
      if (res.data.success) {
        const data = res.data.data;
        setCouponCode(code);
        setAppliedCouponCode(data.couponCode || code);
        setDiscount(data.discountAmount || 0);
        toast.success(data.message || "Áp dụng mã giảm giá thành công");
      }
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message || "Mã không hợp lệ";
      toast.error(msg);
      setDiscount(0);
      setAppliedCouponCode("");
    } finally {
      setCouponApplying(false);
    }
  };

  const clearCoupon = () => {
    setCouponCode("");
    setAppliedCouponCode("");
    setDiscount(0);
  };

  const total = Math.max(0, subtotal - discount + shippingFee);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!lines.length) {
      toast.error("Giỏ hàng trống");
      return;
    }
    if (!shippingName || !shippingPhone || !shippingAddress) {
      toast.error("Vui lòng nhập đủ thông tin giao hàng");
      return;
    }
    if (!districtId || !wardCode) {
      toast.error("Chọn đủ Tỉnh/Quận/Phường để tính phí GHN");
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        addressId: selectedAddressId ? Number(selectedAddressId) : undefined,
        shippingName,
        shippingPhone,
        shippingAddress,
        shippingProvince: provinceName,
        shippingDistrict: districtName,
        shippingWard: wardName,
        toDistrictId: Number(districtId),
        toWardCode: wardCode,
        paymentMethod,
        couponCode: couponCode.trim() || undefined,
        note: note.trim() || undefined,
      };
      const res = await checkoutService.placeOrder(payload);
      if (!res.data.success) {
        toast.error(res.data.message || "Đặt hàng thất bại");
        return;
      }
      const order = res.data.data;
      toast.success("Đặt hàng thành công!");
      const onlineMethods = ["VNPAY", "MOMO", "ZALOPAY"];
      if (order.paymentUrl && onlineMethods.includes(paymentMethod)) {
        window.location.href = order.paymentUrl;
        return;
      }
      router.push(`/checkout/result?orderCode=${order.orderCode}&success=1`);
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message || "Đặt hàng thất bại";
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="py-20 text-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue mx-auto" />
      </div>
    );
  }

  return (
    <>
      <Breadcrumb title="Thanh toán" pages={["checkout"]} />
      <section className="overflow-hidden py-20 bg-gray-2">
        <div className="site-container">
          <form onSubmit={handleSubmit}>
            <div className="flex flex-col lg:flex-row gap-7.5 xl:gap-11">
              <div className="lg:max-w-[670px] w-full space-y-7.5">
                <div className="bg-white shadow-1 rounded-[10px] p-4 sm:p-8.5">
                  <h3 className="font-medium text-xl text-dark mb-5">
                    Địa chỉ giao hàng
                  </h3>
                  {addresses.length > 0 && (
                    <div className="mb-4">
                      <label className="block text-sm mb-2">Chọn địa chỉ đã lưu</label>
                      <select
                        value={selectedAddressId}
                        onChange={(e) =>
                          setSelectedAddressId(
                            e.target.value ? Number(e.target.value) : ""
                          )
                        }
                        className="w-full border border-gray-3 rounded-md px-4 py-2.5"
                      >
                        <option value="">Nhập địa chỉ mới</option>
                        {addresses.map((a) => (
                          <option key={a.id} value={a.id}>
                            {a.receiverName} — {a.addressDetail}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <input
                      required
                      placeholder="Họ tên người nhận"
                      value={shippingName}
                      onChange={(e) => setShippingName(e.target.value)}
                      className="border border-gray-3 rounded-md px-4 py-2.5"
                    />
                    <input
                      required
                      placeholder="Số điện thoại"
                      value={shippingPhone}
                      onChange={(e) => setShippingPhone(e.target.value)}
                      className="border border-gray-3 rounded-md px-4 py-2.5"
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4">
                    <select
                      required
                      value={provinceId}
                      onChange={(e) => onProvinceChange(Number(e.target.value))}
                      className="border border-gray-3 rounded-md px-4 py-2.5"
                    >
                      <option value="">Tỉnh/Thành</option>
                      {provinces.map((p) => (
                        <option key={p.provinceId} value={p.provinceId}>
                          {p.provinceName}
                        </option>
                      ))}
                    </select>
                    <select
                      required
                      value={districtId}
                      onChange={(e) => onDistrictChange(Number(e.target.value))}
                      className="border border-gray-3 rounded-md px-4 py-2.5"
                    >
                      <option value="">Quận/Huyện</option>
                      {districts.map((d) => (
                        <option key={d.districtId} value={d.districtId}>
                          {d.districtName}
                        </option>
                      ))}
                    </select>
                    <select
                      required
                      value={wardCode}
                      onChange={(e) => {
                        setWardCode(e.target.value);
                        const w = wards.find((x) => x.wardCode === e.target.value);
                        setWardName(w?.wardName || "");
                      }}
                      className="border border-gray-3 rounded-md px-4 py-2.5"
                    >
                      <option value="">Phường/Xã</option>
                      {wards.map((w) => (
                        <option key={w.wardCode} value={w.wardCode}>
                          {w.wardName}
                        </option>
                      ))}
                    </select>
                  </div>
                  <input
                    required
                    placeholder="Số nhà, đường..."
                    value={shippingAddress}
                    onChange={(e) => setShippingAddress(e.target.value)}
                    className="w-full border border-gray-3 rounded-md px-4 py-2.5 mt-4"
                  />
                </div>

                <div className="bg-white shadow-1 rounded-[10px] p-4 sm:p-8.5">
                  <label htmlFor="notes" className="block mb-2.5">
                    Ghi chú đơn hàng (tuỳ chọn)
                  </label>
                  <textarea
                    id="notes"
                    rows={4}
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    className="rounded-md border border-gray-3 bg-gray-1 w-full p-5 outline-none focus:ring-2 focus:ring-blue/20"
                  />
                </div>
              </div>

              <div className="max-w-[455px] w-full">
                <div className="bg-white shadow-1 rounded-[10px] p-4 sm:p-8.5">
                  <h3 className="font-medium text-xl text-dark mb-5">Đơn hàng</h3>
                  {lines.length === 0 ? (
                    <p className="text-dark-5">Giỏ hàng trống.</p>
                  ) : (
                    <div className="space-y-4 border-b border-gray-3 pb-4">
                      {lines.map((item) => (
                        <div key={item.id} className="flex gap-3">
                          <div className="w-14 h-14 bg-gray-1 rounded relative flex-shrink-0">
                            {item.imageUrl && (
                              <Image
                                src={item.imageUrl}
                                alt=""
                                fill
                                className="object-cover rounded"
                              />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm text-dark truncate">{item.productName}</p>
                            <p className="text-xs text-gray-500">x{item.quantity}</p>
                          </div>
                          <p className="text-sm font-medium">{formatVnd(item.subtotal)}</p>
                        </div>
                      ))}
                    </div>
                  )}
                  <div className="space-y-2 py-4 text-sm">
                    <div className="flex justify-between">
                      <span>Tạm tính</span>
                      <span>{formatVnd(subtotal)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Phí vận chuyển (GHN)</span>
                      <span>{formatVnd(shippingFee)}</span>
                    </div>
                    {discount > 0 && (
                      <div className="flex justify-between text-green">
                        <span>Giảm giá</span>
                        <span>-{formatVnd(discount)}</span>
                      </div>
                    )}
                    <div className="flex justify-between font-semibold text-lg pt-2 border-t">
                      <span>Tổng</span>
                      <span className="text-red">{formatVnd(total)}</span>
                    </div>
                  </div>

                  <div className="mb-4 space-y-3">
                    <p className="text-sm font-medium text-dark">Mã giảm giá</p>
                    <div className="flex gap-2">
                      <input
                        placeholder="Nhập mã giảm giá"
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            void applyCoupon();
                          }
                        }}
                        className="flex-1 border border-gray-3 rounded-md px-3 py-2 text-sm uppercase"
                      />
                      <button
                        type="button"
                        disabled={couponApplying}
                        onClick={() => void applyCoupon()}
                        className="px-4 py-2 border border-blue text-blue rounded-md hover:bg-blue hover:text-white disabled:opacity-50 text-sm"
                      >
                        {couponApplying ? "..." : "Áp dụng"}
                      </button>
                    </div>
                    {appliedCouponCode && (
                      <div className="flex items-center justify-between text-sm bg-green-light-6 text-green px-3 py-2 rounded-md">
                        <span>
                          Đã áp dụng <strong>{appliedCouponCode}</strong> — giảm{" "}
                          {formatVnd(discount)}
                        </span>
                        <button
                          type="button"
                          onClick={clearCoupon}
                          className="text-xs underline"
                        >
                          Gỡ mã
                        </button>
                      </div>
                    )}
                    {availableCoupons.length > 0 && (
                      <div className="space-y-2">
                        <p className="text-xs text-gray-500">Mã khả dụng — bấm để áp dụng:</p>
                        <div className="flex flex-wrap gap-2">
                          {availableCoupons.slice(0, 6).map((c) => (
                            <button
                              key={c.code}
                              type="button"
                              onClick={() => void applyCoupon(c.code)}
                              className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                                appliedCouponCode === c.code
                                  ? "border-green bg-green-light-6 text-green"
                                  : "border-gray-3 text-[#6C6F93] hover:border-blue hover:text-blue"
                              }`}
                              title={c.description || formatCouponLabel(c)}
                            >
                              {c.code}
                              {c.discountType?.toUpperCase() === "PERCENT"
                                ? ` -${c.discountValue}%`
                                : ` -${Number(c.discountValue).toLocaleString("vi-VN")}₫`}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="space-y-2 mb-6">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="pay"
                        checked={paymentMethod === "COD"}
                        onChange={() => setPaymentMethod("COD")}
                      />
                      Thanh toán khi nhận hàng (COD)
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="pay"
                        checked={paymentMethod === "VNPAY"}
                        onChange={() => setPaymentMethod("VNPAY")}
                      />
                      VNPay
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="pay"
                        checked={paymentMethod === "MOMO"}
                        onChange={() => setPaymentMethod("MOMO")}
                      />
                      MoMo
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="pay"
                        checked={paymentMethod === "ZALOPAY"}
                        onChange={() => setPaymentMethod("ZALOPAY")}
                      />
                      ZaloPay
                    </label>
                  </div>

                  <button
                    type="submit"
                    disabled={submitting || !lines.length}
                    className="w-full flex justify-center font-medium text-white bg-blue py-3 px-6 rounded-md hover:bg-blue-dark disabled:opacity-60"
                  >
                    {submitting ? "Đang xử lý..." : "Đặt hàng"}
                  </button>
                </div>
              </div>
            </div>
          </form>
        </div>
      </section>
    </>
  );
};

export default CheckoutPage;
