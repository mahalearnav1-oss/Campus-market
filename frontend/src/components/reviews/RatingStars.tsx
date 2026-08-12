import React from 'react';

interface RatingStarsProps {
  rating: number;
  maxRating?: number;
  interactive?: boolean;
  onRatingChange?: (newRating: number) => void;
  size?: 'sm' | 'md' | 'lg';
}

export const RatingStars: React.FC<RatingStarsProps> = ({
  rating,
  maxRating = 5,
  interactive = false,
  onRatingChange,
  size = 'md',
}) => {
  const sizeClasses = {
    sm: 'text-xs',
    md: 'text-base',
    lg: 'text-xl',
  };

  return (
    <div className={`flex items-center gap-0.5 ${sizeClasses[size]}`}>
      {Array.from({ length: maxRating }).map((_, idx) => {
        const starValue = idx + 1;
        const isFilled = starValue <= Math.round(rating);

        return (
          <span
            key={idx}
            onClick={() => interactive && onRatingChange && onRatingChange(starValue)}
            className={`transition-colors ${
              interactive ? 'cursor-pointer hover:scale-110' : ''
            } ${isFilled ? 'text-amber-400' : 'text-border'}`}
          >
            ★
          </span>
        );
      })}
    </div>
  );
};
