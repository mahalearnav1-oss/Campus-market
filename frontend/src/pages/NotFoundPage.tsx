import React from 'react';
import { Link } from 'react-router-dom';

export const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-[70vh] flex items-center justify-center p-4 text-[#3B2A22]">
      <div className="max-w-md w-full p-8 sm:p-12 rounded-[36px] bg-[#EDE5D9] border border-[#D6C8B8] shadow-warm-card text-center space-y-6">
        <div className="w-16 h-16 rounded-2xl bg-[#E7DED1] border border-[#D6C8B8] text-[#3B2A22] flex items-center justify-center mx-auto font-heading text-3xl font-normal">
          404
        </div>
        <div>
          <span className="tag-editorial mb-2 block">Page Not Found</span>
          <h1 className="font-heading text-4xl font-normal text-[#3B2A22]">Lost on Campus?</h1>
          <p className="font-sans text-xs text-[#6E5948] mt-2 leading-relaxed">
            The page or course listing you are looking for has moved or does not exist.
          </p>
        </div>

        <Link to="/" className="btn-primary w-full text-xs">
          Return to Marketplace Home
        </Link>
      </div>
    </div>
  );
};
