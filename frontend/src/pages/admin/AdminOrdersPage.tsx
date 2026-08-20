import React, { useState, useEffect } from 'react';
import { apiClient } from '../../lib/api/client';
import { formatINR } from '../../lib/formatters';

export const AdminOrdersPage: React.FC = () => {
  const [orders, setOrders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadOrders() {
      try {
        setIsLoading(true);
        const res: any = await apiClient.get('/admin/orders');
        setOrders(res.data.orders || []);
      } catch (err) {
        // Ignore
      } finally {
        setIsLoading(false);
      }
    }
    loadOrders();
  }, []);

  return (
    <div className="space-y-8 text-[#3B2A22]">
      <div>
        <span className="tag-editorial mb-2 block">Escrow & Transactions</span>
        <h1 className="font-heading text-4xl font-normal text-[#3B2A22]">Orders & Escrow Management</h1>
        <p className="font-sans text-xs text-[#8B7562] mt-1">Inspect live platform orders, verify escrow hold status, and manage transaction releases</p>
      </div>

      {isLoading ? (
        <div className="text-center py-16 text-xs text-[#8B7562]">Loading platform orders…</div>
      ) : (
        <div className="bg-[#EDE5D9] border border-[#D6C8B8] rounded-[32px] overflow-hidden shadow-warm-subtle">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse font-sans text-xs">
              <thead>
                <tr className="bg-[#E7DED1] border-b border-[#D6C8B8] text-[10px] font-semibold text-[#8B7562] uppercase tracking-wider">
                  <th className="py-4 px-6 text-left">Order Number</th>
                  <th className="py-4 px-4 text-left">Buyer Account</th>
                  <th className="py-4 px-4 text-left">Total Amount</th>
                  <th className="py-4 px-4 text-center">Escrow Status</th>
                  <th className="py-4 px-6 text-right">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#D6C8B8]/60">
                {orders.map((o) => (
                  <tr key={o.id} className="hover:bg-[#E7DED1]/50 transition-colors">
                    <td className="py-4 px-6 align-middle font-mono font-medium text-xs text-[#3B2A22]">
                      #{o.orderNumber}
                    </td>
                    <td className="py-4 px-4 align-middle text-xs font-semibold text-[#3B2A22]">
                      {o.buyer?.firstName} {o.buyer?.lastName}
                    </td>
                    <td className="py-4 px-4 align-middle font-heading text-base font-medium text-[#3B2A22] whitespace-nowrap">
                      {formatINR(o.totalAmount)}
                    </td>
                    <td className="py-4 px-4 align-middle text-center whitespace-nowrap">
                      <span className={`badge-status ${
                        o.status === 'COMPLETED' || o.status === 'CONFIRMED'
                          ? 'badge-status-verified'
                          : o.status === 'CANCELLED'
                          ? 'badge-status-rejected'
                          : 'badge-status-pending'
                      }`}>
                        {o.status}
                      </span>
                    </td>
                    <td className="py-4 px-6 align-middle text-right text-xs text-[#6E5948] whitespace-nowrap">
                      {new Date(o.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
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
