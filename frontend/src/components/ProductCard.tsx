import React from 'react';
import { Link } from 'react-router-dom';
import { formatINR } from '../lib/formatters';

export interface ProductCardData {
  id: string;
  title: string;
  price: string | number;
  originalMsrp?: string | number | null;
  conditionGrade: string;
  status: string;
  quantity: number;
  category?: { name: string; slug: string } | null;
  college?: { name: string; code: string } | null;
  seller?: { storeName: string; sellerType: string; rating: string | number } | null;
  images?: Array<{ imageUrl: string; isPrimary: boolean }>;
  bookDetails?: {
    author?: string;
    publisher?: string;
    edition?: string;
    courseCode?: string;
  } | null;
}

interface ProductCardProps {
  product: ProductCardData;
}

const conditionStyles: Record<string, { label: string; badgeClass: string }> = {
  BRAND_NEW: { label: 'Brand New', badgeClass: 'bg-[#6E8A62]/15 text-[#6E8A62] border-[#6E8A62]/30' },
  LIKE_NEW: { label: 'Like New', badgeClass: 'bg-[#C8A46A]/20 text-[#3B2A22] border-[#C8A46A]/40' },
  GOOD: { label: 'Good', badgeClass: 'bg-[#E7DED1] text-[#3B2A22] border-[#D6C8B8]' },
  FAIR: { label: 'Fair', badgeClass: 'bg-[#E7DED1] text-[#6E5948] border-[#D6C8B8]' },
  ACCEPTABLE: { label: 'Acceptable', badgeClass: 'bg-[#E7DED1] text-[#8B7562] border-[#D6C8B8]' },
};

const DEFAULT_FALLBACK_IMAGE = '/images/chemistry_textbook_cover_1786457575258.png';

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  if (!product) return null;

  const primaryImage =
    product.images?.find((img) => img?.isPrimary)?.imageUrl ||
    product.images?.[0]?.imageUrl ||
    DEFAULT_FALLBACK_IMAGE;

  const conditionGrade = product.conditionGrade || 'GOOD';
  const condition = conditionStyles[conditionGrade] || {
    label: conditionGrade,
    badgeClass: 'bg-[#E7DED1] text-[#3B2A22] border-[#D6C8B8]',
  };

  const numPrice = Number(product.price || 0);
  const numMsrp = product.originalMsrp ? Number(product.originalMsrp) : null;

  const discountPercent =
    numMsrp && numMsrp > numPrice && numMsrp > 0
      ? Math.round(((numMsrp - numPrice) / numMsrp) * 100)
      : null;

  return (
    <Link
      to={`/products/${product.id}`}
      className="card-product flex flex-col group"
    >
      {/* Image Container */}
      <div className="card-product-image">
        <img
          src={primaryImage}
          alt={product.title || 'Product Image'}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          loading="lazy"
          onError={(e) => {
            e.currentTarget.onerror = null;
            e.currentTarget.src = DEFAULT_FALLBACK_IMAGE;
          }}
        />

        {/* Top Badges */}
        <div className="absolute top-3.5 left-3.5 right-3.5 flex items-center justify-between pointer-events-none z-10">
          {discountPercent ? (
            <span className="font-sans text-[11px] font-bold tracking-wider uppercase bg-[#111111] text-[#F4EFE7] px-3 py-0.5 rounded-full shadow-md">
              −{discountPercent}% OFF
            </span>
          ) : <span />}

          <span className={`text-[10px] font-sans font-semibold tracking-wider uppercase px-2.5 py-0.5 rounded-full border backdrop-blur-md ${condition.badgeClass}`}>
            {condition.label}
          </span>
        </div>

        {/* Escrow Shield & College Tag */}
        <div className="absolute bottom-3.5 left-3.5 right-3.5 flex items-center justify-between pointer-events-none z-10">
          {product.college?.code ? (
            <div className="bg-[#F4EFE7]/90 backdrop-blur-md px-2.5 py-1 rounded-xl border border-[#D6C8B8] flex items-center gap-1.5 shadow-sm">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-[#3B2A22]">
                <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
                <path d="M6 12v5c3 3 9 3 12 0v-5" />
              </svg>
              <span className="font-sans text-[10px] font-semibold text-[#3B2A22]">
                {product.college.code}
              </span>
            </div>
          ) : <span />}

          <div className="bg-[#F4EFE7]/90 backdrop-blur-md px-2 py-1 rounded-xl border border-[#6E8A62]/40 flex items-center gap-1 text-[#6E8A62] text-[10px] font-medium shadow-sm">
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
            <span>Escrow</span>
          </div>
        </div>
      </div>

      {/* Body Content */}
      <div className="p-5 flex flex-col flex-1 justify-between space-y-4">
        <div className="space-y-1.5">
          {product.category?.name && (
            <span className="tag-editorial block">
              {product.category.name}
            </span>
          )}

          <h3 className="font-heading text-xl font-normal text-[#3B2A22] leading-snug group-hover:text-[#8B6A4F] transition-colors line-clamp-2">
            {product.title}
          </h3>
        </div>

        {/* Price & Seller Footnote */}
        <div className="pt-3 border-t border-[#D6C8B8] flex items-end justify-between">
          <div>
            {numMsrp && numMsrp > numPrice && (
              <span className="font-sans text-[11px] text-[#8B7562] line-through block font-medium">
                {formatINR(numMsrp)}
              </span>
            )}

            <div className="font-heading text-2xl font-normal text-[#3B2A22]">
              {formatINR(numPrice)}
            </div>
          </div>

          {product.seller?.storeName && (
            <span className="font-sans text-[11px] text-[#8B7562] font-semibold truncate max-w-[130px]">
              {product.seller.storeName}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
};
