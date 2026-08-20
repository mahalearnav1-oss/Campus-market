import React, { useState, useEffect } from 'react';
import { formatINR } from '../../lib/formatters';

interface PriceAlertModalProps {
  isOpen: boolean;
  onClose: () => void;
  productTitle: string;
  productImage?: string | null;
  currentPrice: number;
  initialTargetPrice?: number | null;
  onSaveAlert: (targetPrice: number) => Promise<void>;
  onRemoveAlert?: () => Promise<void>;
  isLoading?: boolean;
}

export const PriceAlertModal: React.FC<PriceAlertModalProps> = ({
  isOpen,
  onClose,
  productTitle,
  productImage,
  currentPrice,
  initialTargetPrice,
  onSaveAlert,
  onRemoveAlert,
  isLoading = false,
}) => {
  const [targetPriceInput, setTargetPriceInput] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      if (initialTargetPrice && initialTargetPrice > 0) {
        setTargetPriceInput(String(initialTargetPrice));
      } else {
        // Suggest a default reasonable discount (e.g. 15% lower rounded)
        const suggested = Math.max(1, Math.floor(currentPrice * 0.85));
        setTargetPriceInput(String(suggested));
      }
      setError(null);
    }
  }, [isOpen, initialTargetPrice, currentPrice]);

  if (!isOpen) return null;

  const parsedTarget = parseFloat(targetPriceInput);
  const isValidNumber = !isNaN(parsedTarget) && parsedTarget > 0;
  const isLowerThanCurrent = isValidNumber && parsedTarget < currentPrice;
  const savings = isLowerThanCurrent ? Math.max(0, currentPrice - parsedTarget) : 0;
  const savingsPercentage = isLowerThanCurrent && currentPrice > 0 ? Math.round((savings / currentPrice) * 100) : 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!targetPriceInput.trim()) {
      setError('Please enter a target price.');
      return;
    }

    if (!isValidNumber) {
      setError('Please enter a valid price greater than 0.');
      return;
    }

    if (parsedTarget >= currentPrice) {
      setError(`Your target price must be lower than the current price (${formatINR(currentPrice)}).`);
      return;
    }

    try {
      await onSaveAlert(parsedTarget);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Couldn\'t set price alert. Please try again.');
    }
  };

  const handleRemove = async () => {
    if (!onRemoveAlert) return;
    try {
      setError(null);
      await onRemoveAlert();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Couldn\'t remove price alert. Please try again.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
      <div
        className="w-full max-w-md bg-[#EDE5D9] border border-[#D6C8B8] rounded-[32px] p-6 sm:p-8 shadow-warm-card text-[#3B2A22] relative animate-in fade-in zoom-in-95 duration-200"
        role="dialog"
        aria-modal="true"
        aria-labelledby="price-alert-modal-title"
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-4 mb-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#E7DED1] border border-[#D6C8B8] text-[#C8A46A] flex items-center justify-center text-lg">
              🔔
            </div>
            <div>
              <h3 id="price-alert-modal-title" className="font-heading text-2xl font-normal text-[#3B2A22]">
                {initialTargetPrice ? 'Edit Price Alert' : 'Set Price Alert'}
              </h3>
              <p className="font-sans text-[11px] text-[#8B7562]">Get notified immediately when the price drops</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#E7DED1] border border-[#D6C8B8] text-[#6E5948] hover:text-[#3B2A22] flex items-center justify-center transition-colors text-xs font-bold"
            aria-label="Close dialog"
          >
            ✕
          </button>
        </div>

        {/* Product Snapshot */}
        <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-[#E7DED1] border border-[#D6C8B8] mb-5">
          {productImage ? (
            <img src={productImage} alt={productTitle} className="w-12 h-12 rounded-xl object-cover border border-[#D6C8B8]" />
          ) : (
            <div className="w-12 h-12 rounded-xl bg-[#EDE5D9] border border-[#D6C8B8] flex items-center justify-center text-xs text-[#8B7562]">
              📚
            </div>
          )}
          <div className="min-w-0 flex-1">
            <h4 className="font-heading text-sm font-normal text-[#3B2A22] truncate">{productTitle}</h4>
            <p className="font-sans text-xs font-semibold text-[#6E5948]">
              Current Price: <span className="text-[#3B2A22] font-bold">{formatINR(currentPrice)}</span>
            </p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="target-price-input" className="block font-sans text-xs font-bold text-[#3B2A22] uppercase tracking-wider mb-2">
              Notify me when price reaches (₹)
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 font-sans font-semibold text-sm text-[#8B7562]">
                ₹
              </span>
              <input
                id="target-price-input"
                type="number"
                step="any"
                min="1"
                max={currentPrice - 1}
                value={targetPriceInput}
                onChange={(e) => {
                  setTargetPriceInput(e.target.value);
                  setError(null);
                }}
                placeholder={`e.g. ${Math.floor(currentPrice * 0.85)}`}
                className="w-full bg-[#E7DED1] border border-[#D6C8B8] rounded-2xl py-3 pl-9 pr-4 text-sm font-sans text-[#3B2A22] font-semibold focus:outline-none focus:border-[#C8A46A] focus:ring-2 focus:ring-[#C8A46A]/20 transition-all"
                autoFocus
              />
            </div>
          </div>

          {/* Savings Calculation Preview */}
          {isLowerThanCurrent && (
            <div className="p-3.5 rounded-2xl bg-[#6E8A62]/10 border border-[#6E8A62]/30 flex items-center justify-between text-xs font-sans">
              <span className="text-[#6E8A62] font-semibold flex items-center gap-1.5">
                <span>📉</span> Estimated Savings:
              </span>
              <span className="font-bold text-[#6E8A62]">
                {formatINR(savings)} ({savingsPercentage}% off)
              </span>
            </div>
          )}

          {error && (
            <div className="p-3 rounded-xl bg-[#9B5C52]/10 border border-[#9B5C52]/30 text-[#9B5C52] text-xs font-sans leading-relaxed">
              {error}
            </div>
          )}

          <p className="font-sans text-[11px] text-[#8B7562] leading-relaxed">
            We will send you an in-app alert and real-time notification as soon as the seller reduces the price to your target or below.
          </p>

          <div className="flex items-center justify-between gap-3 pt-2">
            {initialTargetPrice && onRemoveAlert ? (
              <button
                type="button"
                onClick={handleRemove}
                disabled={isLoading}
                className="btn-secondary !py-2.5 !px-4 text-xs !text-[#9B5C52] hover:!bg-[#9B5C52]/10 border-[#9B5C52]/40"
              >
                Remove Alert
              </button>
            ) : (
              <button
                type="button"
                onClick={onClose}
                disabled={isLoading}
                className="btn-secondary !py-2.5 !px-4 text-xs"
              >
                Cancel
              </button>
            )}

            <button
              type="submit"
              disabled={isLoading || !isLowerThanCurrent}
              className="btn-primary !py-2.5 !px-6 text-xs font-semibold ml-auto disabled:opacity-50 flex items-center gap-2"
            >
              {isLoading && (
                <div className="w-3.5 h-3.5 rounded-full border-2 border-current border-t-transparent animate-spin" />
              )}
              {initialTargetPrice ? 'Update Alert' : 'Set Price Alert'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
