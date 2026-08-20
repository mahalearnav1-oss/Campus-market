import React, { useState } from 'react';
import { apiClient } from '../../lib/api/client';

export interface DisputeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  orderId: string;
  orderNumber: string;
}

const DISPUTE_REASONS = [
  { value: 'ITEM_NOT_AS_DESCRIBED', label: 'Item condition does not match listing / Not as described' },
  { value: 'ITEM_NOT_RECEIVED', label: 'Item not received / Seller missed campus meetup' },
  { value: 'WRONG_ITEM', label: 'Received wrong edition, coursebook, or item' },
  { value: 'DAMAGED_IN_HANDOVER', label: 'Item damaged or defective during handover' },
  { value: 'FAKE_SERIAL', label: 'Counterfeit / fake serial / invalid software access code' },
];

export const DisputeModal: React.FC<DisputeModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  orderId,
  orderNumber,
}) => {
  const [reason, setReason] = useState(DISPUTE_REASONS[0].value);
  const [explanation, setExplanation] = useState('');
  const [proofImageUrl, setProofImageUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (explanation.trim().length < 10) {
      setError('Please provide at least 10 characters explaining the issue.');
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);

      const proofImageUrls = proofImageUrl.trim() ? [proofImageUrl.trim()] : [];

      await apiClient.post('/disputes', {
        orderId,
        reason,
        explanation: explanation.trim(),
        proofImageUrls: proofImageUrls.length > 0 ? proofImageUrls : undefined,
      });

      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to submit dispute. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-lg rounded-[32px] bg-[#EDE5D9] border border-[#D6C8B8] shadow-2xl p-6 sm:p-8 space-y-6 text-[#3B2A22] max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-start justify-between border-b border-[#D6C8B8] pb-4">
          <div>
            <span className="tag-editorial mb-1 block">Campus Escrow Protection</span>
            <h2 className="font-heading text-2xl font-normal text-[#3B2A22]">
              Open Escrow Dispute
            </h2>
            <p className="font-sans text-xs text-[#8B7562] mt-0.5">
              Order #{orderNumber}
            </p>
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

        {/* Informational Alert */}
        <div className="p-4 rounded-2xl bg-[#9B5C52]/10 border border-[#9B5C52]/25 text-xs text-[#9B5C52] space-y-1 font-sans">
          <div className="font-semibold flex items-center gap-1.5">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            <span>Escrow Payout Frozen</span>
          </div>
          <p className="leading-relaxed">
            Opening a dispute temporarily freezes the escrow funds so the seller cannot claim payout until campus resolution arbitrates this order.
          </p>
        </div>

        {error && (
          <div className="p-3.5 rounded-2xl bg-[#9B5C52]/15 border border-[#9B5C52]/30 text-[#9B5C52] text-xs font-sans font-semibold">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 font-sans text-xs">
          <div>
            <label className="font-sans text-[10px] tracking-[0.15em] uppercase font-semibold text-[#8B7562] block mb-2">
              Primary Dispute Reason <span className="text-[#9B5C52]">*</span>
            </label>
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="input-editorial cursor-pointer"
            >
              {DISPUTE_REASONS.map((r) => (
                <option key={r.value} value={r.value}>
                  {r.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="font-sans text-[10px] tracking-[0.15em] uppercase font-semibold text-[#8B7562] block mb-2">
              Detailed Explanation <span className="text-[#9B5C52]">*</span>
            </label>
            <textarea
              required
              rows={4}
              value={explanation}
              onChange={(e) => setExplanation(e.target.value)}
              placeholder="Describe what happened (e.g. pages were heavily water-damaged unlike the 'Good' condition listing, or seller did not arrive at the library SafeZone)..."
              className="input-editorial !py-3 resize-none"
            />
            <span className="text-[10px] text-[#8B7562] block mt-1">
              Minimum 10 characters ({explanation.trim().length}/10)
            </span>
          </div>

          <div>
            <label className="font-sans text-[10px] tracking-[0.15em] uppercase font-semibold text-[#8B7562] block mb-2">
              Supporting Proof Photo URL <span className="text-[#8B7562] font-normal lowercase">(optional)</span>
            </label>
            <input
              type="url"
              value={proofImageUrl}
              onChange={(e) => setProofImageUrl(e.target.value)}
              placeholder="https://... (photo showing item condition or defect)"
              className="input-editorial"
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
              disabled={isSubmitting || explanation.trim().length < 10}
              className="btn-primary !py-2.5 !px-6 text-xs flex items-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <div className="w-3.5 h-3.5 rounded-full border-2 border-[#F4EFE7] border-t-transparent animate-spin" />
                  <span>Submitting Dispute…</span>
                </>
              ) : (
                <span>Submit Dispute</span>
              )}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
