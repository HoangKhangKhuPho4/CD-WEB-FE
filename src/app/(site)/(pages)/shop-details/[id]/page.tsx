import React from "react";
import ShopDetails from "@/components/ShopDetails";
import type { Metadata } from "next";

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  return {
    title: `Sản phẩm #${id} | Bảo Khang Gadget`,
    description: "Chi tiết sản phẩm",
  };
}

export default async function ShopDetailsByIdPage() {
  return (
    <main>
      <ShopDetails />
    </main>
  );
}
