"use client";

import { ProductsProvider } from "@/components/Admin/Products/productsStore";
import ProductForm from "@/components/Admin/Products/ProductForm";

export default function AdminEditProductPage({
  params,
}: {
  params: { id: string };
}) {
  return (
    <ProductsProvider variant="form">
      <ProductForm mode="edit" productId={params.id} />
    </ProductsProvider>
  );
}

