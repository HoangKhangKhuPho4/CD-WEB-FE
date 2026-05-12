"use client";

import { useState, useEffect } from "react";
import RangeSlider from "react-range-slider-input";
import "react-range-slider-input/dist/style.css";

const DEFAULT_MAX = 100_000_000;

type PriceDropdownProps = {
  /** Đã áp dụng lên API (null = không lọc giá) */
  appliedMin: number | null;
  appliedMax: number | null;
  sliderMax?: number;
  onApply: (min: number | null, max: number | null) => void;
};

const PriceDropdown = ({
  appliedMin,
  appliedMax,
  sliderMax = DEFAULT_MAX,
  onApply,
}: PriceDropdownProps) => {
  const [toggleDropdown, setToggleDropdown] = useState(true);
  const [local, setLocal] = useState<[number, number]>([
    appliedMin ?? 0,
    appliedMax ?? sliderMax,
  ]);

  useEffect(() => {
    setLocal([appliedMin ?? 0, appliedMax ?? sliderMax]);
  }, [appliedMin, appliedMax, sliderMax]);

  const [from, to] = local;

  const handleApply = () => {
    const lo = Math.min(from, to);
    const hi = Math.max(from, to);
    if (lo <= 0 && hi >= sliderMax) {
      onApply(null, null);
    } else {
      onApply(lo > 0 ? lo : null, hi < sliderMax ? hi : null);
    }
  };

  return (
    <div className="bg-white shadow-1 rounded-lg">
      <div
        onClick={() => setToggleDropdown(!toggleDropdown)}
        className="cursor-pointer flex items-center justify-between py-3 pl-6 pr-5.5"
      >
        <p className="text-dark">Khoảng giá</p>
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

      <div className={`p-6 ${toggleDropdown ? "block" : "hidden"}`}>
        <RangeSlider
          min={0}
          max={sliderMax}
          step={100_000}
          value={local}
          onInput={(value: number[]) => {
            setLocal([Math.floor(value[0]), Math.ceil(value[1])] as [number, number]);
          }}
        />

        <div className="price-amount flex items-center justify-between pt-4 gap-2">
          <div className="text-custom-xs text-dark-4 flex rounded border border-gray-3/80 min-w-0">
            <span className="block border-r border-gray-3/80 px-2 py-1.5 shrink-0">₫</span>
            <span className="block px-2 py-1.5 truncate">{from.toLocaleString("vi-VN")}</span>
          </div>
          <div className="text-custom-xs text-dark-4 flex rounded border border-gray-3/80 min-w-0">
            <span className="block border-r border-gray-3/80 px-2 py-1.5 shrink-0">₫</span>
            <span className="block px-2 py-1.5 truncate">{to.toLocaleString("vi-VN")}</span>
          </div>
        </div>

        <button
          type="button"
          onClick={handleApply}
          className="mt-4 w-full rounded-lg bg-dark py-2.5 text-sm font-medium text-white hover:bg-blue"
        >
          Áp dụng giá
        </button>
      </div>
    </div>
  );
};

export default PriceDropdown;
