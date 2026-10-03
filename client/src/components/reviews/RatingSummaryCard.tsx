import React from 'react';
import { ReviewSummary } from '../../types/review';
import { RatingStars } from '../common/RatingStars';
import { Star, Award } from 'lucide-react';

interface RatingSummaryCardProps {
  summary: ReviewSummary;
  title?: string;
}

export const RatingSummaryCard: React.FC<RatingSummaryCardProps> = ({
  summary,
  title = 'Tổng quan Đánh giá & Uy tín',
}) => {
  const { averageRating, totalReviews, distribution } = summary;

  return (
    <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-7 shadow-sm space-y-6">
      <div className="flex items-center space-x-2.5 pb-4 border-b border-slate-100">
        <div className="p-2 rounded-xl bg-amber-50 text-amber-600">
          <Award className="w-5 h-5" />
        </div>
        <div>
          <h3 className="text-base font-bold text-slate-900">{title}</h3>
          <p className="text-xs text-slate-500">
            Dựa trên phản hồi thực tế từ các công việc đã hoàn thành
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
        {/* Left: Overall Rating Score */}
        <div className="md:col-span-5 flex flex-col items-center justify-center p-6 bg-amber-50/40 border border-amber-100 rounded-2xl text-center space-y-2">
          <div className="text-4xl sm:text-5xl font-black text-slate-900 tracking-tight flex items-baseline justify-center space-x-1">
            <span>{averageRating > 0 ? averageRating.toFixed(1) : '0.0'}</span>
            <span className="text-lg font-semibold text-slate-400">/ 5.0</span>
          </div>

          <RatingStars value={averageRating} size="lg" />

          <p className="text-xs font-semibold text-slate-600 pt-1">
            {totalReviews > 0
              ? `Tổng cộng ${totalReviews} lượt đánh giá`
              : 'Chưa có lượt đánh giá nào'}
          </p>
        </div>

        {/* Right: Distribution Bars */}
        <div className="md:col-span-7 space-y-2.5">
          {[5, 4, 3, 2, 1].map((star) => {
            const count = distribution[star] || 0;
            const percentage = totalReviews > 0 ? Math.round((count / totalReviews) * 100) : 0;

            return (
              <div key={star} className="flex items-center space-x-3 text-xs">
                <div className="flex items-center space-x-1 w-12 shrink-0 font-bold text-slate-700">
                  <span>{star}</span>
                  <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                </div>

                <div className="flex-1 h-3 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-amber-400 rounded-full transition-all duration-500"
                    style={{ width: `${percentage}%` }}
                  />
                </div>

                <div className="w-16 text-right shrink-0 text-slate-500 font-medium">
                  {count} ({percentage}%)
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
