import api from "./api";
import type { ApiResponse, Page } from "@/types/api";
import type {
  ProducerDto,
  ProductResponse,
  ProductSearchParams,
  ProductTypeDto,
} from "@/types/product-api";

function unwrapData<T>(res: { data: ApiResponse<T> }): T | null {
  const body = res.data;
  if (body?.success && body.data != null) {
    return body.data;
  }
  return null;
}

/**
 * Danh sách loại sản phẩm — GET /api/product-types
 * (Nếu BE dùng path khác, chỉnh tại đây.)
 */
export const fetchProductTypes = async (): Promise<ProductTypeDto[]> => {
  try {
    const res = await api.get<ApiResponse<ProductTypeDto[]>>("/product-types");
    return unwrapData(res) ?? [];
  } catch {
    return [];
  }
};

/**
 * Danh sách hãng — GET /api/producers
 */
export const fetchProducers = async (): Promise<ProducerDto[]> => {
  try {
    const res = await api.get<ApiResponse<ProducerDto[]>>("/producers");
    return unwrapData(res) ?? [];
  } catch {
    return [];
  }
};

/** Trang sản phẩm active — GET /api/products */
export const fetchProductsPage = async (page = 0, size = 10) => {
  const res = await api.get<ApiResponse<Page<ProductResponse>>>("/products", {
    params: { page, size },
  });
  return unwrapData(res);
};

/** Alias — một số module có thể đã import tên cũ */
export const fetchAllProducts = fetchProductsPage;

/** GET /api/products/best-sellers — chỉ lấy mảng (vd. home) */
export const fetchBestSellers = async (page = 0, size = 8) => {
  const pageData = await fetchBestSellersPage(page, size);
  return pageData?.content ?? [];
};

/** GET /api/products/best-sellers — đủ metadata phân trang */
export const fetchBestSellersPage = async (page = 0, size = 10) => {
  const res = await api.get<ApiResponse<Page<ProductResponse>>>(
    "/products/best-sellers",
    { params: { page, size } }
  );
  return unwrapData(res);
};

/** GET /api/products/featured */
export const fetchFeaturedProducts = async (page = 0, size = 8) => {
  const res = await api.get<ApiResponse<Page<ProductResponse>>>(
    "/products/featured",
    { params: { page, size } }
  );
  const pageData = unwrapData(res);
  return pageData?.content ?? [];
};

/**
 * Hàng mới — GET /api/products/search
 * sort_by phải là `importdate` (backend so sánh sau toLowerCase).
 */
export const fetchNewArrivals = async (page = 0, size = 8) => {
  const res = await api.get<ApiResponse<Page<ProductResponse>>>(
    "/products/search",
    {
      params: {
        sort_by: "importdate",
        sort_dir: "desc",
        page,
        size,
      },
    }
  );
  const pageData = unwrapData(res);
  return pageData?.content ?? [];
};

/** GET /api/products/search — đầy đủ tham số snake_case */
export const searchProducts = async (params: ProductSearchParams) => {
  const res = await api.get<ApiResponse<Page<ProductResponse>>>(
    "/products/search",
    { params }
  );
  return unwrapData(res);
};

/** GET /api/products/{id} */
export const fetchProductDetail = async (
  productId: number
): Promise<ProductResponse | null> => {
  const res = await api.get<ApiResponse<ProductResponse>>(
    `/products/${productId}`
  );
  return unwrapData(res);
};

/** GET /api/products/sku/{sku} */
export const fetchProductBySku = async (sku: string) => {
  const res = await api.get<ApiResponse<ProductResponse>>(
    `/products/sku/${encodeURIComponent(sku)}`
  );
  return unwrapData(res);
};

/** GET /api/products/product-type/{productTypeId} */
export const fetchProductsByProductType = async (
  productTypeId: number,
  page = 0,
  size = 10
) => {
  const res = await api.get<ApiResponse<Page<ProductResponse>>>(
    `/products/product-type/${productTypeId}`,
    { params: { page, size } }
  );
  return unwrapData(res);
};

/** GET /api/products/producer/{producerId} */
export const fetchProductsByProducer = async (
  producerId: number,
  page = 0,
  size = 10
) => {
  const res = await api.get<ApiResponse<Page<ProductResponse>>>(
    `/products/producer/${producerId}`,
    { params: { page, size } }
  );
  return unwrapData(res);
};

/** GET /api/products/brands */
export const fetchBrands = async (): Promise<string[]> => {
  const res = await api.get<ApiResponse<string[]>>("/products/brands");
  const data = unwrapData(res);
  return data ?? [];
};

/** GET /api/products/recommendations?userId= */
export const fetchRecommendations = async (userId: number) => {
  const res = await api.get<ApiResponse<ProductResponse[]>>(
    "/products/recommendations",
    { params: { userId } }
  );
  return unwrapData(res) ?? [];
};
