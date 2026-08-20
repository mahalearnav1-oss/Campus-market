import React, { useState, useEffect } from 'react';
import { apiClient } from '../../lib/api/client';

export interface AdminSellerItem {
  id: string;
  storeName: string;
  sellerType: string;
  status: string;
  rating: string | number;
  totalSalesCount: number;
  createdAt: string;
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    createdAt?: string;
    college?: { id: string; name: string; code: string } | null;
  };
}

export const AdminSellersPage: React.FC = () => {
  const [sellers, setSellers] = useState<AdminSellerItem[]>([]);
  const [statusFilter, setStatusFilter] = useState('PENDING');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  const fetchSellers = async () => {
    try {
      setIsLoading(true);
      const res: any = await apiClient.get(`/admin/sellers?status=${statusFilter}`);
      setSellers(res.data.sellers || []);
    } catch (err: any) {
      setError(err.message || 'Failed to load seller storefronts.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSellers();
  }, [statusFilter]);

  const handleVerifySeller = async (sellerId: string, status: 'VERIFIED' | 'REJECTED') => {
    try {
      setError(null);
      await apiClient.post(`/admin/sellers/${sellerId}/verify`, {
        status,
        notes: status === 'VERIFIED' ? 'Storefront approved by administrator.' : 'Verification requirements not met.',
      });
      setActionMessage(
        status === 'VERIFIED'
          ? '✅ Seller approved successfully! Seller can now list and publish products.'
          : '❌ Seller application marked as rejected.'
      );
      setTimeout(() => setActionMessage(null), 4000);
      setSellers((prev) => prev.filter((s) => s.id !== sellerId));
    } catch (err: any) {
      setError(err.message || 'Failed to update seller verification status.');
    }
  };

  return (
    <div className="space-y-8 text-[#3B2A22]">
      {/* Header */}
      <div>
        <span className="tag-editorial mb-2 block">Seller Moderation</span>
        <h1 className="font-heading text-4xl font-normal text-[#3B2A22]">Storefront Verification</h1>
        <p className="font-sans text-xs text-[#8B7562] mt-1">Review campus seller storefront applications, verify identity documents, and approve active selling status</p>
      </div>

      {actionMessage && (
        <div className="p-4 bg-[#6E8A62]/15 border border-[#6E8A62]/30 text-[#6E8A62] font-semibold text-xs rounded-2xl">
          {actionMessage}
        </div>
      )}

      {error && (
        <div className="p-4 bg-[#9B5C52]/15 border border-[#9B5C52]/30 text-[#9B5C52] font-semibold text-xs rounded-2xl">
          {error}
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 bg-[#E7DED1] p-2.5 rounded-2xl border border-[#D6C8B8]">
        {['PENDING', 'VERIFIED', 'REJECTED', 'SUSPENDED'].map((st) => (
          <button
            key={st}
            onClick={() => setStatusFilter(st)}
            className={`px-4 py-2 rounded-xl text-xs font-sans font-semibold tracking-wide transition-all ${
              statusFilter === st
                ? 'bg-[#111111] text-[#F4EFE7] shadow-sm'
                : 'bg-[#EDE5D9] text-[#6E5948] hover:text-[#3B2A22]'
            }`}
          >
            {st} QUEUE
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="text-center py-16 text-xs text-[#8B7562]">Loading seller verification queue…</div>
      ) : sellers.length === 0 ? (
        <div className="text-center py-20 px-6 rounded-[32px] bg-[#EDE5D9] border border-[#D6C8B8] shadow-warm-subtle space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-[#E7DED1] text-[#3B2A22] flex items-center justify-center mx-auto">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
              <polyline points="9 22 9 12 15 12 15 22" />
            </svg>
          </div>
          <h3 className="font-heading text-3xl font-normal text-[#3B2A22]">No Sellers in {statusFilter} Queue</h3>
          <p className="font-sans text-xs text-[#8B7562]">No storefront applications matching this queue filter.</p>
        </div>
      ) : (
        <div className="bg-[#EDE5D9] border border-[#D6C8B8] rounded-[32px] overflow-hidden shadow-warm-subtle">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse font-sans text-xs">
              <thead>
                <tr className="bg-[#E7DED1] border-b border-[#D6C8B8] text-[10px] font-semibold text-[#8B7562] uppercase tracking-wider">
                  <th className="py-4 px-6 text-left">Storefront Name</th>
                  <th className="py-4 px-4 text-left">Owner Account</th>
                  <th className="py-4 px-4 text-left">Campus / College</th>
                  <th className="py-4 px-4 text-left">Registered</th>
                  <th className="py-4 px-4 text-center">Status</th>
                  <th className="py-4 px-6 text-right">Verification Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#D6C8B8]/60">
                {sellers.map((s) => (
                  <tr key={s.id} className="hover:bg-[#E7DED1]/50 transition-colors">
                    <td className="py-4.5 px-6 align-middle">
                      <div className="font-heading text-lg font-medium text-[#3B2A22] leading-snug">{s.storeName}</div>
                      <span className="text-[10px] text-[#8B7562] font-semibold uppercase tracking-wider">{s.sellerType}</span>
                    </td>
                    <td className="py-4.5 px-4 align-middle">
                      <div className="font-semibold text-xs text-[#3B2A22]">{s.user.firstName} {s.user.lastName}</div>
                      <div className="text-[11px] text-[#8B7562] font-mono mt-0.5">{s.user.email}</div>
                    </td>
                    <td className="py-4.5 px-4 align-middle">
                      <div className="font-medium text-xs text-[#3B2A22]">{s.user.college?.name || 'General Campus'}</div>
                      <div className="text-[10px] text-[#8B7562] uppercase tracking-wider font-semibold">{s.user.college?.code || 'MAIN'}</div>
                    </td>
                    <td className="py-4.5 px-4 align-middle text-[#6E5948] text-xs whitespace-nowrap">
                      {new Date(s.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </td>
                    <td className="py-4.5 px-4 align-middle text-center whitespace-nowrap">
                      <span className={`badge-status ${
                        s.status === 'VERIFIED'
                          ? 'badge-status-verified'
                          : s.status === 'REJECTED'
                          ? 'badge-status-rejected'
                          : 'badge-status-pending'
                      }`}>
                        {s.status === 'VERIFIED' ? '✓ APPROVED' : s.status === 'REJECTED' ? '✕ REJECTED' : '⏳ PENDING'}
                      </span>
                    </td>
                    <td className="py-4.5 px-6 align-middle text-right whitespace-nowrap space-x-2">
                      {s.status !== 'VERIFIED' && (
                        <button
                          onClick={() => handleVerifySeller(s.id, 'VERIFIED')}
                          className="btn-emerald text-[11px] !py-2 !px-4 !min-h-[34px] shadow-sm hover:shadow"
                        >
                          Approve
                        </button>
                      )}
                      {s.status !== 'REJECTED' && (
                        <button
                          onClick={() => handleVerifySeller(s.id, 'REJECTED')}
                          className="px-3.5 py-1.5 min-h-[34px] rounded-full border border-[#9B5C52]/40 text-[#9B5C52] hover:bg-[#9B5C52]/10 text-[11px] font-semibold transition-colors cursor-pointer"
                        >
                          Reject
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
