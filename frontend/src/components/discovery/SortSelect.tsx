import React from 'react';

interface SortSelectProps {
  value: string;
  onChange: (sort: string) => void;
}

export const SortSelect: React.FC<SortSelectProps> = ({ value, onChange }) => {
  return (
    <div className="flex items-center gap-2">
      <span className="font-sans text-[10px] tracking-[0.15em] uppercase font-semibold text-[#8B7562] whitespace-nowrap">Sort</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="bg-transparent border-b border-[#D6C8B8] text-[#3B2A22] font-sans text-xs py-1.5 focus:outline-none focus:border-[#C8A46A] transition-colors cursor-pointer pr-4 font-medium"
      >
        <option value="newest">Newest First</option>
        <option value="price_asc">Price: Low to High</option>
        <option value="price_desc">Price: High to Low</option>
        <option value="oldest">Oldest First</option>
      </select>
    </div>
  );
};
