import React from 'react';
import { FilterState } from './FilterPanel';
import { CategoryData } from '../../pages/MarketplacePage';

interface ActiveFilterChipsProps {
  searchQuery?: string;
  filters: FilterState;
  categories: CategoryData[];
  onRemoveSearch: () => void;
  onRemoveCategory: () => void;
  onRemovePrice: () => void;
  onRemoveCondition: (cond: string) => void;
  onRemoveSellerType: () => void;
  onClearAll: () => void;
}

const Chip: React.FC<{ label: string; onRemove: () => void }> = ({ label, onRemove }) => (
  <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[#D6C8B8] text-[#3B2A22] font-sans text-[10px] tracking-[0.08em] uppercase bg-[#E7DED1] shadow-sm">
    {label}
    <button
      onClick={onRemove}
      className="text-[#8B7562] hover:text-[#3B2A22] transition-colors leading-none font-bold text-xs"
      aria-label={`Remove ${label} filter`}
    >
      ×
    </button>
  </span>
);

export const ActiveFilterChips: React.FC<ActiveFilterChipsProps> = ({
  searchQuery,
  filters,
  categories,
  onRemoveSearch,
  onRemoveCategory,
  onRemovePrice,
  onRemoveCondition,
  onRemoveSellerType,
  onClearAll,
}) => {
  const categoryName = categories.find((c) => c.id === filters.categoryId || c.slug === filters.categoryId)?.name;
  const hasPrice = filters.minPrice || filters.maxPrice;
  const hasActiveFilters =
    searchQuery || filters.categoryId || hasPrice || (filters.conditions && filters.conditions.length > 0) || filters.sellerType;

  if (!hasActiveFilters) return null;

  return (
    <div className="flex flex-wrap items-center gap-2 mb-6 pb-4 border-b border-[#D6C8B8]">
      <span className="font-sans text-[9px] tracking-[0.2em] uppercase font-semibold text-[#8B7562] mr-1">Active:</span>

      {searchQuery && (
        <Chip label={`"${searchQuery}"`} onRemove={onRemoveSearch} />
      )}

      {categoryName && (
        <Chip label={categoryName} onRemove={onRemoveCategory} />
      )}

      {hasPrice && (
        <Chip
          label={`₹${filters.minPrice || '0'} - ₹${filters.maxPrice || '∞'}`}
          onRemove={onRemovePrice}
        />
      )}

      {filters.conditions &&
        filters.conditions.map((cond) => (
          <Chip key={cond} label={cond.replace('_', ' ')} onRemove={() => onRemoveCondition(cond)} />
        ))}

      {filters.sellerType && (
        <Chip label={filters.sellerType.replace('_', ' ')} onRemove={onRemoveSellerType} />
      )}

      <button
        onClick={onClearAll}
        className="font-sans text-[10px] tracking-[0.1em] uppercase font-semibold text-[#8B7562] hover:text-[#3B2A22] transition-colors ml-2"
      >
        Clear All
      </button>
    </div>
  );
};
