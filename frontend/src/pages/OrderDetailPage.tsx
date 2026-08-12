import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { apiClient } from '../lib/api/client';

export const OrderDetailPage: React.FC = () => {
  const { orderNumber } = useParams<{ orderNumber: string }>();
  const [order, setOrder] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadOrder() {
      if (!orderNumber) return;
      try {
        setIsLoading(true);
        const res: any = await apiClient.get(`/orders/${orderNumber}`);
        setOrder(res.data.order);
      } catch (err: any) {
        setError(err.message || 'Failed to load order details.');
      } finally {
        setIsLoading(false);
      }
    }
    loadOrder();
  }, [orderNumber]);

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto py-20 px-4 text-center">
        <div className="w-12 h-12 rounded-full border-2 border-[#C8A46A] border-t-transparent animate-spin mx-auto mb-4" />
        <p className="font-sans text-xs text-[#8B7562]">Loading order receipt details…</p>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="max-w-md mx-auto my-16 p-8 sm:p-10 rounded-[32px] bg-[#EDE5D9] border border-[#D6C8B8] shadow-warm-card text-center space-y-6 text-[#3B2A22]">
        <div className="w-14 h-14 rounded-2xl bg-[#E7DED1] text-[#3B2A22] flex items-center justify-center mx-auto">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
            <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
            <line x1="12" y1="22.08" x2="12" y2="12" />
          </svg>
        </div>
        <div>
          <h2 className="font-heading text-3xl font-normal text-[#3B2A22] mb-2">Order Not Found</h2>
          <p className="font-sans text-xs text-[#6E5948] leading-relaxed">{error || 'Order record does not exist.'}</p>
        </div>
        <Link to="/orders" className="btn-primary w-full text-xs">
          Back to Orders
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 space-y-8 text-[#3B2A22]">
      <Link to="/orders" className="inline-flex items-center gap-2 font-sans text-xs text-[#8B7562] hover:text-[#3B2A22] transition-colors">
        ← Back to Order History
      </Link>

      <div className="p-8 sm:p-10 rounded-[32px] bg-[#EDE5D9] border border-[#D6C8B8] shadow-warm-subtle flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <span className="tag-editorial mb-2 block">Order Receipt</span>
          <h1 className="font-heading text-4xl font-normal text-[#3B2A22]">Order #{order.orderNumber}</h1>
          <p className="font-sans text-xs text-[#8B7562] mt-1">Placed on {new Date(order.createdAt).toLocaleDateString('en-IN')}</p>
        </div>

        <div className="flex items-center gap-3">
          <span className="px-3.5 py-1.5 rounded-full bg-[#6E8A62]/15 text-[#6E8A62] border border-[#6E8A62]/30 text-xs font-sans font-bold uppercase tracking-wider">
            {order.status}
          </span>
          <Link to={`/orders/${order.orderNumber}/tracking`} className="btn-primary text-xs !py-2.5 !px-5">
            Track Escrow Status →
          </Link>
        </div>
      </div>

      <div className="p-8 sm:p-10 rounded-[32px] bg-[#EDE5D9] border border-[#D6C8B8] shadow-warm-subtle space-y-6">
        <h3 className="font-heading text-2xl font-normal text-[#3B2A22] border-b border-[#D6C8B8] pb-4">Purchased Course Items</h3>
        <div className="divide-y divide-[#D6C8B8] font-sans text-xs">
          {order.items?.map((item: any) => (
            <div key={item.id} className="py-4 first:pt-0 flex items-center justify-between gap-4">
              <div>
                <h4 className="font-heading text-xl font-normal text-[#3B2A22]">{item.snapshotTitle}</h4>
                <p className="text-[11px] text-[#8B7562] mt-0.5">Qty: {item.quantity}</p>
              </div>
              <span className="font-heading text-2xl font-normal text-[#3B2A22]">
                ₹{Number(item.lineTotal || item.snapshotPrice).toLocaleString('en-IN')}
              </span>
            </div>
          ))}
        </div>

        <div className="pt-6 border-t border-[#D6C8B8] flex justify-between items-baseline font-sans text-xs">
          <span className="font-heading text-xl text-[#3B2A22]">Total Order Amount</span>
          <span className="font-heading text-4xl font-normal text-[#3B2A22]">
            ₹{Number(order.totalAmount).toLocaleString('en-IN')}
          </span>
        </div>
      </div>
    </div>
  );
};
