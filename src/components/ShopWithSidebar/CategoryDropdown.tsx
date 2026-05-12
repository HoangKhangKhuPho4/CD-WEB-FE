"use client";

import { useState } from "react";

export type ShopCategoryFilterRow = { id: number; name: string };

type CategoryItemProps = {
  category: ShopCategoryFilterRow;
  selected: boolean;
  onToggle: (id: number) => void;
};

const CategoryItem = ({ category, selected, onToggle }: CategoryItemProps) => {
  return (
    <button
      type="button"
      className={`${
        selected ? "text-blue" : ""
      } group flex w-full items-center justify-between text-left ease-out duration-200 hover:text-blue`}
      onClick={() => onToggle(category.id)}
    >
      <div className="flex min-w-0 flex-1 items-center gap-2">
        <div
          className={`flex h-4 w-4 shrink-0 cursor-pointer items-center justify-center rounded border ${
            selected ? "border-blue bg-blue" : "border-gray-3 bg-white"
          }`}
        >
          <svg
            className={selected ? "block" : "hidden"}
            width="10"
            height="10"
            viewBox="0 0 10 10"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M8.33317 2.5L3.74984 7.08333L1.6665 5"
              stroke="white"
              strokeWidth="1.94437"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>

        <span className="truncate">{category.name}</span>
      </div>
    </button>
  );
};

type CategoryDropdownProps = {
  categories: ShopCategoryFilterRow[];
  selectedId: number | null;
  onChange: (id: number | null) => void;
};

const CategoryDropdown = ({ categories, selectedId, onChange }: CategoryDropdownProps) => {
  const [toggleDropdown, setToggleDropdown] = useState(true);

  const handleToggle = (id: number) => {
    if (selectedId === id) onChange(null);
    else onChange(id);
  };

  return (
    <div className="bg-white shadow-1 rounded-lg">
      <div
        onClick={(e) => {
          e.preventDefault();
          setToggleDropdown(!toggleDropdown);
        }}
        className={`cursor-pointer flex items-center justify-between py-3 pl-6 pr-5.5 ${
          toggleDropdown ? "shadow-filter" : ""
        }`}
      >
        <p className="text-dark">Danh mục</p>
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

      <div className={`flex-col gap-3 py-6 pl-6 pr-5.5 ${toggleDropdown ? "flex" : "hidden"}`}>
        {categories.length === 0 ? (
          <p className="text-sm text-dark-4">Chưa có danh mục hoặc API chưa phản hồi.</p>
        ) : null}
        {categories.map((category) => (
          <CategoryItem
            key={category.id}
            category={category}
            selected={selectedId === category.id}
            onToggle={handleToggle}
          />
        ))}
      </div>
    </div>
  );
};

export default CategoryDropdown;
