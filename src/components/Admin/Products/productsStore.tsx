"use client";

import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

export type ProductStatus = "selling" | "stopped" | "out_of_stock";

export interface AdminProduct {
  id: string;
  name: string;
  description: string;
  sku: string;
  category: string;
  manufacturer: string;
  categoryId?: number;
  producerId?: number;
  price: number; // VND
  stock: number;
  status: ProductStatus;
  featured: boolean;
  createdAt: string; // dd/mm/yyyy
  imageUrl?: string;
}

export interface ProductFiltersState {
  query: string;
  category: string; // "" => all
  manufacturer: string; // "" => all
  status: "" | ProductStatus;
  featuredOnly: boolean;
}

type ProductsContextValue = {
  products: AdminProduct[];
  filters: ProductFiltersState;
  setFilters: React.Dispatch<React.SetStateAction<ProductFiltersState>>;
  perPage: number;
  currentPage: number;
  setCurrentPage: React.Dispatch<React.SetStateAction<number>>;
  filteredProducts: AdminProduct[];
  pagedProducts: AdminProduct[];
  stats: {
    total: number;
    selling: number;
    stopped: number;
    outOfStock: number;
  };
  createProduct: (input: Omit<AdminProduct, "id" | "createdAt">) => Promise<string>;
  updateProduct: (
    id: string,
    patch: Partial<Omit<AdminProduct, "id" | "createdAt">>
  ) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  toggleFeatured: (id: string) => Promise<void>;
  getById: (id: string) => AdminProduct | undefined;
  categories: string[];
  manufacturers: { value: string; label: string }[];
  categoryOptions: { id: number; name: string }[];
  producerOptions: { id: number; name: string; code?: string; label: string }[];
  loading: boolean;
  totalPages: number;
  totalElements: number;
  reload: () => Promise<void>;
};

import toast from "react-hot-toast";
import {
  adminCategoryApi,
  adminProducerApi,
  adminProductApi,
  type AdminProductListItem,
} from "@/utils/adminApi";

function todayDDMMYYYY() {
  const d = new Date();
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yyyy = d.getFullYear();
  return `${dd}/${mm}/${yyyy}`;
}

function mapApiProduct(p: AdminProductListItem): AdminProduct {
  const active = p.status === "ACTIVE";
  const stock = p.totalQuantity ?? 0;
  let status: ProductStatus = active ? "selling" : "stopped";
  if (stock === 0) status = "out_of_stock";
  return {
    id: String(p.id),
    name: p.name,
    description: "",
    sku: `SP-${p.id}`,
    category: p.productType?.name ?? "",
    manufacturer: p.producer?.name ?? "",
    categoryId: p.productType?.id,
    producerId: p.producer?.id,
    price: p.basePrice ?? 0,
    stock,
    status,
    featured: !!p.isFeatured,
    createdAt: p.createdAt ? new Date(p.createdAt).toLocaleDateString("vi-VN") : todayDDMMYYYY(),
    imageUrl: p.imageUrl,
  };
}

function normalize(s: string) {
  return s.trim().toLowerCase();
}

function matchesQuery(product: AdminProduct, q: string) {
  if (!q) return true;
  const nq = normalize(q);
  return (
    normalize(product.name).includes(nq) ||
    normalize(product.sku).includes(nq) ||
    normalize(product.description).includes(nq)
  );
}

function formatMoneyVND(amount: number) {
  try {
    return new Intl.NumberFormat("vi-VN").format(amount) + "đ";
  } catch {
    return `${amount}đ`;
  }
}

export function adminFormatMoneyVND(amount: number) {
  return formatMoneyVND(amount);
}

const ProductsContext = createContext<ProductsContextValue | null>(null);

