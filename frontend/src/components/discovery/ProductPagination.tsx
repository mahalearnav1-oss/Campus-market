import React from 'react';

interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

interface ProductPaginationProps {
  pagination: PaginationMeta;
  onPageChange: (newPage: number) => void;
}

export const ProductPagination: React.FC<ProductPaginationProps> = ({ pagination, onPageChange }) => {
  if (pagination.totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-between border-t border-[#D6C8B8] pt-8">
      <span className="font-sans text-xs text-[#8B7562]">
        Page <span className="text-[#3B2A22] font-semibold">{pagination.page}</span> of{' '}
        <span className="text-[#3B2A22] font-semibold">{pagination.totalPages}</span>
        <span className="ml-2 text-[#8B7562]">({pagination.total} results)</span>
      </span>

      <div className="flex items-center gap-3">
        <button
          disabled={!pagination.hasPreviousPage}
          onClick={() => onPageChange(pagination.page - 1)}
          className="btn-secondary text-xs !py-2 !px-4 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          ← Previous
        </button>

        <button
          disabled={!pagination.hasNextPage}
          onClick={() => onPageChange(pagination.page + 1)}
          className="btn-secondary text-xs !py-2 !px-4 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Next →
        </button>
      </div>
    </div>
  );
};
