import React from 'react';
import { Link } from 'react-router-dom';

export const PaymentSuccessPage: React.FC = () => {
  return (
    <div className="max-w-xl mx-auto my-16 p-8 sm:p-12 rounded-[36px] bg-[#EDE5D9] border border-[#D6C8B8] shadow-warm-card text-center space-y-6 text-[#3B2A22]">
      <div className="w-16 h-16 rounded-2xl bg-[#6E8A62]/15 text-[#6E8A62] border border-[#6E8A62]/30 flex items-center justify-center mx-auto">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <polyline points="20 6 9 17 4 12" />
        </svg>
      </div>
      <div>
        <span className="tag-editorial mb-2 block">Payment Confirmed</span>
        <h1 className="font-heading text-4xl font-normal text-[#3B2A22]">Escrow Funded Successfully</h1>
        <p className="font-sans text-xs text-[#6E5948] mt-2 leading-relaxed">
          Your payment is safely held in campus escrow. The seller has been notified to schedule a direct campus meetup.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 pt-2">
        <Link to="/orders" className="btn-primary flex-1 text-xs">
          View My Orders
        </Link>
        <Link to="/products" className="btn-secondary flex-1 text-xs">
          Continue Shopping
        </Link>
      </div>
    </div>
  );
};
