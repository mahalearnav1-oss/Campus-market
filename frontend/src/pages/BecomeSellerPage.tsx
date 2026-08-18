import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiClient } from '../lib/api/client';
import { useAuthStore } from '../stores/authStore';

export const BecomeSellerPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, fetchMe } = useAuthStore();

  useEffect(() => {
    if (user?.sellerId) {
      navigate('/seller/products/new', { replace: true });
    }
  }, [user, navigate]);

  const [storeName, setStoreName] = useState('');
  const [sellerType, setSellerType] = useState('STUDENT');
  const [bio, setBio] = useState('');
  const [documentType, setDocumentType] = useState('Student ID Card');
  const [documentUrl, setDocumentUrl] = useState('https://campusmarket.internal/docs/student_id.pdf');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!storeName.trim()) return;

    try {
      setIsSubmitting(true);
      setError(null);
      await apiClient.post('/sellers/apply', {
        storeName: storeName.trim(),
        sellerType,
        bio: bio.trim() || undefined,
        documentType: documentType.trim() || 'Student ID Card',
        documentUrl: documentUrl.trim() || 'https://campusmarket.internal/docs/student_id.pdf',
      });
      await fetchMe();
      navigate('/seller/products');
    } catch (err: any) {
      setError(err.message || 'Couldn\'t set up seller profile. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 space-y-8 text-[#3B2A22]">
      {/* Header */}
      <div className="p-8 sm:p-12 rounded-[36px] bg-[#EDE5D9] border border-[#D6C8B8] shadow-warm-card">
        <span className="tag-editorial mb-3 block">Seller Registration</span>
        <h1 className="font-heading text-4xl sm:text-5xl font-normal text-[#3B2A22]">
          Become a Campus Seller
        </h1>
        <p className="font-sans text-sm text-[#6E5948] mt-2 max-w-xl leading-relaxed">
          List your pre-owned coursebooks, calculators, lab tools, and dorm supplies. Zero delivery costs and 100% escrow protection.
        </p>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-[#9B5C52]/15 border border-[#9B5C52]/30 text-[#9B5C52] text-xs font-semibold font-sans">
          {error}
        </div>
      )}

      {/* Registration Form */}
      <div className="p-8 sm:p-10 rounded-[32px] bg-[#EDE5D9] border border-[#D6C8B8] shadow-warm-subtle">
        <form onSubmit={handleSubmit} className="space-y-6 max-w-xl font-sans text-xs">
          <div>
            <label className="font-sans text-[10px] tracking-[0.15em] uppercase font-semibold text-[#8B7562] block mb-2">
              Storefront Name
            </label>
            <input
              type="text"
              required
              value={storeName}
              onChange={(e) => setStoreName(e.target.value)}
              placeholder="e.g. Engineering Books Hub, Alice’s Dorm Shop"
              className="input-editorial"
            />
          </div>

          <div>
            <label className="font-sans text-[10px] tracking-[0.15em] uppercase font-semibold text-[#8B7562] block mb-2">
              Seller Type
            </label>
            <select
              value={sellerType}
              onChange={(e) => setSellerType(e.target.value)}
              className="input-editorial cursor-pointer"
            >
              <option value="STUDENT">Student Seller (Individual)</option>
              <option value="COMMERCIAL_BOOKSTORE">Commercial Campus Bookstore</option>
            </select>
          </div>

          <div>
            <label className="font-sans text-[10px] tracking-[0.15em] uppercase font-semibold text-[#8B7562] block mb-2">
              Store Biography / Description
            </label>
            <textarea
              rows={4}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Describe what course materials or tools you typically sell…"
              className="input-editorial w-full"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting || !storeName.trim()}
            className="btn-primary w-full py-4 text-xs font-semibold uppercase tracking-wider disabled:opacity-40"
          >
            {isSubmitting ? 'Registering Seller Profile…' : 'Register Storefront'}
          </button>
        </form>
      </div>
    </div>
  );
};
