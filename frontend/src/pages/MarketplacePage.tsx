import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../lib/api/client';
import { ProductCard, ProductCardData } from '../components/ProductCard';
import { SearchBar } from '../components/discovery/SearchBar';
import { FilterPanel, FilterState } from '../components/discovery/FilterPanel';
import { SortSelect } from '../components/discovery/SortSelect';
import { ProductPagination } from '../components/discovery/ProductPagination';
import { ActiveFilterChips } from '../components/discovery/ActiveFilterChips';
import { useCampusStore } from '../stores/campusStore';
import { useAuthStore } from '../stores/authStore';
import { formatBranchShort } from '../lib/academicConstants';

export interface CategoryData {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
}

export const MarketplacePage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { activeCampus } = useCampusStore();
  const { user } = useAuthStore();

  const queryQ = searchParams.get('q') || '';
  const queryCategory = searchParams.get('category') || '';
  const queryMinPrice = searchParams.get('minPrice') || '';
  const queryMaxPrice = searchParams.get('maxPrice') || '';
  const queryConditions = searchParams.getAll('condition');
  const querySellerType = searchParams.get('sellerType') || '';
  const queryBranch = searchParams.get('branch') || '';
  const querySemester = searchParams.get('semester') || '';
  const queryForYou = searchParams.get('forYou') === 'true';
  const querySort = searchParams.get('sort') || 'newest';
  const queryPage = parseInt(searchParams.get('page') || '1', 10);

  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  const hasUserAcademicContext = Boolean(user && (user.course || user.semester));

  // Fetch Categories
  const { data: categories = [] } = useQuery<CategoryData[]>({
    queryKey: ['categories'],
    queryFn: async () => {
      try {
        const res: any = await apiClient.get('/categories');
        const list = res?.data?.categories || res?.categories || res?.data || [];
        return Array.isArray(list) ? list : [];
      } catch (err) {
        return [];
      }
    },
    staleTime: 5 * 60 * 1000,
  });

  // Fetch Products
  const { data: productsData, isLoading, isError } = useQuery({
    queryKey: [
      'products',
      queryQ,
      queryCategory,
      queryMinPrice,
      queryMaxPrice,
      queryConditions,
      querySellerType,
      queryBranch,
      querySemester,
      queryForYou,
      querySort,
      queryPage,
      activeCampus?.id,
      user?.course,
      user?.semester,
    ],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (queryQ) params.append('q', queryQ);
      if (queryCategory) params.append('category', queryCategory);
      if (queryMinPrice) params.append('minPrice', queryMinPrice);
      if (queryMaxPrice) params.append('maxPrice', queryMaxPrice);
      queryConditions.forEach((c) => params.append('condition', c));
      if (querySellerType) params.append('sellerType', querySellerType);
      if (queryBranch) params.append('branch', queryBranch);
      if (querySemester) params.append('semester', querySemester);
      if (queryForYou) params.append('forYou', 'true');
      if (querySort) params.append('sort', querySort);
      params.append('page', String(queryPage));
      params.append('limit', '12');
      if (activeCampus?.id) params.append('campusId', activeCampus.id);

      const res: any = await apiClient.get(`/products?${params.toString()}`);
      return {
        products: (res.data.products || res.products || []) as ProductCardData[],
        pagination: res.data.pagination || res.pagination || {
          page: 1,
          limit: 12,
          total: 0,
          totalPages: 1,
          hasNextPage: false,
          hasPreviousPage: false,
        },
      };
    },
  });

  const updateParams = (updater: (params: URLSearchParams) => void) => {
    const next = new URLSearchParams(searchParams);
    updater(next);
    setSearchParams(next);
  };

  const handleSearch = (q: string) => {
    updateParams((p) => {
      if (q) p.set('q', q);
      else p.delete('q');
      p.set('page', '1');
    });
  };

  const toggleForYou = () => {
    updateParams((p) => {
      if (queryForYou) {
        p.delete('forYou');
      } else {
        p.set('forYou', 'true');
      }
      p.set('page', '1');
    });
  };

  const handleApplyFilters = (newFilters: FilterState) => {
    updateParams((p) => {
      if (newFilters.categoryId) p.set('category', newFilters.categoryId);
      else p.delete('category');

      if (newFilters.minPrice) p.set('minPrice', newFilters.minPrice);
      else p.delete('minPrice');

      if (newFilters.maxPrice) p.set('maxPrice', newFilters.maxPrice);
      else p.delete('maxPrice');

      p.delete('condition');
      newFilters.conditions.forEach((c) => p.append('condition', c));

      if (newFilters.sellerType) p.set('sellerType', newFilters.sellerType);
      else p.delete('sellerType');

      if (newFilters.branch) p.set('branch', newFilters.branch);
      else p.delete('branch');

      if (newFilters.semester) p.set('semester', newFilters.semester);
      else p.delete('semester');

      p.set('page', '1');
    });
  };

  const handleClearFilters = () => {
    updateParams((p) => {
      p.delete('category');
      p.delete('minPrice');
      p.delete('maxPrice');
      p.delete('condition');
      p.delete('sellerType');
      p.delete('branch');
      p.delete('semester');
      p.delete('forYou');
      p.set('page', '1');
    });
  };

  const currentFilters: FilterState = {
    categoryId: queryCategory,
    minPrice: queryMinPrice,
    maxPrice: queryMaxPrice,
    conditions: queryConditions,
    sellerType: querySellerType,
    branch: queryBranch,
    semester: querySemester,
  };

  const productsList = productsData?.products || [];
  const pagination = productsData?.pagination;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-8 lg:px-12 py-12 text-[#3B2A22]">
      {/* Header Banner */}
      <div className="p-8 sm:p-12 rounded-[36px] bg-[#EDE5D9] border border-[#D6C8B8] shadow-warm-card mb-10">
        <span className="tag-editorial mb-3 block">Campus Secondhand Exchange</span>
        <h1 className="font-heading text-4xl sm:text-6xl font-normal text-[#3B2A22] leading-tight mb-4">
          Courseware Catalog
        </h1>
        <p className="font-sans text-sm text-[#6E5948] max-w-2xl leading-relaxed">
          Browse verified textbooks, calculators, lab gear, and dorm essentials with 100% campus escrow protection.
        </p>
      </div>

      {/* Main Grid: Filters Left, Catalog Right */}
      <div className="flex flex-col lg:flex-row gap-8 items-start">
        <FilterPanel
          categories={categories}
          filters={currentFilters}
          onApplyFilters={handleApplyFilters}
          onClearFilters={handleClearFilters}
          isMobileOpen={isMobileFilterOpen}
          onCloseMobile={() => setIsMobileFilterOpen(false)}
        />

        <div className="flex-1 w-full min-w-0">
          {/* Search & Sort Controls Bar */}
          <div className="space-y-4 mb-6">
            <SearchBar initialValue={queryQ} onSearch={handleSearch} />

            {/* Academic Personalization "For You" Toggle Pill */}
            {hasUserAcademicContext && (
              <div className="flex flex-wrap items-center gap-3 pt-1">
                <button
                  type="button"
                  onClick={toggleForYou}
                  className={`inline-flex items-center gap-2 px-4 py-2 rounded-2xl border text-xs font-sans font-semibold transition-all shadow-sm ${
                    queryForYou
                      ? 'bg-[#111111] text-[#F4EFE7] border-[#111111] shadow-md ring-2 ring-[#C8A46A]/40'
                      : 'bg-[#E7DED1] text-[#3B2A22] border-[#D6C8B8] hover:border-[#C8A46A] hover:bg-[#EDE5D9]'
                  }`}
                >
                  <span>🎓</span>
                  <span>
                    For You
                    {user?.course ? ` · ${formatBranchShort(user.course)}` : ''}
                    {user?.semester ? ` · Sem ${user.semester}` : ''}
                  </span>
                  {queryForYou && (
                    <span className="w-2 h-2 rounded-full bg-[#6E8A62] animate-pulse" />
                  )}
                </button>

                {queryForYou && (
                  <span className="text-[11px] font-sans text-[#8B7562] italic">
                    Prioritizing courseware matching your academic context
                  </span>
                )}
              </div>
            )}

            <div className="flex items-center justify-between gap-4 pt-2">
              <button
                onClick={() => setIsMobileFilterOpen(true)}
                className="lg:hidden btn-secondary text-xs !py-2 !px-4"
              >
                Filters & Refinements
              </button>

              <div className="ml-auto">
                <SortSelect
                  value={querySort}
                  onChange={(sort) => updateParams((p) => { p.set('sort', sort); p.set('page', '1'); })}
                />
              </div>
            </div>

            <ActiveFilterChips
              searchQuery={queryQ}
              filters={currentFilters}
              categories={categories}
              onRemoveSearch={() => handleSearch('')}
              onRemoveCategory={() => updateParams((p) => { p.delete('category'); p.set('page', '1'); })}
              onRemovePrice={() => updateParams((p) => { p.delete('minPrice'); p.delete('maxPrice'); p.set('page', '1'); })}
              onRemoveCondition={(c) => updateParams((p) => {
                const nextConds = queryConditions.filter((item) => item !== c);
                p.delete('condition');
                nextConds.forEach((item) => p.append('condition', item));
                p.set('page', '1');
              })}
              onRemoveSellerType={() => updateParams((p) => { p.delete('sellerType'); p.set('page', '1'); })}
              onRemoveBranch={() => updateParams((p) => { p.delete('branch'); p.set('page', '1'); })}
              onRemoveSemester={() => updateParams((p) => { p.delete('semester'); p.set('page', '1'); })}
              onClearAll={handleClearFilters}
            />
          </div>

          {/* Product Grid */}
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="h-80 rounded-[32px] skeleton" />
              ))}
            </div>
          ) : isError ? (
            <div className="p-8 rounded-[32px] bg-[#EDE5D9] border border-[#D6C8B8] text-center font-sans text-xs text-[#9B5C52]">
              Failed to load product catalog. Please try refreshing.
            </div>
          ) : productsList.length === 0 ? (
            <div className="text-center py-20 px-6 rounded-[32px] bg-[#EDE5D9] border border-[#D6C8B8] shadow-warm-subtle space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-[#E7DED1] border border-[#D6C8B8] text-[#3B2A22] flex items-center justify-center mx-auto">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                  <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
                </svg>
              </div>
              <h3 className="font-heading text-3xl font-normal text-[#3B2A22]">No Listings Match Criteria</h3>
              <p className="font-sans text-xs text-[#6E5948] max-w-sm mx-auto leading-relaxed">
                Try clearing your search query or adjusting your category and price range filters.
              </p>
              <button onClick={handleClearFilters} className="btn-primary">
                Clear Filters
              </button>
            </div>
          ) : (
            <div className="space-y-10">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {productsList.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>

              {pagination && (
                <ProductPagination
                  pagination={pagination}
                  onPageChange={(page) => updateParams((p) => p.set('page', String(page)))}
                />
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
