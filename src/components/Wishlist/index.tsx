"use client";
import React, { useEffect } from "react";
import Breadcrumb from "../Common/Breadcrumb";
import { useAppSelector } from "@/redux/store";
import { useDispatch } from "react-redux";
import { AppDispatch } from "@/redux/store";
import { fetchWishlist, clearWishlist } from "@/redux/features/wishlist-slice";
import SingleItem from "./SingleItem";
import toast from "react-hot-toast";

export const Wishlist = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { items, loading, totalElements, totalPages, currentPage } =
    useAppSelector((state) => state.wishlistReducer);
  const { isAuthenticated } = useAppSelector((state) => state.authReducer);

  useEffect(() => {
    if (isAuthenticated) {
      dispatch(fetchWishlist({ page: 0, size: 20 }));
    }
  }, [dispatch, isAuthenticated]);

  const handleClearWishlist = async () => {
    if (!isAuthenticated) {
      toast.error("Vui lòng đăng nhập để thực hiện thao tác này");
      return;
    }
    if (items.length === 0) return;
    
    try {
      await dispatch(clearWishlist()).unwrap();
      toast.success("Đã xóa toàn bộ danh sách yêu thích!");
    } catch (err: any) {
      toast.error(err || "Có lỗi xảy ra");
    }
  };

  const handlePageChange = (page: number) => {
    dispatch(fetchWishlist({ page, size: 20 }));
  };

  if (!isAuthenticated) {
    return (
      <>
        <Breadcrumb title={"Sản Phẩm Yêu Thích"} pages={["sản phẩm yêu thích"]} />
        <section className="overflow-hidden py-20 bg-gray-2">
          <div className="max-w-[1170px] w-full mx-auto px-4 sm:px-8 xl:px-0">
            <div className="bg-white rounded-[10px] shadow-1 p-10 text-center">
              <div className="mb-6">
                <svg className="mx-auto" width="64" height="64" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" fill="#e0e0e0"/>
                </svg>
              </div>
              <p className="text-dark text-lg mb-4">Vui lòng đăng nhập để xem danh sách yêu thích</p>
              <a
                href="/signin"
                className="inline-flex font-medium text-white bg-blue py-3 px-7 rounded-md ease-out duration-200 hover:bg-blue-dark"
              >
                Đăng Nhập
              </a>
            </div>
          </div>
        </section>
      </>
    );
  }

  return (
    <>
      <Breadcrumb title={"Sản Phẩm Yêu Thích"} pages={["sản phẩm yêu thích"]} />
      <section className="overflow-hidden py-20 bg-gray-2">
        <div className="max-w-[1170px] w-full mx-auto px-4 sm:px-8 xl:px-0">
          <div className="flex flex-wrap items-center justify-between gap-5 mb-7.5">
            <h2 className="font-medium text-dark text-2xl">
              Sản Phẩm Yêu Thích
              {totalElements > 0 && (
                <span className="text-base font-normal text-gray-500 ml-2">
                  ({totalElements} sản phẩm)
                </span>
              )}
            </h2>
            {items.length > 0 && (
              <button
                onClick={handleClearWishlist}
                className="text-red ease-out duration-200 hover:underline flex items-center gap-2"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z" fill="currentColor"/>
                </svg>
                Xóa tất cả
              </button>
            )}
          </div>

          {loading ? (
            <div className="bg-white rounded-[10px] shadow-1 p-10 text-center">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue mx-auto mb-4"></div>
              <p className="text-gray-500">Đang tải...</p>
            </div>
          ) : items.length === 0 ? (
            <div className="bg-white rounded-[10px] shadow-1 p-10 text-center">
              <div className="mb-6">
                <svg className="mx-auto" width="64" height="64" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" fill="#e0e0e0"/>
                </svg>
              </div>
              <p className="text-dark text-lg mb-2">Danh sách yêu thích trống</p>
              <p className="text-gray-500 mb-6">Hãy khám phá và thêm sản phẩm yêu thích của bạn!</p>
              <a
                href="/shop-with-sidebar"
                className="inline-flex font-medium text-white bg-blue py-3 px-7 rounded-md ease-out duration-200 hover:bg-blue-dark"
              >
                Khám Phá Ngay
              </a>
            </div>
          ) : (
            <>
              <div className="bg-white rounded-[10px] shadow-1">
                <div className="w-full overflow-x-auto">
                  <div className="min-w-[1170px]">
                    {/* table header */}
                    <div className="flex items-center py-5.5 px-10">
                      <div className="min-w-[83px]"></div>
                      <div className="min-w-[387px]">
                        <p className="text-dark font-medium">Sản phẩm</p>
                      </div>
                      <div className="min-w-[205px]">
                        <p className="text-dark font-medium">Đơn giá</p>
                      </div>
                      <div className="min-w-[265px]">
                        <p className="text-dark font-medium">Ngày thêm</p>
                      </div>
                      <div className="min-w-[150px]">
                        <p className="text-dark font-medium text-right">Thao tác</p>
                      </div>
                    </div>

                    {/* wish items */}
                    {items.map((item, key) => (
                      <SingleItem item={item} key={item.id || key} />
                    ))}
                  </div>
                </div>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-8">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 0}
                    className="px-4 py-2 rounded-md border border-gray-3 text-dark disabled:opacity-50 disabled:cursor-not-allowed ease-out duration-200 hover:bg-blue hover:text-white hover:border-blue"
                  >
                    Trước
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => (
                    <button
                      key={i}
                      onClick={() => handlePageChange(i)}
                      className={`w-10 h-10 rounded-md ease-out duration-200 ${
                        currentPage === i
                          ? "bg-blue text-white"
                          : "border border-gray-3 text-dark hover:bg-blue hover:text-white hover:border-blue"
                      }`}
                    >
                      {i + 1}
                    </button>
                  ))}
                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage >= totalPages - 1}
                    className="px-4 py-2 rounded-md border border-gray-3 text-dark disabled:opacity-50 disabled:cursor-not-allowed ease-out duration-200 hover:bg-blue hover:text-white hover:border-blue"
                  >
                    Sau
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </section>
    </>
  );
};
