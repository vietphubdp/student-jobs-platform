import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Job } from '../../types/job';
import { useAuth } from '../../context/AuthContext';
import { applicationApi } from '../../api/applications';
import { 
  X, 
  Send, 
  FileText, 
  AlertCircle, 
  Loader2, 
  CheckCircle2, 
  ArrowRight,
  ShieldCheck 
} from 'lucide-react';

interface ApplyJobModalProps {
  job: Job;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const ApplyJobModal: React.FC<ApplyJobModalProps> = ({
  job,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { user } = useAuth();
  const [coverLetter, setCoverLetter] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  if (!isOpen) return null;

  const profile = user?.studentProfile;
  const hasCv = Boolean(profile?.cvUrl);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    try {
      setIsSubmitting(true);
      await applicationApi.applyJob(job.id, {
        coverLetter: coverLetter.trim() || undefined,
      });
      setIsSuccess(true);
      setTimeout(() => {
        onSuccess();
      }, 1500);
    } catch (err: any) {
      const msg =
        err.response?.data?.error?.message ||
        'Không thể gửi đơn ứng tuyển. Vui lòng thử lại sau.';
      setErrorMessage(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-lg w-full overflow-hidden animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-[#0065c9] flex items-center justify-center font-bold">
              <Send className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm text-slate-900">Nộp đơn ứng tuyển</h3>
              <p className="text-[11px] text-slate-500 truncate max-w-xs">{job.title}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        {isSuccess ? (
          <div className="p-8 text-center space-y-3">
            <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto animate-bounce">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h4 className="text-base font-bold text-slate-900">Nộp đơn thành công!</h4>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Nhà tuyển dụng đã nhận được thông báo về đơn ứng tuyển của bạn. Bạn có thể theo dõi tiến độ trong mục &ldquo;Đơn ứng tuyển của tôi&rdquo;.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {/* Error banner */}
            {errorMessage && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start space-x-2">
                <AlertCircle className="w-4 h-4 text-rose-500 mt-0.5 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Profile & CV Status Card */}
            <div className="p-4 rounded-2xl bg-blue-50/60 border border-blue-100 space-y-2.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-700 flex items-center">
                  <ShieldCheck className="w-4 h-4 text-[#0065c9] mr-1" />
                  Hồ sơ ứng viên: {profile?.fullName || user?.email}
                </span>
                {profile?.university && (
                  <span className="text-slate-500 text-[11px]">{profile.university}</span>
                )}
              </div>

              <div className="pt-2 border-t border-blue-100/60 flex items-center justify-between text-xs">
                <div className="flex items-center space-x-1.5 text-slate-600">
                  <FileText className="w-4 h-4 text-[#0065c9]" />
                  <span>
                    CV đính kèm:{' '}
                    {hasCv ? (
                      <strong className="text-emerald-700 font-bold">Đã có CV trong hồ sơ</strong>
                    ) : (
                      <span className="text-amber-700 font-medium">Chưa tải lên CV</span>
                    )}
                  </span>
                </div>

                {hasCv ? (
                  <a
                    href={profile?.cvUrl || '#'}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[11px] font-bold text-[#0065c9] hover:underline"
                  >
                    Xem CV PDF
                  </a>
                ) : (
                  <Link
                    to="/student/profile"
                    className="text-[11px] font-bold text-[#0065c9] hover:underline flex items-center"
                  >
                    <span>Cập nhật CV</span>
                    <ArrowRight className="w-3 h-3 ml-0.5" />
                  </Link>
                )}
              </div>
            </div>

            {/* Cover Letter Input */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                Thư giới thiệu / Lời nhắn gửi nhà tuyển dụng{' '}
                <span className="text-slate-400 font-normal lowercase">(tùy chọn)</span>
              </label>
              <textarea
                value={coverLetter}
                onChange={(e) => setCoverLetter(e.target.value)}
                placeholder="Giới thiệu nhanh về kinh nghiệm, kỹ năng và thời gian bạn có thể làm việc..."
                rows={4}
                maxLength={2000}
                className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:bg-white focus:border-[#0065c9] focus:outline-hidden transition"
              />
              <div className="text-right text-[10px] text-slate-400">
                {coverLetter.length}/2000 ký tự
              </div>
            </div>

            {/* Business Rules Note */}
            <div className="text-[11px] text-slate-500 bg-slate-50 p-3 rounded-xl border border-slate-100 leading-relaxed">
              💡 <strong>Lưu ý:</strong> Mỗi sinh viên chỉ nộp 1 đơn ứng tuyển cho mỗi công việc. Bạn có thể tự rút đơn trước khi công việc hoàn thành.
            </div>

            {/* Actions */}
            <div className="pt-2 flex items-center justify-end space-x-3">
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                className="px-4 py-2.5 rounded-xl bg-slate-100 text-slate-700 text-xs font-bold hover:bg-slate-200 transition"
              >
                Hủy bỏ
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-2.5 rounded-xl bg-[#0065c9] hover:bg-[#0054a6] text-white text-xs font-bold transition shadow-sm inline-flex items-center space-x-1.5 active:scale-95 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Đang gửi đơn...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    <span>Xác nhận Nộp đơn</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
