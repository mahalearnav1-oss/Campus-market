import React, { useState, useEffect } from 'react';
import { apiClient } from '../../lib/api/client';
import { Link } from 'react-router-dom';
import { formatINR } from '../../lib/formatters';

export interface AdminProductItem {
  id: string;
  title: string;
  price: string | number;
  quantity: number;
  status: string;
  conditionGrade: string;
  createdAt: string;
  seller?: { storeName: string } | null;
  category?: { name: string } | null;
}

export const AdminProductsPage: React.FC = () => {
  const [products, setProducts] = useState<AdminProductItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadProducts() {
      try {
        setIsLoading(true);
        const res: any = await apiClient.get('/admin/products');
        setProducts(res.data.products || []);
      } catch (err: any) {
        setError(err.message || 'Failed to load products.');
      } finally {
        setIsLoading(false);
      }
    }
    loadProducts();
  }, []);

  return (
    <div className="space-y-8 text-[#3B2A22]">
      <div>
        <span className="tag-editorial mb-2 block">Catalog Moderation</span>
        <h1 className="font-heading text-4xl font-normal text-[#3B2A22]">Product Moderation</h1>
        <p className="font-sans text-xs text-[#8B7562] mt-1">Review active catalog listings, check condition grade compliance, or remove flagged items</p>
      </div>

      {error && (
        <div className="p-4 bg-[#9B5C52]/15 border border-[#9B5C52]/30 text-[#9B5C52] font-semibold text-xs rounded-2xl">
          {error}
        </div>
      )}

      {isLoading ? (
        <div className="text-center py-16 text-xs text-[#8B7562]">Loading product catalog…</div>
      ) : (
        <div className="bg-[#EDE5D9] border border-[#D6C8B8] rounded-[32px] overflow-hidden shadow-warm-subtle">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse font-sans text-xs">
              <thead>
                <tr className="bg-[#E7DED1] border-b border-[#D6C8B8] text-[10px] font-semibold text-[#8B7562] uppercase tracking-wider">
                  <th className="p-4 pl-6">Listing Title</th>
                  <th className="p-4">Seller Store</th>
                  <th className="p-4">Price</th>
                  <th className="p-4">Grade</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 pr-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#D6C8B8]">
                {products.map((p) => (
                  <tr key={p.id} className="hover:bg-[#E7DED1]/50 transition-colors">
                    <td className="p-4 pl-6 font-heading text-lg font-normal text-[#3B2A22]">
                      <Link to={`/products/${p.id}`} className="hover:text-[#8B6A4F] transition-colors">{p.title}</Link>
                    </td>
                    <td className="p-4 text-[#6E5948] font-medium">{p.seller?.storeName || 'Unknown Store'}</td>
                    <td className="p-4 font-heading text-xl font-normal text-[#3B2A22]">{formatINR(p.price)}</td>
                    <td className="p-4 font-semibold text-[#3B2A22]">{p.conditionGrade}</td>
                    <td className="p-4">
                      <span className="px-2.5 py-1 rounded-full bg-[#6E8A62]/15 text-[#6E8A62] text-[10px] font-bold uppercase">
                        {p.status}
                      </span>
                    </td>
                    <td className="p-4 pr-6 text-right">
                      <Link to={`/products/${p.id}`} className="btn-secondary text-[10px] !py-1.5 !px-3">
                        Inspect Item →
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
