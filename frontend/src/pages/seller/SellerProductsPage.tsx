import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { apiClient } from '../../lib/api/client';
import { queryClient } from '../../lib/queryClient';

export interface SellerProductItem {
  id: string;
  title: string;
  price: string | number;
  quantity: number;
  status: string;
  conditionGrade: string;
  createdAt: string;
  category?: { name: string } | null;
  images?: Array<{ imageUrl: string; isPrimary: boolean }>;
}

export const SellerProductsPage: React.FC = () => {
  const [products, setProducts] = useState<SellerProductItem[]>([]);
  const [statusFilter, setStatusFilter] = useState<string | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const fetchSellerProducts = async () => {
    try {
      setIsLoading(true);
      const queryParams = new URLSearchParams({
        limit: '50',
        ...(statusFilter ? { status: statusFilter } : {}),
      });
      const res: any = await apiClient.get(`/products/seller/me?${queryParams.toString()}`);
      setProducts(res.data.products || []);
    } catch (err: any) {
      setError(err.message || 'Failed to load seller products.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSellerProducts();
  }, [statusFilter]);

  const handlePublish = async (id: string) => {
    try {
      setMessage(null);
      await apiClient.post(`/products/${id}/publish`);
      queryClient.invalidateQueries();
      setMessage('Product successfully published to marketplace!');
      fetchSellerProducts();
    } catch (err: any) {
      setError(err.message || 'Failed to publish product.');
    }
  };

  const handlePause = async (id: string) => {
    try {
      setMessage(null);
      await apiClient.post(`/products/${id}/pause`);
      queryClient.invalidateQueries();
      setMessage('Product paused.');
      fetchSellerProducts();
    } catch (err: any) {
      setError(err.message || 'Failed to pause product.');
    }
  };

  const handleArchive = async (id: string) => {
    if (!confirm('Are you sure you want to archive this product listing?')) return;
    try {
      setMessage(null);
      await apiClient.delete(`/products/${id}`);
      queryClient.invalidateQueries();
      setMessage('Product listing archived.');
      fetchSellerProducts();
    } catch (err: any) {
      setError(err.message || 'Failed to archive product.');
    }
  };

  return (
    <div className="max-w-6xl mx-auto py-12 px-4 sm:px-6 lg:px-8 space-y-8 text-[#3B2A22]">

      {/* Header Banner */}
      <div className="p-8 sm:p-10 rounded-[32px] bg-[#EDE5D9] border border-[#D6C8B8] shadow-warm-subtle flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <span className="tag-editorial mb-2 block">Store Inventory</span>
          <h1 className="font-heading text-4xl font-normal text-[#3B2A22]">Product Listings Inventory</h1>
          <p className="font-sans text-xs text-[#8B7562] mt-1">Manage active items, update prices, or post new course textbooks & lab gear</p>
        </div>
        <Link to="/seller/products/new" className="btn-primary text-xs !py-3.5 !px-6">
          + Post New Product Listing
        </Link>
      </div>

      {message && (
        <div className="p-4 rounded-2xl bg-[#6E8A62]/15 border border-[#6E8A62]/30 text-[#6E8A62] font-sans text-xs font-semibold">
          {message}
        </div>
      )}
      {error && (
        <div className="p-4 rounded-2xl bg-[#9B5C52]/15 border border-[#9B5C52]/30 text-[#9B5C52] font-sans text-xs font-semibold">
          {error}
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-[#D6C8B8] pb-4 font-sans text-xs font-semibold">
        {['ALL', 'ACTIVE', 'DRAFT', 'PAUSED', 'SOLD'].map((st) => (
          <button
            key={st}
            onClick={() => setStatusFilter(st === 'ALL' ? undefined : st)}
            className={`px-4 py-2 rounded-xl transition-all ${
              (st === 'ALL' && !statusFilter) || statusFilter === st
                ? 'bg-[#111111] text-[#F4EFE7]'
                : 'bg-[#EDE5D9] text-[#6E5948] hover:text-[#3B2A22] border border-[#D6C8B8]'
            }`}
          >
            {st}
          </button>
        ))}
      </div>

      {/* Products Table */}
      {isLoading ? (
        <div className="text-center py-16 text-xs text-[#8B7562]">Loading store inventory…</div>
      ) : products.length === 0 ? (
        <div className="text-center py-20 px-6 rounded-[32px] bg-[#EDE5D9] border border-[#D6C8B8] shadow-warm-subtle space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-[#E7DED1] border border-[#D6C8B8] text-[#3B2A22] flex items-center justify-center mx-auto">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
              <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
              <line x1="12" y1="22.08" x2="12" y2="12" />
            </svg>
          </div>
          <h3 className="font-heading text-3xl font-normal text-[#3B2A22]">No Listings Found</h3>
          <p className="font-sans text-xs text-[#6E5948] max-w-sm mx-auto leading-relaxed">
            Post your pre-owned textbooks, calculators, and lab tools to start earning from campus sales.
          </p>
          <Link to="/seller/products/new" className="btn-primary">
            Post First Listing
          </Link>
        </div>
      ) : (
        <div className="bg-[#EDE5D9] border border-[#D6C8B8] rounded-[32px] overflow-hidden shadow-warm-subtle">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse font-sans text-xs">
              <thead>
                <tr className="bg-[#E7DED1] border-b border-[#D6C8B8] text-[10px] font-semibold text-[#8B7562] uppercase tracking-wider">
                  <th className="p-4 pl-6">Listing Title</th>
                  <th className="p-4">Category</th>
                  <th className="p-4">Price</th>
                  <th className="p-4">Qty</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 pr-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#D6C8B8]">
                {products.map((p) => {
                  const img = p.images?.[0]?.imageUrl || 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=80';
                  return (
                    <tr key={p.id} className="hover:bg-[#E7DED1]/50 transition-colors">
                      <td className="p-4 pl-6">
                        <div className="flex items-center gap-3">
                          <img src={img} alt={p.title} className="w-12 h-12 object-cover rounded-xl border border-[#D6C8B8] bg-[#E7DED1]" />
                          <div>
                            <Link to={`/products/${p.id}`} className="font-heading text-lg font-normal text-[#3B2A22] hover:text-[#8B6A4F] transition-colors line-clamp-1">
                              {p.title}
                            </Link>
                            <span className="text-[10px] text-[#8B7562] font-semibold">Grade: {p.conditionGrade}</span>
                          </div>
                        </div>
                      </td>

                      <td className="p-4 text-[#6E5948] font-medium">{p.category?.name || 'Uncategorized'}</td>

                      <td className="p-4 font-heading text-xl font-normal text-[#3B2A22]">
                        ₹{Number(p.price).toLocaleString('en-IN')}
                      </td>

                      <td className="p-4 font-semibold text-[#3B2A22]">{p.quantity}</td>

                      <td className="p-4">
                        <span
                          className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            p.status === 'ACTIVE'
                              ? 'bg-[#6E8A62]/15 text-[#6E8A62]'
                              : p.status === 'PAUSED'
                              ? 'bg-[#C8A46A]/20 text-[#3B2A22]'
                              : 'bg-[#9B5C52]/15 text-[#9B5C52]'
                          }`}
                        >
                          {p.status}
                        </span>
                      </td>

                      <td className="p-4 pr-6 text-right space-x-2">
                        <Link to={`/seller/products/${p.id}/edit`} className="btn-secondary text-[10px] !py-1.5 !px-3">
                          Edit
                        </Link>
                        {p.status === 'DRAFT' || p.status === 'PAUSED' ? (
                          <button onClick={() => handlePublish(p.id)} className="btn-primary text-[10px] !py-1.5 !px-3">
                            Publish
                          </button>
                        ) : p.status === 'ACTIVE' ? (
                          <button onClick={() => handlePause(p.id)} className="btn-secondary text-[10px] !py-1.5 !px-3">
                            Pause
                          </button>
                        ) : null}
                        <button onClick={() => handleArchive(p.id)} className="btn-ghost text-[10px] text-[#9B5C52] hover:text-[#3B2A22]">
                          Archive
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
};
