import React, { useEffect, useState } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useCampusStore } from '../stores/campusStore';
import { useAuthStore } from '../stores/authStore';
import { apiClient } from '../lib/api/client';
import { NotificationBell } from '../components/notifications/NotificationBell';
import { formatUserRole } from '../lib/formatters';

export const PublicLayout: React.FC = () => {
  const { activeCampus } = useCampusStore();
  const { user, isAuthenticated, fetchMe, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();

  const [cartCount, setCartCount] = useState(0);
  const [wishlistCount, setWishlistCount] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchCounts = async () => {
    if (!isAuthenticated) return;
    try {
      const [cartRes, wishRes]: any = await Promise.all([
        apiClient.get('/cart').catch(() => null),
        apiClient.get('/wishlist').catch(() => null),
      ]);
      if (cartRes?.data?.cart?.totalItemCount !== undefined) {
        setCartCount(cartRes.data.cart.totalItemCount);
      }
      if (wishRes?.data?.wishlist?.totalCount !== undefined) {
        setWishlistCount(wishRes.data.wishlist.totalCount);
      }
    } catch (e) {
      // Ignore
    }
  };

  useEffect(() => {
    fetchMe();
  }, []);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname, location.search]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchCounts();
    } else {
      setCartCount(0);
      setWishlistCount(0);
    }
  }, [isAuthenticated]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const isAdmin = user && ['ADMIN', 'SUPER_ADMIN', 'MODERATOR'].includes(user.role);

  return (
    <div className="min-h-screen flex flex-col bg-[#F4EFE7] text-[#3B2A22] selection:bg-[#C8A46A]/25">

      {/* ── Top Announcement & Trust Bar ────────────────────────────── */}
      <div className="bg-[#EDE5D9] border-b border-[#D6C8B8] text-[#3B2A22] text-center py-2.5 px-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between text-xs font-sans">
          <div className="hidden sm:flex items-center gap-2 text-[#6E5948] font-medium tracking-wide">
            <span className="w-1.5 h-1.5 rounded-full bg-[#C8A46A]" />
            Verified Campus Secondhand Exchange
          </div>

          <div className="mx-auto sm:mx-0 flex items-center gap-3">
            <span className="text-[#3B2A22] font-medium flex items-center gap-1.5">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-[#6E8A62]">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
              100% Guaranteed Campus Escrow Protection
            </span>
            {activeCampus && (
              <span className="hidden md:inline-flex items-center gap-1 px-3 py-0.5 rounded-full bg-[#E7DED1] text-[#3B2A22] border border-[#D6C8B8] text-[10px] font-bold tracking-wider uppercase">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
                  <path d="M6 12v5c3 3 9 3 12 0v-5" />
                </svg>
                {activeCampus.name}
              </span>
            )}
          </div>

          <div className="hidden lg:flex items-center gap-4 text-[#8B7562]">
            {isAdmin && (
              <Link to="/admin" className="text-[#3B2A22] font-semibold hover:underline flex items-center gap-1">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-[#C8A46A]">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
                Admin Dashboard
              </Link>
            )}
            <Link to="/products" className="hover:text-[#3B2A22] transition-colors">Catalog</Link>
            <span>•</span>
            <Link to="/become-seller" className="hover:text-[#3B2A22] transition-colors">Seller Portal</Link>
          </div>
        </div>
      </div>

      {/* ── Floating Glassmorphic Pill Navbar ───────────────────────── */}
      <div className="sticky top-4 z-50 px-4 sm:px-8 py-2">
        <header className="max-w-6xl mx-auto rounded-full bg-[#EDE5D9]/90 backdrop-blur-2xl border border-[#D6C8B8] shadow-glass-nav px-6 py-3 transition-all duration-300">
          <div className="flex items-center justify-between gap-4">

            {/* Left: Mobile Menu Toggle */}
            <button
              className="md:hidden flex flex-col gap-1.5 p-2 -ml-2 text-[#3B2A22] hover:opacity-70"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle menu"
            >
              <span className={`block w-5 h-0.5 bg-current transition-all duration-300 ${mobileMenuOpen ? 'rotate-45 translate-y-2' : ''}`} />
              <span className={`block w-5 h-0.5 bg-current transition-all duration-300 ${mobileMenuOpen ? 'opacity-0' : ''}`} />
              <span className={`block w-5 h-0.5 bg-current transition-all duration-300 ${mobileMenuOpen ? '-rotate-45 -translate-y-2' : ''}`} />
            </button>

            {/* Logo — Playfair Display Editorial */}
            <Link to="/" className="flex items-center gap-3 group">
              <div className="w-10 h-10 rounded-full bg-[#111111] flex items-center justify-center text-[#F4EFE7] shadow-sm group-hover:scale-105 transition-transform duration-300">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                  <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
                  <line x1="3" y1="6" x2="21" y2="6" />
                  <path d="M16 10a4 4 0 0 1-8 0" />
                </svg>
              </div>
              <div className="flex flex-col leading-none">
                <span className="font-heading text-2xl font-normal tracking-tight text-[#3B2A22] group-hover:text-[#8B6A4F] transition-colors">
                  Campus<span className="text-[#C8A46A] italic">Market</span>
                </span>
                <span className="text-[9px] tracking-[0.25em] uppercase font-sans text-[#8B7562] font-semibold mt-0.5">
                  Exclusive Student Exchange
                </span>
              </div>
            </Link>

            {/* Search Input Integrated in Navbar (Desktop) */}
            <form onSubmit={handleSearchSubmit} className="hidden md:flex flex-1 max-w-sm relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search textbooks, calculators, gear..."
                className="w-full bg-[#E7DED1] text-xs text-[#3B2A22] placeholder-[#8B7562] pl-9 pr-8 py-2 rounded-full border border-[#D6C8B8] focus:border-[#C8A46A] focus:ring-1 focus:ring-[#C8A46A]/30 focus:outline-none transition-all"
              />
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8B7562]">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              {searchQuery && (
                <button type="button" onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8B7562] hover:text-[#3B2A22] text-xs">
                  ✕
                </button>
              )}
            </form>

            {/* Navigation Links & Actions */}
            <div className="flex items-center gap-2 sm:gap-3">
              <Link
                to="/products"
                className={`hidden lg:inline-flex text-xs font-sans font-semibold uppercase tracking-[0.12em] px-4 py-2 rounded-full transition-all ${
                  location.pathname === '/products'
                    ? 'bg-[#111111] text-[#F4EFE7]'
                    : 'text-[#6E5948] hover:text-[#3B2A22] hover:bg-[#E7DED1]'
                }`}
              >
                Marketplace
              </Link>

              {isAdmin && (
                <Link
                  to="/admin"
                  className="hidden md:inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#E7DED1] text-[#3B2A22] border border-[#D6C8B8] hover:bg-[#111111] hover:text-[#F4EFE7] font-heading text-xs font-semibold uppercase tracking-wider transition-all"
                  title="Admin Dashboard"
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                  </svg>
                  <span>Admin</span>
                </Link>
              )}

              {isAuthenticated ? (
                <>
                  <NotificationBell />

                  <Link
                    to="/wishlist"
                    className="relative flex items-center justify-center w-9 h-9 rounded-full bg-[#E7DED1] border border-[#D6C8B8] text-[#3B2A22] hover:border-[#C8A46A] transition-all"
                    title="Wishlist"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                    </svg>
                    {wishlistCount > 0 && (
                      <span className="absolute -top-1 -right-1 badge-count">{wishlistCount}</span>
                    )}
                  </Link>

                  <Link
                    to="/cart"
                    className="relative flex items-center justify-center w-9 h-9 rounded-full bg-[#E7DED1] border border-[#D6C8B8] text-[#3B2A22] hover:border-[#C8A46A] transition-all"
                    title="Cart"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
                      <line x1="3" y1="6" x2="21" y2="6" />
                      <path d="M16 10a4 4 0 0 1-8 0" />
                    </svg>
                    {cartCount > 0 && (
                      <span className="absolute -top-1 -right-1 badge-count">{cartCount}</span>
                    )}
                  </Link>

                  {/* Profile Dropdown */}
                  {user && (
                    <div className="relative group">
                      <button className="flex items-center gap-2 p-0.5 rounded-full hover:ring-2 hover:ring-[#C8A46A]/50 transition-all">
                        <div className="w-8 h-8 rounded-full bg-[#111111] text-[#F4EFE7] border border-[#3B2A22] flex items-center justify-center font-heading font-semibold text-sm shadow-md">
                          {user.firstName?.charAt(0)}
                        </div>
                      </button>

                      <div className="absolute right-0 top-full mt-3 w-56 bg-[#EDE5D9] border border-[#D6C8B8] rounded-2xl shadow-2xl p-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                        <div className="px-3 py-2 border-b border-[#D6C8B8] mb-1">
                          <p className="font-heading font-medium text-base text-[#3B2A22]">{user.firstName} {user.lastName}</p>
                          <p className="font-sans text-[10px] text-[#8B7562] font-semibold tracking-wider mt-0.5">{formatUserRole(user.role)}</p>
                        </div>
                        {isAdmin && (
                          <Link to="/admin" className="flex items-center gap-2 px-3 py-2 text-xs font-sans font-semibold text-[#3B2A22] bg-[#E7DED1] hover:bg-[#D9C8B7] border border-[#D6C8B8] rounded-xl transition-colors my-1">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                            </svg>
                            <span>Admin Dashboard</span>
                          </Link>
                        )}
                        <Link to="/account" className="block px-3 py-2 text-xs font-sans text-[#6E5948] hover:text-[#3B2A22] hover:bg-[#E7DED1] rounded-xl transition-colors">
                          My Account
                        </Link>
                        <Link to="/orders" className="block px-3 py-2 text-xs font-sans text-[#6E5948] hover:text-[#3B2A22] hover:bg-[#E7DED1] rounded-xl transition-colors">
                          My Orders
                        </Link>
                        <Link to="/messages" className="block px-3 py-2 text-xs font-sans text-[#6E5948] hover:text-[#3B2A22] hover:bg-[#E7DED1] rounded-xl transition-colors">
                          Messages
                        </Link>
                        {user.sellerId && (
                          <Link to="/seller/products" className="block px-3 py-2 text-xs font-sans text-[#6E5948] hover:text-[#3B2A22] hover:bg-[#E7DED1] rounded-xl transition-colors">
                            Seller Dashboard
                          </Link>
                        )}
                        <button
                          onClick={logout}
                          className="w-full text-left px-3 py-2 text-xs font-sans font-medium text-rose-700 hover:bg-rose-500/10 rounded-xl transition-colors mt-1"
                        >
                          Sign Out
                        </button>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="flex items-center gap-2">
                  <Link to="/login" className="text-xs font-sans font-semibold uppercase tracking-wider text-[#6E5948] hover:text-[#3B2A22] px-3 py-2">
                    Sign In
                  </Link>
                  <Link to="/register" className="btn-primary text-xs !py-2 !px-4">
                    Register
                  </Link>
                </div>
              )}

              {/* Sell Item Action Button */}
              <Link
                to={!user ? '/login' : '/seller/products/new'}
                className="btn-primary hidden sm:inline-flex text-xs !py-2 !px-4"
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                  <line x1="12" y1="5" x2="12" y2="19" />
                  <line x1="5" y1="12" x2="19" y2="12" />
                </svg>
                Sell Item
              </Link>
            </div>
          </div>
        </header>
      </div>

      {/* ── Mobile Drawer Navigation ─────────────────────────────────── */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div className="fixed inset-0 bg-[#3B2A22]/50 backdrop-blur-md" onClick={() => setMobileMenuOpen(false)} />
          <div className="relative ml-auto w-4/5 max-w-xs bg-[#EDE5D9] h-full p-6 border-l border-[#D6C8B8] shadow-2xl overflow-y-auto">
            <div className="flex justify-between items-center pb-4 mb-4 border-b border-[#D6C8B8]">
              <span className="font-heading font-normal text-xl text-[#3B2A22]">CampusMarket</span>
              <button onClick={() => setMobileMenuOpen(false)} className="text-[#8B7562] hover:text-[#3B2A22]">
                ✕
              </button>
            </div>
            <nav className="flex flex-col gap-3 text-sm">
              <Link to="/products" onClick={() => setMobileMenuOpen(false)} className="py-2 text-[#3B2A22] hover:text-[#8B6A4F]">
                Browse Marketplace
              </Link>
              <Link to="/become-seller" onClick={() => setMobileMenuOpen(false)} className="py-2 text-[#3B2A22] hover:text-[#8B6A4F]">
                Become a Seller
              </Link>
              {isAdmin && (
                <Link to="/admin" onClick={() => setMobileMenuOpen(false)} className="py-2 text-[#3B2A22] font-semibold flex items-center gap-1.5">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-[#C8A46A]">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </svg>
                  Admin Dashboard
                </Link>
              )}
            </nav>
          </div>
        </div>
      )}

      {/* ── Main Content Outlet ──────────────────────────────────────── */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* ── Multi-Column Luxury Editorial Footer ─────────────────────── */}
      <footer className="bg-[#EDE5D9] border-t border-[#D6C8B8] pt-20 pb-12 text-[#6E5948] text-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 lg:px-12">
          {/* Trust Value Badges */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 pb-16 mb-16 border-b border-[#D6C8B8]">
            <div className="flex items-center gap-4 p-5 rounded-2xl bg-[#F4EFE7] border border-[#D6C8B8]">
              <div className="w-12 h-12 rounded-xl bg-[#EDE5D9] border border-[#D6C8B8] text-[#3B2A22] flex items-center justify-center">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-[#6E8A62]">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                </svg>
              </div>
              <div>
                <h4 className="font-heading font-medium text-[#3B2A22] text-lg">100% Escrow Protection</h4>
                <p className="text-xs text-[#8B7562] mt-0.5">Funds held safely until inspection</p>
              </div>
            </div>

            <div className="flex items-center gap-4 p-5 rounded-2xl bg-[#F4EFE7] border border-[#D6C8B8]">
              <div className="w-12 h-12 rounded-xl bg-[#6E8A62]/15 border border-[#6E8A62]/30 text-[#6E8A62] flex items-center justify-center">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
                  <path d="M6 12v5c3 3 9 3 12 0v-5" />
                </svg>
              </div>
              <div>
                <h4 className="font-heading font-medium text-[#3B2A22] text-lg">Student ID Verified</h4>
                <p className="text-xs text-[#8B7562] mt-0.5">High-trust campus network</p>
              </div>
            </div>

            <div className="flex items-center gap-4 p-5 rounded-2xl bg-[#F4EFE7] border border-[#D6C8B8]">
              <div className="w-12 h-12 rounded-xl bg-[#EDE5D9] border border-[#D6C8B8] text-[#3B2A22] flex items-center justify-center">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-[#C8A46A]">
                  <path d="M11 15h2a2 2 0 1 0 0-4h-3c-.6 0-1.1.2-1.4.6L4 16" />
                  <path d="m7 21 1.6-1.4c.3-.4.8-.6 1.4-.6h4c1.1 0 2.1-.4 2.8-1.2l4.6-4.4a2 2 0 0 0-2.7-2.9l-3.2 2.9" />
                  <path d="m2 10 6-6" />
                </svg>
              </div>
              <div>
                <h4 className="font-heading font-medium text-[#3B2A22] text-lg">Campus Handshake</h4>
                <p className="text-xs text-[#8B7562] mt-0.5">Zero delivery cost on-site</p>
              </div>
            </div>

            <div className="flex items-center gap-4 p-5 rounded-2xl bg-[#F4EFE7] border border-[#D6C8B8]">
              <div className="w-12 h-12 rounded-xl bg-[#EDE5D9] border border-[#D6C8B8] text-[#3B2A22] flex items-center justify-center">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
                </svg>
              </div>
              <div>
                <h4 className="font-heading font-medium text-[#3B2A22] text-lg">Instant Payouts</h4>
                <p className="text-xs text-[#8B7562] mt-0.5">Quick seller funds release</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-10 pb-16">
            <div className="md:col-span-2">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-9 h-9 rounded-full bg-[#111111] flex items-center justify-center text-[#F4EFE7]">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                    <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
                    <line x1="3" y1="6" x2="21" y2="6" />
                    <path d="M16 10a4 4 0 0 1-8 0" />
                  </svg>
                </div>
                <span className="font-heading text-2xl font-normal text-[#3B2A22]">Campus<span className="text-[#C8A46A] italic">Market</span></span>
              </div>
              <p className="text-xs text-[#8B7562] max-w-sm leading-relaxed mb-6">
                The premier exclusive student secondhand marketplace platform. Trade pre-owned textbooks, calculators, lab equipment, and dorm supplies with complete trust.
              </p>
            </div>

            <div>
              <h4 className="font-heading font-medium text-[#3B2A22] text-lg mb-4">Marketplace</h4>
              <ul className="space-y-3 text-xs">
                <li><Link to="/products?category=textbooks" className="hover:text-[#3B2A22] transition-colors">Textbooks</Link></li>
                <li><Link to="/products?category=electronics" className="hover:text-[#3B2A22] transition-colors">Electronics & Calculators</Link></li>
                <li><Link to="/products?category=dorm-supplies" className="hover:text-[#3B2A22] transition-colors">Dorm Supplies</Link></li>
                <li><Link to="/products?category=study-guides" className="hover:text-[#3B2A22] transition-colors">Study Guides</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-heading font-medium text-[#3B2A22] text-lg mb-4">Sellers</h4>
              <ul className="space-y-3 text-xs">
                <li><Link to="/become-seller" className="hover:text-[#3B2A22] transition-colors">Become a Seller</Link></li>
                <li><Link to="/seller/products" className="hover:text-[#3B2A22] transition-colors">Seller Dashboard</Link></li>
                <li><Link to="/account" className="hover:text-[#3B2A22] transition-colors">Account Settings</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-heading font-medium text-[#3B2A22] text-lg mb-4">Trust & Safety</h4>
              <ul className="space-y-3 text-xs">
                <li><span className="text-[#8B7562]">Escrow Policy</span></li>
                <li><span className="text-[#8B7562]">Student ID Verification</span></li>
                <li><span className="text-[#8B7562]">Campus Guidelines</span></li>
              </ul>
            </div>
          </div>

          <div className="pt-8 border-t border-[#D6C8B8] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#8B7562]">
            <p>© {new Date().getFullYear()} CampusMarket. Aesop-Inspired Warm Editorial Design.</p>
            <div className="flex items-center gap-6">
              <span>Privacy Policy</span>
              <span>Terms of Service</span>
              <span>Campus Directory</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};
