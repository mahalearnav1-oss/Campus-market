import React, { useState } from 'react';

interface RatingStarsProps {
  rating: number;
  maxRating?: number;
  interactive?: boolean;
  onRatingChange?: (newRating: number) => void;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export const RatingStars: React.FC<RatingStarsProps> = ({
  rating,
  maxRating = 5,
  interactive = false,
  onRatingChange,
  size = 'md',
}) => {
  const [hoverRating, setHoverRating] = useState<number | null>(null);

  const sizeClasses = {
    sm: 'text-xs gap-0.5',
    md: 'text-base gap-1',
    lg: 'text-xl gap-1.5',
    xl: 'text-2xl gap-2',
  };

  const activeRating = hoverRating !== null ? hoverRating : rating;

  return (
    <div
      className={`inline-flex items-center ${sizeClasses[size]}`}
      onMouseLeave={() => interactive && setHoverRating(null)}
    >
      {Array.from({ length: maxRating }).map((_, idx) => {
        const starValue = idx + 1;
        const isFilled = starValue <= Math.round(activeRating);

        return (
          <button
            key={idx}
            type="button"
            disabled={!interactive}
            onMouseEnter={() => interactive && setHoverRating(starValue)}
            onClick={() => interactive && onRatingChange && onRatingChange(starValue)}
            className={`transition-all duration-150 select-none ${
              interactive
                ? 'cursor-pointer hover:scale-125 focus:outline-none'
                : 'cursor-default pointer-events-none'
            } ${isFilled ? 'text-[#C8A46A]' : 'text-[#D6C8B8]'}`}
            aria-label={`${starValue} star`}
          >
            ★
          </button>
        );
      })}
    </div>
  );
};
