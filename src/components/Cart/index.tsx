"use client";
import React, { useEffect, useState } from "react";
import OrderSummary from "./OrderSummary";
import { useAppSelector, type AppDispatch } from "@/redux/store";
import { useDispatch } from "react-redux";
import SingleItem from "./SingleItem";
import Breadcrumb from "../Common/Breadcrumb";
import Link from "next/link";
import { clearCartApi, loadCartFromApi } from "@/utils/cartSync";
import toast from "react-hot-toast";

const Cart = () => {
  const dispatch = useDispatch<AppDispatch>();
  const cartItems = useAppSelector((state) => state.cartReducer.items);
  const { isAuthenticated } = useAppSelector((state) => state.authReducer);
  const [loading, setLoading] = useState(false);
  const [clearing, setClearing] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) return;
    let cancelled = false;
    setLoading(true);
    loadCartFromApi(dispatch)
      .catch(() => {
        if (!cancelled) toast.error("Không tải được giỏ hàng");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [dispatch, isAuthenticated]);

  const handleClearCart = async () => {
    if (clearing) return;
    setClearing(true);
    try {
      const ok = await clearCartApi(dispatch, isAuthenticated);
      if (ok) toast.success("Đã xóa giỏ hàng");
    } finally {
      setClearing(false);
    }
  };

  return (
    <>
      <section>
        <Breadcrumb title={"Giỏ hàng"} pages={["Giỏ hàng"]} />
      </section>
      {loading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue" />
        </div>
      ) : cartItems.length > 0 ? (
        <section className="overflow-hidden py-20 bg-gray-2">
          <div className="site-container">
            <div className="flex flex-wrap items-center justify-between gap-5 mb-7.5">
              <h2 className="font-medium text-dark text-2xl">Giỏ hàng của bạn</h2>
              <button
                type="button"
                disabled={clearing}
                onClick={handleClearCart}
                className="text-blue disabled:opacity-50"
              >
                Xóa toàn bộ giỏ
              </button>
            </div>

            <div className="bg-white rounded-[10px] shadow-1">
              <div className="w-full overflow-x-auto">
                <div className="min-w-[1170px]">
                  <div className="flex items-center py-5.5 px-7.5">
                    <div className="min-w-[400px]">
                      <p className="text-dark">Sản phẩm</p>
                    </div>
                    <div className="min-w-[180px]">
                      <p className="text-dark">Đơn giá</p>
                    </div>
                    <div className="min-w-[275px]">
                      <p className="text-dark">Số lượng</p>
                    </div>
                    <div className="min-w-[200px]">
                      <p className="text-dark">Thành tiền</p>
                    </div>
                    <div className="min-w-[50px]">
                      <p className="text-dark text-right">Thao tác</p>
                    </div>
                  </div>

                  {cartItems.map((item) => (
                    <SingleItem item={item} key={item.id} />
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-9 max-w-[670px] ml-auto">
              <div className="mb-4 rounded-[10px] bg-white shadow-1 px-5 py-4 text-sm text-gray-600">
                Mã giảm giá áp dụng tại bước{" "}
                <Link href="/checkout" className="text-blue hover:underline">
                  thanh toán
                </Link>
                .
              </div>
              <OrderSummary />
            </div>
          </div>
        </section>
      ) : (
        <div className="text-center mt-8 pb-20">
          <p className="text-dark text-lg mb-6">Giỏ hàng trống</p>
          <Link
            href="/shop-with-sidebar"
            className="inline-flex font-medium text-white bg-blue py-3 px-8 rounded-md hover:bg-blue-dark"
          >
            Tiếp tục mua sắm
          </Link>
        </div>
      )}
    </>
  );
};

export default Cart;
