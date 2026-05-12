export type Product = {
  title: string;
  reviews: number;
  price: number;
  discountedPrice: number;
  id: number;
  /** Mô tả — map từ ProductDto.Response.detail */
  detail?: string;
  /** % giảm từ coupon (hiển thị badge) */
  couponPercent?: number | null;
  /** Nhà sản xuất — map ProducerDto.name */
  producerName?: string;
  /** Danh mục — map ProductTypeDto.name */
  productTypeName?: string;
  imgs?: {
    thumbnails: string[];
    previews: string[];
  };
};
