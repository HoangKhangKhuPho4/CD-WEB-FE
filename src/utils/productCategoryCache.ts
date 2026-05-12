import type { ProductTypeDto } from "@/types/product-api";
import { fetchProductTypes } from "@/utils/productApi";

export type ProductCategoryRow = { id: number; name: string };

function productTypeRowIsActive(t: ProductTypeDto): boolean {
  if (typeof t.isActive === "boolean") return t.isActive;
  if (typeof t.is_active === "number") return t.is_active === 1;
  return true;
}

function sortProductTypes(a: ProductTypeDto, b: ProductTypeDto): number {
  const ao = a.display_order ?? a.displayOrder ?? a.id;
  const bo = b.display_order ?? b.displayOrder ?? b.id;
  return ao - bo;
}

function mapTypesToRows(types: ProductTypeDto[]): ProductCategoryRow[] {
  const active = types.filter(productTypeRowIsActive);
  const source = active.length > 0 ? active : types;
  return source.sort(sortProductTypes).map((t) => ({ id: t.id, name: t.name }));
}

let resolvedRows: ProductCategoryRow[] | null = null;
let inFlight: Promise<ProductCategoryRow[]> | null = null;

/**
 * Danh mục từ GET /api/product-types — cache theo phiên, gộp request trùng (Header + Shop).
 */
export async function getProductCategoryRows(): Promise<ProductCategoryRow[]> {
  if (resolvedRows) return resolvedRows;
  if (inFlight) return inFlight;
  inFlight = fetchProductTypes()
    .then((types) => {
      const rows = mapTypesToRows(types);
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
