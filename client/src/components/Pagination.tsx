import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";

interface PaginationProps {
  page: number;
  totalPages: number;
  total: number;
  onPageChange: (p: number) => void;
  PAGE_SIZE: number;
}

export function Pagination({ page, totalPages, total, onPageChange, PAGE_SIZE }: PaginationProps) {
  // Always show pagination if there's data, regardless of totalPages
  if (total === 0) return null;

  const pages: (number | "…")[] = [];
  if (totalPages <= 3) {
    for (let i = 1; i <= totalPages; i++) pages.push(i);
  } else {
    const start = Math.max(1, Math.min(page - 1, totalPages - 2));
    const end = Math.min(totalPages, start + 2);
    if (start > 1) pages.push("…");
    for (let i = start; i <= end; i++) pages.push(i);
    if (end < totalPages) pages.push("…");
  }

  const from = total === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const to = Math.min(page * PAGE_SIZE, total);

  return (
    <div className="flex items-center justify-center sm:justify-between border-t border-gray-100 my-2">
      <p className="text-sm text-gray-500 sm:block hidden">
        Showing{" "}
        <span className="font-medium text-gray-700">{from} to {to}</span> of{" "}
        <span className="font-medium text-gray-700">{total}</span>
      </p>
      <div className="flex items-center gap-1">
        {/* First page button */}
        <button
          disabled={page === 1}
          onClick={() => onPageChange(1)}
          className="px-2.5 py-1.5 text-sm rounded-lg border border-gray-200 text-gray-800 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronsLeft size={20} />
        </button>

        <button
          disabled={page === 1}
          onClick={() => onPageChange(page - 1)}
          className="px-2.5 py-1.5 text-sm rounded-lg border border-gray-200 text-gray-800 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronLeft size={20} />
        </button>

        {pages.map((p, i) =>
          p === "…" ? (
            <span key={`ellipsis-${i}`} className="w-8 text-center text-gray-800 text-sm select-none">
              …
            </span>
          ) : (
            <button
              key={p}
              onClick={() => onPageChange(p as number)}
              className={`w-8 h-8 text-sm rounded-lg transition-colors ${p === page
                ? "bg-blue-600 text-white font-semibold"
                : "border border-gray-200 text-gray-800 hover:bg-gray-50"
                }`}
            >
              {p}
            </button>
          )
        )}

        <button
          disabled={page === totalPages}
          onClick={() => onPageChange(page + 1)}
          className="px-2.5 py-1.5 text-sm rounded-lg border border-gray-200 text-gray-800 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronRight size={20} />
        </button>

        {/* Last page button */}
        <button
          disabled={page === totalPages}
          onClick={() => onPageChange(totalPages)}
          className="px-2.5 py-1.5 text-sm rounded-lg border border-gray-200 text-gray-800 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronsRight size={20} />
        </button>
      </div>
    </div>
  );
}