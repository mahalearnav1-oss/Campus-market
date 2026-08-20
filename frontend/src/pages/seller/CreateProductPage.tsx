import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { apiClient } from '../../lib/api/client';
import { queryClient } from '../../lib/queryClient';
import { useAuthStore } from '../../stores/authStore';
import { CategoryData } from '../MarketplacePage';
import { ImageUpload } from '../../components/ImageUpload';
import { ACADEMIC_BRANCHES, ACADEMIC_SEMESTERS } from '../../lib/academicConstants';

export const CreateProductPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const [sellerStatus, setSellerStatus] = useState<string | null>(user?.sellerStatus || null);
  const [isCheckingStatus, setIsCheckingStatus] = useState(true);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [originalMsrp, setOriginalMsrp] = useState('');
  const [quantity, setQuantity] = useState('1');
  const [conditionGrade, setConditionGrade] = useState('GOOD');
  const [conditionNotes, setConditionNotes] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [imageUrl, setImageUrl] = useState('');

  // Academic Targeting State
  const [targetBranch, setTargetBranch] = useState('');
  const [targetSemester, setTargetSemester] = useState('');

  // Course Book Details
  const [author, setAuthor] = useState('');
  const [isbn13, setIsbn13] = useState('');
  const [courseCode, setCourseCode] = useState('');

  const [categories, setCategories] = useState<CategoryData[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [imageError, setImageError] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        setIsCheckingStatus(true);
        const [catRes, statusRes]: any = await Promise.all([
          apiClient.get('/categories'),
          apiClient.get('/sellers/me/status').catch(() => null),
        ]);
        setCategories(catRes.data?.categories || catRes.data || []);
        if (statusRes?.data?.status) {
          setSellerStatus(statusRes.data.status);
        }
      } catch (e) {
        // Ignore
      } finally {
        setIsCheckingStatus(false);
      }
    }
    loadData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setImageError(null);

    if (sellerStatus !== 'VERIFIED') {
      setError('Your seller account must be approved by an administrator before you can list products.');
      return;
    }

    if (isUploading) {
      setError('Please wait for the photo upload to finish before publishing.');
      return;
    }

    if (!imageUrl || !imageUrl.trim()) {
      const msg = 'Please upload at least one photo of the actual product before publishing.';
      setImageError(msg);
      setError(msg);
      return;
    }

    if (!title.trim() || !price || !categoryId) return;

    try {
      setIsSubmitting(true);

      const payload: any = {
        title: title.trim(),
        description: description.trim() || 'Verified pre-owned campus course item in clean, usable condition.',
        price: parseFloat(price),
        originalMsrp: originalMsrp ? parseFloat(originalMsrp) : undefined,
        quantity: parseInt(quantity, 10) || 1,
        conditionGrade,
        conditionNotes: conditionNotes.trim() || 'Verified condition grade by seller.',
        categoryId,
        targetBranch: targetBranch.trim() || undefined,
        targetSemester: targetSemester ? parseInt(targetSemester, 10) : undefined,
        images: [{ imageUrl: imageUrl.trim(), isPrimary: true }],
        bookDetails: author.trim() || isbn13.trim() || courseCode.trim() ? {
          author: author.trim() || 'Standard Course Author',
          isbn13: isbn13.trim() || undefined,
          courseCode: courseCode.trim() || undefined,
        } : undefined,
      };

      await apiClient.post('/products', payload);
      queryClient.invalidateQueries();
      navigate('/seller/products');
    } catch (err: any) {
      setError(err.message || 'Couldn\'t publish listing. Please check the details and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isCheckingStatus) {
    return (
      <div className="max-w-4xl mx-auto py-20 px-4 text-center text-xs text-[#8B7562]">
        <div className="w-10 h-10 rounded-full border-2 border-[#C8A46A] border-t-transparent animate-spin mx-auto mb-4" />
        Checking seller verification status…
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 space-y-8 text-[#3B2A22]">
      <Link to="/seller/products" className="inline-flex items-center gap-2 font-sans text-xs text-[#8B7562] hover:text-[#3B2A22] transition-colors">
        ← Back to Seller Inventory
      </Link>

      <div className="p-8 sm:p-10 rounded-[32px] bg-[#EDE5D9] border border-[#D6C8B8] shadow-warm-subtle">
        <span className="tag-editorial mb-2 block">Catalog Management</span>
        <h1 className="font-heading text-4xl font-normal text-[#3B2A22]">Post New Product Listing</h1>
        <p className="font-sans text-xs text-[#8B7562] mt-1">List your pre-owned courseware, calculators, or lab tools</p>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-[#9B5C52]/15 border border-[#9B5C52]/30 text-[#9B5C52] text-xs font-semibold font-sans">
          {error}
        </div>
      )}

      {sellerStatus && sellerStatus !== 'VERIFIED' ? (
        <div className="p-8 sm:p-12 rounded-[32px] bg-[#EDE5D9] border border-[#D6C8B8] shadow-warm-subtle text-center space-y-6">
          <div className="w-16 h-16 rounded-3xl bg-[#C8A46A]/20 border border-[#C8A46A]/40 text-[#8B6A4F] flex items-center justify-center mx-auto text-3xl">
            ⏳
          </div>
          <div className="space-y-2 max-w-md mx-auto">
            <span className="tag-editorial">Approval Required</span>
            <h2 className="font-heading text-3xl font-normal text-[#3B2A22]">
              Storefront Awaiting Admin Approval
            </h2>
            <p className="font-sans text-xs text-[#8B7562] leading-relaxed">
              Your seller account is currently <strong className="text-[#3B2A22] uppercase">{sellerStatus}</strong>. CampusMarket requires administrator approval before your storefront can list or publish products on the campus marketplace.
            </p>
          </div>
          <div className="p-5 rounded-2xl bg-[#E7DED1] border border-[#D6C8B8] max-w-md mx-auto text-left font-sans text-xs space-y-2">
            <p className="font-semibold text-[#3B2A22]">Next Steps:</p>
            <ul className="list-disc list-inside text-[#6E5948] space-y-1.5 text-xs">
              <li>A university administrator is reviewing your storefront verification.</li>
              <li>You will receive an in-app notification immediately upon approval.</li>
              <li>Once approved, you will be able to post listings and accept orders.</li>
            </ul>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <Link to="/seller/products" className="btn-secondary text-xs !py-3 !px-6">
              View Storefront Status
            </Link>
            <Link to="/" className="btn-primary text-xs !py-3 !px-6">
              Browse Marketplace
            </Link>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="p-8 sm:p-10 rounded-[32px] bg-[#EDE5D9] border border-[#D6C8B8] shadow-warm-subtle space-y-6 font-sans text-xs">
          <div>
            <label className="font-sans text-[10px] tracking-[0.15em] uppercase font-semibold text-[#8B7562] block mb-2">
              Listing Title *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Higher Engineering Mathematics — 44th Edition"
              className="input-editorial"
            />
          </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="font-sans text-[10px] tracking-[0.15em] uppercase font-semibold text-[#8B7562] block mb-2">Category *</label>
            <select
              required
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="input-editorial cursor-pointer"
            >
              <option value="">Select Category</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="font-sans text-[10px] tracking-[0.15em] uppercase font-semibold text-[#8B7562] block mb-2">Condition Grade *</label>
            <select
              value={conditionGrade}
              onChange={(e) => setConditionGrade(e.target.value)}
              className="input-editorial cursor-pointer"
            >
              <option value="BRAND_NEW">Brand New</option>
              <option value="LIKE_NEW">Like New</option>
              <option value="GOOD">Good</option>
              <option value="FAIR">Fair</option>
              <option value="ACCEPTABLE">Acceptable</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="font-sans text-[10px] tracking-[0.15em] uppercase font-semibold text-[#8B7562] block mb-2">Selling Price (₹) *</label>
            <input type="number" step="0.01" required value={price} onChange={(e) => setPrice(e.target.value)} placeholder="450" className="input-editorial" />
          </div>

          <div>
            <label className="font-sans text-[10px] tracking-[0.15em] uppercase font-semibold text-[#8B7562] block mb-2">Original MSRP (₹)</label>
            <input type="number" step="0.01" value={originalMsrp} onChange={(e) => setOriginalMsrp(e.target.value)} placeholder="950" className="input-editorial" />
          </div>

          <div>
            <label className="font-sans text-[10px] tracking-[0.15em] uppercase font-semibold text-[#8B7562] block mb-2">Available Qty</label>
            <input type="number" min="1" value={quantity} onChange={(e) => setQuantity(e.target.value)} className="input-editorial" />
          </div>
        </div>

        <ImageUpload
          value={imageUrl}
          onChange={(url) => {
            setImageUrl(url);
            if (url) setImageError(null);
          }}
          onUploadingChange={setIsUploading}
          label="Product Photos"
          helperText="Upload at least one clear photo of the actual book/product you are selling."
          required={true}
          error={imageError}
        />

        <div>
          <label className="font-sans text-[10px] tracking-[0.15em] uppercase font-semibold text-[#8B7562] block mb-2">Detailed Description</label>
          <textarea
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Include information about highlights, missing pages, or condition notes…"
            className="input-editorial w-full"
          />
        </div>

        {/* Academic Personalization & Targeting */}
        <div className="p-6 rounded-2xl bg-[#E7DED1] border border-[#D6C8B8] space-y-4">
          <div>
            <span className="tag-editorial mb-1 block">Campus Discovery</span>
            <h4 className="font-heading text-xl font-normal text-[#3B2A22]">Academic Targeting (Optional)</h4>
            <p className="font-sans text-[11px] text-[#8B7562] mt-0.5">
              Tag your item with a specific engineering branch or semester to boost its visibility for relevant campus students.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="font-sans text-[10px] tracking-[0.15em] uppercase font-semibold text-[#8B7562] block mb-2">
                Target Branch / Course
              </label>
              <select
                value={targetBranch}
                onChange={(e) => setTargetBranch(e.target.value)}
                className="input-editorial cursor-pointer"
              >
                <option value="">All Branches / General</option>
                {ACADEMIC_BRANCHES.map((b) => (
                  <option key={b} value={b}>
                    {b}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="font-sans text-[10px] tracking-[0.15em] uppercase font-semibold text-[#8B7562] block mb-2">
                Target Semester
              </label>
              <select
                value={targetSemester}
                onChange={(e) => setTargetSemester(e.target.value)}
                className="input-editorial cursor-pointer"
              >
                <option value="">All Semesters / General</option>
                {ACADEMIC_SEMESTERS.map((s) => (
                  <option key={s} value={s}>
                    Semester {s}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Course Book Optional Metadata */}
        <div className="p-6 rounded-2xl bg-[#E7DED1] border border-[#D6C8B8] space-y-4">
          <h4 className="font-heading text-xl font-normal text-[#3B2A22]">Optional Courseware Metadata</h4>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="font-sans text-[10px] tracking-[0.15em] uppercase font-semibold text-[#8B7562] block mb-2">Author</label>
              <input type="text" value={author} onChange={(e) => setAuthor(e.target.value)} placeholder="B.S. Grewal" className="input-editorial" />
            </div>
            <div>
              <label className="font-sans text-[10px] tracking-[0.15em] uppercase font-semibold text-[#8B7562] block mb-2">ISBN-13</label>
              <input type="text" value={isbn13} onChange={(e) => setIsbn13(e.target.value)} placeholder="978-8174091955" className="input-editorial" />
            </div>
            <div>
              <label className="font-sans text-[10px] tracking-[0.15em] uppercase font-semibold text-[#8B7562] block mb-2">Course Code</label>
              <input type="text" value={courseCode} onChange={(e) => setCourseCode(e.target.value)} placeholder="MATH201" className="input-editorial" />
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={isSubmitting || isUploading}
          className="btn-primary w-full py-4 text-xs font-semibold uppercase tracking-wider disabled:opacity-50"
        >
          {isUploading ? 'Uploading Photo…' : isSubmitting ? 'Creating Listing…' : 'Publish Listing'}
        </button>
      </form>
      )}
    </div>
  );
};
