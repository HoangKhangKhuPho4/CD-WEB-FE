import type { CategoryDto, ProductTypeDto } from "@/types/product-api";
import { fetchCategories } from "@/utils/productApi";

export type ProductCategoryRow = { id: number; name: string };

function categoryIsActive(c: CategoryDto): boolean {
  return c.isActive !== false;
}

function sortCategories(a: CategoryDto, b: CategoryDto): number {
  const ao = a.displayOrder ?? a.id;
  const bo = b.displayOrder ?? b.id;
  return ao - bo;
}

function mapToRows(categories: CategoryDto[]): ProductCategoryRow[] {
  const active = categories.filter(categoryIsActive);
  const source = active.length > 0 ? active : categories;
  return source.sort(sortCategories).map((c) => ({ id: c.id, name: c.name }));
}

let resolvedRows: ProductCategoryRow[] | null = null;
let inFlight: Promise<ProductCategoryRow[]> | null = null;

/**
 * Danh mục từ GET /api/categories/list — cache theo phiên (Header + Shop).
 */
export async function getProductCategoryRows(): Promise<ProductCategoryRow[]> {
  if (resolvedRows) return resolvedRows;
  if (inFlight) return inFlight;
  inFlight = fetchCategories()
    .then((categories) => {
      const rows = mapToRows(categories);
      resolvedRows = rows;
      return rows;
    })
    .catch(() => {
      resolvedRows = [];
      return [];
    })
    .finally(() => {
      inFlight = null;
    });
  return inFlight;
}

/** Xóa cache sau khi admin cập nhật danh mục (tùy chọn gọi từ admin). */
export function invalidateProductCategoryCache(): void {
  resolvedRows = null;
  inFlight = null;
}

/** @deprecated */
export type { ProductTypeDto };
