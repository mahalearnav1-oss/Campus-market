import React, { useState, useEffect } from 'react';
import { apiClient } from '../../lib/api/client';

export const AdminCategoriesPage: React.FC = () => {
  const [categories, setCategories] = useState<any[]>([]);
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const fetchCategories = async () => {
    try {
      setIsLoading(true);
      const res: any = await apiClient.get('/categories');
      setCategories(res.data.categories || res.data || []);
    } catch (err) {
      // Ignore
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !slug) return;
    try {
      await apiClient.post('/admin/categories', { name, slug });
      setName('');
      setSlug('');
      fetchCategories();
    } catch (err: any) {
      alert(err.message || 'Failed to create category.');
    }
  };

  return (
    <div className="space-y-8 text-[#3B2A22]">
      <div>
        <span className="tag-editorial mb-2 block">Taxonomy & Catalog</span>
        <h1 className="font-heading text-4xl font-normal text-[#3B2A22]">Category Management</h1>
        <p className="font-sans text-xs text-[#8B7562] mt-1">Organize course textbook and student gear taxonomy categories</p>
      </div>

      {/* Create Form */}
      <form onSubmit={handleCreate} className="p-6 rounded-[28px] bg-[#EDE5D9] border border-[#D6C8B8] shadow-warm-subtle flex flex-col sm:flex-row gap-4 items-end">
        <div className="flex-1">
          <label className="font-sans text-[10px] tracking-[0.15em] uppercase font-semibold text-[#8B7562] block mb-2">Category Name</label>
          <input type="text" value={name} onChange={(e) => { setName(e.target.value); setSlug(e.target.value.toLowerCase().replace(/\s+/g, '-')); }} placeholder="e.g. Lab Tools" className="input-editorial text-xs" />
        </div>
        <div className="flex-1">
          <label className="font-sans text-[10px] tracking-[0.15em] uppercase font-semibold text-[#8B7562] block mb-2">Category Slug</label>
          <input type="text" value={slug} onChange={(e) => setSlug(e.target.value)} placeholder="lab-tools" className="input-editorial text-xs" />
        </div>
        <button type="submit" className="btn-primary text-xs !py-3 !px-6 shrink-0">
          + Add Category
        </button>
      </form>

      {/* List */}
      {isLoading ? (
        <div className="text-center py-16 text-xs text-[#8B7562]">Loading taxonomy categories…</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((c) => (
            <div key={c.id || c.slug} className="p-6 rounded-[28px] bg-[#EDE5D9] border border-[#D6C8B8] shadow-warm-subtle flex items-center justify-between">
              <div>
                <h3 className="font-heading text-2xl font-normal text-[#3B2A22]">{c.name}</h3>
                <span className="font-sans text-xs text-[#8B7562]">/{c.slug}</span>
              </div>
              <span className="w-8 h-8 rounded-full bg-[#E7DED1] border border-[#D6C8B8] flex items-center justify-center text-[#3B2A22]">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
                  <line x1="7" y1="7" x2="7.01" y2="7" />
                </svg>
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
