import React from "react";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

type PageItem = number | "ellipsis-start" | "ellipsis-end";

export const Pagination: React.FC<PaginationProps> = ({ currentPage, totalPages, onPageChange }) => {
  const safeTotalPages = Math.max(1, Math.floor(Number(totalPages) || 1));
  const safeCurrentPage = Math.min(
    Math.max(1, Math.floor(Number(currentPage) || 1)),
    safeTotalPages
  );

  if (safeTotalPages <= 1) return null;

  const getPageNumbers = (): PageItem[] => {
    const pages: PageItem[] = [];
    const maxVisiblePages = 7;

    if (safeTotalPages <= maxVisiblePages) {
      for (let i = 1; i <= safeTotalPages; i++) {
        pages.push(i);
      }
    } else {
      if (safeCurrentPage <= 4) {
        pages.push(1, 2, 3, 4, 5, "ellipsis-end", safeTotalPages);
      } else if (safeCurrentPage >= safeTotalPages - 3) {
        pages.push(1, "ellipsis-start", safeTotalPages - 4, safeTotalPages - 3, safeTotalPages - 2, safeTotalPages - 1, safeTotalPages);
      } else {
        pages.push(1, "ellipsis-start", safeCurrentPage - 1, safeCurrentPage, safeCurrentPage + 1, "ellipsis-end", safeTotalPages);
      }
    }
    return pages;
  };

  const goToPage = (nextPage: number) => {
    const boundedPage = Math.min(Math.max(1, nextPage), safeTotalPages);
    if (boundedPage !== safeCurrentPage) onPageChange(boundedPage);
  };

  return (
    <nav className="flex w-full items-center justify-center gap-1.5" aria-label="Pagination">
      <button
        type="button"
        onClick={() => goToPage(safeCurrentPage - 1)}
        disabled={safeCurrentPage === 1}
        className="flex h-9 w-9 items-center justify-center rounded-button border border-border bg-surface text-text-secondary transition-colors hover:border-border-medium hover:bg-accent-bg hover:text-text-primary disabled:cursor-not-allowed disabled:border-border/50 disabled:bg-surface/60 disabled:text-text-muted/40"
        aria-label="Previous page"
      >
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
      </button>

      {getPageNumbers().map((page) => {
        if (typeof page !== "number") {
          return (
            <span key={page} className="flex h-9 w-5 items-center justify-center text-sm font-semibold text-text-muted" aria-hidden="true">
              …
            </span>
          );
        }

        const isCurrentPage = page === safeCurrentPage;
        return (
          <button
            key={page}
            type="button"
            onClick={() => goToPage(page)}
            aria-current={isCurrentPage ? "page" : undefined}
            aria-label={`Page ${page}`}
            className={`flex h-9 w-9 items-center justify-center rounded-button border font-sans text-xs font-semibold transition-all duration-200 ${
              isCurrentPage
                ? "border-primary bg-primary text-primary-text shadow-glow"
                : "border-border bg-surface text-text-secondary hover:border-border-medium hover:bg-accent-bg hover:text-text-primary"
            }`}
          >
            {page}
          </button>
        );
      })}

      <button
        type="button"
        onClick={() => goToPage(safeCurrentPage + 1)}
        disabled={safeCurrentPage === safeTotalPages}
        className="flex h-9 w-9 items-center justify-center rounded-button border border-border bg-surface text-text-secondary transition-colors hover:border-border-medium hover:bg-accent-bg hover:text-text-primary disabled:cursor-not-allowed disabled:border-border/50 disabled:bg-surface/60 disabled:text-text-muted/40"
        aria-label="Next page"
      >
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
        </svg>
      </button>
    </nav>
  );
};
