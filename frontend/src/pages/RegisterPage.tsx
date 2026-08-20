import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore, UserRole } from '../stores/authStore';
import { apiClient } from '../lib/api/client';
import { ACADEMIC_BRANCHES, ACADEMIC_SEMESTERS } from '../lib/academicConstants';

export interface CollegeOption {
  id: string;
  name: string;
  code: string;
  city: string;
  state: string;
}

export const RegisterPage: React.FC = () => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>('STUDENT_BUYER');
  const [collegeId, setCollegeId] = useState('');
  const [course, setCourse] = useState('');
  const [semester, setSemester] = useState('');
  const [colleges, setColleges] = useState<CollegeOption[]>([]);
  const [isLoadingColleges, setIsLoadingColleges] = useState(true);
  const [collegeFetchError, setCollegeFetchError] = useState<string | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);

  const { register, error, isLoading, clearError } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    let isMounted = true;
    async function loadColleges() {
      try {
        setIsLoadingColleges(true);
        setCollegeFetchError(null);
        const res: any = await apiClient.get('/colleges');
        if (isMounted) {
          const list = res?.data?.colleges || [];
          setColleges(list);
          if (list.length > 0) {
            setCollegeId(list[0].id);
          }
        }
      } catch (err: any) {
        if (isMounted) {
          setCollegeFetchError('Failed to load campus list. Please refresh or try again.');
        }
      } finally {
        if (isMounted) {
          setIsLoadingColleges(false);
        }
      }
    }
    loadColleges();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);
    if (!collegeId) {
      setValidationError('Please select your university campus to continue.');
      return;
    }
    try {
      await register({
        firstName,
        lastName,
        email,
        password,
        role,
        collegeId,
        course: course.trim() || null,
        semester: semester ? parseInt(semester, 10) : null,
      });
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
            Join verified students trading secondhand textbooks, lab tools, and course gear directly on your campus network.
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
          {(error || validationError) && (
            <div className="mb-6 flex items-center justify-between gap-2 p-4 rounded-2xl border border-[#9B5C52]/30 bg-[#9B5C52]/10">
              <span className="font-sans text-xs text-[#9B5C52]">{error || validationError}</span>
              <button
                type="button"
                onClick={() => {
                  clearError();
                  setValidationError(null);
                }}
                className="text-[#9B5C52] hover:text-[#3B2A22] transition-colors"
              >
                ✕
              </button>
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
                  onChange={(e) => { clearError(); setValidationError(null); setFirstName(e.target.value); }}
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
                  onChange={(e) => { clearError(); setValidationError(null); setLastName(e.target.value); }}
                  placeholder="Smith"
                  className="input-editorial"
                  autoComplete="family-name"
                />
              </div>
            </div>

            <div>
              <label className="font-sans text-[10px] tracking-[0.15em] uppercase font-semibold text-[#8B7562] block mb-2">
                University Campus <span className="text-[#9B5C52]">*</span>
              </label>
              {isLoadingColleges ? (
                <div className="input-editorial flex items-center justify-between text-xs text-[#8B7562] py-3.5 px-5">
                  <span>Loading available campuses…</span>
                  <div className="w-4 h-4 rounded-full border-2 border-[#C8A46A] border-t-transparent animate-spin" />
                </div>
              ) : collegeFetchError ? (
                <div className="p-3 rounded-2xl border border-[#9B5C52]/30 bg-[#9B5C52]/10 text-[#9B5C52] text-xs font-sans flex items-center justify-between">
                  <span>{collegeFetchError}</span>
                  <button
                    type="button"
                    onClick={() => window.location.reload()}
                    className="underline text-[11px] font-semibold"
                  >
                    Retry
                  </button>
                </div>
              ) : (
                <select
                  required
                  value={collegeId}
                  onChange={(e) => {
                    clearError();
                    setValidationError(null);
                    setCollegeId(e.target.value);
                  }}
                  className="input-editorial cursor-pointer"
                >
                  <option value="">Select your university / campus…</option>
                  {colleges.map((col) => (
                    <option key={col.id} value={col.id}>
                      {col.name} ({col.code}) — {col.city}, {col.state}
                    </option>
                  ))}
                </select>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="w-full">
                <label className="font-sans text-[10px] tracking-[0.15em] uppercase font-semibold text-[#8B7562] block mb-2 truncate" title="Branch / Course (optional)">
                  Branch / Course <span className="text-[#8B7562] font-normal lowercase">(optional)</span>
                </label>
                <select
                  value={course}
                  onChange={(e) => setCourse(e.target.value)}
                  className="input-editorial cursor-pointer w-full"
                >
                  <option value="">Branch</option>
                  {ACADEMIC_BRANCHES.map((b) => (
                    <option key={b} value={b}>
                      {b}
                    </option>
                  ))}
                </select>
              </div>

              <div className="w-full">
                <label className="font-sans text-[10px] tracking-[0.15em] uppercase font-semibold text-[#8B7562] block mb-2 truncate" title="Semester (optional)">
                  Semester <span className="text-[#8B7562] font-normal lowercase">(optional)</span>
                </label>
                <select
                  value={semester}
                  onChange={(e) => setSemester(e.target.value)}
                  className="input-editorial cursor-pointer w-full"
                >
                  <option value="">Semester</option>
                  {ACADEMIC_SEMESTERS.map((s) => (
                    <option key={s} value={s}>
                      Semester {s}
                    </option>
                  ))}
                </select>
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
                onChange={(e) => { clearError(); setValidationError(null); setEmail(e.target.value); }}
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
                onChange={(e) => { clearError(); setValidationError(null); setPassword(e.target.value); }}
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
              disabled={isLoading || isLoadingColleges}
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
