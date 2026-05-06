"use client"

import { ChevronLeft, ChevronRight } from "lucide-react"

interface PaginationProps {
  currentPage: number
  onPageChange: (page: number) => void
  totalPages?: number      // known total — shows numbered buttons
  hasNextPage?: boolean    // fallback when total unknown
  disabled?: boolean
}

export function Pagination({ currentPage, onPageChange, totalPages, hasNextPage, disabled }: PaginationProps) {
  const canGoPrev = currentPage > 1
  const canGoNext = totalPages ? currentPage < totalPages : (hasNextPage ?? false)

  if (!totalPages && !hasNextPage && currentPage === 1) return null

  const btnBase =
    "w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center rounded-xl border text-sm font-medium transition-all disabled:opacity-30"
  const btnDefault =
    "border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"
  const btnActive =
    "bg-[#eab308] border-[#eab308] text-white shadow-lg shadow-amber-500/20"

  const pages = buildPageList(currentPage, totalPages)

  return (
    <div className="p-4 md:p-6 border-t border-slate-100 dark:border-slate-800 flex justify-center items-center bg-white dark:bg-[#111318]">
      <div className="flex items-center gap-1 sm:gap-2 flex-wrap justify-center">

        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={!canGoPrev || disabled}
          className={`${btnBase} ${btnDefault}`}
        >
          <ChevronLeft size={18} />
        </button>

        {totalPages ? (
          pages.map((entry, i) =>
            entry === "…" ? (
              <span key={`ellipsis-${i}`} className="px-1 text-slate-400 select-none">…</span>
            ) : (
              <button
                key={entry}
                onClick={() => onPageChange(entry as number)}
                disabled={disabled}
                className={`${btnBase} ${currentPage === entry ? btnActive : btnDefault}`}
              >
                {entry}
              </button>
            )
          )
        ) : (
          <span className="px-3 py-2 text-sm font-medium text-slate-500 dark:text-slate-400 select-none">
            Page {currentPage}
          </span>
        )}

        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={!canGoNext || disabled}
          className={`${btnBase} ${btnDefault}`}
        >
          <ChevronRight size={18} />
        </button>

      </div>
    </div>
  )
}

function buildPageList(current: number, total?: number): (number | "…")[] {
  if (!total) return []
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1)

  const pages: (number | "…")[] = []

  pages.push(1)
  if (current > 3) pages.push("…")

  const start = Math.max(2, current - 1)
  const end = Math.min(total - 1, current + 1)
  for (let p = start; p <= end; p++) pages.push(p)

  if (current < total - 2) pages.push("…")
  pages.push(total)

  return pages
}