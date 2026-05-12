"use client";

import { useCallback, useEffect, useState } from "react";
import type { Product } from "@/types/product";
import type { ProductSearchParams } from "@/types/product-api";
import { mapBackendProductToFrontend } from "@/utils/productMapper";
import { fetchBestSellersPage, searchProducts } from "@/utils/productApi";

/** Khớp `CustomSelect` mặc định: 0 = mới nhất, 1 = bán chạy, 2 = cũ nhất */
export type ShopSortValue = "0" | "1" | "2";

/** Tham số lọc khớp GET /api/products/search */
export type ShopCatalogFilters = {
  productTypeId: number | null;
  producerId: number | null;
  /** Khi không có `producer_id`, có thể lọc theo tên thương hiệu (chuỗi từ /products/brands) */
  keyword: string | null;
  minPrice: number | null;
  maxPrice: number | null;
  color: string | null;
};

export const EMPTY_SHOP_FILTERS: ShopCatalogFilters = {
  productTypeId: null,
  producerId: null,
  keyword: null,
  minPrice: null,
  maxPrice: null,
  color: null,
};

const PAGE_SIZE = 12;

function usesSearchApi(f: ShopCatalogFilters, sortValue: ShopSortValue): boolean {
  if (f.productTypeId != null) return true;
  if (f.producerId != null) return true;
  if (f.keyword?.trim()) return true;
  if (f.minPrice != null || f.maxPrice != null) return true;
  if (f.color?.trim()) return true;
  if (sortValue === "0" || sortValue === "2") return true;
  return false;
}

function buildSearchParams(
  sortValue: ShopSortValue,
  filters: ShopCatalogFilters,
  page: number
): ProductSearchParams {
  const p: ProductSearchParams = { page, size: PAGE_SIZE };

  if (filters.productTypeId != null) p.product_type_id = filters.productTypeId;
  if (filters.producerId != null) p.producer_id = filters.producerId;
  const kw = filters.keyword?.trim();
  if (kw) p.keyword = kw;
  if (filters.minPrice != null) p.min_price = filters.minPrice;
  if (filters.maxPrice != null) p.max_price = filters.maxPrice;
  const col = filters.color?.trim();
  if (col) p.color = col;

  if (sortValue === "0") {
    p.sort_by = "importdate";
    p.sort_dir = "desc";
  } else if (sortValue === "2") {
    p.sort_by = "importdate";
    p.sort_dir = "asc";
  } else {
    p.sort_by = "price";
    p.sort_dir = "desc";
  }

  return p;
}

export function useShopCatalog(sortValue: ShopSortValue, filters: ShopCatalogFilters = EMPTY_SHOP_FILTERS) {
  const [page, setPage] = useState(0);
  const [products, setProducts] = useState<Product[]>([]);
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const {
    productTypeId,
    producerId,
    keyword,
    minPrice,
    maxPrice,
    color,
  } = filters;

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      let pageData = null;

      const needSearch = usesSearchApi(filters, sortValue);

      if (sortValue === "1" && !needSearch) {
        pageData = await fetchBestSellersPage(page, PAGE_SIZE);
      } else {
        pageData = await searchProducts(buildSearchParams(sortValue, filters, page));
      }

      if (!pageData?.content) {
        setProducts([]);
        setTotalElements(pageData?.totalElements ?? 0);
        setTotalPages(pageData?.totalPages ?? 0);
        return;
      }

      setProducts(pageData.content.map(mapBackendProductToFrontend));
      setTotalElements(pageData.totalElements ?? 0);
      setTotalPages(pageData.totalPages ?? 0);
    } catch {
      setError("Không tải được danh sách sản phẩm. Kiểm tra kết nối API.");
      setProducts([]);
      setTotalElements(0);
      setTotalPages(0);
    } finally {
      setLoading(false);
    }
  }, [sortValue, page, productTypeId, producerId, keyword, minPrice, maxPrice, color]);

  useEffect(() => {
    void load();
  }, [load]);

  const from = totalElements === 0 ? 0 : page * PAGE_SIZE + 1;
  const to = Math.min((page + 1) * PAGE_SIZE, totalElements);

  return {
    products,
    page,
    setPage,
    totalElements,
    totalPages,
    loading,
    error,
    pageSize: PAGE_SIZE,
    rangeLabel: { from, to },
  };
}
