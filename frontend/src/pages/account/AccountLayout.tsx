import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import { formatUserRole } from '../../lib/formatters';

export const AccountLayout: React.FC = () => {
  const location = useLocation();
  const { user } = useAuthStore();

  const tabs = [
    { label: 'Overview', path: '/account' },
    { label: 'Profile', path: '/account/profile' },
    { label: 'Preferences', path: '/account/preferences' },
    { label: 'Addresses', path: '/account/addresses' },
    { label: 'Wishlist', path: '/wishlist' },
    { label: 'Price Alerts', path: '/price-alerts' },
    { label: 'My Orders', path: '/orders' },
    { label: 'Messages', path: '/messages' },
  ];

  return (
    <div className="max-w-6xl mx-auto py-12 px-4 sm:px-6 lg:px-8 space-y-8 text-[#3B2A22]">
      {/* Account Hero Banner */}
      <div className="p-8 sm:p-10 rounded-[32px] bg-[#EDE5D9] border border-[#D6C8B8] shadow-warm-subtle flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="flex items-center gap-5">
          <div className="w-16 h-16 rounded-2xl bg-[#111111] text-[#F4EFE7] font-heading font-semibold text-2xl flex items-center justify-center shadow-md">
            {user?.firstName?.charAt(0)}
            {user?.lastName?.charAt(0)}
          </div>
          <div>
            <h1 className="font-heading text-3xl sm:text-4xl font-normal text-[#3B2A22]">
              {user?.firstName} {user?.lastName}
            </h1>
            <p className="font-sans text-xs text-[#8B7562] mt-0.5">{user?.email}</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <span className="px-3.5 py-1.5 rounded-full bg-[#E7DED1] text-[#3B2A22] border border-[#D6C8B8] text-xs font-sans font-semibold">
            {formatUserRole(user?.role)}
          </span>
          {user?.sellerId && (
            <Link to="/seller/products" className="btn-primary text-xs !py-2.5 !px-4">
              Seller Dashboard →
            </Link>
          )}
        </div>
      </div>

      {/* Account Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-[#D6C8B8] pb-4 font-sans text-xs font-semibold overflow-x-auto">
        {tabs.map((tab) => {
          const isActive = location.pathname === tab.path;
          return (
            <Link
              key={tab.path}
              to={tab.path}
              className={`px-4 py-2 rounded-xl transition-all whitespace-nowrap ${
                isActive
                  ? 'bg-[#111111] text-[#F4EFE7]'
                  : 'bg-[#EDE5D9] text-[#6E5948] hover:text-[#3B2A22] border border-[#D6C8B8]'
              }`}
            >
              {tab.label}
            </Link>
          );
        })}
      </div>

      {/* Main Account Tab Content */}
      <main>
        <Outlet />
      </main>
    </div>
  );
};
