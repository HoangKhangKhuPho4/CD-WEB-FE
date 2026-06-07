"use client";

import { ProductsProvider } from "@/components/Admin/Products/productsStore";
import ProductForm from "@/components/Admin/Products/ProductForm";

export default function AdminNewProductPage() {
  return (
    <ProductsProvider variant="form">
      <ProductForm mode="create" />
    </ProductsProvider>
  );
}

