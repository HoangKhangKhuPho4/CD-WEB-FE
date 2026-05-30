import React from "react";
import Image from "next/image";

const Newsletter = () => {
  return (
    <section className="overflow-hidden">
      <div className="site-container-fluid">
        <div className="relative z-1 w-full overflow-hidden rounded-xl">
          {/* <!-- bg shapes --> */}
          <Image
            src="/images/shapes/newsletter-bg.jpg"
            alt="background illustration"
            className="absolute -z-1 w-full h-full left-0 top-0 rounded-xl"
            width={1170}
            height={200}
          />
          <div className="absolute -z-1 max-w-[523px] max-h-[243px] w-full h-full right-0 top-0 bg-gradient-1"></div>

          <div className="flex flex-col gap-8 px-5 py-11 sm:px-8 lg:flex-row lg:items-center lg:justify-between xl:px-14 xl:py-12 2xl:px-16">
            <div className="w-full min-w-0 flex-1 lg:max-w-[42%]">
              <h2 className="mb-3 text-lg font-bold text-white sm:text-xl xl:text-heading-4">
                Đừng Bỏ Lỡ Những Xu Hướng & Ưu Đãi Mới Nhất
              </h2>
              <p className="text-white">
                Đăng ký để nhận tin tức về các ưu đãi & mã giảm giá mới nhất
              </p>
            </div>

            <div className="w-full shrink-0 lg:max-w-[480px] lg:flex-1">
              <form>
                <div className="flex flex-col sm:flex-row gap-4">
                  <input
                    type="email"
                    name="email"
                    id="email"
                    placeholder="Nhập email của bạn"
                    className="w-full bg-gray-1 border border-gray-3 outline-none rounded-md placeholder:text-dark-4 py-3 px-5"
                  />
                  <button
                    type="submit"
                    className="inline-flex justify-center py-3 px-7 text-white bg-blue font-medium rounded-md ease-out duration-200 hover:bg-blue-dark"
                  >
                    Đăng Ký
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Newsletter;
