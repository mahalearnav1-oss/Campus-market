import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { apiClient } from '../../lib/api/client';
import { queryClient } from '../../lib/queryClient';
import { CategoryData } from '../MarketplacePage';
import { ImageUpload } from '../../components/ImageUpload';

export const CreateProductPage: React.FC = () => {
  const navigate = useNavigate();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [originalMsrp, setOriginalMsrp] = useState('');
  const [quantity, setQuantity] = useState('1');
  const [conditionGrade, setConditionGrade] = useState('GOOD');
  const [conditionNotes, setConditionNotes] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [imageUrl, setImageUrl] = useState('');

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
    async function loadCategories() {
      try {
        const res: any = await apiClient.get('/categories');
        setCategories(res.data.categories || res.data || []);
      } catch (e) {
        // Ignore
      }
    }
    loadCategories();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setImageError(null);

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
      setError(err.message || 'Failed to create product listing.');
    } finally {
      setIsSubmitting(false);
    }
  };

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
    </div>
  );
};
