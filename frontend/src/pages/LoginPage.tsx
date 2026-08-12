import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login, error, isLoading, clearError } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login(email, password);
      navigate('/account');
    } catch (err) {
      // Handled in store
    }
  };

  return (
    <div className="min-h-screen flex bg-[#F4EFE7] text-[#3B2A22]">
      {/* Left: Decorative Warm Editorial Panel */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-gradient-to-tr from-[#F4EFE7] via-[#EDE5D9] to-[#E7DED1] items-end p-16 border-r border-[#D6C8B8]">
        <img
          src="https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?auto=format&fit=crop&w=1200&q=80"
          alt="University Library Warm Sunlight"
          className="absolute inset-0 w-full h-full object-cover opacity-20"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#EDE5D9] via-[#EDE5D9]/70 to-transparent" />

        <div className="relative z-10">
          <span className="tag-editorial mb-4 block">Exclusive Campus Marketplace</span>
          <h2 className="font-heading text-5xl font-normal text-[#3B2A22] leading-tight mb-4">
            The marketplace built for <br />
            <span className="italic font-normal text-[#8B6A4F]">verified students.</span>
          </h2>
          <p className="font-sans text-sm text-[#6E5948] leading-relaxed max-w-md">
            Buy and sell secondhand textbooks, lab tools, and gear with 100% escrow protection within your university network.
          </p>

          <div className="flex items-center gap-6 mt-8 pt-8 border-t border-[#D6C8B8] text-xs">
            <div className="flex items-center gap-1.5 text-[#3B2A22]">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-[#6E8A62]">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
              <span>Escrow Protected</span>
            </div>
            <div className="flex items-center gap-1.5 text-[#3B2A22]">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-[#C8A46A]">
                <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
                <path d="M6 12v5c3 3 9 3 12 0v-5" />
              </svg>
              <span>Student ID Verified</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right: Glass Form Container */}
      <div className="flex-1 flex items-center justify-center px-6 py-16">
        <div className="w-full max-w-md p-8 sm:p-10 rounded-[32px] bg-[#EDE5D9] border border-[#D6C8B8] shadow-warm-card backdrop-blur-2xl">

          {/* Header */}
          <div className="mb-8">
            <Link to="/" className="font-heading text-2xl font-normal text-[#3B2A22] block mb-6">
              Campus<span className="text-[#C8A46A] italic">Market</span>
            </Link>
            <h1 className="font-heading text-4xl font-normal text-[#3B2A22] mb-2">
              Welcome back
            </h1>
            <p className="font-sans text-xs text-[#8B7562]">
              Sign in with your verified campus credentials
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 flex items-center justify-between gap-2 p-4 rounded-2xl border border-[#9B5C52]/30 bg-[#9B5C52]/10">
              <span className="font-sans text-xs text-[#9B5C52]">{error}</span>
              <button onClick={clearError} className="text-[#9B5C52] hover:text-[#3B2A22] transition-colors">✕</button>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="font-sans text-[10px] tracking-[0.15em] uppercase font-semibold text-[#8B7562] block mb-2">
                Campus Email
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => { clearError(); setEmail(e.target.value); }}
                placeholder="you@university.edu"
                className="input-editorial"
                autoComplete="email"
              />
            </div>

            <div>
              <label className="font-sans text-[10px] tracking-[0.15em] uppercase font-semibold text-[#8B7562] block mb-2">
                Password
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => { clearError(); setPassword(e.target.value); }}
                placeholder="••••••••"
                className="input-editorial"
                autoComplete="current-password"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="btn-primary w-full py-4 text-xs font-semibold uppercase tracking-wider mt-4"
            >
              {isLoading ? 'Authenticating…' : 'Sign In'}
            </button>
          </form>

          {/* Footer Navigation */}
          <p className="font-sans text-xs text-[#8B7562] mt-8 text-center">
            New to CampusMarket?{' '}
            <Link to="/register" className="text-[#3B2A22] font-semibold hover:underline">
              Create an Account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};
