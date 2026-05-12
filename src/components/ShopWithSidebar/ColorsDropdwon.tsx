"use client";

import React, { useState } from "react";

/** Giá trị `color` gửi GET /api/products/search — chỉnh nếu BE dùng mã khác */
const COLOR_OPTIONS: { value: string; label: string; dot: string }[] = [
  { value: "red", label: "Đỏ", dot: "#ef4444" },
  { value: "blue", label: "Xanh dương", dot: "#3b82f6" },
  { value: "orange", label: "Cam", dot: "#f97316" },
  { value: "pink", label: "Hồng", dot: "#ec4899" },
  { value: "purple", label: "Tím", dot: "#a855f7" },
  { value: "black", label: "Đen", dot: "#111827" },
  { value: "white", label: "Trắng", dot: "#e5e7eb" },
];

type ColorsDropdownProps = {
  selected: string | null;
  onChange: (color: string | null) => void;
};

const ColorsDropdwon = ({ selected, onChange }: ColorsDropdownProps) => {
  const [toggleDropdown, setToggleDropdown] = useState(true);

  return (
    <div className="bg-white shadow-1 rounded-lg">
      <div
        onClick={() => setToggleDropdown(!toggleDropdown)}
        className={`cursor-pointer flex items-center justify-between py-3 pl-6 pr-5.5 ${
          toggleDropdown ? "shadow-filter" : ""
        }`}
      >
        <p className="text-dark">Màu sắc</p>
        <span
          className={`text-dark ease-out duration-200 ${toggleDropdown ? "rotate-180" : ""}`}
          aria-hidden
        >
          <svg className="fill-current" width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M4.43057 8.51192C4.70014 8.19743 5.17361 8.161 5.48811 8.43057L12 14.0122L18.5119 8.43057C18.8264 8.16101 19.2999 8.19743 19.5695 8.51192C19.839 8.82642 19.8026 9.29989 19.4881 9.56946L12.4881 15.5695C12.2072 15.8102 11.7928 15.8102 11.5119 15.5695L4.51192 9.56946C4.19743 9.29989 4.161 8.82641 4.43057 8.51192Z"
              fill=""
            />
          </svg>
        </span>
      </div>

      <div className={`flex flex-wrap gap-3 p-6 ${toggleDropdown ? "flex" : "hidden"}`}>
        <button
          type="button"
          onClick={() => onChange(null)}
          className={`rounded-full border px-3 py-1 text-xs ${
            selected == null ? "border-blue bg-blue/10 text-blue" : "border-gray-3 text-dark-4"
          }`}
        >
          Tất cả
        </button>
        {COLOR_OPTIONS.map((c) => (
          <button
            key={c.value}
            type="button"
            onClick={() => onChange(selected === c.value ? null : c.value)}
            className={`flex items-center gap-2 rounded-full border px-3 py-1 text-xs ${
              selected === c.value ? "border-blue bg-blue/10" : "border-gray-3"
            }`}
          >
            <span className="h-3 w-3 rounded-full border border-gray-3" style={{ backgroundColor: c.dot }} />
            {c.label}
          </button>
        ))}
      </div>
    </div>
  );
};

export default ColorsDropdwon;
