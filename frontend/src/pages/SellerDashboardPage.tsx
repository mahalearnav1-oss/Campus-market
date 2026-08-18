import React, { useState, useEffect } from 'react';
import { apiClient } from '../lib/api/client';
import { Link } from 'react-router-dom';
import { formatINR } from '../lib/formatters';

export interface SellerDashboardData {
  id: string;
  storeName: string;
  sellerType: string;
  status: string;
  rating: string | number;
  totalSalesCount: number;
  bio?: string | null;
  wallet?: {
    clearedBalance: string | number;
    pendingEscrowBalance: string | number;
  } | null;
  verifications?: Array<{
    id: string;
    documentType: string;
    status: string;
    createdAt: string;
  }>;
}

export const SellerDashboardPage: React.FC = () => {
  const [seller, setSeller] = useState<SellerDashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadSeller() {
      try {
        setIsLoading(true);
        const res: any = await apiClient.get('/sellers/me');
        setSeller(res.data.seller);
      } catch (err: any) {
        setError(err.message || 'Failed to load seller dashboard.');
      } finally {
        setIsLoading(false);
      }
    }
    loadSeller();
  }, []);

  if (isLoading) {
    return (
      <div className="max-w-5xl mx-auto py-20 px-4 text-center">
        <div className="w-12 h-12 rounded-full border-2 border-[#C8A46A] border-t-transparent animate-spin mx-auto mb-4" />
        <p className="font-sans text-xs text-[#8B7562]">Loading seller portal…</p>
      </div>
    );
  }

  if (error || !seller) {
    return (
      <div className="max-w-md mx-auto my-16 p-8 sm:p-10 rounded-[32px] bg-[#EDE5D9] border border-[#D6C8B8] shadow-warm-card text-center space-y-6 text-[#3B2A22]">
        <div className="w-16 h-16 rounded-2xl bg-[#E7DED1] border border-[#D6C8B8] text-[#3B2A22] flex items-center justify-center mx-auto">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
            <polyline points="9 22 9 12 15 12 15 22" />
          </svg>
        </div>
        <div>
          <h2 className="font-heading text-3xl font-normal text-[#3B2A22] mb-2">No Active Seller Profile</h2>
          <p className="font-sans text-xs text-[#6E5948] leading-relaxed">
            You haven't registered as a campus seller yet. Register to sell your textbooks, lab tools, and notes.
          </p>
        </div>
        <Link to="/become-seller" className="btn-primary w-full text-xs">
          Become a Campus Seller
        </Link>
      </div>
    );
  }

  const cleared = Number(seller.wallet?.clearedBalance || 0);
  const pending = Number(seller.wallet?.pendingEscrowBalance || 0);

  return (
    <div className="max-w-6xl mx-auto py-12 px-4 sm:px-6 lg:px-8 space-y-8 text-[#3B2A22]">

      {/* Header Banner */}
      <div className="p-8 sm:p-10 rounded-[32px] bg-[#EDE5D9] border border-[#D6C8B8] shadow-warm-subtle flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <span className="tag-editorial">Seller Dashboard</span>
            <span className="px-3 py-0.5 rounded-full bg-[#E7DED1] text-[#3B2A22] border border-[#D6C8B8] text-[10px] font-sans font-bold uppercase tracking-wider">
              {seller.sellerType}
            </span>
          </div>
          <h1 className="font-heading text-4xl font-normal text-[#3B2A22]">
            {seller.storeName}
          </h1>
          <p className="font-sans text-xs text-[#8B7562] mt-1">{seller.bio || 'Campus verified courseware seller.'}</p>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right">
            <span className="font-sans text-[10px] tracking-[0.15em] uppercase text-[#8B7562] block font-semibold">Verification</span>
            <span className="font-sans text-xs font-bold text-[#6E8A62] inline-flex items-center gap-1">
              {seller.status === 'VERIFIED' ? (
                <>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  VERIFIED SELLER
                </>
              ) : (
                <>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-[#C8A46A]">
                    <circle cx="12" cy="12" r="10" />
                    <polyline points="12 6 12 12 16 14" />
                  </svg>
                  {seller.status}
                </>
              )}
            </span>
          </div>

          <Link to={`/sellers/${seller.id}`} className="btn-secondary text-xs !py-2.5 !px-4">
            Public Storefront →
          </Link>
        </div>
      </div>

      {/* Revenue & Balance Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="p-8 rounded-[32px] bg-[#EDE5D9] border border-[#D6C8B8] shadow-warm-subtle">
          <span className="font-sans text-[10px] tracking-[0.2em] uppercase font-semibold text-[#8B7562] block mb-2">
            Cleared Balance
          </span>
          <p className="font-heading text-4xl font-normal text-[#3B2A22]">
            {formatINR(cleared)}
          </p>
          <span className="font-sans text-[11px] text-[#6E8A62] font-semibold mt-2 block">
            Ready for Payout
          </span>
        </div>

        <div className="p-8 rounded-[32px] bg-[#EDE5D9] border border-[#D6C8B8] shadow-warm-subtle">
          <span className="font-sans text-[10px] tracking-[0.2em] uppercase font-semibold text-[#8B7562] block mb-2">
            Pending Escrow
          </span>
          <p className="font-heading text-4xl font-normal text-[#3B2A22]">
            {formatINR(pending)}
          </p>
          <span className="font-sans text-[11px] text-[#C8A46A] font-semibold mt-2 block">
            Held in Campus Escrow
          </span>
        </div>

        <div className="p-8 rounded-[32px] bg-[#EDE5D9] border border-[#D6C8B8] shadow-warm-subtle">
          <span className="font-sans text-[10px] tracking-[0.2em] uppercase font-semibold text-[#8B7562] block mb-2">
            Total Sales Count
          </span>
          <p className="font-heading text-4xl font-normal text-[#3B2A22]">
            {seller.totalSalesCount}
          </p>
          <span className="font-sans text-[11px] text-[#8B7562] font-semibold mt-2 flex items-center gap-1">
            <svg width="10" height="10" viewBox="0 0 24 24" fill="#C8A46A" stroke="none">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
            </svg>
            {Number(seller.rating).toFixed(1)} Rating
          </span>
        </div>
      </div>

      {/* Quick Seller Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div className="p-8 rounded-[32px] bg-[#EDE5D9] border border-[#D6C8B8] shadow-warm-subtle flex flex-col justify-between space-y-4">
          <div>
            <h3 className="font-heading text-2xl font-normal text-[#3B2A22] mb-1">Manage Listings</h3>
            <p className="font-sans text-xs text-[#8B7562]">
              Edit active inventory, update prices, or post new course textbooks & lab gear.
            </p>
          </div>
          <Link to="/seller/products" className="btn-primary w-fit text-xs !py-3 !px-6">
            View Listing Inventory →
          </Link>
        </div>

        <div className="p-8 rounded-[32px] bg-[#EDE5D9] border border-[#D6C8B8] shadow-warm-subtle flex flex-col justify-between space-y-4">
          <div>
            <h3 className="font-heading text-2xl font-normal text-[#3B2A22] mb-1">Sales & Escrow Orders</h3>
            <p className="font-sans text-xs text-[#8B7562]">
              Track buyer pickups, confirm handshakes, and view escrow release status.
            </p>
          </div>
          <Link to="/seller/orders" className="btn-secondary w-fit text-xs !py-3 !px-6">
            Manage Escrow Orders →
          </Link>
        </div>
      </div>

    </div>
  );
};
