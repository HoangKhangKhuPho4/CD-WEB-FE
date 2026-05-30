import { ButtonHTMLAttributes, ReactNode } from "react";

export default function PrimaryButton({
  children,
  className = "",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { children: ReactNode }) {
  return (
    <button
      type="button"
      className={`inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-[#3C50E0] text-white text-sm font-semibold rounded-lg hover:bg-[#1C3FB7] shadow-lg shadow-[#3C50E0]/25 transition-all disabled:opacity-60 ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
