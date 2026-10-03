import React, { useState } from 'react';
import { Star } from 'lucide-react';

interface RatingStarsProps {
  value: number; // 0 to 5
  onChange?: (value: number) => void;
  readOnly?: boolean;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  showScore?: boolean;
  showTextLabel?: boolean;
  totalReviews?: number;
}

const STAR_LABELS: Record<number, string> = {
  1: 'Rất không hài lòng',
  2: 'Chưa hài lòng',
  3: 'Bình thường / Tạm ổn',
  4: 'Hài lòng',
  5: 'Rất hài lòng & Xuất sắc',
};

export const RatingStars: React.FC<RatingStarsProps> = ({
  value,
  onChange,
  readOnly = true,
  size = 'md',
  showScore = false,
  showTextLabel = false,
  totalReviews,
}) => {
  const [hoverValue, setHoverValue] = useState<number | null>(null);

  const activeValue = hoverValue !== null ? hoverValue : value;

  const sizeClasses = {
    xs: 'w-3.5 h-3.5',
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-7 h-7',
    xl: 'w-9 h-9',
  };

  return (
    <div className="inline-flex items-center space-x-1.5">
      <div className="flex items-center space-x-0.5">
        {[1, 2, 3, 4, 5].map((star) => {
          const isFilled = star <= activeValue;

          return (
            <button
              type="button"
              key={star}
              disabled={readOnly}
              onClick={() => !readOnly && onChange && onChange(star)}
              onMouseEnter={() => !readOnly && setHoverValue(star)}
              onMouseLeave={() => !readOnly && setHoverValue(null)}
              className={`transition-transform duration-100 ${
                readOnly
                  ? 'cursor-default'
                  : 'cursor-pointer hover:scale-115 focus:outline-hidden'
              }`}
            >
              <Star
                className={`${sizeClasses[size]} ${
                  isFilled
                    ? 'text-amber-400 fill-amber-400 drop-shadow-xs'
                    : 'text-slate-300 fill-slate-100'
                } transition-colors`}
              />
            </button>
          );
        })}
      </div>

      {showScore && (
        <span className="text-xs font-bold text-slate-800 ml-1">
          {value > 0 ? value.toFixed(1) : 'Chưa có'}
        </span>
      )}

      {totalReviews !== undefined && (
        <span className="text-xs text-slate-500 font-medium">
          ({totalReviews} đánh giá)
        </span>
      )}

      {showTextLabel && activeValue > 0 && STAR_LABELS[activeValue] && (
        <span className="text-xs font-semibold text-amber-600 ml-2 animate-in fade-in">
          {STAR_LABELS[activeValue]}
        </span>
      )}
    </div>
  );
};
