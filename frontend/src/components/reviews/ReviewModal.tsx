import React, { useState, useEffect } from 'react';
import { apiClient } from '../../lib/api/client';
import { RatingStars } from './RatingStars';

export interface ExistingReviewData {
  id: string;
  rating: number;
  title?: string | null;
  comment?: string;
}

interface ReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  type?: 'product' | 'seller';
  productId?: string;
  orderItemId?: string;
  orderId?: string;
  sellerId?: string;
  itemTitle: string;
  itemImage?: string | null;
  existingReview?: ExistingReviewData | null;
}

export const ReviewModal: React.FC<ReviewModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  type = 'product',
  productId,
  orderItemId,
  orderId,
  sellerId,
  itemTitle,
  itemImage,
  existingReview,
}) => {
  const [rating, setRating] = useState<number>(existingReview?.rating || 0);
  const [title, setTitle] = useState<string>(existingReview?.title || '');
  const [comment, setComment] = useState<string>(existingReview?.comment || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape' && !isSubmitting) {
          onClose();
        }
      };
      window.addEventListener('keydown', handleKeyDown);
      return () => {
        document.body.style.overflow = 'unset';
        window.removeEventListener('keydown', handleKeyDown);
      };
    }
  }, [isOpen, isSubmitting, onClose]);

  useEffect(() => {
    if (existingReview) {
      setRating(existingReview.rating || 0);
      setTitle(existingReview.title || '');
      setComment(existingReview.comment || '');
    } else {
      setRating(0);
      setTitle('');
      setComment('');
    }
    setError(null);
  }, [existingReview, isOpen, orderItemId, sellerId]);

  if (!isOpen) return null;

  const isEditing = !!existingReview?.id;

  const ratingLabels: Record<number, string> = {
    1: '1 Star — Poor',
    2: '2 Stars — Fair',
    3: '3 Stars — Good',
    4: '4 Stars — Very Good',
    5: '5 Stars — Excellent',
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating < 1 || rating > 5) {
      setError('Please select a rating between 1 and 5 stars.');
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);

      if (type === 'product') {
        if (isEditing) {
          // Update existing product review
          await apiClient.patch(`/products/${productId}/reviews/${existingReview.id}`, {
            rating,
            title: title.trim() || null,
            comment: comment.trim(),
          });
        } else {
          // Create new product review
          await apiClient.post(`/products/${productId}/reviews`, {
            orderItemId,
            rating,
            title: title.trim() || null,
            comment: comment.trim(),
          });
        }
      } else {
        // Seller review
        await apiClient.post(`/sellers/${sellerId}/reviews`, {
          orderId,
          rating,
          comment: comment.trim(),
        });
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to submit review. Please check your inputs and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget && !isSubmitting) onClose();
      }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#3B2A22]/60 backdrop-blur-sm animate-fade-in"
    >
      <div className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-[32px] bg-[#F4EFE7] border border-[#D6C8B8] shadow-warm-card text-[#3B2A22]">
        {/* Header */}
        <div className="p-6 sm:p-8 border-b border-[#D6C8B8] bg-[#EDE5D9]/70 flex items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            {itemImage && (
              <img
                src={itemImage}
                alt={itemTitle}
                className="w-14 h-14 object-cover rounded-2xl border border-[#D6C8B8] bg-[#E7DED1] flex-shrink-0"
              />
            )}
            <div>
              <span className="tag-editorial mb-1 block">
                {type === 'seller' ? 'Seller Feedback' : isEditing ? 'Edit Product Review' : 'Verified Buyer Review'}
              </span>
              <h3 className="font-heading text-2xl font-normal text-[#3B2A22] line-clamp-1">{itemTitle}</h3>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#E7DED1] hover:bg-[#D6C8B8] text-[#3B2A22] flex items-center justify-center transition-colors text-sm font-bold"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-6">
          {error && (
            <div className="p-4 rounded-2xl bg-[#9B5C52]/15 border border-[#9B5C52]/30 text-[#9B5C52] text-xs font-semibold">
              {error}
            </div>
          )}

          {/* Star Selection */}
          <div className="p-5 rounded-2xl bg-[#EDE5D9] border border-[#D6C8B8] text-center space-y-2">
            <label className="font-sans text-[10px] tracking-[0.15em] uppercase font-semibold text-[#8B7562] block">
              Select Your Rating <span className="text-[#9B5C52]">*</span>
            </label>
            <div className="flex justify-center py-1">
              <RatingStars
                rating={rating}
                interactive={true}
                onRatingChange={(newR) => {
                  setRating(newR);
                  if (error) setError(null);
                }}
                size="xl"
              />
            </div>
            <p className="font-sans text-xs font-semibold text-[#3B2A22] h-4">
              {rating > 0 ? ratingLabels[rating] : 'Tap a star to rate'}
            </p>
          </div>

          {/* Optional Title (for Product reviews) */}
          {type === 'product' && (
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="font-sans text-[10px] tracking-[0.15em] uppercase font-semibold text-[#8B7562]">
                  Review Headline <span className="text-[#8B7562]/70 font-normal lowercase">(optional)</span>
                </label>
                <span className="font-mono text-[10px] text-[#8B7562]">{title.length}/100</span>
              </div>
              <input
                type="text"
                maxLength={100}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Great condition, essential textbook for CS 101"
                className="input-editorial"
              />
            </div>
          )}

          {/* Optional Written Comment */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="font-sans text-[10px] tracking-[0.15em] uppercase font-semibold text-[#8B7562]">
                Written Review <span className="text-[#8B7562]/70 font-normal lowercase">(optional)</span>
              </label>
              <span className="font-mono text-[10px] text-[#8B7562]">{comment.length}/2000</span>
            </div>
            <textarea
              rows={4}
              maxLength={2000}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Share details about the book condition, delivery, or coursework relevance..."
              className="input-editorial w-full"
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="btn-secondary flex-1 py-3.5 text-xs font-semibold uppercase tracking-wider"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || rating === 0}
              className="btn-primary flex-1 py-3.5 text-xs font-semibold uppercase tracking-wider disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                  <span>Submitting…</span>
                </>
              ) : isEditing ? (
                'Save Changes'
              ) : (
                'Submit Review'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
