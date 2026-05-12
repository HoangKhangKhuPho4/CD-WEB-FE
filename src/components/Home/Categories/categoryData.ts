const data = [
  {
    title: "Ti vi",
    id: 1,
    img: "/images/categories/categories-01.png",
  },
  {
    title: "Máy tính xách tay & PC",
    id: 2,
    img: "/images/categories/categories-02.png",
  },
  {
    title: "Điện thoại & Máy tính bảng",
    id: 3,
    img: "/images/categories/categories-03.png",
  },
  {
    title: "Trò chơi & Video",
    id: 4,
    img: "/images/categories/categories-04.png",
  },
  {
    title: "Thiết bị gia dụng",
    id: 5,
    img: "/images/categories/categories-05.png",
  },
  {
    title: "Sức khỏe & Thể thao",
    id: 6,
    img: "/images/categories/categories-06.png",
  },
  {
    title: "Đồng hồ",
    id: 7,
    img: "/images/categories/categories-07.png",
  },
  {
    title: "Ti vi",
    id: 8,
    img: "/images/categories/categories-04.png",
  },
];

/** Cùng `id` với `product_type_id` backend — bỏ trùng id khi build bộ lọc shop. */
export function getUniqueCategoryFilterRows(): { id: number; name: string }[] {
  const seen = new Set<number>();
  return data
    .filter((c) => {
      if (seen.has(c.id)) return false;
      seen.add(c.id);
      return true;
    })
    .map((c) => ({ id: c.id, name: c.title }));
}

export default data;
