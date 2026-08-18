import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { apiClient } from '../lib/api/client';
import { queryClient } from '../lib/queryClient';
import { formatINR } from '../lib/formatters';

export interface CartItemData {
  id: string;
  productId: string;
  quantity: number;
  unitPrice: string;
  lineTotal: string;
  isAvailable: boolean;
  availabilityWarning: string | null;
  product: {
    id: string;
    title: string;
    conditionGrade: string;
    price: string;
    availableQuantity: number;
    status: string;
    images?: Array<{ imageUrl: string; isPrimary: boolean }>;
    category?: { name: string; slug: string } | null;
    seller?: { storeName: string; sellerType: string } | null;
    bookDetails?: { author: string } | null;
  };
}

export interface CartData {
  cartId: string;
  userId: string;
  items: CartItemData[];
  subtotal: string;
  totalItemCount: number;
  hasAvailabilityIssues?: boolean;
}

export const CartPage: React.FC = () => {
  const navigate = useNavigate();
  const [cart, setCart] = useState<CartData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingItemId, setUpdatingItemId] = useState<string | null>(null);

  const fetchCart = async () => {
    try {
      setIsLoading(true);
      const res: any = await apiClient.get('/cart');
      setCart(res.data.cart);
    } catch (err: any) {
      setError(err.message || 'Couldn\'t load your cart. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
  }, []);

  const handleUpdateQuantity = async (itemId: string, newQty: number) => {
    if (newQty < 1) return;
    try {
      setUpdatingItemId(itemId);
      const res: any = await apiClient.patch(`/cart/items/${itemId}`, { quantity: newQty });
      setCart(res.data.cart);
      queryClient.invalidateQueries();
    } catch (err: any) {
      setError(err.message || 'Your cart couldn\'t be updated. Please try again.');
    } finally {
      setUpdatingItemId(null);
    }
  };

  const handleRemoveItem = async (itemId: string) => {
    try {
      setUpdatingItemId(itemId);
      const res: any = await apiClient.delete(`/cart/items/${itemId}`);
      setCart(res.data.cart);
      queryClient.invalidateQueries();
    } catch (err: any) {
      setError(err.message || 'Couldn\'t remove item from cart. Please try again.');
    } finally {
      setUpdatingItemId(null);
    }
  };

  const handleClearCart = async () => {
    if (!confirm('Are you sure you want to clear your shopping cart?')) return;
    try {
      setIsLoading(true);
      const res: any = await apiClient.delete('/cart');
      setCart(res.data.cart);
      queryClient.invalidateQueries();
    } catch (err: any) {
      setError(err.message || 'Couldn\'t clear your cart. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-5xl mx-auto py-20 px-4 text-center">
        <div className="w-12 h-12 rounded-full border-2 border-[#C8A46A] border-t-transparent animate-spin mx-auto mb-4" />
        <p className="font-sans text-xs text-[#8B7562]">Loading shopping cart…</p>
      </div>
    );
  }

  const hasItems = cart && cart.items.length > 0;

  return (
    <div className="max-w-6xl mx-auto py-12 px-4 sm:px-6 lg:px-8 space-y-8 text-[#3B2A22]">

      {/* Header */}
      <div className="p-8 sm:p-10 rounded-[32px] bg-[#EDE5D9] border border-[#D6C8B8] shadow-warm-subtle flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <span className="tag-editorial mb-2 block">Checkout Bag</span>
          <h1 className="font-heading text-4xl font-normal text-[#3B2A22]">
            Shopping Cart
          </h1>
          <p className="font-sans text-xs text-[#8B7562] mt-1">
            {hasItems ? `${cart.totalItemCount} course item(s) in your bag` : 'Your cart is currently empty'}
          </p>
        </div>

        {hasItems && (
          <button onClick={handleClearCart} className="font-sans text-xs text-[#8B7562] hover:text-[#3B2A22] transition-colors underline">
            Clear Entire Cart
          </button>
        )}
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-[#9B5C52]/15 border border-[#9B5C52]/30 text-[#9B5C52] text-xs font-semibold font-sans">
          {error}
        </div>
      )}

      {hasItems ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

          {/* Cart Items List Left */}
          <div className="lg:col-span-8 space-y-4">
            {cart.items.map((item) => {
              const product = item.product;
              if (!product) return null;

              const primaryImage =
                product.images?.find((img) => img.isPrimary)?.imageUrl ||
                product.images?.[0]?.imageUrl ||
                'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=80';

              const isUpdating = updatingItemId === item.id;

              return (
                <div
                  key={item.id}
                  className="p-6 rounded-[28px] bg-[#EDE5D9] border border-[#D6C8B8] shadow-warm-subtle flex flex-col sm:flex-row sm:items-center justify-between gap-6"
                >
                  <div className="flex items-center gap-4 flex-1">
                    <img
                      src={primaryImage}
                      alt={product.title}
                      className="w-20 h-20 object-cover rounded-2xl border border-[#D6C8B8] shrink-0 bg-[#E7DED1]"
                    />
                    <div>
                      {product.category?.name && (
                        <span className="tag-editorial mb-1 block">{product.category.name}</span>
                      )}
                      <Link
                        to={`/products/${product.id}`}
                        className="font-heading text-xl font-normal text-[#3B2A22] hover:text-[#8B6A4F] transition-colors line-clamp-1"
                      >
                        {product.title}
                      </Link>
                      <p className="font-sans text-xs text-[#8B7562] mt-0.5">Grade: {product.conditionGrade}</p>
                      <span className="font-heading text-xl font-normal text-[#3B2A22] mt-1 block">
                        {formatINR(item.unitPrice)}
                      </span>
                    </div>
                  </div>

                  {/* Quantity & Controls */}
                  <div className="flex items-center justify-between sm:justify-end gap-6 pt-4 sm:pt-0 border-t sm:border-t-0 border-[#D6C8B8]">
                    <div className="flex items-center gap-2">
                      <label className="font-sans text-[10px] text-[#8B7562] uppercase font-semibold">Qty</label>
                      <select
                        value={item.quantity}
                        onChange={(e) => handleUpdateQuantity(item.id, parseInt(e.target.value, 10))}
                        disabled={isUpdating}
                        className="input-editorial w-auto py-1.5 px-3 text-xs font-semibold cursor-pointer"
                      >
                        {Array.from({ length: Math.min(product.availableQuantity || 10, 10) }).map((_, i) => (
                          <option key={i + 1} value={i + 1}>
                            {i + 1}
                          </option>
                        ))}
                      </select>
                    </div>

                    <button
                      onClick={() => handleRemoveItem(item.id)}
                      disabled={isUpdating}
                      className="text-[#8B7562] hover:text-[#9B5C52] transition-colors text-xs font-sans"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Order Summary Right */}
          <div className="lg:col-span-4">
            <div className="p-8 rounded-[32px] bg-[#EDE5D9] border border-[#D6C8B8] shadow-warm-subtle space-y-6 sticky top-24">
              <h3 className="font-heading text-2xl font-normal text-[#3B2A22] border-b border-[#D6C8B8] pb-4">
                Order Summary
              </h3>

              <div className="space-y-3 font-sans text-xs">
                <div className="flex justify-between text-[#6E5948]">
                  <span>Items ({cart.totalItemCount})</span>
                  <span>{formatINR(cart.subtotal)}</span>
                </div>
                <div className="flex justify-between text-[#6E5948]">
                  <span>Campus Meetup Shipping</span>
                  <span className="text-[#6E8A62] font-semibold">FREE (On-site)</span>
                </div>
                <div className="flex justify-between text-[#6E5948]">
                  <span>Escrow Guarantee Protection</span>
                  <span className="text-[#6E8A62] font-semibold">Included</span>
                </div>

                <div className="pt-4 border-t border-[#D6C8B8] flex justify-between items-baseline">
                  <span className="font-heading text-xl text-[#3B2A22]">Total Amount</span>
                  <span className="font-heading text-3xl font-normal text-[#3B2A22]">
                    {formatINR(cart.subtotal)}
                  </span>
                </div>
              </div>

              <button
                onClick={() => navigate('/checkout')}
                className="btn-primary w-full py-4 text-xs font-semibold uppercase tracking-wider"
              >
                Proceed to Checkout →
              </button>

              <div className="p-4 rounded-2xl bg-[#E7DED1] border border-[#D6C8B8] text-center font-sans text-[11px] text-[#8B7562] flex items-center justify-center gap-1.5">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-[#6E8A62] shrink-0">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                </svg>
                <span>100% Escrow Protection. Funds released to seller after physical item inspection.</span>
              </div>
            </div>
          </div>

        </div>
      ) : (
        <div className="text-center py-20 px-6 rounded-[32px] bg-[#EDE5D9] border border-[#D6C8B8] shadow-warm-subtle space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-[#E7DED1] border border-[#D6C8B8] text-[#3B2A22] flex items-center justify-center mx-auto">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="9" cy="21" r="1" />
              <circle cx="20" cy="21" r="1" />
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
            </svg>
          </div>
          <h2 className="font-heading text-3xl font-normal text-[#3B2A22]">Your Cart is Empty</h2>
          <p className="font-sans text-xs text-[#6E5948] max-w-sm mx-auto leading-relaxed">
            Explore verified secondhand coursebooks, calculators, and lab tools available on your campus.
          </p>
          <Link to="/products" className="btn-primary">
            Explore Marketplace
          </Link>
        </div>
      )}

    </div>
  );
};
