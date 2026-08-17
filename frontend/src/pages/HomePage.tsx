import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../lib/api/client';
import { ProductCard, ProductCardData } from '../components/ProductCard';
import { useCampusStore } from '../stores/campusStore';

export const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const { activeCampus } = useCampusStore();
  const [searchTerm, setSearchTerm] = React.useState('');

  const { data: featuredProducts, isLoading: isProductsLoading } = useQuery<ProductCardData[]>({
    queryKey: ['featured-products', activeCampus?.id],
    queryFn: async () => {
      try {
        const res: any = await apiClient.get('/products', {
          params: { limit: 8, campusId: activeCampus?.id },
        });
        const productsList = res?.data?.products || res?.products || res?.data || [];
        return Array.isArray(productsList) ? productsList : [];
      } catch (err) {
        return [];
      }
    },
    retry: 1,
  });




  const { data: platformStats, isLoading: isStatsLoading } = useQuery<{
    verifiedStudents: number;
    activeListings: number;
    activeCampuses: number;
  }>({
    queryKey: ['platform-stats'],
    queryFn: async () => {
      try {
        const res: any = await apiClient.get('/platform/stats');
        return res?.data || { verifiedStudents: 0, activeListings: 0, activeCampuses: 0 };
      } catch (err) {
        return { verifiedStudents: 0, activeListings: 0, activeCampuses: 0 };
      }
    },
    staleTime: 30000,
  });

  const activeHeroProduct = Array.isArray(featuredProducts) && featuredProducts.length > 0 ? featuredProducts[0] : null;

  const heroImage = activeHeroProduct?.images?.[0]?.imageUrl || (activeHeroProduct as any)?.imageUrl || '/images/collection_textbooks.png';
  const heroCategory = typeof activeHeroProduct?.category === 'object' ? activeHeroProduct?.category?.name : (activeHeroProduct?.category || 'Campus Materials');
  const heroCondition = activeHeroProduct?.conditionGrade ? activeHeroProduct.conditionGrade.replace(/_/g, ' ') : 'LIKE NEW';
  const heroAuthor = activeHeroProduct?.bookDetails?.author 
    ? `By ${activeHeroProduct.bookDetails.author}${activeHeroProduct.bookDetails.courseCode ? ` · ${activeHeroProduct.bookDetails.courseCode}` : ''}`
    : 'Verified Secondhand Item';
  const heroSavings = (activeHeroProduct?.originalMsrp && Number(activeHeroProduct.originalMsrp) > Number(activeHeroProduct.price))
    ? Math.round(((Number(activeHeroProduct.originalMsrp) - Number(activeHeroProduct.price)) / Number(activeHeroProduct.originalMsrp)) * 100)
    : null;

  const handleHeroSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/products?q=${encodeURIComponent(searchTerm.trim())}`);
    }
  };

  return (
    <div className="min-h-screen bg-[#F4EFE7] text-[#3B2A22]">

      {/* ── EDITORIAL HERO SECTION ───────────────────────────────────── */}
      <section className="relative overflow-hidden border-b border-[#D6C8B8] bg-gradient-to-b from-[#F4EFE7] via-[#EDE5D9]/60 to-[#F4EFE7] py-20 sm:py-28 lg:py-36">
        <div className="relative max-w-7xl mx-auto px-4 sm:px-8 lg:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">

            {/* Left Copy — Playfair Display Editorial Hierarchy */}
            <div className="lg:col-span-7 animate-fade-in-up">
              <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-[#EDE5D9] border border-[#D6C8B8] text-[#8B7562] text-xs font-sans font-semibold tracking-widest uppercase mb-8">
                <span className="w-2 h-2 rounded-full bg-[#C8A46A]" />
                Exclusive Student Courseware Exchange
              </div>

              <h1 className="font-heading text-5xl sm:text-7xl lg:text-[84px] font-normal text-[#3B2A22] leading-[1.05] tracking-tight mb-8">
                Curated essentials <br />
                <span className="italic font-normal text-[#8B6A4F]">
                  for campus life.
                </span>
              </h1>

              <p className="font-sans text-base sm:text-lg text-[#6E5948] leading-relaxed max-w-xl mb-10">
                Trade textbooks, lab gear, notes, and calculators with quiet confidence. Verified student profiles, escrow protection, and direct on-campus handshakes.
              </p>

              {/* Glass Search Panel */}
              <form onSubmit={handleHeroSearch} className="flex flex-col sm:flex-row items-stretch gap-2 max-w-xl bg-[#EDE5D9] p-2.5 rounded-2xl border border-[#D6C8B8] shadow-warm-subtle mb-8">
                <div className="flex-1 flex items-center gap-3 px-3 py-2">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-[#8B7562]">
                    <circle cx="11" cy="11" r="8" />
                    <line x1="21" y1="21" x2="16.65" y2="16.65" />
                  </svg>
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search by title, author, ISBN, or course code…"
                    className="w-full bg-transparent text-sm text-[#3B2A22] placeholder-[#8B7562] focus:outline-none"
                  />
                </div>
                <button type="submit" className="btn-primary text-xs font-medium uppercase py-3.5 px-7 rounded-xl">
                  Search Catalog
                </button>
              </form>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-4 mb-10">
                <Link to="/products" className="btn-primary">
                  Explore Marketplace
                </Link>
                <Link to="/become-seller" className="btn-secondary">
                  Sell Your Books
                </Link>
              </div>

              {/* Live Platform Stats */}
              <div className="grid grid-cols-3 gap-6 pt-10 border-t border-[#D6C8B8]">
                <div>
                  <p className="font-heading text-3xl sm:text-4xl font-normal text-[#3B2A22]">
                    {isStatsLoading ? '…' : (platformStats?.verifiedStudents || 0).toLocaleString('en-IN')}
                  </p>
                  <p className="text-[11px] font-sans font-semibold tracking-wider uppercase text-[#8B7562] mt-1">
                    Verified Students
                  </p>
                </div>
                <div>
                  <p className="font-heading text-3xl sm:text-4xl font-normal text-[#3B2A22]">
                    {isStatsLoading ? '…' : (platformStats?.activeListings || 0).toLocaleString('en-IN')}
                  </p>
                  <p className="text-[11px] font-sans font-semibold tracking-wider uppercase text-[#8B7562] mt-1">
                    Active Listings
                  </p>
                </div>
                <div>
                  <p className="font-heading text-3xl sm:text-4xl font-normal text-[#3B2A22]">
                    Secure
                  </p>
                  <p className="text-[11px] font-sans font-semibold tracking-wider uppercase text-[#8B7562] mt-1">
                    Escrow Protected
                  </p>
                </div>
              </div>
            </div>

            {/* Right Photography Framing — Dynamic Active Listing Card */}
            <div className="lg:col-span-5 hidden lg:flex justify-center">
              <div className="relative w-full max-w-md">
                <div className="absolute -top-6 -left-6 w-full h-[420px] rounded-[36px] bg-[#E7DED1] border border-[#D6C8B8] rotate-[-3deg]" />
                
                {activeHeroProduct ? (
                  <div className="relative w-full rounded-[36px] bg-[#EDE5D9] border border-[#D6C8B8] shadow-warm-card p-6 flex flex-col justify-between">
                    <div className="relative aspect-[4/3] rounded-2xl overflow-hidden mb-6 bg-[#E7DED1] border border-[#D6C8B8]">
                      <img
                        src={heroImage}
                        alt={activeHeroProduct.title}
                        className="w-full h-full object-cover"
                        onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = '/images/collection_textbooks.png'; }}
                      />
                      {heroSavings && (
                        <div className="absolute top-3 left-3 bg-[#111111] text-[#F4EFE7] font-sans font-bold text-xs px-3 py-1 rounded-full shadow-sm">
                          SAVE {heroSavings}%
                        </div>
                      )}
                      <div className="absolute bottom-3 right-3 bg-[#F4EFE7]/90 backdrop-blur-md px-3 py-1 rounded-xl border border-[#D6C8B8] text-xs font-semibold text-[#3B2A22] flex items-center gap-1.5">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-[#C8A46A]">
                          <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
                          <path d="M6 12v5c3 3 9 3 12 0v-5" />
                        </svg>
                        Campus Verified
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between text-xs mb-2">
                        <span className="tag-category">{heroCategory}</span>
                        <span className="px-3 py-0.5 rounded-full bg-[#E7DED1] text-[#3B2A22] border border-[#D6C8B8] text-[10px] font-bold uppercase">
                          {heroCondition}
                        </span>
                      </div>
                      <h3 className="font-heading text-2xl font-normal text-[#3B2A22] mb-2 leading-tight line-clamp-2">
                        {activeHeroProduct.title}
                      </h3>
                      <p className="text-xs text-[#8B7562] mb-4">{heroAuthor}</p>

                      <div className="flex items-center justify-between pt-4 border-t border-[#D6C8B8]">
                        <div>
                          {activeHeroProduct.originalMsrp && Number(activeHeroProduct.originalMsrp) > Number(activeHeroProduct.price) && (
                            <span className="text-xs text-[#8B7562] line-through mr-2">MSRP ₹{activeHeroProduct.originalMsrp}</span>
                          )}
                          <span className="font-heading text-2xl font-normal text-[#3B2A22]">₹{activeHeroProduct.price}</span>
                        </div>
                        <Link to={`/products/${activeHeroProduct.id}`} className="btn-primary text-xs !py-2 !px-4">
                          View Item
                        </Link>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="relative w-full rounded-[36px] bg-[#EDE5D9] border border-[#D6C8B8] shadow-warm-card p-8 text-center flex flex-col items-center justify-center space-y-4 min-h-[380px]">
                    <div className="w-16 h-16 rounded-2xl bg-[#E7DED1] border border-[#D6C8B8] text-[#3B2A22] flex items-center justify-center">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                        <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
                      </svg>
                    </div>
                    <h3 className="font-heading text-2xl font-normal text-[#3B2A22]">Active Campus Listing</h3>
                    <p className="font-sans text-xs text-[#8B7562]">Browse verified secondhand course items or publish your first listing.</p>
                    <Link to="/products" className="btn-primary text-xs">Explore Marketplace</Link>
                  </div>
                )}
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ── CURATED COLLECTIONS — Editorial Luxury Gallery ──────────── */}
      <section className="py-28 border-b border-[#D6C8B8] bg-[#F4EFE7]">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 lg:px-12">

          {/* Section Header — Magazine Editorial Typography */}
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6 mb-16">
            <div className="max-w-2xl">
              <span className="font-sans text-[11px] tracking-[0.3em] uppercase font-semibold text-[#C8A46A] mb-4 block">
                Curated Collections
              </span>
              <h2 className="font-heading text-5xl sm:text-6xl font-normal text-[#3B2A22] leading-[1.08] tracking-tight">
                Discover what your <br className="hidden sm:block" />
                <span className="italic text-[#8B6A4F]">campus offers.</span>
              </h2>
              <p className="font-sans text-sm text-[#6E5948] leading-relaxed mt-5 max-w-lg">
                Every collection is hand-verified by campus students. Browse semester-ready editions, precision instruments, and essentials — all protected by escrow.
              </p>
            </div>
            <Link
              to="/products"
              className="group inline-flex items-center gap-2 font-sans text-xs font-semibold tracking-[0.15em] uppercase text-[#6E5948] hover:text-[#3B2A22] transition-colors self-start lg:self-end pb-1 border-b border-[#D6C8B8] hover:border-[#3B2A22]"
            >
              View All Collections
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="transition-transform duration-300 group-hover:translate-x-1">
                <line x1="5" y1="12" x2="19" y2="12" />
                <polyline points="12 5 19 12 12 19" />
              </svg>
            </Link>
          </div>

          {/* Symmetrical Editorial Grid — 3 rows, each summing to 12 cols */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-6">

            {/* ── ROW 1: Textbooks (7) + Electronics (5) = 12 ──── */}

            {/* Textbooks — Featured Large Card */}
            <Link
              to="/products?category=textbooks"
              className="group md:col-span-2 lg:col-span-7 rounded-[32px] overflow-hidden border border-[#D6C8B8] bg-[#EDE5D9] transition-all duration-500 hover:-translate-y-1.5 hover:border-[#C8A46A] hover:shadow-warm-hover"
            >
              <div className="relative aspect-[16/10] overflow-hidden bg-[#E7DED1]">
                <img
                  src="/images/collection_textbooks.png"
                  alt="Curated Textbooks Collection"
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                  onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = '/images/chemistry_textbook_cover_1786457575258.png'; }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#EDE5D9]/80 via-transparent to-transparent" />
                <div className="absolute top-5 left-5">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F4EFE7]/90 backdrop-blur-md border border-[#D6C8B8] font-sans text-[10px] font-bold tracking-[0.15em] uppercase text-[#3B2A22]">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#C8A46A]" />
                    Featured Collection
                  </span>
                </div>
              </div>
              <div className="p-8 space-y-3">
                <span className="font-sans text-[10px] tracking-[0.25em] uppercase font-semibold text-[#8B7562]">Course Textbooks</span>
                <h3 className="font-heading text-4xl font-normal text-[#3B2A22] group-hover:text-[#8B6A4F] transition-colors leading-tight">
                  Textbooks
                </h3>
                <p className="font-sans text-sm text-[#6E5948] leading-relaxed max-w-md">
                  Discover semester-ready editions, engineering manuals, medical references, and campus classics selected from verified student sellers.
                </p>
                <div className="pt-4 flex items-center gap-2 text-[#6E5948] group-hover:text-[#3B2A22] transition-colors">
                  <span className="font-sans text-xs font-semibold tracking-[0.12em] uppercase">Explore Collection</span>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="transition-transform duration-300 group-hover:translate-x-1.5">
                    <line x1="5" y1="12" x2="19" y2="12" />
                    <polyline points="12 5 19 12 12 19" />
                  </svg>
                </div>
              </div>
            </Link>

            {/* Electronics — Medium Right */}
            <Link
              to="/products?category=calculators-electronics"
              className="group lg:col-span-5 rounded-[32px] overflow-hidden border border-[#D6C8B8] bg-[#EDE5D9] transition-all duration-500 hover:-translate-y-1.5 hover:border-[#C8A46A] hover:shadow-warm-hover flex flex-col"
            >
              <div className="relative aspect-[4/3] overflow-hidden bg-[#E7DED1] shrink-0">
                <img
                  src="/images/collection_electronics.png"
                  alt="Electronics Collection"
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                  onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = '/images/ti84_calculator_photo_1786457657954.png'; }}
                />
              </div>
              <div className="p-7 space-y-2.5 flex-1 flex flex-col">
                <span className="font-sans text-[10px] tracking-[0.25em] uppercase font-semibold text-[#8B7562]">Campus Electronics</span>
                <h3 className="font-heading text-3xl font-normal text-[#3B2A22] group-hover:text-[#8B6A4F] transition-colors leading-tight">
                  Electronics
                </h3>
                <p className="font-sans text-xs text-[#6E5948] leading-relaxed">
                  Laptops, tablets, graphing calculators, and lab instruments at campus-friendly prices.
                </p>
                <div className="pt-3 mt-auto flex items-center gap-2 text-[#6E5948] group-hover:text-[#3B2A22] transition-colors">
                  <span className="font-sans text-xs font-semibold tracking-[0.12em] uppercase">Explore Collection</span>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="transition-transform duration-300 group-hover:translate-x-1.5">
                    <line x1="5" y1="12" x2="19" y2="12" />
                    <polyline points="12 5 19 12 12 19" />
                  </svg>
                </div>
              </div>
            </Link>

            {/* ── ROW 2: Dorm (5) + Study Guides (7) = 12 — mirrored ── */}

            {/* Dorm Essentials — Medium Left */}
            <Link
              to="/products?category=dorm-supplies"
              className="group lg:col-span-5 rounded-[32px] overflow-hidden border border-[#D6C8B8] bg-[#EDE5D9] transition-all duration-500 hover:-translate-y-1.5 hover:border-[#C8A46A] hover:shadow-warm-hover flex flex-col"
            >
              <div className="relative aspect-[4/3] overflow-hidden bg-[#E7DED1] shrink-0">
                <img
                  src="/images/collection_dorm.png"
                  alt="Dorm Essentials Collection"
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                  onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = '/images/chemistry_textbook_cover_1786457575258.png'; }}
                />
              </div>
              <div className="p-7 space-y-2.5 flex-1 flex flex-col">
                <span className="font-sans text-[10px] tracking-[0.25em] uppercase font-semibold text-[#8B7562]">Dorm Essentials</span>
                <h3 className="font-heading text-3xl font-normal text-[#3B2A22] group-hover:text-[#8B6A4F] transition-colors leading-tight">
                  Dorm Essentials
                </h3>
                <p className="font-sans text-xs text-[#6E5948] leading-relaxed">
                  Bedding, organizers, desk lamps, and everything to make your room feel like home.
                </p>
                <div className="pt-3 mt-auto flex items-center gap-2 text-[#6E5948] group-hover:text-[#3B2A22] transition-colors">
                  <span className="font-sans text-xs font-semibold tracking-[0.12em] uppercase">Explore Collection</span>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="transition-transform duration-300 group-hover:translate-x-1.5">
                    <line x1="5" y1="12" x2="19" y2="12" />
                    <polyline points="12 5 19 12 12 19" />
                  </svg>
                </div>
              </div>
            </Link>

            {/* Study Guides — Large Right (mirrored from Row 1) */}
            <Link
              to="/products?category=study-guides"
              className="group lg:col-span-7 rounded-[32px] overflow-hidden border border-[#D6C8B8] bg-[#EDE5D9] transition-all duration-500 hover:-translate-y-1.5 hover:border-[#C8A46A] hover:shadow-warm-hover"
            >
              <div className="relative aspect-[16/10] overflow-hidden bg-[#E7DED1]">
                <img
                  src="/images/collection_studyguides.png"
                  alt="Study Guides Collection"
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                  onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = '/images/chemistry_textbook_cover_1786457575258.png'; }}
                />
              </div>
              <div className="p-8 space-y-3">
                <span className="font-sans text-[10px] tracking-[0.25em] uppercase font-semibold text-[#8B7562]">Course Study Aids</span>
                <h3 className="font-heading text-4xl font-normal text-[#3B2A22] group-hover:text-[#8B6A4F] transition-colors leading-tight">
                  Study Guides
                </h3>
                <p className="font-sans text-sm text-[#6E5948] leading-relaxed max-w-md">
                  Handwritten notes, solution manuals, and exam prep guides from top-scoring seniors across every department.
                </p>
                <div className="pt-4 flex items-center gap-2 text-[#6E5948] group-hover:text-[#3B2A22] transition-colors">
                  <span className="font-sans text-xs font-semibold tracking-[0.12em] uppercase">Explore Collection</span>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="transition-transform duration-300 group-hover:translate-x-1.5">
                    <line x1="5" y1="12" x2="19" y2="12" />
                    <polyline points="12 5 19 12 12 19" />
                  </svg>
                </div>
              </div>
            </Link>

            {/* ── ROW 3: Lab Tools (6) + Calculators (6) = 12 — equal halves ── */}

            {/* Lab Tools */}
            <Link
              to="/products?category=tools-equipment"
              className="group lg:col-span-6 rounded-[32px] overflow-hidden border border-[#D6C8B8] bg-[#EDE5D9] transition-all duration-500 hover:-translate-y-1.5 hover:border-[#C8A46A] hover:shadow-warm-hover flex flex-col"
            >
              <div className="relative aspect-[3/2] overflow-hidden bg-[#E7DED1] shrink-0">
                <img
                  src="/images/collection_labtools.png"
                  alt="Lab Tools Collection"
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                  onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = '/images/physics_lab_kit_1786457973983.png'; }}
                />
              </div>
              <div className="p-7 space-y-2.5 flex-1 flex flex-col">
                <span className="font-sans text-[10px] tracking-[0.25em] uppercase font-semibold text-[#8B7562]">Lab Apparatus</span>
                <h3 className="font-heading text-3xl font-normal text-[#3B2A22] group-hover:text-[#8B6A4F] transition-colors leading-tight">
                  Lab Tools
                </h3>
                <p className="font-sans text-xs text-[#6E5948] leading-relaxed">
                  Beakers, dissection kits, multimeters, and precision instruments for every STEM lab session.
                </p>
                <div className="pt-3 mt-auto flex items-center gap-2 text-[#6E5948] group-hover:text-[#3B2A22] transition-colors">
                  <span className="font-sans text-xs font-semibold tracking-[0.12em] uppercase">Explore Collection</span>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="transition-transform duration-300 group-hover:translate-x-1.5">
                    <line x1="5" y1="12" x2="19" y2="12" />
                    <polyline points="12 5 19 12 12 19" />
                  </svg>
                </div>
              </div>
            </Link>

            {/* Calculators */}
            <Link
              to="/products?category=calculators-electronics"
              className="group lg:col-span-6 rounded-[32px] overflow-hidden border border-[#D6C8B8] bg-[#EDE5D9] transition-all duration-500 hover:-translate-y-1.5 hover:border-[#C8A46A] hover:shadow-warm-hover flex flex-col"
            >
              <div className="relative aspect-[3/2] overflow-hidden bg-[#E7DED1] shrink-0">
                <img
                  src="/images/ti84_calculator_photo_1786457657954.png"
                  alt="Calculators Collection"
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                  onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = '/images/chemistry_textbook_cover_1786457575258.png'; }}
                />
              </div>
              <div className="p-7 space-y-2.5 flex-1 flex flex-col">
                <span className="font-sans text-[10px] tracking-[0.25em] uppercase font-semibold text-[#8B7562]">STEM Electronics</span>
                <h3 className="font-heading text-3xl font-normal text-[#3B2A22] group-hover:text-[#8B6A4F] transition-colors leading-tight">
                  Calculators
                </h3>
                <p className="font-sans text-xs text-[#6E5948] leading-relaxed">
                  Graphing calculators, scientific models, and refurbished TI devices at student-friendly prices.
                </p>
                <div className="pt-3 mt-auto flex items-center gap-2 text-[#6E5948] group-hover:text-[#3B2A22] transition-colors">
                  <span className="font-sans text-xs font-semibold tracking-[0.12em] uppercase">Explore Collection</span>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="transition-transform duration-300 group-hover:translate-x-1.5">
                    <line x1="5" y1="12" x2="19" y2="12" />
                    <polyline points="12 5 19 12 12 19" />
                  </svg>
                </div>
              </div>
            </Link>

          </div>

          {/* Bottom Trust Footnote */}
          <div className="mt-14 pt-8 border-t border-[#D6C8B8] flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="font-sans text-xs text-[#8B7562]">
              All collections are verified by campus students and protected by campus escrow protection.
            </p>
            <div className="flex items-center gap-5">
              <div className="flex items-center gap-1.5 text-[#6E8A62]">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                </svg>
                <span className="font-sans text-[11px] font-semibold tracking-wider uppercase">Escrow Protected</span>
              </div>
              <div className="flex items-center gap-1.5 text-[#C8A46A]">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                  <polyline points="22 4 12 14.01 9 11.01" />
                </svg>
                <span className="font-sans text-[11px] font-semibold tracking-wider uppercase">Campus Verified</span>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* ── TRENDING LISTINGS ────────────────────────────────────────── */}
      <section className="py-24 border-b border-[#D6C8B8]">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 lg:px-12">
          <div className="section-header">
            <div>
              <p className="section-subtitle">Staff Picks & Curated</p>
              <h2 className="section-title">Trending On Your Campus</h2>
            </div>
            <Link to="/products" className="btn-secondary">
              Browse All Listings
            </Link>
          </div>

          {isProductsLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-80 rounded-[32px] skeleton" />
              ))}
            </div>
          ) : featuredProducts && featuredProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="text-center py-20 px-4 bg-[#EDE5D9] rounded-[32px] border border-[#D6C8B8]">
              <div className="w-16 h-16 rounded-2xl bg-[#E7DED1] border border-[#D6C8B8] text-[#3B2A22] flex items-center justify-center mx-auto mb-4">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                  <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
                </svg>
              </div>
              <h3 className="font-heading text-2xl font-normal text-[#3B2A22] mb-2">Explore Campus Marketplace</h3>
              <p className="text-sm text-[#6E5948] max-w-md mx-auto mb-6">
                Be the first to list or browse verified secondhand course items in your campus network.
              </p>
              <Link to="/products" className="btn-primary">
                Browse Marketplace
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* ── ESCROW VISUAL TRUST FLOW ──────────────────────────────────── */}
      <section className="py-24 border-b border-[#D6C8B8] bg-[#EDE5D9]/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 lg:px-12">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="section-subtitle">Frictionless Guarantee</span>
            <h2 className="section-title">How Campus Escrow Works</h2>
            <p className="text-sm text-[#6E5948] mt-2">
              Designed specifically for university students to exchange secondhand educational goods with zero risk.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-8 rounded-[32px] bg-[#EDE5D9] border border-[#D6C8B8] relative overflow-hidden group hover:border-[#C8A46A] transition-all">
              <div className="w-14 h-14 rounded-2xl bg-[#F4EFE7] border border-[#D6C8B8] text-[#3B2A22] font-heading font-normal text-3xl flex items-center justify-center mb-6">
                01
              </div>
              <h3 className="font-heading text-2xl font-normal text-[#3B2A22] mb-3">List Item in 60 Seconds</h3>
              <p className="text-xs text-[#6E5948] leading-relaxed">
                Snap photos of your textbook or device, set your price, and tag your campus location for verified buyers.
              </p>
            </div>

            <div className="p-8 rounded-[32px] bg-[#EDE5D9] border border-[#D6C8B8] relative overflow-hidden group hover:border-[#C8A46A] transition-all">
              <div className="w-14 h-14 rounded-2xl bg-[#F4EFE7] border border-[#D6C8B8] text-[#3B2A22] font-heading font-normal text-3xl flex items-center justify-center mb-6">
                02
              </div>
              <h3 className="font-heading text-2xl font-normal text-[#3B2A22] mb-3">Campus Handshake Pickup</h3>
              <p className="text-xs text-[#6E5948] leading-relaxed">
                Meet safely at your campus library or hostel. Funds remain protected in Escrow until buyer verifies item condition.
              </p>
            </div>

            <div className="p-8 rounded-[32px] bg-[#EDE5D9] border border-[#D6C8B8] relative overflow-hidden group hover:border-[#C8A46A] transition-all">
              <div className="w-14 h-14 rounded-2xl bg-[#F4EFE7] border border-[#D6C8B8] text-[#3B2A22] font-heading font-normal text-3xl flex items-center justify-center mb-6">
                03
              </div>
              <h3 className="font-heading text-2xl font-normal text-[#3B2A22] mb-3">Instant Escrow Release</h3>
              <p className="text-xs text-[#6E5948] leading-relaxed">
                Upon item inspection confirmation, funds release instantly to the seller's account with zero hidden fees.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── SELLER BANNER CTA ────────────────────────────────────────── */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 lg:px-12">
          <div className="relative rounded-[36px] overflow-hidden p-10 sm:p-14 lg:p-20 bg-[#EDE5D9] border border-[#D6C8B8] shadow-warm-card">
            <div className="relative z-10 max-w-xl">
              <span className="text-[#8B7562] text-xs font-sans font-semibold uppercase tracking-widest mb-3 block">
                Turn Old Textbooks Into Cash
              </span>
              <h2 className="font-heading text-4xl sm:text-5xl font-normal text-[#3B2A22] mb-6">
                Done with last semester’s courses?
              </h2>
              <p className="text-sm text-[#6E5948] leading-relaxed mb-10">
                Sell your pre-owned textbooks, lab kits, and calculators to junior students on campus. Fast verification and instant payouts.
              </p>
              <div className="flex flex-wrap items-center gap-4">
                <Link to="/become-seller" className="btn-primary">
                  Start Selling on Campus
                </Link>
                <Link to="/products" className="btn-secondary">
                  Browse Catalog
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
};
