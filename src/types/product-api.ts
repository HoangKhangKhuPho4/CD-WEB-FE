/** ProductDto.Response — đồng bộ tài liệu backend mục 3 */
/** Bảng product_types — BE có thể trả camelCase hoặc snake_case */
export type ProductTypeDto = {
  id: number;
  name: string;
  code: string;
  isActive?: boolean;
  is_active?: number;
  parentId?: number | null;
  parent_id?: number | null;
  display_order?: number;
  displayOrder?: number;
};
export type ProducerDto = { id: number; name: string; code: string };
export type ImageDto = {
  id: number;
  linkImage: string;
  variantId: number | null;
};
export type CouponDto = { id: number; code: string; percentDiscount: number };
export type AttributeValueResponse = {
  id: number;
  attributeName: string;
  value: string;
};
export type VariantDto = {
  id: number;
  productId?: number;
  productName?: string;
  skuCode?: string;
  variantName?: string;
  price?: number;
  originalPrice?: number;
  stockQuantity?: number;
  isActive?: boolean;
  isDefault?: boolean;
  attributeValues?: AttributeValueResponse[];
};
export type ProductOptionDto = { name: string; values: string[] };

export type ProductResponse = {
  id: number;
  name: string;
  price: number;
  quantity: number;
  status: string;
  detail: string;
  importDate: string | null;
  active: number;
  isFeatured: boolean | null;
  productType: ProductTypeDto | null;
  producer: ProducerDto | null;
  coupon: CouponDto | null;
  averageRating: number;
  reviewCount: number;
  soldQuantity: number;
  images: ImageDto[];
  variants: VariantDto[];
  options: ProductOptionDto[];
};

/** Tham số GET /api/products/search — snake_case theo backend */
export type ProductSearchParams = {
  keyword?: string;
  product_type_id?: number;
  min_price?: number;
  max_price?: number;
  producer_id?: number;
  min_rating?: number;
  color?: string;
  sort_by?: "name" | "price" | "importdate";
  sort_dir?: "asc" | "desc";
  page?: number;
  size?: number;
};
