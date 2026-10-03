import React, { useState } from 'react';
import { reviewApi } from '../../api/reviews';
import { RatingStars } from '../common/RatingStars';
import { Star, X, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';

interface ReviewModalProps {
  applicationId: string;
  jobTitle: string;
  revieweeName: string;
  revieweeRole: 'STUDENT' | 'EMPLOYER';
  onClose: () => void;
  onSuccess: () => void;
}

export const ReviewModal: React.FC<ReviewModalProps> = ({
  applicationId,
  jobTitle,
  revieweeName,
  revieweeRole,
  onClose,
  onSuccess,
}) => {
  const [rating, setRating] = useState<number>(5);
  const [comment, setComment] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating < 1 || rating > 5) {
      setError('Vui lòng chọn số sao đánh giá từ 1 đến 5 sao.');
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);
      await reviewApi.createReview(applicationId, {
        rating,
        comment: comment.trim() || undefined,
      });
      onSuccess();
    } catch (err: any) {
      setError(
        err.response?.data?.error?.message ||
          'Không thể gửi đánh giá. Vui lòng kiểm tra lại.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl border border-slate-200 max-w-lg w-full p-6 sm:p-7 shadow-2xl space-y-5 animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <div className="flex items-center space-x-2 text-amber-500">
              <Star className="w-5 h-5 fill-amber-400" />
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Đánh giá hai chiều
              </span>
            </div>
            <h3 className="text-xl font-extrabold text-slate-900">
              Đánh giá {revieweeRole === 'STUDENT' ? 'Sinh viên' : 'Nhà tuyển dụng'}
            </h3>
            <p className="text-xs text-slate-500">
              Đối tượng: <strong className="text-slate-800">{revieweeName}</strong> • Công việc:{' '}
              <span className="text-slate-700 italic">&ldquo;{jobTitle}&rdquo;</span>
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start space-x-2">
            <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Star Selection Section */}
          <div className="p-5 rounded-2xl bg-amber-50/50 border border-amber-100 flex flex-col items-center justify-center space-y-3">
            <label className="text-xs font-bold text-slate-700">
              Mức độ hài lòng của bạn (1 đến 5 sao) <span className="text-rose-500">*</span>
            </label>

            <RatingStars
              value={rating}
              onChange={(val) => setRating(val)}
              readOnly={false}
              size="xl"
              showTextLabel={true}
            />

            <p className="text-[11px] text-slate-500">
              Di chuột hoặc chạm vào các ngôi sao để chấm điểm.
            </p>
          </div>

          {/* Comment textarea */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <label className="font-bold text-slate-700">
                Nhận xét / Phản hồi (tùy chọn):
              </label>
              <span className="text-slate-400">{comment.length}/1000 ký tự</span>
            </div>
            <textarea
              rows={4}
              maxLength={1000}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder={
                revieweeRole === 'STUDENT'
                  ? 'Chia sẻ về tinh thần làm việc, trách nhiệm, thái độ và kỹ năng của sinh viên...'
                  : 'Chia sẻ về môi trường làm việc, sự hỗ trợ, tính chuyên nghiệp và minh bạch lương thưởng của NTD...'
              }
              className="w-full px-3.5 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:bg-white focus:border-[#0065c9] focus:outline-hidden leading-relaxed"
            />
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-end space-x-3 pt-2">
            <button
              type="button"
              disabled={isSubmitting}
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-slate-100 text-slate-700 text-xs font-bold hover:bg-slate-200 transition"
            >
              Hủy bỏ
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 rounded-xl bg-[#0065c9] hover:bg-[#0054a6] text-white text-xs font-bold transition shadow-sm inline-flex items-center space-x-1.5 disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-1" />
                  <span>Đang gửi...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4 mr-1" />
                  <span>Gửi đánh giá</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
