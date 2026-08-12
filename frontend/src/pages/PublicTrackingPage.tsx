import React, { useState } from 'react';
import { apiClient } from '../lib/api/client';

export const PublicTrackingPage: React.FC = () => {
  const [orderNumber, setOrderNumber] = useState('');
  const [order, setOrder] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderNumber.trim()) return;
    try {
      setIsLoading(true);
      setError(null);
      const res: any = await apiClient.get(`/orders/track/${orderNumber.trim()}`);
      setOrder(res.data.order);
    } catch (err: any) {
      setError(err.message || 'Order tracking number not found.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 space-y-8 text-[#3B2A22]">
      <div className="p-8 sm:p-12 rounded-[36px] bg-[#EDE5D9] border border-[#D6C8B8] shadow-warm-card text-center space-y-4">
        <span className="tag-editorial mb-2 inline-block">Public Escrow Lookup</span>
        <h1 className="font-heading text-4xl sm:text-5xl font-normal text-[#3B2A22]">Track Escrow Status</h1>
        <p className="font-sans text-xs text-[#6E5948] max-w-md mx-auto leading-relaxed">
          Enter your order reference number to check live campus escrow status and pickup verification stage.
        </p>

        <form onSubmit={handleTrack} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto pt-2">
          <input
            type="text"
            required
            value={orderNumber}
            onChange={(e) => setOrderNumber(e.target.value)}
            placeholder="Enter Order # (e.g. ORD-1002)"
            className="input-editorial flex-1 text-xs"
          />
          <button type="submit" disabled={isLoading} className="btn-primary text-xs !py-3 !px-6">
            {isLoading ? 'Checking…' : 'Track Order'}
          </button>
        </form>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-[#9B5C52]/15 border border-[#9B5C52]/30 text-[#9B5C52] text-xs font-semibold font-sans text-center">
          {error}
        </div>
      )}

      {order && (
        <div className="p-8 rounded-[32px] bg-[#EDE5D9] border border-[#D6C8B8] shadow-warm-subtle space-y-4 font-sans text-xs">
          <div className="flex justify-between items-center border-b border-[#D6C8B8] pb-4">
            <h3 className="font-heading text-2xl font-normal text-[#3B2A22]">Order #{order.orderNumber}</h3>
            <span className="px-3 py-1 rounded-full bg-[#6E8A62]/15 text-[#6E8A62] border border-[#6E8A62]/30 font-bold uppercase text-[10px]">
              {order.status}
            </span>
          </div>

          <div className="space-y-2 text-[#6E5948]">
            <p><strong>Campus Meetup Location:</strong> {order.shippingAddress?.campusBuilding || 'Campus Main Library'}</p>
            <p><strong>Total Escrow Value:</strong> ₹{Number(order.totalAmount).toLocaleString('en-IN')}</p>
          </div>
        </div>
      )}
    </div>
  );
};
