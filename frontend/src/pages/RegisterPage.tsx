import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore, UserRole } from '../stores/authStore';

export const RegisterPage: React.FC = () => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>('STUDENT_BUYER');
  const { register, error, isLoading, clearError } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await register({ firstName, lastName, email, password, role });
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
          src="https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=1200&q=80"
          alt="Campus Library Sunlight"
          className="absolute inset-0 w-full h-full object-cover opacity-20"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#EDE5D9] via-[#EDE5D9]/70 to-transparent" />

        <div className="relative z-10">
          <span className="tag-editorial mb-4 block">Join CampusMarket</span>
          <h2 className="font-heading text-5xl font-normal text-[#3B2A22] leading-tight mb-4">
            Everything you need <br />
            <span className="italic font-normal text-[#8B6A4F]">on one campus.</span>
          </h2>
          <p className="font-sans text-sm text-[#6E5948] leading-relaxed max-w-md">
            Join over 15,000 verified students trading secondhand textbooks, lab tools, and gear with discounts up to 70% off retail prices.
          </p>

          <div className="mt-8 flex flex-col gap-3">
            {[
              'Verified student profile',
              'Guaranteed Escrow protection on every purchase',
              'Zero delivery fee campus handshakes',
            ].map((benefit) => (
              <div key={benefit} className="flex items-center gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-[#C8A46A]" />
                <span className="font-sans text-xs text-[#6E5948]">{benefit}</span>
              </div>
            ))}
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
              Create account
            </h1>
            <p className="font-sans text-xs text-[#8B7562]">
              Join the student exchange — it takes less than 60 seconds
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
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="font-sans text-[10px] tracking-[0.15em] uppercase font-semibold text-[#8B7562] block mb-2">
                  First Name
                </label>
                <input
                  type="text"
                  required
                  value={firstName}
                  onChange={(e) => { clearError(); setFirstName(e.target.value); }}
                  placeholder="Alice"
                  className="input-editorial"
                  autoComplete="given-name"
                />
              </div>

              <div>
                <label className="font-sans text-[10px] tracking-[0.15em] uppercase font-semibold text-[#8B7562] block mb-2">
                  Last Name
                </label>
                <input
                  type="text"
                  required
                  value={lastName}
                  onChange={(e) => { clearError(); setLastName(e.target.value); }}
                  placeholder="Smith"
                  className="input-editorial"
                  autoComplete="family-name"
                />
              </div>
            </div>

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
                autoComplete="new-password"
              />
            </div>

            <div>
              <label className="font-sans text-[10px] tracking-[0.15em] uppercase font-semibold text-[#8B7562] block mb-2">
                Account Role
              </label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as UserRole)}
                className="input-editorial cursor-pointer"
              >
                <option value="STUDENT_BUYER">Student Buyer (Explore & Buy)</option>
                <option value="STUDENT_SELLER">Student Seller (Sell Textbooks & Gear)</option>
                <option value="COMMERCIAL_BOOKSTORE">Commercial Bookstore Partner</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="btn-primary w-full py-4 text-xs font-semibold uppercase tracking-wider mt-4"
            >
              {isLoading ? 'Creating Account…' : 'Create Free Account'}
            </button>
          </form>

          {/* Footer Navigation */}
          <p className="font-sans text-xs text-[#8B7562] mt-8 text-center">
            Already have an account?{' '}
            <Link to="/login" className="text-[#3B2A22] font-semibold hover:underline">
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};