export function ProductsProvider({
  children,
  variant = "list",
}: {
  children: React.ReactNode;
  /** form: trang thêm/sửa — chỉ tải danh mục & hãng, bỏ list + stats */
  variant?: "list" | "form";
}) {
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [loading, setLoading] = useState(variant === "list");
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);
  const [apiStats, setApiStats] = useState({
    total: 0,
    selling: 0,
    stopped: 0,
    outOfStock: 0,
  });
  const [categoryOptions, setCategoryOptions] = useState<{ id: number; name: string }[]>([]);
  const [producerOptions, setProducerOptions] = useState<
    { id: number; name: string; code?: string; label: string }[]
  >([]);
  const [metaReady, setMetaReady] = useState(variant === "form");
  const [filters, setFilters] = useState<ProductFiltersState>({
    query: "",
    category: "",
    manufacturer: "",
    status: "",
    featuredOnly: false,
  });
  const [currentPage, setCurrentPage] = useState(1);
  const perPage = 10;

  const loadMeta = useCallback(async () => {
    try {
      const [cRes, pRes] = await Promise.all([
        adminCategoryApi.listAll(),
        adminProducerApi.listAll(),
      ]);
      if (cRes.data.success) {
        setCategoryOptions(cRes.data.data.map((c) => ({ id: c.id, name: c.name })));
      }
      if (pRes.data.success) {
        setProducerOptions(
          pRes.data.data.map((p) => ({
            id: p.id,
            name: p.name,
            code: p.code,
            label: p.code ? `${p.name} (${p.code})` : p.name,
          }))
        );
      }
    } catch {
      // ignore
    } finally {
      setMetaReady(true);
    }
  }, []);

  const loadProducts = useCallback(async () => {
    setLoading(true);
    try {
      const cat = categoryOptions.find((c) => c.name === filters.category);
      const prod = producerOptions.find((p) => p.name === filters.manufacturer);
      const isActive =
        filters.status === "selling"
          ? true
          : filters.status === "stopped"
            ? false
            : undefined;
      const res = await adminProductApi.list({
        page: currentPage - 1,
        size: perPage,
        keyword: filters.query || undefined,
        isActive,
        productTypeId: cat?.id,
        producerId: prod?.id,
      });
      if (res.data.success) {
        let list = res.data.data.content.map(mapApiProduct);
        if (filters.featuredOnly) list = list.filter((p) => p.featured);
        if (filters.status === "out_of_stock") list = list.filter((p) => p.stock === 0);
        setProducts(list);
        setTotalPages(Math.max(1, res.data.data.totalPages));
        setTotalElements(res.data.data.totalElements ?? list.length);
      }
    } catch {
      toast.error("Không tải được danh sách sản phẩm");
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, [categoryOptions, producerOptions, filters, currentPage, perPage]);

  const loadStats = useCallback(async () => {
    try {
      const res = await adminProductApi.stats();
      if (res.data.success) {
        const d = res.data.data;
        setApiStats({
          total: d.total ?? 0,
          selling: d.active ?? 0,
          stopped: d.inactive ?? 0,
          outOfStock: 0,
        });
      }
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    void loadMeta();
    if (variant === "list") {
      void loadStats();
    }
  }, [loadMeta, loadStats, variant]);

  useEffect(() => {
    if (variant === "list" && metaReady) {
      void loadProducts();
    }
  }, [loadProducts, variant, metaReady]);

  useEffect(() => {
    setCurrentPage(1);
  }, [filters.query, filters.category, filters.manufacturer, filters.status, filters.featuredOnly]);

  const categories = useMemo(
    () => categoryOptions.map((c) => c.name),
    [categoryOptions]
  );
  const manufacturers = useMemo(
    () => producerOptions.map((p) => ({ value: p.name, label: p.label })),
    [producerOptions]
  );

  const filteredProducts = products;
  const pagedProducts = products;

  const stats = useMemo(() => {
    const pageOut = products.filter((p) => p.status === "out_of_stock").length;
    return {
      total: apiStats.total || totalElements,
      selling: apiStats.selling,
      stopped: apiStats.stopped,
      outOfStock: pageOut,
    };
  }, [products, apiStats, totalElements]);

  const getById = useCallback(
    (id: string) => products.find((p) => p.id === id),
    [products]
  );

  const createProduct = useCallback(
    async (input: Omit<AdminProduct, "id" | "createdAt">) => {
      const cat =
        categoryOptions.find((c) => c.name === input.category) ??
        categoryOptions.find((c) => c.id === input.categoryId);
      const prod =
        producerOptions.find((p) => p.name === input.manufacturer) ??
        producerOptions.find((p) => p.id === input.producerId);
      if (!cat || !prod) throw new Error("Chọn danh mục và nhà sản xuất hợp lệ");
      const res = await adminProductApi.create({
        name: input.name,
        price: input.price,
        quantity: input.stock,
        detail: input.description,
        status: input.status === "stopped" ? "INACTIVE" : "ACTIVE",
        productTypeId: cat.id,
        producerId: prod.id,
        isFeatured: input.featured,
      });
      if (!res.data.success) throw new Error(res.data.message);
      if (variant === "list") {
        await loadProducts();
        void loadStats();
      }
      return String(res.data.data.id);
    },
    [categoryOptions, producerOptions, loadProducts, loadStats, variant]
  );

  const updateProduct = useCallback(
    async (id: string, patch: Partial<Omit<AdminProduct, "id" | "createdAt">>) => {
      const numId = Number(id);
      const body: Record<string, unknown> = {};
      if (patch.name) body.name = patch.name;
      if (patch.price != null) body.price = patch.price;
      if (patch.stock != null) body.quantity = patch.stock;
      if (patch.description != null) body.detail = patch.description;
      if (patch.status)
        body.status = patch.status === "stopped" ? "INACTIVE" : "ACTIVE";
      if (patch.featured != null) body.isFeatured = patch.featured;
      if (patch.category) {
        const cat = categoryOptions.find((c) => c.name === patch.category);
        if (cat) body.productTypeId = cat.id;
      }
      if (patch.manufacturer) {
        const pr = producerOptions.find((p) => p.name === patch.manufacturer);
        if (pr) body.producerId = pr.id;
      }
      await adminProductApi.update(numId, body);
      if (variant === "list") {
        await loadProducts();
      }
    },
    [categoryOptions, producerOptions, loadProducts, variant]
  );

  const deleteProduct = useCallback(
    async (id: string) => {
      await adminProductApi.remove(Number(id));
      await loadProducts();
    },
    [loadProducts]
  );

  const toggleFeatured = useCallback(
    async (id: string) => {
      const p = products.find((x) => x.id === id);
      if (!p) return;
      await adminProductApi.update(Number(id), { isFeatured: !p.featured });
      await loadProducts();
    },
    [products, loadProducts]
  );

  const value: ProductsContextValue = useMemo(
    () => ({
      products,
      filters,
      setFilters,
      perPage,
      currentPage,
      setCurrentPage,
      filteredProducts,
      pagedProducts,
      stats,
      createProduct,
      updateProduct,
      deleteProduct,
      toggleFeatured,
      getById,
      categories,
      manufacturers,
      categoryOptions,
      producerOptions,
      loading,
      totalPages,
      totalElements,
      reload: loadProducts,
    }),
    [
      products,
      filters,
      perPage,
      currentPage,
      filteredProducts,
      pagedProducts,
      stats,
      createProduct,
      updateProduct,
      deleteProduct,
      toggleFeatured,
      getById,
      categories,
      manufacturers,
      categoryOptions,
      producerOptions,
      loading,
      totalPages,
      totalElements,
      loadProducts,
    ]
  );

  return <ProductsContext.Provider value={value}>{children}</ProductsContext.Provider>;
}

export function useProducts() {
  const ctx = useContext(ProductsContext);
  if (!ctx) throw new Error("useProducts must be used within ProductsProvider");
  return ctx;
}

