import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { apiClient } from '../lib/api/client';
import { ProductCard, ProductCardData } from '../components/ProductCard';

export const PublicSellerPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [seller, setSeller] = useState<any>(null);
  const [products, setProducts] = useState<ProductCardData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadStorefront() {
      if (!id) return;
      try {
        setIsLoading(true);
        const [sellerRes, prodRes]: any = await Promise.all([
          apiClient.get(`/sellers/${id}`),
          apiClient.get(`/products?sellerId=${id}&limit=24`),
        ]);
        setSeller(sellerRes.data.seller);
        setProducts(prodRes.data.products || []);
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

  return (
    <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8 space-y-10 text-[#3B2A22]">
      {/* Storefront Hero Banner */}
      <div className="p-8 sm:p-12 rounded-[36px] bg-[#EDE5D9] border border-[#D6C8B8] shadow-warm-card flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="flex items-center gap-5">
          <div className="w-16 h-16 rounded-full bg-[#111111] text-[#F4EFE7] font-heading font-semibold text-2xl flex items-center justify-center shadow-md">
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
            <p className="font-sans text-xs text-[#8B7562] mt-1 inline-flex items-center gap-1">
              <svg width="11" height="11" viewBox="0 0 24 24" fill="#C8A46A" stroke="none">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
              </svg>
              {seller.rating || 5.0} Rating • {seller.totalSalesCount || 0} items sold
            </p>
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
    </div>
  );
};
