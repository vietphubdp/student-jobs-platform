import React from 'react';
import { Link } from 'react-router-dom';
import { Review } from '../../types/review';
import { RatingStars } from '../common/RatingStars';
import { Briefcase, Calendar, MessageSquareQuote } from 'lucide-react';

interface ReviewCardProps {
  review: Review;
}

export const ReviewCard: React.FC<ReviewCardProps> = ({ review }) => {
  const reviewer = review.reviewer;
  const isStudent = reviewer?.role === 'STUDENT';
  const reviewerName = isStudent
    ? reviewer?.studentProfile?.fullName || 'Sinh viên'
    : reviewer?.employerProfile?.companyName || 'Nhà tuyển dụng';
  const reviewerSub = isStudent
    ? reviewer?.studentProfile?.university
      ? `${reviewer.studentProfile.university}${
          reviewer.studentProfile.major ? ` • ${reviewer.studentProfile.major}` : ''
        }`
      : 'Sinh viên tìm việc'
    : reviewer?.employerProfile?.address || 'Nhà tuyển dụng';

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-xs hover:border-slate-300 transition space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
        {/* Reviewer Meta */}
        <div className="flex items-center space-x-3">
          <Link
            to={`/users/${reviewer?.id}`}
            className="w-10 h-10 rounded-xl bg-blue-50 text-[#0065c9] border border-blue-100 flex items-center justify-center font-bold text-sm shrink-0 hover:bg-blue-100 transition"
          >
            {reviewerName.charAt(0).toUpperCase()}
          </Link>

          <div>
            <div className="flex items-center space-x-2 flex-wrap">
              <Link
                to={`/users/${reviewer?.id}`}
                className="text-sm font-bold text-slate-900 hover:text-[#0065c9] transition"
              >
                {reviewerName}
              </Link>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  isStudent
                    ? 'bg-blue-50 text-[#0065c9] border border-blue-100'
                    : 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                }`}
              >
                {isStudent ? 'Sinh viên' : 'Nhà tuyển dụng'}
              </span>
            </div>
            <p className="text-xs text-slate-500 truncate max-w-xs sm:max-w-md">
              {reviewerSub}
            </p>
          </div>
        </div>

        {/* Rating Score & Date */}
        <div className="flex items-center space-x-3 self-start sm:self-auto">
          <RatingStars value={review.rating} size="sm" />
          <div className="text-xs text-slate-400 flex items-center space-x-1">
            <Calendar className="w-3.5 h-3.5" />
            <span>{new Date(review.createdAt).toLocaleDateString('vi-VN')}</span>
          </div>
        </div>
      </div>

      {/* Associated Job Title if available */}
      {review.application?.job && (
        <div className="flex items-center space-x-1.5 text-xs text-slate-500 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-100 w-fit">
          <Briefcase className="w-3.5 h-3.5 text-slate-400" />
          <span>Công việc:</span>
          <Link
            to={`/jobs/${review.application.job.id}`}
            className="font-semibold text-slate-700 hover:text-[#0065c9] hover:underline"
          >
            {review.application.job.title}
          </Link>
        </div>
      )}

      {/* Comment Content */}
      {review.comment ? (
        <div className="text-xs sm:text-sm text-slate-700 leading-relaxed bg-amber-50/20 p-3.5 rounded-xl border border-amber-100/50 space-y-1">
          <div className="flex items-center space-x-1 text-amber-700 font-semibold text-xs">
            <MessageSquareQuote className="w-4 h-4" />
            <span>Nhận xét chi tiết:</span>
          </div>
          <p className="whitespace-pre-wrap">{review.comment}</p>
        </div>
      ) : (
        <p className="text-xs text-slate-400 italic">
          (Người đánh giá không để lại nhận xét bằng chữ)
        </p>
      )}
    </div>
  );
};
