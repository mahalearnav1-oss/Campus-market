import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { apiClient } from '../lib/api/client';
import { DisputeModal } from '../components/disputes/DisputeModal';

export const OrderTrackingPage: React.FC = () => {
  const { orderNumber } = useParams<{ orderNumber: string }>();
  const [order, setOrder] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDisputeModalOpen, setIsDisputeModalOpen] = useState(false);
  const [disputeMsg, setDisputeMsg] = useState<string | null>(null);

  async function loadTracking() {
    if (!orderNumber) return;
    try {
      setIsLoading(true);
      const res: any = await apiClient.get(`/orders/${orderNumber}`);
      setOrder(res.data.order);
    } catch (err) {
      // Ignore
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadTracking();
  }, [orderNumber]);

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto py-20 px-4 text-center">
        <div className="w-12 h-12 rounded-full border-2 border-[#C8A46A] border-t-transparent animate-spin mx-auto mb-4" />
        <p className="font-sans text-xs text-[#8B7562]">Loading escrow progress tracker…</p>
      </div>
    );
  }

  const steps = [
    { title: 'Order Placed', desc: 'Buyer submitted courseware order request' },
    { title: 'Escrow Funded', desc: 'Payment locked safely in campus escrow' },
    { title: 'Campus Meetup Scheduled', desc: 'Direct on-site handshake meeting set' },
    { title: 'Item Inspected', desc: 'Buyer confirms textbook condition' },
    { title: 'Payment Released', desc: 'Funds transferred instantly to seller' },
  ];

  return (
    <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 space-y-8 text-[#3B2A22]">
      <div className="flex items-center justify-between">
        <Link to="/orders" className="inline-flex items-center gap-2 font-sans text-xs text-[#8B7562] hover:text-[#3B2A22] transition-colors">
          ← Back to Orders
        </Link>
        <Link to={`/orders/${orderNumber}`} className="font-sans text-xs font-semibold text-[#8B6A4F] hover:underline">
          View Receipt Details →
        </Link>
      </div>

      {disputeMsg && (
        <div className="p-4 rounded-2xl bg-[#6E8A62]/15 border border-[#6E8A62]/30 text-[#6E8A62] text-xs font-sans font-semibold flex items-center justify-between">
          <span>✓ {disputeMsg}</span>
          <button onClick={() => setDisputeMsg(null)} className="hover:opacity-75">✕</button>
        </div>
      )}

      {order?.dispute && (
        <div className="p-5 rounded-2xl bg-[#9B5C52]/10 border border-[#9B5C52]/25 text-xs text-[#9B5C52] font-sans flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#9B5C52] animate-ping" />
            <span className="font-semibold">Escrow Dispute Open: {order.dispute.reason.replace(/_/g, ' ')}</span>
          </div>
          <span className="text-[10px] uppercase font-bold px-2.5 py-0.5 rounded-full bg-[#9B5C52]/15 border border-[#9B5C52]/30">
            {order.dispute.status.replace(/_/g, ' ')}
          </span>
        </div>
      )}

      <div className="p-8 sm:p-10 rounded-[32px] bg-[#EDE5D9] border border-[#D6C8B8] shadow-warm-subtle space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="tag-editorial mb-2 block">Escrow Milestone Tracker</span>
            <h1 className="font-heading text-4xl font-normal text-[#3B2A22]">Order #{orderNumber} Status</h1>
            <p className="font-sans text-xs text-[#8B7562] mt-1">100% Guaranteed Campus Handshake Escrow Progress</p>
          </div>

          {!order?.dispute && order && ['PAID_ESCROW', 'SELLER_ACCEPTED', 'DELIVERED_PENDING_INSPECTION', 'COMPLETED'].includes(order.status) && (
            <button
              type="button"
              onClick={() => setIsDisputeModalOpen(true)}
              className="btn-secondary !py-2 !px-4 text-xs text-[#9B5C52] border-[#9B5C52]/40 hover:border-[#9B5C52] hover:bg-[#9B5C52]/10 self-start sm:self-auto shrink-0"
            >
              Open Dispute
            </button>
          )}
        </div>

        {/* 5 Step Progress Timeline */}
        <div className="space-y-4 pt-4 border-t border-[#D6C8B8]">
          {steps.map((step, idx) => (
            <div key={step.title} className="flex items-start gap-4 p-4 rounded-2xl bg-[#E7DED1] border border-[#D6C8B8]">
              <div className="w-8 h-8 rounded-full bg-[#111111] text-[#F4EFE7] font-heading font-semibold text-sm flex items-center justify-center shrink-0">
                {idx + 1}
              </div>
              <div>
                <h4 className="font-heading text-xl font-normal text-[#3B2A22]">{step.title}</h4>
                <p className="font-sans text-xs text-[#8B7562] mt-0.5">{step.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {order && (
        <DisputeModal
          isOpen={isDisputeModalOpen}
          onClose={() => setIsDisputeModalOpen(false)}
          onSuccess={() => {
            setDisputeMsg('Dispute submitted successfully. Our resolution team will review the case.');
            loadTracking();
          }}
          orderId={order.id}
          orderNumber={order.orderNumber}
        />
      )}
    </div>
  );
};
