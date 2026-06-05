import { selectTotalPrice } from "@/redux/features/cart-slice";
import { useAppSelector } from "@/redux/store";
import React from "react";
import { useSelector } from "react-redux";
import Link from "next/link";
import { formatVnd } from "@/utils/cartSync";

const OrderSummary = () => {
  const cartItems = useAppSelector((state) => state.cartReducer.items);
  const totalPrice = useSelector(selectTotalPrice);

  return (
    <div className="lg:max-w-[455px] w-full">
      <div className="bg-white shadow-1 rounded-[10px]">
        <div className="border-b border-gray-3 py-5 px-4 sm:px-8.5">
          <h3 className="font-medium text-xl text-dark">Tóm tắt đơn</h3>
        </div>

        <div className="pt-2.5 pb-8.5 px-4 sm:px-8.5">
          <div className="flex items-center justify-between py-5 border-b border-gray-3">
            <h4 className="font-medium text-dark">Sản phẩm</h4>
            <h4 className="font-medium text-dark text-right">Thành tiền</h4>
          </div>

          {cartItems.map((item, key) => (
            <div
              key={key}
              className="flex items-center justify-between py-5 border-b border-gray-3"
            >
              <p className="text-dark text-sm pr-4">
                {item.title} × {item.quantity}
              </p>
              <p className="text-dark text-right whitespace-nowrap">
                {formatVnd(item.discountedPrice * item.quantity)}
              </p>
            </div>
          ))}

          <div className="flex items-center justify-between pt-5">
            <p className="font-medium text-lg text-dark">Tổng cộng</p>
            <p className="font-medium text-lg text-dark text-right">
              {formatVnd(totalPrice)}
            </p>
          </div>

          <Link
            href="/checkout"
            className="w-full flex justify-center font-medium text-white bg-blue py-3 px-6 rounded-md ease-out duration-200 hover:bg-blue-dark mt-7.5"
          >
            Thanh toán
          </Link>
        </div>
      </div>
    </div>
  );
};

export default OrderSummary;
