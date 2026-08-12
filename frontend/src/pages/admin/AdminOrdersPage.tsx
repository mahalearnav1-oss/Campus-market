import React, { useState, useEffect } from 'react';
import { apiClient } from '../../lib/api/client';

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
                  <th className="p-4 pl-6">Order Number</th>
                  <th className="p-4">Buyer Account</th>
                  <th className="p-4">Total Amount</th>
                  <th className="p-4">Escrow Status</th>
                  <th className="p-4">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#D6C8B8]">
                {orders.map((o) => (
                  <tr key={o.id} className="hover:bg-[#E7DED1]/50 transition-colors">
                    <td className="p-4 pl-6 font-heading text-xl font-normal text-[#3B2A22]">#{o.orderNumber}</td>
                    <td className="p-4 text-[#6E5948]">{o.buyer?.firstName} {o.buyer?.lastName}</td>
                    <td className="p-4 font-heading text-xl font-normal text-[#3B2A22]">₹{Number(o.totalAmount).toLocaleString('en-IN')}</td>
                    <td className="p-4">
                      <span className="px-2.5 py-1 rounded-full bg-[#6E8A62]/15 text-[#6E8A62] text-[10px] font-bold uppercase">
                        {o.status}
                      </span>
                    </td>
                    <td className="p-4 text-[#8B7562]">{new Date(o.createdAt).toLocaleDateString('en-IN')}</td>
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
