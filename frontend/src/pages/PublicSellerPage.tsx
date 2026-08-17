import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { apiClient } from '../lib/api/client';
import { ProductCard, ProductCardData } from '../components/ProductCard';
import { RatingStars } from '../components/reviews/RatingStars';

export const PublicSellerPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [seller, setSeller] = useState<any>(null);
  const [products, setProducts] = useState<ProductCardData[]>([]);
  const [reviewsData, setReviewsData] = useState<{
    reviews: any[];
    summary: { averageRating: string; totalReviews: number; distribution: Record<number, number> };
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadStorefront() {
      if (!id) return;
      try {
        setIsLoading(true);
        const [sellerRes, prodRes, revRes]: any = await Promise.all([
          apiClient.get(`/sellers/${id}`),
          apiClient.get(`/products?sellerId=${id}&limit=24`),
          apiClient.get(`/sellers/${id}/reviews`).catch(() => ({ data: null })),
        ]);
        setSeller(sellerRes.data.seller);
        setProducts(prodRes.data.products || []);
        if (revRes?.data) {
          setReviewsData(revRes.data);
        }
      } catch (e) {
        // Ignore
      } finally {
        setIsLoading(false);
      }
    }
    loadStorefront();
  }, [id]);

  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto py-20 px-4 text-center">
        <div className="w-12 h-12 rounded-full border-2 border-[#C8A46A] border-t-transparent animate-spin mx-auto mb-4" />
        <p className="font-sans text-xs text-[#8B7562]">Loading seller storefront…</p>
      </div>
    );
  }

  if (!seller) {
    return (
      <div className="max-w-md mx-auto my-16 p-8 rounded-[32px] bg-[#EDE5D9] border border-[#D6C8B8] text-center space-y-4 text-[#3B2A22]">
        <h2 className="font-heading text-3xl font-normal">Seller Storefront Not Found</h2>
        <Link to="/products" className="btn-primary">Browse Marketplace</Link>
      </div>
    );
  }

  const sellerRatingNum = Number(reviewsData?.summary?.averageRating || seller.rating || 5.0);
  const sellerReviewCount = reviewsData?.summary?.totalReviews || 0;

  return (
    <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8 space-y-10 text-[#3B2A22]">
      {/* Storefront Hero Banner */}
      <div className="p-8 sm:p-12 rounded-[36px] bg-[#EDE5D9] border border-[#D6C8B8] shadow-warm-card flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="flex items-center gap-5">
          <div className="w-16 h-16 rounded-full bg-[#111111] text-[#F4EFE7] font-heading font-semibold text-2xl flex items-center justify-center shadow-md flex-shrink-0">
            {seller.storeName.charAt(0)}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-heading text-4xl font-normal text-[#3B2A22]">{seller.storeName}</h1>
              <span className="px-3 py-0.5 rounded-full bg-[#6E8A62]/15 text-[#6E8A62] border border-[#6E8A62]/30 text-[10px] font-sans font-bold uppercase tracking-wider inline-flex items-center gap-1">
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
                  <path d="M6 12v5c3 3 9 3 12 0v-5" />
                </svg>
                Verified Student Store
              </span>
            </div>
            <div className="flex items-center gap-3 mt-1 font-sans text-xs text-[#8B7562]">
              <div className="flex items-center gap-1.5">
                <RatingStars rating={sellerRatingNum} size="sm" />
                <span className="font-semibold text-[#3B2A22]">{sellerRatingNum.toFixed(1)}</span>
                <span>({sellerReviewCount} {sellerReviewCount === 1 ? 'review' : 'reviews'})</span>
              </div>
              <span>•</span>
              <span>{seller.totalSalesCount || 0} items sold</span>
            </div>
          </div>
        </div>
      </div>

      {/* Catalog Grid */}
      <div className="space-y-6">
        <h2 className="font-heading text-3xl font-normal text-[#3B2A22]">Store Catalog ({products.length})</h2>

        {products.length === 0 ? (
          <div className="text-center py-16 p-8 rounded-[32px] bg-[#EDE5D9] border border-[#D6C8B8] font-sans text-xs text-[#8B7562]">
            No active course items listed currently in this storefront.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {products.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}
      </div>

      {/* Verified Seller Reviews */}
      {reviewsData && reviewsData.reviews.length > 0 && (
        <div className="p-8 sm:p-10 rounded-[32px] bg-[#EDE5D9] border border-[#D6C8B8] shadow-warm-subtle space-y-6 font-sans text-xs">
          <div className="flex items-center justify-between border-b border-[#D6C8B8] pb-4">
            <h2 className="font-heading text-3xl font-normal text-[#3B2A22]">
              Buyer Feedback ({reviewsData.summary.totalReviews})
            </h2>
            <div className="flex items-center gap-2">
              <RatingStars rating={sellerRatingNum} size="sm" />
              <span className="font-semibold text-sm text-[#3B2A22]">{sellerRatingNum.toFixed(1)} / 5.0</span>
            </div>
          </div>

          <div className="divide-y divide-[#D6C8B8] pt-2 space-y-4">
            {reviewsData.reviews.map((rev) => (
              <div key={rev.id} className="pt-4 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-[#3B2A22]">
                      {rev.author?.firstName} {rev.author?.lastName ? `${rev.author.lastName.charAt(0)}.` : ''}
                    </span>
                    <span className="px-2.5 py-0.5 bg-[#6E8A62]/15 text-[#6E8A62] font-bold text-[10px] rounded-full border border-[#6E8A62]/30">
                      Verified Buyer
                    </span>
                  </div>
                  <span className="text-[#8B7562] text-[10px]">{new Date(rev.createdAt).toLocaleDateString('en-IN')}</span>
                </div>
                <RatingStars rating={rev.rating} size="sm" />
                {rev.comment ? (
                  <p className="text-[#6E5948] leading-relaxed">{rev.comment}</p>
                ) : (
                  <p className="text-[#8B7562] italic text-[11px]">(Rating only)</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

