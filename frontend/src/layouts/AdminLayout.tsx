import React, { useState, useEffect } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { apiClient } from '../lib/api/client';

export const AdminLayout: React.FC = () => {
  const location = useLocation();
  const { user, logout, fetchMe } = useAuthStore();
  const [isPromoting, setIsPromoting] = useState(false);
  const [promoteMsg, setPromoteMsg] = useState<string | null>(null);

  useEffect(() => {
    fetchMe();
  }, []);

  const isAdminRole = user?.role === 'ADMIN' || user?.role === 'MODERATOR' || user?.role === 'SUPER_ADMIN';

  const handlePromoteAdmin = async () => {
    try {
      setIsPromoting(true);
      await apiClient.post('/auth/dev-promote-admin');
      await fetchMe();
      setPromoteMsg('Account successfully promoted to SUPER_ADMIN! Full access granted.');
    } catch (err: any) {
      setPromoteMsg(err.message || 'Failed to promote account.');
    } finally {
      setIsPromoting(false);
    }
  };

  const navItems = [
    {
      label: 'Overview',
      path: '/admin',
      icon: (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="3" y="3" width="7" height="7" />
          <rect x="14" y="3" width="7" height="7" />
          <rect x="14" y="14" width="7" height="7" />
          <rect x="3" y="14" width="7" height="7" />
        </svg>
      ),
    },
    {
      label: 'User Management',
      path: '/admin/users',
      icon: (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
          <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
      ),
    },
    {
      label: 'Sellers & Verification',
      path: '/admin/sellers',
      icon: (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
          <polyline points="9 22 9 12 15 12 15 22" />
        </svg>
      ),
    },
    {
      label: 'Product Moderation',
      path: '/admin/products',
      icon: (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
          <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
        </svg>
      ),
    },
    {
      label: 'Categories',
      path: '/admin/categories',
      icon: (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
          <line x1="7" y1="7" x2="7.01" y2="7" />
        </svg>
      ),
    },
    {
      label: 'Orders & Payments',
      path: '/admin/orders',
      icon: (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
          <line x1="1" y1="10" x2="23" y2="10" />
        </svg>
      ),
    },
    {
      label: 'Content Reports',
      path: '/admin/reports',
      icon: (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" />
          <line x1="4" y1="22" x2="4" y2="15" />
        </svg>
      ),
    },
    {
      label: 'Disputes',
      path: '/admin/disputes',
      icon: (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 3v18M3 7h18M6 12l-3 7h6l-3-7zM18 12l-3 7h6l-3-7z" />
        </svg>
      ),
    },
    {
      label: 'Audit Logs',
      path: '/admin/audit-logs',
      icon: (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <line x1="8" y1="6" x2="21" y2="6" />
          <line x1="8" y1="12" x2="21" y2="12" />
          <line x1="8" y1="18" x2="21" y2="18" />
          <line x1="3" y1="6" x2="3.01" y2="6" />
          <line x1="3" y1="12" x2="3.01" y2="12" />
          <line x1="3" y1="18" x2="3.01" y2="18" />
        </svg>
      ),
    },
  ];

  if (!user || !isAdminRole) {
    return (
      <div className="min-h-screen bg-[#F4EFE7] flex flex-col items-center justify-center p-6 text-center text-[#3B2A22]">
        <div className="w-full max-w-md bg-[#EDE5D9] border border-[#D6C8B8] rounded-[32px] p-8 sm:p-10 shadow-warm-card">
          <div className="w-14 h-14 rounded-2xl bg-[#111111] text-[#F4EFE7] flex items-center justify-center mx-auto mb-6">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
          </div>

          <h1 className="font-heading text-3xl font-normal text-[#3B2A22] mb-3">Admin Access Required</h1>
          <p className="font-sans text-xs text-[#6E5948] mb-6 leading-relaxed">
            Your account (<span className="text-[#3B2A22] font-semibold">{user?.email}</span>) has role{' '}
            <span className="font-semibold text-[#3B2A22] uppercase tracking-wide">{user?.role || 'BUYER'}</span>.
            Admin access requires ADMIN, MODERATOR, or SUPER_ADMIN role.
          </p>

          {promoteMsg && (
            <div className="mb-4 p-3.5 rounded-2xl border border-[#D6C8B8] bg-[#E7DED1] font-sans text-xs text-[#3B2A22]">
              {promoteMsg}
            </div>
          )}

          <div className="space-y-3">
            <button
              onClick={handlePromoteAdmin}
              disabled={isPromoting}
              className="btn-primary w-full disabled:opacity-50"
            >
              {isPromoting ? 'Promoting…' : 'Promote My Account to SUPER_ADMIN'}
            </button>

            <Link to="/" className="block font-sans text-xs text-[#8B7562] hover:text-[#3B2A22] transition-colors text-center mt-2">
              Return to Marketplace
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F4EFE7] text-[#3B2A22] flex flex-col">
      {/* Admin Executive Header */}
      <header className="bg-[#111111] text-[#F4EFE7] h-16 px-8 flex items-center justify-between sticky top-0 z-40 shadow-md">
        <div className="flex items-center gap-4">
          <Link to="/admin" className="font-heading text-xl font-normal text-[#F4EFE7] hover:opacity-80 transition-opacity">
            CampusMarket <span className="text-[#C8A46A] italic">Admin</span>
          </Link>
          <span className="text-[10px] tracking-[0.2em] uppercase font-sans text-[#F4EFE7]/60 font-semibold px-2.5 py-0.5 rounded-full bg-white/10 border border-white/10">
            {user?.role}
          </span>
        </div>

        <div className="flex items-center gap-6 text-xs">
          <Link to="/" className="font-sans text-xs tracking-wider uppercase text-[#F4EFE7]/70 hover:text-white transition-colors flex items-center gap-1">
            ← Marketplace
          </Link>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-[#C8A46A] text-[#3B2A22] flex items-center justify-center font-heading font-bold text-xs">
              {user?.firstName?.charAt(0)}
            </div>
            <span className="font-sans text-xs text-[#F4EFE7]">
              {user?.firstName} {user?.lastName}
            </span>
          </div>
          <button
            onClick={() => logout()}
            className="font-sans text-xs tracking-wider uppercase text-rose-400 hover:text-rose-300 transition-colors"
          >
            Sign Out
          </button>
        </div>
      </header>

      <div className="flex flex-1 max-w-[1440px] w-full mx-auto px-4 sm:px-8 py-8 gap-8">
        {/* Executive Warm Sidebar */}
        <aside className="w-64 shrink-0 bg-[#EDE5D9] border border-[#D6C8B8] rounded-[32px] p-6 shadow-warm-subtle h-fit sticky top-24">
          <div className="px-3 mb-4">
            <span className="font-sans text-[10px] tracking-[0.25em] uppercase text-[#8B7562] font-semibold">Admin Navigation</span>
          </div>
          <nav className="space-y-1.5">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-3 px-4 py-3 rounded-2xl font-sans text-xs transition-all duration-200 ${
                    isActive
                      ? 'text-[#F4EFE7] bg-[#111111] font-semibold shadow-sm'
                      : 'text-[#6E5948] hover:text-[#3B2A22] hover:bg-[#E7DED1]'
                  }`}
                >
                  <span className="text-[12px]">{item.icon}</span>
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 min-w-0 bg-[#EDE5D9] border border-[#D6C8B8] rounded-[32px] p-8 sm:p-10 shadow-warm-subtle">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
