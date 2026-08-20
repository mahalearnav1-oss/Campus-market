import React, { useState } from 'react';
import { apiClient } from '../../lib/api/client';

export interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetType: 'PRODUCT' | 'SELLER' | 'USER' | 'MESSAGE' | 'REVIEW';
  targetId: string;
  targetTitle?: string;
  onSuccess?: () => void;
}

const PRODUCT_REASONS = [
  'Scam or suspicious listing',
  'Prohibited, hazardous, or illegal item',
  'Misleading or inaccurate condition/description',
  'Inappropriate or offensive media/text',
  'Counterfeit / fake textbook or item',
  'Spam or duplicate listing',
  'Incorrect price / extortive pricing',
  'Other policy violation',
];

const SELLER_REASONS = [
  'Suspicious or fraudulent behavior',
  'Harassment or abusive communication',
  'No-show / ghosted agreed campus meetup',
  'Selling prohibited or counterfeit items',
  'Demanding off-platform unprotected payments',
  'Other violation',
];

const USER_REASONS = [
  'Abusive behavior or harassment',
  'Spamming or promotional solicitation',
  'Impersonation or fake account',
  'Suspicious activity',
  'Other violation',
];

export const ReportModal: React.FC<ReportModalProps> = ({
  isOpen,
  onClose,
  targetType,
  targetId,
  targetTitle,
  onSuccess,
}) => {
  const reasons =
    targetType === 'PRODUCT'
      ? PRODUCT_REASONS
      : targetType === 'SELLER'
      ? SELLER_REASONS
      : USER_REASONS;

  const [reason, setReason] = useState(reasons[0]);
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      setError(null);

      await apiClient.post('/reports', {
        targetType,
        targetId,
        reason,
        description: description.trim() || undefined,
      });

      setIsSubmitted(true);
      if (onSuccess) onSuccess();
      setTimeout(() => {
        setIsSubmitted(false);
        onClose();
      }, 1600);
    } catch (err: any) {
      setError(err.message || 'Failed to submit report. Please try again.');
      setIsSubmitting(false);
    }
  };

  const getModalTitle = () => {
    switch (targetType) {
      case 'PRODUCT':
        return 'Report Listing';
      case 'SELLER':
        return 'Report Storefront';
      case 'USER':
        return 'Report User';
      case 'MESSAGE':
        return 'Report Message';
      default:
        return 'Report Abuse';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-md rounded-[32px] bg-[#EDE5D9] border border-[#D6C8B8] shadow-2xl p-6 sm:p-8 space-y-6 text-[#3B2A22]">
        
        {/* Header */}
        <div className="flex items-start justify-between border-b border-[#D6C8B8] pb-4">
          <div>
            <span className="tag-editorial mb-1 block">Campus Trust & Safety</span>
            <h2 className="font-heading text-2xl font-normal text-[#3B2A22]">
              {getModalTitle()}
            </h2>
            {targetTitle && (
              <p className="font-sans text-xs text-[#8B7562] mt-0.5 line-clamp-1">
                {targetTitle}
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#E7DED1] hover:bg-[#D6C8B8] text-[#8B7562] hover:text-[#3B2A22] flex items-center justify-center transition-colors text-sm"
            aria-label="Close dialog"
          >
            ✕
          </button>
        </div>

        {isSubmitted ? (
          <div className="py-8 text-center space-y-3 font-sans">
            <div className="w-12 h-12 rounded-full bg-[#6E8A62]/15 text-[#6E8A62] border border-[#6E8A62]/30 flex items-center justify-center mx-auto text-xl font-bold">
              ✓
            </div>
            <h3 className="font-heading text-2xl font-normal text-[#3B2A22]">
              Report Submitted
            </h3>
            <p className="text-xs text-[#8B7562] max-w-xs mx-auto">
              Thank you for helping keep CampusMarket safe. Our campus moderation team will review this listing shortly.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 font-sans text-xs">
            {error && (
              <div className="p-3.5 rounded-2xl bg-[#9B5C52]/15 border border-[#9B5C52]/30 text-[#9B5C52] text-xs font-semibold">
                {error}
              </div>
            )}

            <div>
              <label className="font-sans text-[10px] tracking-[0.15em] uppercase font-semibold text-[#8B7562] block mb-2">
                Why are you reporting this? <span className="text-[#9B5C52]">*</span>
              </label>
              <select
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="input-editorial cursor-pointer"
              >
                {reasons.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="font-sans text-[10px] tracking-[0.15em] uppercase font-semibold text-[#8B7562] block mb-2">
                Additional Details <span className="text-[#8B7562] font-normal lowercase">(optional)</span>
              </label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Provide any relevant context for campus moderators..."
                className="input-editorial !py-3 resize-none"
              />
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#D6C8B8]">
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                className="btn-secondary !py-2.5 !px-5 text-xs"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="btn-primary !py-2.5 !px-6 text-xs flex items-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-3.5 h-3.5 rounded-full border-2 border-[#F4EFE7] border-t-transparent animate-spin" />
                    <span>Submitting Report…</span>
                  </>
                ) : (
                  <span>Submit Report</span>
                )}
              </button>
            </div>
          </form>
        )}

      </div>
    </div>
  );
};
