import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { apiClient } from '../lib/api/client';
import { queryClient } from '../lib/queryClient';

export interface WishlistItemData {
  id: string;
  productId: string;
  addedAt: string;
  isAvailable?: boolean;
  availabilityWarning?: string | null;
  product: {
    id: string;
    title: string;
    price: string | number;
    originalMsrp?: string | number | null;
    conditionGrade: string;
    images?: Array<{ imageUrl: string; isPrimary?: boolean }>;
    category?: { name: string; slug?: string } | null;
    bookDetails?: { author?: string } | null;
  };
}

export interface WishlistData {
  id: string;
  userId: string;
  items: WishlistItemData[];
  totalCount?: number;
}

export const WishlistPage: React.FC = () => {
  const [wishlist, setWishlist] = useState<WishlistData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionItemId, setActionItemId] = useState<string | null>(null);

  const fetchWishlist = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const res: any = await apiClient.get('/wishlist');
      setWishlist(res.data.wishlist);
    } catch (err: any) {
      setError(err.message || 'Failed to load wishlist items.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchWishlist();
  }, []);

  const handleRemoveItem = async (itemId: string) => {
    try {
      setActionItemId(itemId);
      const res: any = await apiClient.delete(`/wishlist/items/${itemId}`);
      setWishlist(res.data.wishlist);
      queryClient.invalidateQueries();
    } catch (err: any) {
      setError(err.message || 'Failed to remove wishlist item.');
    } finally {
      setActionItemId(null);
    }
  };

  const handleMoveToCart = async (itemId: string) => {
    try {
      setActionItemId(itemId);
      const res: any = await apiClient.post(`/wishlist/items/${itemId}/move-to-cart`);
      setWishlist(res.data.wishlist);
      queryClient.invalidateQueries();
    } catch (err: any) {
      setError(err.message || 'Failed to move item to cart.');
    } finally {
      setActionItemId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto py-20 px-4 text-center">
        <div className="w-12 h-12 rounded-full border-2 border-[#C8A46A] border-t-transparent animate-spin mx-auto mb-4" />
        <p className="font-sans text-xs text-[#8B7562]">Loading saved wishlist items…</p>
      </div>
    );
  }

  const hasItems = wishlist && wishlist.items.length > 0;

  return (
    <div className="max-w-6xl mx-auto py-12 px-4 sm:px-6 lg:px-8 space-y-8 text-[#3B2A22]">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 p-8 sm:p-10 rounded-[32px] bg-[#EDE5D9] border border-[#D6C8B8] shadow-warm-subtle">
        <div>
          <span className="tag-editorial mb-2 block">Saved Items</span>
          <h1 className="font-heading text-4xl font-normal text-[#3B2A22]">
            Saved Wishlist
          </h1>
          <p className="font-sans text-xs text-[#8B7562] mt-1">
            {hasItems ? `${wishlist.totalCount} saved course product(s)` : 'Your saved wishlist is currently empty'}
          </p>
        </div>

        <Link to="/products" className="btn-primary text-xs font-semibold uppercase">
          Explore Marketplace
        </Link>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-[#9B5C52]/15 border border-[#9B5C52]/30 text-[#9B5C52] text-xs font-semibold">
          {error}
        </div>
      )}

      {/* Wishlist Grid */}
      {hasItems ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {wishlist.items.map((item) => {
            const product = item.product;
            if (!product) return null;

            const primaryImage =
              product.images?.find((img) => img.isPrimary)?.imageUrl ||
              product.images?.[0]?.imageUrl ||
              'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=80';

            const isBusy = actionItemId === item.id;

            return (
              <div
                key={item.id}
                className="rounded-[32px] bg-[#EDE5D9] border border-[#D6C8B8] shadow-warm-subtle overflow-hidden flex flex-col justify-between group hover:border-[#C8A46A] transition-all"
              >
                <div>
                  <div className="aspect-[4/3] relative bg-[#E7DED1] overflow-hidden">
                    <img
                      src={primaryImage}
                      alt={product.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    />

                    {!item.isAvailable && (
                      <div className="absolute inset-0 bg-[#3B2A22]/60 backdrop-blur-sm flex items-center justify-center p-4 text-center">
                        <span className="bg-[#9B5C52] text-[#F4EFE7] text-[10px] font-sans font-bold uppercase tracking-wider px-3 py-1 rounded-full">
                          {item.availabilityWarning || 'Item Unavailable'}
                        </span>
                      </div>
                    )}

                    <div className="absolute top-3 left-3 bg-[#E7DED1] text-[#3B2A22] text-[10px] font-sans font-bold uppercase tracking-wider px-3 py-0.5 rounded-full border border-[#D6C8B8]">
                      {product.conditionGrade}
                    </div>
                  </div>

                  <div className="p-6">
                    {product.category?.name && (
                      <span className="tag-editorial mb-1 block">{product.category.name}</span>
                    )}

                    <Link
                      to={`/products/${product.id}`}
                      className="font-heading text-2xl font-normal text-[#3B2A22] hover:text-[#8B6A4F] transition-colors line-clamp-2 block mb-2"
                    >
                      {product.title}
                    </Link>

                    {product.bookDetails?.author && (
                      <p className="text-xs text-[#8B7562] mb-3">By {product.bookDetails.author}</p>
                    )}

                    <div className="font-heading text-2xl font-normal text-[#3B2A22]">
                      ₹{Number(product.price).toLocaleString('en-IN')}
                    </div>
                  </div>
                </div>

                <div className="p-6 pt-0 space-y-2">
                  <button
                    onClick={() => handleMoveToCart(item.id)}
                    disabled={!item.isAvailable || isBusy}
                    className="btn-primary w-full text-xs !py-3 disabled:opacity-40"
                  >
                    {isBusy ? 'Processing…' : 'Move to Cart'}
                  </button>

                  <button
                    onClick={() => handleRemoveItem(item.id)}
                    disabled={isBusy}
                    className="btn-ghost w-full justify-center py-2 text-[10px] text-rose-700 hover:text-rose-900"
                  >
                    Remove from Wishlist
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-20 px-6 rounded-[32px] bg-[#EDE5D9] border border-[#D6C8B8] shadow-warm-subtle">
          <div className="w-16 h-16 rounded-2xl bg-[#E7DED1] border border-[#D6C8B8] text-[#3B2A22] flex items-center justify-center mx-auto mb-4">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-[#9B5C52]">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
          </div>
          <h3 className="font-heading text-3xl font-normal text-[#3B2A22] mb-2">No Saved Items Yet</h3>
          <p className="text-xs text-[#6E5948] max-w-md mx-auto mb-6 leading-relaxed">
            Save textbooks, calculators, and lab tools to your wishlist while browsing to track price drops and availability.
          </p>
          <Link to="/products" className="btn-primary">
            Explore Course Items
          </Link>
        </div>
      )}

    </div>
  );
};
