import React, { useState, useEffect } from 'react';
import { CategoryData } from '../../pages/MarketplacePage';

export interface FilterState {
  categoryId?: string;
  minPrice?: string;
  maxPrice?: string;
  conditions: string[];
  sellerType?: string;
}

interface FilterPanelProps {
  categories: CategoryData[];
  filters: FilterState;
  onApplyFilters: (newFilters: FilterState) => void;
  onClearFilters: () => void;
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
}

const CONDITION_OPTIONS = [
  { value: 'BRAND_NEW', label: 'Brand New' },
  { value: 'LIKE_NEW', label: 'Like New' },
  { value: 'GOOD', label: 'Good' },
  { value: 'FAIR', label: 'Fair' },
  { value: 'ACCEPTABLE', label: 'Acceptable' },
];

const FilterSection: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <div className="py-5 border-b border-[#D6C8B8] last:border-0">
    <h4 className="font-sans text-[10px] tracking-[0.2em] uppercase font-semibold text-[#8B7562] mb-4">{title}</h4>
    {children}
  </div>
);

export const FilterPanel: React.FC<FilterPanelProps> = ({
  categories,
  filters,
  onApplyFilters,
  onClearFilters,
  isMobileOpen = false,
  onCloseMobile,
}) => {
  const [localCategory, setLocalCategory] = useState(filters.categoryId || '');
  const [localMinPrice, setLocalMinPrice] = useState(filters.minPrice || '');
  const [localMaxPrice, setLocalMaxPrice] = useState(filters.maxPrice || '');
  const [localConditions, setLocalConditions] = useState<string[]>(filters.conditions || []);
  const [localSellerType, setLocalSellerType] = useState(filters.sellerType || '');

  useEffect(() => {
    setLocalCategory(filters.categoryId || '');
    setLocalMinPrice(filters.minPrice || '');
    setLocalMaxPrice(filters.maxPrice || '');
    setLocalConditions(filters.conditions || []);
    setLocalSellerType(filters.sellerType || '');
  }, [filters]);

  const toggleCondition = (cond: string) => {
    setLocalConditions((prev) =>
      prev.includes(cond) ? prev.filter((c) => c !== cond) : [...prev, cond]
    );
  };

  const handleApply = () => {
    onApplyFilters({
      categoryId: localCategory || undefined,
      minPrice: localMinPrice || undefined,
      maxPrice: localMaxPrice || undefined,
      conditions: localConditions,
      sellerType: localSellerType || undefined,
    });
    if (onCloseMobile) onCloseMobile();
  };

  const handleReset = () => {
    setLocalCategory('');
    setLocalMinPrice('');
    setLocalMaxPrice('');
    setLocalConditions([]);
    setLocalSellerType('');
    onClearFilters();
    if (onCloseMobile) onCloseMobile();
  };

  const content = (
    <div className="p-6 rounded-[32px] bg-[#EDE5D9] border border-[#D6C8B8] shadow-warm-subtle">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-[#D6C8B8] mb-1">
        <h3 className="font-heading font-medium text-lg text-[#3B2A22] tracking-wide">Filters</h3>
        <button
          onClick={handleReset}
          className="font-sans text-[10px] tracking-[0.1em] uppercase text-[#8B7562] hover:text-[#3B2A22] transition-colors"
        >
          Clear all
        </button>
      </div>

      {/* Category */}
      <FilterSection title="Category">
        <div className="space-y-1">
          <button
            onClick={() => setLocalCategory('')}
            className={`w-full text-left font-sans text-xs py-1.5 transition-colors ${!localCategory ? 'text-[#3B2A22] font-semibold' : 'text-[#6E5948] hover:text-[#3B2A22]'}`}
          >
            All Categories
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setLocalCategory(cat.id)}
              className={`w-full text-left font-sans text-xs py-1.5 transition-colors flex items-center justify-between group ${localCategory === cat.id ? 'text-[#3B2A22] font-semibold' : 'text-[#6E5948] hover:text-[#3B2A22]'}`}
            >
              {cat.name}
              {localCategory === cat.id && (
                <div className="w-1.5 h-1.5 rounded-full bg-[#C8A46A]" />
              )}
            </button>
          ))}
        </div>
      </FilterSection>

      {/* Price Range */}
      <FilterSection title="Price Range (₹)">
        <div className="flex items-center gap-3">
          <input
            type="number"
            min="0"
            placeholder="Min"
            value={localMinPrice}
            onChange={(e) => setLocalMinPrice(e.target.value)}
            className="w-full bg-[#E7DED1] border-b border-[#D6C8B8] text-[#3B2A22] text-xs font-sans py-1.5 px-2 focus:outline-none focus:border-[#C8A46A] transition-colors placeholder:text-[#8B7562] rounded-t"
          />
          <span className="text-[#8B7562] text-xs">–</span>
          <input
            type="number"
            min="0"
            placeholder="Max"
            value={localMaxPrice}
            onChange={(e) => setLocalMaxPrice(e.target.value)}
            className="w-full bg-[#E7DED1] border-b border-[#D6C8B8] text-[#3B2A22] text-xs font-sans py-1.5 px-2 focus:outline-none focus:border-[#C8A46A] transition-colors placeholder:text-[#8B7562] rounded-t"
          />
        </div>
      </FilterSection>

      {/* Condition */}
      <FilterSection title="Condition">
        <div className="space-y-2.5">
          {CONDITION_OPTIONS.map((opt) => (
            <label key={opt.value} className="flex items-center gap-3 cursor-pointer group">
              <div
                className={`w-4 h-4 rounded border flex items-center justify-center flex-shrink-0 transition-colors ${localConditions.includes(opt.value) ? 'bg-[#C8A46A] border-[#C8A46A]' : 'border-[#D6C8B8] group-hover:border-[#C8A46A]'}`}
                onClick={() => toggleCondition(opt.value)}
              >
                {localConditions.includes(opt.value) && (
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#F4EFE7" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                )}
              </div>
              <span
                className={`font-sans text-xs transition-colors cursor-pointer ${localConditions.includes(opt.value) ? 'text-[#3B2A22] font-semibold' : 'text-[#6E5948] group-hover:text-[#3B2A22]'}`}
                onClick={() => toggleCondition(opt.value)}
              >
                {opt.label}
              </span>
            </label>
          ))}
        </div>
      </FilterSection>

      {/* Seller Type */}
      <FilterSection title="Seller Type">
        <div className="space-y-2.5">
          {[
            { value: '', label: 'All Sellers' },
            { value: 'STUDENT', label: 'Student Sellers' },
            { value: 'COMMERCIAL_BOOKSTORE', label: 'Commercial Bookstores' },
          ].map((st) => (
            <label key={st.value} className="flex items-center gap-3 cursor-pointer group">
              <div
                className={`w-4 h-4 rounded-full border flex items-center justify-center flex-shrink-0 transition-colors ${localSellerType === st.value ? 'border-[#C8A46A] bg-[#C8A46A]/30' : 'border-[#D6C8B8] group-hover:border-[#C8A46A]'}`}
                onClick={() => setLocalSellerType(st.value)}
              >
                {localSellerType === st.value && (
                  <div className="w-2 h-2 rounded-full bg-[#C8A46A]" />
                )}
              </div>
              <span
                className={`font-sans text-xs transition-colors cursor-pointer ${localSellerType === st.value ? 'text-[#3B2A22] font-semibold' : 'text-[#6E5948] group-hover:text-[#3B2A22]'}`}
                onClick={() => setLocalSellerType(st.value)}
              >
                {st.label}
              </span>
            </label>
          ))}
        </div>
      </FilterSection>

      {/* Apply */}
      <div className="pt-4">
        <button
          onClick={handleApply}
          className="btn-primary w-full text-xs px-6 py-3"
        >
          Apply Filters
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <div className="hidden lg:block w-64 shrink-0 h-fit">
        {content}
      </div>

      {/* Mobile Drawer */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div className="fixed inset-0 bg-[#3B2A22]/40 backdrop-blur-md" onClick={onCloseMobile} />
          <div className="relative ml-auto w-4/5 max-w-xs bg-[#EDE5D9] h-full p-6 border-l border-[#D6C8B8] shadow-2xl overflow-y-auto">
            <div className="flex justify-between items-center pb-4 mb-2 border-b border-[#D6C8B8]">
              <span className="font-heading font-medium text-lg text-[#3B2A22]">Filters</span>
              <button onClick={onCloseMobile} className="text-[#8B7562] hover:text-[#3B2A22] transition-colors">
                ✕
              </button>
            </div>
            {content}
          </div>
        </div>
      )}
    </>
  );
};
