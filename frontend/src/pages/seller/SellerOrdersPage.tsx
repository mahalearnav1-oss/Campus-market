import React, { useState, useEffect } from 'react';
import { apiClient } from '../../lib/api/client';
import { Link } from 'react-router-dom';
import { formatINR } from '../../lib/formatters';

export const SellerOrdersPage: React.FC = () => {
  const [orders, setOrders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadSellerOrders() {
      try {
        setIsLoading(true);
        const res: any = await apiClient.get('/sellers/me/orders');
        setOrders(res.data.orders || []);
      } catch (e) {
        // Ignore
      } finally {
        setIsLoading(false);
      }
    }
    loadSellerOrders();
  }, []);

  return (
    <div className="max-w-6xl mx-auto py-12 px-4 sm:px-6 lg:px-8 space-y-8 text-[#3B2A22]">
      <div className="p-8 sm:p-10 rounded-[32px] bg-[#EDE5D9] border border-[#D6C8B8] shadow-warm-subtle flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <span className="tag-editorial mb-2 block">Sales Management</span>
          <h1 className="font-heading text-4xl font-normal text-[#3B2A22]">Seller Escrow Orders</h1>
          <p className="font-sans text-xs text-[#8B7562] mt-1">Track buyer pickups, confirm handshakes, and manage escrow releases</p>
        </div>
        <Link to="/seller/products" className="btn-secondary text-xs !py-2.5 !px-4">
          Manage Inventory →
        </Link>
      </div>

      {isLoading ? (
        <div className="text-center py-16 text-xs text-[#8B7562]">Loading seller orders…</div>
      ) : orders.length === 0 ? (
        <div className="text-center py-20 px-6 rounded-[32px] bg-[#EDE5D9] border border-[#D6C8B8] shadow-warm-subtle space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-[#E7DED1] text-[#3B2A22] flex items-center justify-center mx-auto">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
              <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
              <line x1="12" y1="22.08" x2="12" y2="12" />
            </svg>
          </div>
          <h3 className="font-heading text-3xl font-normal text-[#3B2A22]">No Active Orders</h3>
          <p className="font-sans text-xs text-[#8B7562]">You don't have any pending buyer orders currently.</p>
        </div>
      ) : (
        <div className="bg-[#EDE5D9] border border-[#D6C8B8] rounded-[32px] overflow-hidden shadow-warm-subtle">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse font-sans text-xs">
              <thead>
                <tr className="bg-[#E7DED1] border-b border-[#D6C8B8] text-[10px] font-semibold text-[#8B7562] uppercase tracking-wider">
                  <th className="p-4 pl-6">Order Number</th>
                  <th className="p-4">Buyer Account</th>
                  <th className="p-4">Total Amount</th>
                  <th className="p-4">Escrow Status</th>
                  <th className="p-4 pr-6 text-right">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#D6C8B8]">
                {orders.map((o) => (
                  <tr key={o.id} className="hover:bg-[#E7DED1]/50 transition-colors">
                    <td className="p-4 pl-6 font-heading text-xl font-normal text-[#3B2A22]">#{o.orderNumber}</td>
                    <td className="p-4 text-[#6E5948] font-medium">{o.buyer?.firstName} {o.buyer?.lastName}</td>
                    <td className="p-4 font-heading text-xl font-normal text-[#3B2A22]">{formatINR(o.totalAmount)}</td>
                    <td className="p-4">
                      <span className="px-2.5 py-1 rounded-full bg-[#6E8A62]/15 text-[#6E8A62] text-[10px] font-bold uppercase">
                        {o.status}
                      </span>
                    </td>
                    <td className="p-4 pr-6 text-right text-[#8B7562]">{new Date(o.createdAt).toLocaleDateString('en-IN')}</td>
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
