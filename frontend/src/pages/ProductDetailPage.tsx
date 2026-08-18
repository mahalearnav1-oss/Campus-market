import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { apiClient } from '../lib/api/client';
import { queryClient } from '../lib/queryClient';
import { RatingStars } from '../components/reviews/RatingStars';
import { useAuthStore } from '../stores/authStore';
import { formatINR } from '../lib/formatters';

export interface DetailedProduct {
  id: string;
  title: string;
  description: string;
  conditionGrade: string;
  conditionNotes: string;
  price: string | number;
  originalMsrp?: string | number | null;
  quantity: number;
  status: string;
  createdAt: string;
  category?: { name: string; slug: string } | null;
  college?: { name: string; code: string } | null;
  seller: { id: string; storeName: string; rating: number; totalSalesCount: number; userId?: string };
  images: Array<{ id: string; imageUrl: string; isPrimary: boolean }>;
  bookDetails?: {
    isbn13?: string | null;
    author?: string | null;
    edition?: string | null;
    courseCode?: string | null;
  } | null;
}

export interface ReviewItem {
  id: string;
  rating: number;
  title?: string | null;
  comment: string;
  createdAt: string;
  author: { firstName: string; lastName: string; avatarUrl?: string | null };
}

export const ProductDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();

  const [product, setProduct] = useState<DetailedProduct | null>(null);
  const [selectedImage, setSelectedImage] = useState<string>('');
  const [purchaseQty, setPurchaseQty] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddingCart, setIsAddingCart] = useState(false);
  const [isSavingWishlist, setIsSavingWishlist] = useState(false);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [pageError, setPageError] = useState<string | null>(null);

  // Reviews State
  const [reviewsData, setReviewsData] = useState<{
    reviews: ReviewItem[];
    summary: { averageRating: string; totalReviews: number; distribution: Record<number, number> };
  } | null>(null);

  useEffect(() => {
    async function loadData() {
      if (!id) return;
      try {
        setIsLoading(true);
        setPageError(null);
        const [prodRes, revRes]: any = await Promise.all([
          apiClient.get(`/products/${id}`),
          apiClient.get(`/products/${id}/reviews`),
        ]);
        setProduct(prodRes.data.product);
        setReviewsData(revRes.data);
        if (prodRes.data.product.images?.length > 0) {
          const primary = prodRes.data.product.images.find((i: any) => i.isPrimary) || prodRes.data.product.images[0];
          setSelectedImage(primary.imageUrl);
        }
      } catch (err: any) {
        setPageError(err.message || 'We couldn\'t find or load this product. Please try again.');
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, [id]);

  const handleAddToCart = async () => {
    if (!id || !product) return;
    try {
      setIsAddingCart(true);
      setActionSuccess(null);
      setActionError(null);
      await apiClient.post('/cart/items', { productId: id, quantity: purchaseQty });
      queryClient.invalidateQueries();
      setActionSuccess(`Successfully added ${purchaseQty} unit(s) of "${product.title}" to your cart!`);
    } catch (err: any) {
      setActionError(err.message || 'Couldn\'t add item to cart. Please try again.');
    } finally {
      setIsAddingCart(false);
    }
  };

  const handleAddToWishlist = async () => {
    if (!id || !product) return;
    try {
      setIsSavingWishlist(true);
      setActionSuccess(null);
      setActionError(null);
      await apiClient.post('/wishlist/items', { productId: id });
      queryClient.invalidateQueries();
      setActionSuccess(`Saved "${product.title}" to your wishlist!`);
    } catch (err: any) {
      setActionError(err.message || 'Couldn\'t save to wishlist. Please try again.');
    } finally {
      setIsSavingWishlist(false);
    }
  };

  const [isStartingChat, setIsStartingChat] = useState(false);

  const handleMessageSeller = async () => {
    if (!product) return;
    if (!isAuthenticated) {
      navigate('/login?redirect=' + encodeURIComponent(window.location.pathname));
      return;
    }

    try {
      setIsStartingChat(true);
      setActionError(null);
      const res: any = await apiClient.post('/conversations', {
        sellerId: product.seller.id,
        productId: product.id,
      });

      const conversationId = res.data?.conversation?.id;
      if (conversationId) {
        navigate(`/messages/${conversationId}`);
      } else {
        navigate('/messages');
      }
    } catch (err: any) {
      if (err.code === 'SELF_MESSAGING_NOT_ALLOWED') {
        setActionError('You cannot message yourself on your own product listing.');
      } else {
        setActionError(err.message || 'Couldn\'t open chat with seller. Please try again.');
      }
    } finally {
      setIsStartingChat(false);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-5xl mx-auto py-20 px-4 text-center">
        <div className="w-12 h-12 rounded-full border-2 border-[#C8A46A] border-t-transparent animate-spin mx-auto mb-4" />
        <p className="font-sans text-xs text-[#8B7562]">Loading product details…</p>
      </div>
    );
  }

  if (pageError || !product) {
    return (
      <div className="max-w-md mx-auto my-16 p-8 sm:p-10 rounded-[32px] bg-[#EDE5D9] border border-[#D6C8B8] shadow-warm-card text-center space-y-6 text-[#3B2A22]">
        <div className="w-14 h-14 rounded-2xl bg-[#E7DED1] text-[#3B2A22] flex items-center justify-center mx-auto">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
            <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
          </svg>
        </div>
        <div>
          <h2 className="font-heading text-3xl font-normal text-[#3B2A22] mb-2">Product Not Found</h2>
          <p className="font-sans text-xs text-[#6E5948] leading-relaxed">{pageError || 'This listing does not exist.'}</p>
        </div>
        <Link to="/products" className="btn-primary w-full text-xs">
          Browse Marketplace
        </Link>
      </div>
    );
  }

  const isAvailable = product.status === 'ACTIVE' && product.quantity > 0;

  return (
    <div className="max-w-6xl mx-auto py-12 px-4 sm:px-6 lg:px-8 space-y-8 text-[#3B2A22]">

      {/* Breadcrumb */}
      <div className="flex items-center gap-2 font-sans text-xs text-[#8B7562]">
        <Link to="/products" className="hover:text-[#3B2A22] transition-colors">Marketplace</Link>
        <span>/</span>
        {product.category && (
          <>
            <Link to={`/products?category=${product.category.slug}`} className="hover:text-[#3B2A22] transition-colors">
              {product.category.name}
            </Link>
            <span>/</span>
          </>
        )}
        <span className="text-[#3B2A22] font-semibold truncate max-w-xs">{product.title}</span>
      </div>

      {actionSuccess && (
        <div className="p-4 rounded-2xl bg-[#6E8A62]/15 border border-[#6E8A62]/30 text-[#6E8A62] font-sans text-xs font-semibold flex items-center justify-between">
          <span>{actionSuccess}</span>
          <button onClick={() => setActionSuccess(null)} className="underline hover:text-[#3B2A22]">Dismiss</button>
        </div>
      )}
      {actionError && (
        <div className="p-4 rounded-2xl bg-[#9B5C52]/15 border border-[#9B5C52]/30 text-[#9B5C52] font-sans text-xs font-semibold flex items-center justify-between">
          <span>{actionError}</span>
          <button onClick={() => setActionError(null)} className="underline hover:text-[#3B2A22]">Dismiss</button>
        </div>
      )}

      {/* Main Grid: Gallery Left, Details Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">

        {/* Left Column: Image Gallery */}
        <div className="lg:col-span-6 space-y-4">
          <div className="w-full aspect-[4/3] rounded-[32px] bg-[#EDE5D9] border border-[#D6C8B8] overflow-hidden flex items-center justify-center p-4 shadow-warm-subtle">
            <img
              src={selectedImage || '/images/chemistry_textbook_cover_1786457575258.png'}
              alt={product.title}
              className="max-h-full max-w-full object-contain rounded-2xl"
              onError={(e) => {
                e.currentTarget.onerror = null;
                e.currentTarget.src = '/images/chemistry_textbook_cover_1786457575258.png';
              }}
            />
          </div>

          {product.images?.length > 1 && (
            <div className="flex gap-3 overflow-x-auto pb-2">
              {product.images.map((img) => (
                <button
                  key={img.id}
                  onClick={() => setSelectedImage(img.imageUrl)}
                  className={`w-20 h-20 rounded-2xl overflow-hidden border transition-all ${
                    selectedImage === img.imageUrl ? 'border-[#C8A46A] ring-2 ring-[#C8A46A]/30' : 'border-[#D6C8B8] opacity-70 hover:opacity-100'
                  }`}
                >
                  <img src={img.imageUrl} alt="Thumbnail" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Information & Actions */}
        <div className="lg:col-span-6 space-y-6">
          <div className="space-y-3 border-b border-[#D6C8B8] pb-6">
            <div className="flex items-center justify-between">
              <span className="px-3 py-1 bg-[#E7DED1] text-[#3B2A22] font-sans font-bold text-xs rounded-full border border-[#D6C8B8]">
                Grade: {product.conditionGrade}
              </span>
              {product.college && (
                <span className="font-sans text-xs font-semibold text-[#6E5948] bg-[#EDE5D9] px-3 py-1 rounded-full border border-[#D6C8B8] flex items-center gap-1.5">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
                    <path d="M6 12v5c3 3 9 3 12 0v-5" />
                  </svg>
                  {product.college.name}
                </span>
              )}
            </div>

            <h1 className="font-heading text-4xl font-normal text-[#3B2A22] leading-tight">{product.title}</h1>
            <div className="flex items-center gap-2 pt-1">
              <RatingStars rating={Number(reviewsData?.summary?.averageRating || 0)} size="sm" />
              <span className="font-semibold text-xs text-[#3B2A22]">{reviewsData?.summary?.averageRating || '0.0'}</span>
              <a href="#reviews" className="text-[11px] text-[#8B7562] hover:text-[#3B2A22] underline underline-offset-2 transition-colors">
                ({reviewsData?.summary?.totalReviews || 0} {reviewsData?.summary?.totalReviews === 1 ? 'review' : 'reviews'})
              </a>
            </div>

            <div className="flex items-baseline gap-3 pt-2">
              <span className="font-heading text-4xl font-normal text-[#3B2A22]">
                {formatINR(product.price)}
              </span>
              {product.originalMsrp && Number(product.originalMsrp) > Number(product.price) && (
                <span className="font-sans text-sm text-[#8B7562] line-through">
                  {formatINR(product.originalMsrp)} MSRP
                </span>
              )}
              <span className={`font-sans text-xs font-semibold ml-auto ${isAvailable ? 'text-[#6E8A62]' : 'text-[#9B5C52]'}`}>
                {isAvailable ? `In Stock (${product.quantity} available)` : 'Out of Stock / Unavailable'}
              </span>
            </div>
          </div>

          {/* Condition Notes */}
          <div className="p-5 rounded-2xl bg-[#EDE5D9] border border-[#D6C8B8] font-sans text-xs space-y-1">
            <span className="font-bold text-[#3B2A22] block">Seller Condition Notes:</span>
            <p className="text-[#6E5948] leading-relaxed">{product.conditionNotes || 'No additional condition notes provided.'}</p>
          </div>

          {/* Book Information Card */}
          {product.bookDetails && (
            <div className="p-6 rounded-[28px] bg-[#EDE5D9] border border-[#D6C8B8] space-y-3 font-sans text-xs">
              <h3 className="font-heading text-xl font-normal text-[#3B2A22]">Course Book Metadata</h3>
              <div className="grid grid-cols-2 gap-3 text-[#6E5948] pt-1">
                <div>
                  <span className="text-[#8B7562] block font-semibold text-[10px] uppercase">Author</span>
                  <span className="font-semibold text-[#3B2A22]">{product.bookDetails.author || 'N/A'}</span>
                </div>
                {product.bookDetails.isbn13 && (
                  <div>
                    <span className="text-[#8B7562] block font-semibold text-[10px] uppercase">ISBN-13</span>
                    <span className="font-mono text-[#3B2A22]">{product.bookDetails.isbn13}</span>
                  </div>
                )}
                {product.bookDetails.courseCode && (
                  <div>
                    <span className="text-[#8B7562] block font-semibold text-[10px] uppercase">Campus Course</span>
                    <span className="font-semibold text-[#C8A46A]">{product.bookDetails.courseCode}</span>
                  </div>
                )}
                {product.bookDetails.edition && (
                  <div>
                    <span className="text-[#8B7562] block font-semibold text-[10px] uppercase">Edition</span>
                    <span className="font-semibold text-[#3B2A22]">{product.bookDetails.edition}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Seller Storefront & Message Card */}
          <div className="p-5 rounded-[28px] bg-[#EDE5D9] border border-[#D6C8B8] flex items-center justify-between text-xs gap-3">
            <div>
              <span className="text-[#8B7562] block font-semibold text-[10px] uppercase">Storefront Seller</span>
              <Link to={`/sellers/${product.seller.id}`} className="font-heading text-xl font-normal text-[#3B2A22] hover:text-[#8B6A4F] transition-colors">
                {product.seller.storeName}
              </Link>
              <div className="flex items-center gap-1.5 mt-0.5 text-[11px] text-[#8B7562]">
                <RatingStars rating={Number(product.seller.rating || 5)} size="sm" />
                <span>({Number(product.seller.rating || 5.0).toFixed(1)}★ • {product.seller.totalSalesCount || 0} sales)</span>
              </div>
            </div>

            <button
              onClick={handleMessageSeller}
              disabled={isStartingChat}
              className="btn-secondary !py-2.5 !px-4 text-xs font-semibold uppercase flex items-center gap-1.5 disabled:opacity-50"
            >
              {isStartingChat ? (
                <>
                  <div className="w-3.5 h-3.5 rounded-full border-2 border-[#3B2A22] border-t-transparent animate-spin" />
                  Connecting…
                </>
              ) : (
                <>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                  </svg>
                  Chat Seller
                </>
              )}
            </button>
          </div>

          {/* Purchase Actions Card */}
          <div className="p-6 rounded-[28px] bg-[#EDE5D9] border border-[#D6C8B8] shadow-warm-subtle space-y-4">
            {isAvailable && (
              <div className="flex items-center justify-between font-sans text-xs">
                <label className="font-semibold text-[#3B2A22]">Order Quantity:</label>
                <select
                  value={purchaseQty}
                  onChange={(e) => setPurchaseQty(Number(e.target.value))}
                  className="bg-[#E7DED1] border border-[#D6C8B8] rounded-xl px-3 py-1.5 font-sans text-xs font-semibold text-[#3B2A22]"
                >
                  {Array.from({ length: Math.min(product.quantity, 5) }).map((_, i) => (
                    <option key={i + 1} value={i + 1}>
                      {i + 1}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="flex gap-3">
              <button
                disabled={!isAvailable || isAddingCart}
                onClick={handleAddToCart}
                className="btn-primary flex-1 py-4 text-xs font-semibold uppercase tracking-wider disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="9" cy="21" r="1" />
                  <circle cx="20" cy="21" r="1" />
                  <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
                </svg>
                {isAddingCart ? 'Adding to Cart…' : isAvailable ? 'Add to Cart' : 'Item Out of Stock'}
              </button>

              <button
                disabled={isSavingWishlist}
                onClick={handleAddToWishlist}
                className="btn-secondary py-4 px-6 text-xs font-semibold uppercase flex items-center gap-1.5"
                title="Save to Wishlist"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-[#9B5C52]">
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                </svg>
                {isSavingWishlist ? 'Saving…' : 'Save'}
              </button>
            </div>
          </div>
        </div>

      </div>

      {/* Description Section */}
      <div className="p-8 sm:p-10 rounded-[32px] bg-[#EDE5D9] border border-[#D6C8B8] shadow-warm-subtle space-y-4 font-sans text-xs">
        <h2 className="font-heading text-3xl font-normal text-[#3B2A22]">Item Description</h2>
        <p className="text-[#6E5948] leading-relaxed whitespace-pre-line text-sm">{product.description}</p>
      </div>

      {/* Product Reviews Section */}
      <div id="reviews" className="p-8 sm:p-10 rounded-[32px] bg-[#EDE5D9] border border-[#D6C8B8] shadow-warm-subtle space-y-6 font-sans text-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#D6C8B8] pb-4">
          <h2 className="font-heading text-3xl font-normal text-[#3B2A22]">
            Verified Buyer Reviews ({reviewsData?.summary.totalReviews || 0})
          </h2>
          <span className="text-[#8B7562] text-xs">
            Reviews from verified campus purchases
          </span>
        </div>

        {reviewsData && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl bg-[#E7DED1] border border-[#D6C8B8] text-center space-y-2 flex flex-col justify-center">
              <span className="font-heading text-5xl font-normal text-[#3B2A22]">{reviewsData.summary.averageRating}</span>
              <div className="flex justify-center">
                <RatingStars rating={Number(reviewsData.summary.averageRating)} size="lg" />
              </div>
              <p className="text-[#8B7562] text-xs font-semibold">{reviewsData.summary.totalReviews} verified {reviewsData.summary.totalReviews === 1 ? 'rating' : 'ratings'}</p>
            </div>

            <div className="md:col-span-2 space-y-2 justify-center flex flex-col">
              {[5, 4, 3, 2, 1].map((stars) => {
                const count = reviewsData.summary.distribution?.[stars] || 0;
                const pct = reviewsData.summary.totalReviews > 0 ? (count / reviewsData.summary.totalReviews) * 100 : 0;
                return (
                  <div key={stars} className="flex items-center gap-3 text-xs">
                    <span className="w-14 font-semibold text-[#6E5948]">{stars} Stars</span>
                    <div className="flex-1 h-2.5 bg-[#E7DED1] border border-[#D6C8B8] rounded-full overflow-hidden">
                      <div className="h-full bg-[#C8A46A] rounded-full transition-all duration-300" style={{ width: `${pct}%` }} />
                    </div>
                    <span className="w-8 text-right font-mono text-[#8B7562]">{count}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Review Cards List */}
        {!reviewsData || reviewsData.reviews.length === 0 ? (
          <div className="text-center py-12 px-6 rounded-2xl bg-[#E7DED1]/50 border border-[#D6C8B8] text-[#8B7562] space-y-2">
            <p className="font-heading text-2xl text-[#3B2A22]">No Reviews Yet</p>
            <p className="max-w-md mx-auto leading-relaxed">
              No verified student reviews have been submitted for this listing yet. Verified buyers can submit a rating upon order completion.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-[#D6C8B8] pt-2 space-y-4">
            {reviewsData.reviews.map((rev) => (
              <div key={rev.id} className="pt-4 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-[#3B2A22]">
                      {rev.author?.firstName} {rev.author?.lastName ? `${rev.author.lastName.charAt(0)}.` : ''}
                    </span>
                    <span className="px-2.5 py-0.5 bg-[#6E8A62]/15 text-[#6E8A62] font-bold text-[10px] rounded-full border border-[#6E8A62]/30">
                      Verified Purchase
                    </span>
                  </div>
                  <span className="text-[#8B7562] text-[10px]">{new Date(rev.createdAt).toLocaleDateString('en-IN')}</span>
                </div>
                <RatingStars rating={rev.rating} size="sm" />
                {rev.title && <h4 className="font-heading text-xl font-normal text-[#3B2A22]">{rev.title}</h4>}
                {rev.comment ? (
                  <p className="text-[#6E5948] leading-relaxed">{rev.comment}</p>
                ) : (
                  <p className="text-[#8B7562] italic text-[11px]">(Rating only)</p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
};
