'use client';

import { Star } from 'lucide-react';

interface RatingStarsProps {
  rating: number;
  maxRating?: number;
  size?: 'sm' | 'md' | 'lg';
  showValue?: boolean;
  reviewCount?: number;
}

export function RatingStars({
  rating,
  maxRating = 5,
  size = 'md',
  showValue = true,
  reviewCount,
}: RatingStarsProps) {
  const sizeClasses = {
    sm: 'h-3 w-3',
    md: 'h-4 w-4',
    lg: 'h-5 w-5',
  };

  const textSizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
  };

  return (
    <div className="flex items-center gap-1">
      <div className="flex items-center gap-0.5">
        {Array.from({ length: maxRating }, (_, i) => (
          <Star
            key={i}
            className={`${sizeClasses[size]} ${
              i < Math.floor(rating)
                ? 'fill-yellow-400 text-yellow-400'
                : i < rating
                ? 'fill-yellow-400/50 text-yellow-400'
                : 'text-muted-foreground/30'
            }`}
          />
        ))}
      </div>
      {showValue && rating > 0 && (
        <span className={`font-medium text-muted-foreground ${textSizeClasses[size]}`}>
          {rating.toFixed(1)}
        </span>
      )}
      {reviewCount !== undefined && reviewCount > 0 && (
        <span className={`text-muted-foreground ${textSizeClasses.size}`}>
          ({reviewCount}{' '}
          {reviewCount > 1 ? 'avis' : 'avis'})
        </span>
      )}
    </div>
  );
}
