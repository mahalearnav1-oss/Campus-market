import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { apiClient } from '../lib/api/client';
import { formatINR } from '../lib/formatters';

export interface OrderItemSummary {
  id: string;
  orderNumber: string;
  status: string;
  totalAmount: string | number;
  createdAt: string;
  items: Array<{ id: string; snapshotTitle: string }>;
  seller?: { storeName: string };
}

export const BuyerOrdersPage: React.FC = () => {
  const [orders, setOrders] = useState<OrderItemSummary[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalOrders, setTotalOrders] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadOrders() {
      try {
        setIsLoading(true);
        const res: any = await apiClient.get(`/orders?page=${page}&limit=10`);
        setOrders(res.data.orders || []);
        setTotalPages(res.data.pagination?.totalPages || 1);
        setTotalOrders(res.data.pagination?.total || 0);
      } catch (err: any) {
        setError(err.message || 'Couldn\'t load your orders. Please try again.');
      } finally {
        setIsLoading(false);
      }
    }
    loadOrders();
  }, [page]);

  return (
    <div className="max-w-5xl mx-auto py-12 px-4 sm:px-6 space-y-8 text-[#3B2A22]">
      {/* Header */}
      <div className="p-8 sm:p-10 rounded-[32px] bg-[#EDE5D9] border border-[#D6C8B8] shadow-warm-subtle flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <span className="tag-editorial mb-2 block">Order Management</span>
          <h1 className="font-heading text-4xl font-normal text-[#3B2A22]">
            My Purchases & Escrow History
          </h1>
          <p className="font-sans text-xs text-[#8B7562] mt-1">
            Track active campus handshakes, escrow protection statuses, and past purchases
          </p>
        </div>

        <div className="px-4 py-2 rounded-full bg-[#E7DED1] border border-[#D6C8B8] text-xs font-sans font-semibold text-[#3B2A22]">
          {totalOrders} Total Orders
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-[#9B5C52]/15 border border-[#9B5C52]/30 text-[#9B5C52] text-xs font-semibold">
          {error}
        </div>
      )}

      {isLoading ? (
        <div className="text-center py-16 text-xs text-[#8B7562]">Loading order history…</div>
      ) : orders.length === 0 ? (
        <div className="text-center py-20 px-6 rounded-[32px] bg-[#EDE5D9] border border-[#D6C8B8] shadow-warm-subtle space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-[#E7DED1] text-[#3B2A22] flex items-center justify-center mx-auto">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
              <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
              <line x1="12" y1="22.08" x2="12" y2="12" />
            </svg>
          </div>
          <h2 className="font-heading text-3xl font-normal text-[#3B2A22]">No Orders Placed Yet</h2>
          <p className="font-sans text-xs text-[#6E5948] max-w-sm mx-auto leading-relaxed">
            You haven't placed any orders on CampusMarket. Find great deals on course textbooks and student gear!
          </p>
          <Link to="/products" className="btn-primary">
            Browse Marketplace
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((ord) => (
            <div key={ord.id} className="p-6 rounded-[28px] bg-[#EDE5D9] border border-[#D6C8B8] shadow-warm-subtle space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#D6C8B8] pb-4">
                <div className="flex items-center gap-3">
                  <Link to={`/orders/${ord.orderNumber}`} className="font-heading text-2xl font-normal text-[#3B2A22] hover:text-[#8B6A4F] transition-colors">
                    Order #{ord.orderNumber}
                  </Link>
                  <span
                    className={`px-3 py-1 rounded-full text-[10px] font-sans font-bold uppercase tracking-wider ${
                      ord.status === 'CANCELLED'
                        ? 'bg-[#9B5C52]/15 text-[#9B5C52]'
                        : ord.status === 'COMPLETED'
                        ? 'bg-[#6E8A62]/15 text-[#6E8A62]'
                        : 'bg-[#C8A46A]/20 text-[#3B2A22]'
                    }`}
                  >
                    {ord.status}
                  </span>
                </div>

                <div className="flex items-center gap-4 text-xs font-sans text-[#8B7562]">
                  <span>{new Date(ord.createdAt).toLocaleDateString('en-IN')}</span>
                  <span className="font-heading text-2xl font-normal text-[#3B2A22]">
                    {formatINR(ord.totalAmount)}
                  </span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <p className="font-sans text-xs text-[#6E5948] line-clamp-1">
                  <span className="font-semibold text-[#3B2A22]">Items:</span> {ord.items.map((i) => i.snapshotTitle).join(', ')}
                </p>

                <div className="flex items-center gap-3 shrink-0">
                  {ord.status === 'COMPLETED' && (
                    <Link to={`/orders/${ord.orderNumber}`} className="btn-secondary text-xs !py-2 !px-4 text-[#C8A46A] border-[#C8A46A]/50 hover:border-[#C8A46A] inline-flex items-center gap-1">
                      <span>★</span> Rate & Review
                    </Link>
                  )}
                  <Link to={`/orders/${ord.orderNumber}`} className="btn-secondary text-xs !py-2 !px-4">
                    View Details
                  </Link>
                  <Link to={`/orders/${ord.orderNumber}/tracking`} className="btn-primary text-xs !py-2 !px-4">
                    Escrow Tracking
                  </Link>
                </div>
              </div>
            </div>
          ))}

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-4 pt-6">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="btn-secondary text-xs !py-2 !px-4 disabled:opacity-40"
              >
                ← Previous
              </button>
              <span className="font-sans text-xs font-semibold text-[#3B2A22]">
                Page {page} of {totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="btn-secondary text-xs !py-2 !px-4 disabled:opacity-40"
              >
                Next →
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
