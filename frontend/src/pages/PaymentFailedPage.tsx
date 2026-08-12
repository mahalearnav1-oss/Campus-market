import React from 'react';
import { Link } from 'react-router-dom';

export const PaymentFailedPage: React.FC = () => {
  return (
    <div className="max-w-xl mx-auto my-16 p-8 sm:p-12 rounded-[36px] bg-[#EDE5D9] border border-[#D6C8B8] shadow-warm-card text-center space-y-6 text-[#3B2A22]">
      <div className="w-16 h-16 rounded-2xl bg-[#9B5C52]/15 text-[#9B5C52] border border-[#9B5C52]/30 flex items-center justify-center mx-auto">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="12" />
          <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
      </div>
      <div>
        <span className="tag-editorial mb-2 block">Payment Unsuccessful</span>
        <h1 className="font-heading text-4xl font-normal text-[#3B2A22]">Escrow Funding Failed</h1>
        <p className="font-sans text-xs text-[#6E5948] mt-2 leading-relaxed">
          Your transaction could not be processed. No funds were deducted from your account.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 pt-2">
        <Link to="/checkout" className="btn-primary flex-1 text-xs">
          Retry Checkout
        </Link>
        <Link to="/cart" className="btn-secondary flex-1 text-xs">
          Return to Cart
        </Link>
      </div>
    </div>
  );
};
