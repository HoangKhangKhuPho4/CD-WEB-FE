import { Product } from "@/types/product";
import type { ProductResponse } from "@/types/product-api";

const FALLBACK_IMG = "/images/404.svg";

/** Origin backend (không kèm /api) — để ghép với linkImage dạng /img/... */
function getApiOrigin(): string {
  const raw =
    (typeof process !== "undefined" &&
      process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, "")) ||
    "http://localhost:8080";
  return raw;
}

/**
 * Chuẩn hóa linkImage từ API.
 * URL `/img/{id}` luôn trỏ về NEXT_PUBLIC_API_BASE_URL — tránh ngrok cũ/hết hạn trong JSON.
 */
export function resolveBackendImageUrl(
  linkImage: string | null | undefined
): string | null {
  const u = typeof linkImage === "string" ? linkImage.trim() : "";
  if (!u) return null;

  const imgIdMatch = u.match(/\/img\/(\d+)\/?(?:\?.*)?$/);
  if (imgIdMatch) {
    return `${getApiOrigin()}/img/${imgIdMatch[1]}`;
  }

  if (/^https?:\/\//i.test(u)) return u;
  if (u.startsWith("//")) {
    try {
      return new URL(u, `${getApiOrigin()}/`).href;
    } catch {
      return null;
    }
  }
  if (u.startsWith("/")) return `${getApiOrigin()}${u}`;
  return null;
}

function normalizeImageUrl(linkImage: string | null | undefined): string | null {
  return resolveBackendImageUrl(linkImage);
}

function collectImageUrls(images: ProductResponse["images"]): string[] {
  if (!images?.length) return [FALLBACK_IMG];
  const urls = images
    .map((img) => normalizeImageUrl(img.linkImage))
    .filter((url): url is string => Boolean(url));
  return urls.length > 0 ? urls : [FALLBACK_IMG];
}

export const mapBackendProductToFrontend = (
  backendProduct: ProductResponse
): Product => {
  const imageUrls = collectImageUrls(backendProduct.images ?? []);

  let discountedPrice = backendProduct.price;
  if (
    backendProduct.coupon &&
    typeof backendProduct.coupon.percentDiscount === "number"
  ) {
    discountedPrice =
      backendProduct.price *
      (1 - backendProduct.coupon.percentDiscount / 100);
  }

  return {
    id: backendProduct.id,
    title: backendProduct.name,
    price: backendProduct.price,
    discountedPrice,
    reviews: backendProduct.reviewCount ?? 0,
    detail: backendProduct.detail,
    couponPercent: backendProduct.coupon?.percentDiscount ?? null,
    producerName: backendProduct.producer?.name,
    productTypeName: backendProduct.productType?.name,
    imgs: {
      thumbnails: imageUrls,
      previews: imageUrls,
    },
    quantity: backendProduct.quantity ?? 1,
  } as Product;
};
