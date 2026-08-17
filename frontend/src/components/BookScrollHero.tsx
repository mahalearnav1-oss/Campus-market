import React, { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { motion } from 'framer-motion';

gsap.registerPlugin(ScrollTrigger);

const FRAME_COUNT = 240;
const INITIAL_PRIORITY_FRAMES = 10;

const getFrameUrl = (index: number) => {
  const paddedIndex = String(index + 1).padStart(3, '0');
  return `/book_scroll/ezgif-frame-${paddedIndex}.jpg`;
};

export const BookScrollHero: React.FC = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [imagesLoaded, setImagesLoaded] = useState(false);
  const [loadProgress, setLoadProgress] = useState(0);

  const containerRef = useRef<HTMLDivElement>(null);
  const pinnedRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imagesRef = useRef<HTMLImageElement[]>([]);
  const processedCanvasesRef = useRef<(HTMLCanvasElement | null)[]>(new Array(FRAME_COUNT).fill(null));
  const frameIndexObjRef = useRef({ frame: 0 });

  const headlineRef = useRef<HTMLHeadingElement>(null);
  const paragraphRef = useRef<HTMLParagraphElement>(null);
  const searchFormRef = useRef<HTMLFormElement>(null);
  const ctaGroupRef = useRef<HTMLDivElement>(null);
  const trustBadgeRef = useRef<HTMLDivElement>(null);

  // Fast On-Demand Offscreen Canvas Process
  const processImageToCanvas = (img: HTMLImageElement): HTMLCanvasElement | null => {
    if (!img || !img.complete || img.naturalWidth === 0) return null;
    const offscreen = document.createElement('canvas');
    offscreen.width = img.naturalWidth;
    offscreen.height = img.naturalHeight;
    const ctx = offscreen.getContext('2d');

    if (!ctx) return null;
    ctx.drawImage(img, 0, 0);
    const imgData = ctx.getImageData(0, 0, offscreen.width, offscreen.height);
    const data = imgData.data;

    // Fast Alpha Keying on Light Cream Background Tones
    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      if (r > 222 && g > 215 && b > 200) {
        const brightness = (r + g + b) / 3;
        if (brightness > 245) {
          data[i + 3] = 0;
        } else {
          const alphaFactor = Math.max(0, 1 - (brightness - 222) / 23);
          data[i + 3] = Math.round(alphaFactor * 255);
        }
      }
    }
    ctx.putImageData(imgData, 0, 0);
    return offscreen;
  };

  // 1. Instant Priority Preloading + Asynchronous Non-Blocking Queue
  useEffect(() => {
    let loadedCount = 0;
    const images: HTMLImageElement[] = new Array(FRAME_COUNT);

    const checkInitialReady = () => {
      // Once priority initial frames are loaded, render hero immediately (<100ms)!
      if (!imagesLoaded && loadedCount >= INITIAL_PRIORITY_FRAMES) {
        setImagesLoaded(true);
      }
    };

    // Load Frame Function
    const loadFrame = (index: number) => {
      const img = new Image();
      img.src = getFrameUrl(index);
      img.onload = () => {
        images[index] = img;
        loadedCount++;
        setLoadProgress(Math.round((loadedCount / FRAME_COUNT) * 100));

        // Process priority frames immediately
        if (index < INITIAL_PRIORITY_FRAMES) {
          processedCanvasesRef.current[index] = processImageToCanvas(img);
          checkInitialReady();
        } else {
          // Defer background frame processing using requestIdleCallback / setTimeout
          if ('requestIdleCallback' in window) {
            window.requestIdleCallback(() => {
              processedCanvasesRef.current[index] = processImageToCanvas(img);
            });
          } else {
            setTimeout(() => {
              processedCanvasesRef.current[index] = processImageToCanvas(img);
            }, 0);
          }
        }

        if (loadedCount === FRAME_COUNT) {
          setImagesLoaded(true);
        }
      };
      img.onerror = () => {
        loadedCount++;
        if (loadedCount === FRAME_COUNT) setImagesLoaded(true);
      };
    };

    // Load Priority Frames First
    for (let i = 0; i < INITIAL_PRIORITY_FRAMES; i++) {
      loadFrame(i);
    }

    // Load Remaining Frames Non-Blocking
    setTimeout(() => {
      for (let i = INITIAL_PRIORITY_FRAMES; i < FRAME_COUNT; i++) {
        loadFrame(i);
      }
    }, 50);

    imagesRef.current = images;
  }, []);

  // 2. High-Performance Render Frame
  const renderFrame = (index: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const idx = Math.min(Math.max(0, Math.floor(index)), FRAME_COUNT - 1);
    let sourceCanvas = processedCanvasesRef.current[idx];
    const sourceImg = imagesRef.current[idx];

    // Lazy process on scrub if not yet processed
    if (!sourceCanvas && sourceImg && sourceImg.complete) {
      sourceCanvas = processImageToCanvas(sourceImg);
      processedCanvasesRef.current[idx] = sourceCanvas;
    }

    const width = canvas.width;
    const height = canvas.height;

    ctx.clearRect(0, 0, width, height);

    if (sourceCanvas && sourceCanvas.width > 0) {
      const sWidth = sourceCanvas.width;
      const sHeight = sourceCanvas.height;
      const imgRatio = sWidth / sHeight;
      const canvasRatio = width / height;

      let drawWidth = width;
      let drawHeight = height;
      let offsetX = 0;
      let offsetY = 0;

      if (imgRatio > canvasRatio) {
        drawWidth = width * 0.92;
        drawHeight = drawWidth / imgRatio;
        offsetX = (width - drawWidth) / 2;
        offsetY = (height - drawHeight) / 2;
      } else {
        drawHeight = height * 0.90;
        drawWidth = drawHeight * imgRatio;
        offsetX = (width - drawWidth) / 2;
        offsetY = (height - drawHeight) / 2;
      }

      ctx.drawImage(sourceCanvas, offsetX, offsetY, drawWidth, drawHeight);
    } else if (sourceImg && sourceImg.complete && sourceImg.naturalWidth > 0) {
      ctx.drawImage(sourceImg, 0, 0, width, height);
    }
  };

  // 3. Canvas Size Sync & Resize
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const updateCanvasSize = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      renderFrame(frameIndexObjRef.current.frame);
    };

    updateCanvasSize();
    window.addEventListener('resize', updateCanvasSize);

    if (imagesLoaded) {
      renderFrame(0);
    }

    return () => window.removeEventListener('resize', updateCanvasSize);
  }, [imagesLoaded]);

  // 4. GSAP ScrollTrigger Scrubbing
  useEffect(() => {
    if (!containerRef.current || !pinnedRef.current) return;

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: containerRef.current,
          pin: pinnedRef.current,
          start: 'top top',
          end: '+=160%',
          scrub: 0.3,
          anticipatePin: 1,
          invalidateOnRefresh: true,
        },
      });

      tl.to(frameIndexObjRef.current, {
        frame: FRAME_COUNT - 1,
        ease: 'none',
        onUpdate: () => {
          renderFrame(frameIndexObjRef.current.frame);
        },
      });

      if (headlineRef.current) {
        tl.to(headlineRef.current, { y: -20, opacity: 0.95, ease: 'power1.out' }, 0);
      }
      if (paragraphRef.current) {
        tl.to(paragraphRef.current, { y: -12, opacity: 0.9, ease: 'power1.out' }, 0);
      }
      if (searchFormRef.current) {
        tl.to(searchFormRef.current, { scale: 1.015, ease: 'power1.out' }, 0);
      }
      if (ctaGroupRef.current) {
        tl.to(ctaGroupRef.current, { y: -8, ease: 'power1.out' }, 0);
      }
    }, containerRef);

    return () => ctx.revert();
  }, [imagesLoaded]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/products?q=${encodeURIComponent(searchTerm.trim())}`);
    }
  };

  return (
    <div ref={containerRef} className="relative bg-[#F4EFE7] border-b border-[#D6C8B8]">
      {/* Pinned Viewport Container */}
      <div ref={pinnedRef} className="relative w-full min-h-screen flex items-center overflow-hidden py-10 lg:py-16">
        
        {/* Ambient Warm Gradient */}
        <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-[#F4EFE7] via-[#EDE5D9]/40 to-[#F4EFE7]" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-8 lg:px-12 w-full z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14 items-center">

            {/* LEFT COLUMN: Editorial Copy & Search */}
            <div className="lg:col-span-6 space-y-6 sm:space-y-8 text-[#3B2A22] order-2 lg:order-1">
              
              {/* Serif Headline */}
              <h1
                ref={headlineRef}
                className="font-heading text-4xl sm:text-6xl lg:text-[76px] font-normal text-[#3B2A22] leading-[1.06] tracking-tight"
              >
                Curated essentials <br />
                <span className="italic font-normal text-[#8B6A4F]">
                  for campus life.
                </span>
              </h1>

              {/* Supporting Copy */}
              <p
                ref={paragraphRef}
                className="font-sans text-base sm:text-lg text-[#6E5948] leading-relaxed max-w-xl"
              >
                Trade textbooks, lab gear, notes, and calculators with quiet confidence. Verified student profiles, escrow protection, and direct on-campus handshakes.
              </p>

              {/* Glass Search Panel */}
              <motion.form
                ref={searchFormRef}
                onSubmit={handleSearchSubmit}
                whileHover={{ scale: 1.01 }}
                transition={{ duration: 0.2 }}
                className="flex flex-col sm:flex-row items-stretch gap-2 max-w-xl bg-[#EDE5D9] p-2.5 rounded-2xl border border-[#D6C8B8] shadow-warm-subtle transition-all duration-300"
              >
                <div className="flex-1 flex items-center gap-3 px-3 py-2">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" className="text-[#8B7562]">
                    <circle cx="11" cy="11" r="8" />
                    <line x1="21" y1="21" x2="16.65" y2="16.65" />
                  </svg>
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search by title, author, ISBN, or course code…"
                    className="w-full bg-transparent text-sm text-[#3B2A22] placeholder-[#8B7562] focus:outline-none font-sans"
                  />
                </div>
                <button type="submit" className="btn-primary text-xs font-medium uppercase py-3.5 px-7 rounded-xl shrink-0">
                  Search Catalog
                </button>
              </motion.form>

              {/* Action Buttons */}
              <div ref={ctaGroupRef} className="flex flex-wrap items-center gap-4 pt-2">
                <Link to="/products" className="btn-primary shadow-md hover:shadow-lg transition-shadow">
                  Explore Marketplace
                </Link>
                <Link to="/seller/products/new" className="btn-secondary">
                  Sell an Item
                </Link>
              </div>

              {/* Trust Indicators */}
              <div ref={trustBadgeRef} className="pt-6 border-t border-[#D6C8B8]/60 grid grid-cols-3 gap-4 max-w-lg">
                <div>
                  <div className="font-heading text-xl font-medium text-[#3B2A22]">Secure</div>
                  <div className="font-sans text-[11px] text-[#8B7562] uppercase tracking-wider">Escrow Protected</div>
                </div>
                <div>
                  <div className="font-heading text-xl font-medium text-[#3B2A22]">₹0</div>
                  <div className="font-sans text-[11px] text-[#8B7562] uppercase tracking-wider">Listing Fees</div>
                </div>
                <div>
                  <div className="font-heading text-xl font-medium text-[#3B2A22]">Verified</div>
                  <div className="font-sans text-[11px] text-[#8B7562] uppercase tracking-wider">PCET Students</div>
                </div>
              </div>

            </div>

            {/* RIGHT COLUMN: Tall Editorial Portrait Showcase Panel */}
            <div className="lg:col-span-6 flex flex-col items-center lg:items-end justify-center order-1 lg:order-2">
              
              {/* Premium Editorial Showcase Panel */}
              <div className="relative w-full max-w-[500px] sm:max-w-[560px] lg:max-w-[620px] xl:max-w-[660px] h-[540px] sm:h-[640px] lg:h-[720px] xl:h-[760px] bg-[#F4EFE7] rounded-[32px] border border-[#D6C8B8] p-6 sm:p-8 flex items-center justify-center shadow-[0_24px_50px_-12px_rgba(59,42,34,0.08)] overflow-hidden">
                
                {/* Fine Texture Overlay */}
                <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[radial-gradient(#3B2A22_1px,transparent_1px)] [background-size:16px_16px]" />

                {/* Soft Contact Shadow */}
                <div className="absolute bottom-10 left-1/2 -translate-x-1/2 w-3/4 h-8 bg-[#3B2A22]/20 blur-2xl rounded-full pointer-events-none transform scale-95" />

                {/* Micro Floating Motion */}
                <motion.div
                  animate={{ y: [-7, 7, -7] }}
                  transition={{ duration: 5.5, repeat: Infinity, ease: 'easeInOut' }}
                  className="relative w-full h-full flex items-center justify-center z-10"
                >
                  <canvas
                    ref={canvasRef}
                    className="w-full h-full object-contain filter drop-shadow-[18px_22px_30px_rgba(59,42,34,0.18)]"
                  />

                  {/* Progressive Loading Indicator */}
                  {!imagesLoaded && (
                    <div className="absolute inset-0 bg-[#F4EFE7]/90 backdrop-blur-md rounded-[24px] flex flex-col items-center justify-center p-6 border border-[#D6C8B8]">
                      <div className="w-10 h-10 border-2 border-[#C8A46A] border-t-transparent rounded-full animate-spin mb-3" />
                      <span className="font-sans text-xs font-semibold uppercase tracking-widest text-[#8B7562]">
                        Loading Animation ({loadProgress}%)
                      </span>
                    </div>
                  )}
                </motion.div>

              </div>

            </div>

          </div>
        </div>
      </div>
    </div>
  );
};
