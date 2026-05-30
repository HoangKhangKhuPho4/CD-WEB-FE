import { ReactNode } from "react";

export default function PageHeader({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
      <div>
        <h1 className="text-2xl font-bold text-dark">{title}</h1>
        {subtitle && <p className="text-sm text-[#6C6F93] mt-1">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}
