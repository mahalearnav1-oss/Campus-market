import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { apiClient } from '../../lib/api/client';
import { queryClient } from '../../lib/queryClient';
import { ImageUpload } from '../../components/ImageUpload';

export const EditProductPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [quantity, setQuantity] = useState('1');
  const [conditionGrade, setConditionGrade] = useState('GOOD');
  const [imageUrl, setImageUrl] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [imageError, setImageError] = useState<string | null>(null);

  useEffect(() => {
    async function loadProduct() {
      if (!id) return;
      try {
        setIsLoading(true);
        const res: any = await apiClient.get(`/products/${id}`);
        const p = res.data.product;
        setTitle(p.title);
        setDescription(p.description || '');
        setPrice(String(p.price));
        setQuantity(String(p.quantity));
        setConditionGrade(p.conditionGrade);
        if (p.images && p.images.length > 0) {
          setImageUrl(p.images[0].imageUrl);
        }
      } catch (err: any) {
        setError(err.message || 'Couldn\'t load product details. Please try again.');
      } finally {
        setIsLoading(false);
      }
    }
    loadProduct();
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setImageError(null);

    if (isUploading) {
      setError('Please wait for the photo upload to finish before saving.');
      return;
    }

    if (!imageUrl || !imageUrl.trim()) {
      const msg = 'Please upload at least one photo of the actual product before saving.';
      setImageError(msg);
      setError(msg);
      return;
    }

    if (!id || !title.trim() || !price) return;

    try {
      setIsSubmitting(true);
      await apiClient.patch(`/products/${id}`, {
        title: title.trim(),
        description: description.trim(),
        price: parseFloat(price),
        quantity: parseInt(quantity, 10),
        conditionGrade,
        images: [{ imageUrl: imageUrl.trim(), isPrimary: true }],
      });
      queryClient.invalidateQueries();
      navigate('/seller/products');
    } catch (err: any) {
      setError(err.message || 'Couldn\'t update product listing. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto py-20 px-4 text-center">
        <div className="w-12 h-12 rounded-full border-2 border-[#C8A46A] border-t-transparent animate-spin mx-auto mb-4" />
        <p className="font-sans text-xs text-[#8B7562]">Loading product details…</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 space-y-8 text-[#3B2A22]">
      <Link to="/seller/products" className="inline-flex items-center gap-2 font-sans text-xs text-[#8B7562] hover:text-[#3B2A22] transition-colors">
        ← Back to Inventory
      </Link>

      <div className="p-8 sm:p-10 rounded-[32px] bg-[#EDE5D9] border border-[#D6C8B8] shadow-warm-subtle">
        <span className="tag-editorial mb-2 block">Storefront Inventory</span>
        <h1 className="font-heading text-4xl font-normal text-[#3B2A22]">Edit Listing</h1>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-[#9B5C52]/15 border border-[#9B5C52]/30 text-[#9B5C52] text-xs font-semibold font-sans">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="p-8 sm:p-10 rounded-[32px] bg-[#EDE5D9] border border-[#D6C8B8] shadow-warm-subtle space-y-6 font-sans text-xs">
        <div>
          <label className="font-sans text-[10px] tracking-[0.15em] uppercase font-semibold text-[#8B7562] block mb-2">Listing Title</label>
          <input type="text" required value={title} onChange={(e) => setTitle(e.target.value)} className="input-editorial" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="font-sans text-[10px] tracking-[0.15em] uppercase font-semibold text-[#8B7562] block mb-2">Selling Price (₹)</label>
            <input type="number" step="0.01" required value={price} onChange={(e) => setPrice(e.target.value)} className="input-editorial" />
          </div>

          <div>
            <label className="font-sans text-[10px] tracking-[0.15em] uppercase font-semibold text-[#8B7562] block mb-2">Quantity</label>
            <input type="number" min="1" value={quantity} onChange={(e) => setQuantity(e.target.value)} className="input-editorial" />
          </div>

          <div>
            <label className="font-sans text-[10px] tracking-[0.15em] uppercase font-semibold text-[#8B7562] block mb-2">Condition Grade</label>
            <select value={conditionGrade} onChange={(e) => setConditionGrade(e.target.value)} className="input-editorial cursor-pointer">
              <option value="BRAND_NEW">Brand New</option>
              <option value="LIKE_NEW">Like New</option>
              <option value="GOOD">Good</option>
              <option value="FAIR">Fair</option>
              <option value="ACCEPTABLE">Acceptable</option>
            </select>
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
          helperText="At least 1 clear photo of the actual product is required."
          required={true}
          error={imageError}
        />

        <div>
          <label className="font-sans text-[10px] tracking-[0.15em] uppercase font-semibold text-[#8B7562] block mb-2">Description</label>
          <textarea rows={4} value={description} onChange={(e) => setDescription(e.target.value)} className="input-editorial w-full" />
        </div>

        <button
          type="submit"
          disabled={isSubmitting || isUploading}
          className="btn-primary w-full py-4 text-xs font-semibold uppercase tracking-wider disabled:opacity-50"
        >
          {isUploading ? 'Uploading Photo…' : isSubmitting ? 'Updating Listing…' : 'Save Changes'}
        </button>
      </form>
    </div>
  );
};
