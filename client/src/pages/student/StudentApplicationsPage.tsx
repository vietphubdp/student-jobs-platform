import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { applicationApi } from '../../api/applications';
import { Application } from '../../types/application';
import { Navbar } from '../../components/layout/Navbar';
import { StatusBadge } from '../../components/common/StatusBadge';
import { RatingStars } from '../../components/common/RatingStars';
import { ReviewModal } from '../../components/reviews/ReviewModal';
import {
  FileText,
  Building,
  MapPin,
  Clock,
  AlertCircle,
  Loader2,
  XCircle,
  Briefcase,
  ChevronLeft,
  ChevronRight,
  Send,
  HelpCircle,
  CheckCircle2,
  Star,
  Award
} from 'lucide-react';

export const StudentApplicationsPage: React.FC = () => {
  const { user } = useAuth();
  const [applications, setApplications] = useState<Application[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [selectedTab, setSelectedTab] = useState<string>('ALL');
  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalCount, setTotalCount] = useState<number>(0);

  // Withdraw modal state
  const [withdrawApp, setWithdrawApp] = useState<Application | null>(null);
  const [withdrawReason, setWithdrawReason] = useState<string>('');
  const [isWithdrawing, setIsWithdrawing] = useState<boolean>(false);
  const [withdrawError, setWithdrawError] = useState<string | null>(null);

  // Review modal state
  const [reviewModalTarget, setReviewModalTarget] = useState<{
    applicationId: string;
    jobTitle: string;
    employerName: string;
  } | null>(null);
  const [reviewSuccessMsg, setReviewSuccessMsg] = useState<string | null>(null);

  const fetchApplications = async () => {
    try {
      setIsLoading(true);
      const statusParam = selectedTab === 'ALL' ? undefined : selectedTab;
      const data = await applicationApi.getStudentApplications({
        page,
        limit: 10,
        status: statusParam,
      });
      setApplications(data.applications);
      setTotalPages(data.pagination?.totalPages || 1);
      setTotalCount(data.pagination?.total || 0);
    } catch (err) {
      console.error('Failed to fetch student applications:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, [selectedTab, page]);

  const handleWithdrawSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!withdrawApp) return;

    try {
      setIsWithdrawing(true);
      setWithdrawError(null);
      await applicationApi.withdrawApplication(
        withdrawApp.id,
        withdrawReason.trim() || undefined
      );
      setWithdrawApp(null);
      setWithdrawReason('');
      fetchApplications();
    } catch (err: any) {
      setWithdrawError(
        err.response?.data?.error?.message || 'Không thể rút đơn. Vui lòng thử lại sau.'
      );
    } finally {
      setIsWithdrawing(false);
    }
  };

  const handleReviewSuccess = () => {
    setReviewModalTarget(null);
    setReviewSuccessMsg('Cảm ơn bạn! Đánh giá đã được gửi thành công.');
    setTimeout(() => setReviewSuccessMsg(null), 4000);
    fetchApplications();
  };

  const tabs = [
    { id: 'ALL', label: 'Tất cả đơn' },
    { id: 'PENDING', label: 'Đang chờ duyệt' },
    { id: 'ACCEPTED', label: 'Được chấp nhận' },
    { id: 'REJECTED', label: 'Bị từ chối' },
    { id: 'WITHDRAWN', label: 'Đã rút' },
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 flex items-center space-x-3">
              <span className="p-2 rounded-xl bg-blue-50 text-[#0065c9] border border-blue-100">
                <FileText className="w-6 h-6" />
              </span>
              <span>Đơn ứng tuyển của tôi</span>
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Theo dõi tiến độ xét duyệt, kết quả ứng tuyển và đánh giá sau khi hoàn thành công việc.
            </p>
          </div>

          <Link
            to="/jobs"
            className="inline-flex items-center px-4 py-2.5 rounded-xl bg-[#0065c9] hover:bg-[#0054a6] text-white text-xs font-bold transition shadow-sm self-start sm:self-auto"
          >
            <Send className="w-4 h-4 mr-1.5" />
            <span>Tìm việc mới</span>
          </Link>
        </div>

        {/* Success Alert */}
        {reviewSuccessMsg && (
          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm flex items-center space-x-2 animate-in fade-in">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span className="font-semibold">{reviewSuccessMsg}</span>
          </div>
        )}

        {/* Filter Tabs */}
        <div className="flex items-center space-x-2 overflow-x-auto pb-1 border-b border-slate-200">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setSelectedTab(tab.id);
                setPage(1);
              }}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                selectedTab === tab.id
                  ? 'bg-[#0065c9] text-white shadow-sm'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Applications List */}
        {isLoading ? (
          <div className="py-20 flex flex-col items-center justify-center space-y-3 text-slate-500">
            <Loader2 className="w-8 h-8 animate-spin text-[#0065c9]" />
            <p className="text-sm">Đang tải danh sách đơn ứng tuyển...</p>
          </div>
        ) : applications.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center space-y-4 shadow-sm">
            <div className="w-16 h-16 rounded-2xl bg-blue-50 text-[#0065c9] flex items-center justify-center mx-auto">
              <Briefcase className="w-8 h-8" />
            </div>
            <div className="space-y-1">
              <h3 className="text-lg font-bold text-slate-900">
                {selectedTab === 'ALL'
                  ? 'Bạn chưa nộp đơn ứng tuyển công việc nào'
                  : 'Không có đơn nào ở trạng thái này'}
              </h3>
              <p className="text-sm text-slate-500 max-w-md mx-auto">
                Khám phá hàng trăm cơ hội việc làm part-time hấp dẫn và nộp đơn ngay hôm nay!
              </p>
            </div>
            <Link
              to="/jobs"
              className="inline-flex items-center px-5 py-2.5 rounded-xl bg-[#0065c9] hover:bg-[#0054a6] text-white text-xs font-bold transition shadow-sm"
            >
              Khám phá việc làm ngay
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="text-xs text-slate-500 font-medium">
              Hiển thị <strong className="text-slate-800">{applications.length}</strong> / {totalCount} đơn ứng tuyển
            </div>

            <div className="grid grid-cols-1 gap-4">
              {applications.map((app) => {
                const job = app.job;
                const employerId = job?.employerId || job?.employer?.id;
                const employerName =
                  job?.employer?.employerProfile?.companyName || 'Nhà tuyển dụng';

                // Reviews
                const myReview = app.reviews?.find((r) => r.reviewerId === user?.id);
                const employerReview = app.reviews?.find((r) => r.revieweeId === user?.id);

                return (
                  <div
                    key={app.id}
                    className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-sm hover:border-[#0065c9]/40 transition space-y-4"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                      <div className="space-y-1 flex-1">
                        <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                          <StatusBadge status={app.status as any} />
                          {job?.category && (
                            <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-blue-50 text-[#0065c9] border border-blue-100">
                              {job.category.name}
                            </span>
                          )}
                        </div>

                        <Link
                          to={`/jobs/${job?.id}`}
                          className="text-base sm:text-lg font-bold text-slate-900 hover:text-[#0065c9] transition inline-block mt-1"
                        >
                          {job?.title || 'Công việc không xác định'}
                        </Link>

                        <div className="flex items-center space-x-2 text-xs text-slate-600">
                          <Building className="w-3.5 h-3.5 text-slate-400" />
                          {employerId ? (
                            <Link
                              to={`/users/${employerId}`}
                              className="font-semibold text-slate-800 hover:text-[#0065c9] hover:underline"
                            >
                              {employerName}
                            </Link>
                          ) : (
                            <span className="font-semibold">{employerName}</span>
                          )}
                        </div>
                      </div>

                      {/* Status / Action Column */}
                      <div className="sm:text-right shrink-0">
                        <div className="text-xs text-slate-400">
                          Ngày nộp: {new Date(app.createdAt).toLocaleDateString('vi-VN')}
                        </div>

                        {/* Allow withdraw only before job is COMPLETED */}
                        {(app.status === 'PENDING' || (app.status === 'ACCEPTED' && job?.status !== 'COMPLETED')) && (
                          <button
                            onClick={() => {
                              setWithdrawApp(app);
                              setWithdrawReason('');
                              setWithdrawError(null);
                            }}
                            className="mt-2 text-xs font-bold text-rose-600 hover:text-rose-800 bg-rose-50 hover:bg-rose-100 px-3 py-1.5 rounded-xl border border-rose-200 transition inline-flex items-center space-x-1"
                          >
                            <XCircle className="w-3.5 h-3.5" />
                            <span>Rút đơn</span>
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Job Completed & Review Section */}
                    {app.status === 'ACCEPTED' && job?.status === 'COMPLETED' && (
                      <div className="p-4 rounded-2xl bg-gradient-to-r from-purple-50/90 to-amber-50/70 border border-purple-200 text-purple-900 text-xs space-y-3">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-purple-100 pb-2.5">
                          <div className="flex items-center space-x-2">
                            <Award className="w-4 h-4 text-purple-600 shrink-0" />
                            <span className="font-bold text-purple-950">
                              Công việc đã hoàn thành! Cả hai bên đã có thể tiến hành đánh giá.
                            </span>
                          </div>

                          {!myReview && (
                            <button
                              onClick={() =>
                                setReviewModalTarget({
                                  applicationId: app.id,
                                  jobTitle: job?.title || 'Công việc',
                                  employerName,
                                })
                              }
                              className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs shadow-sm transition inline-flex items-center space-x-1.5 self-start sm:self-auto"
                            >
                              <Star className="w-3.5 h-3.5 fill-white" />
                              <span>Đánh giá Nhà tuyển dụng ngay</span>
                            </button>
                          )}
                        </div>

                        {/* Review Status Breakdown */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {/* Student's Review of Employer */}
                          <div className="p-3 rounded-xl bg-white border border-purple-100/80 shadow-2xs space-y-1.5">
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-slate-700">Đánh giá của bạn:</span>
                              {myReview ? (
                                <RatingStars value={myReview.rating} size="sm" showScore={true} />
                              ) : (
                                <span className="text-[11px] font-semibold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-100">
                                  Chưa đánh giá
                                </span>
                              )}
                            </div>
                            {myReview?.comment && (
                              <p className="text-slate-600 italic text-[11px]">
                                &ldquo;{myReview.comment}&rdquo;
                              </p>
                            )}
                          </div>

                          {/* Employer's Review of Student */}
                          <div className="p-3 rounded-xl bg-white border border-purple-100/80 shadow-2xs space-y-1.5">
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-slate-700">Đánh giá từ NTD:</span>
                              {employerReview ? (
                                <RatingStars value={employerReview.rating} size="sm" showScore={true} />
                              ) : (
                                <span className="text-[11px] text-slate-400">
                                  NTD chưa gửi đánh giá
                                </span>
                              )}
                            </div>
                            {employerReview?.comment && (
                              <p className="text-slate-600 italic text-[11px]">
                                &ldquo;{employerReview.comment}&rdquo;
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Quick Meta */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs text-slate-600">
                      <div className="flex items-center space-x-1.5">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="truncate">{job?.location}, {job?.city}</span>
                      </div>
                      <div className="flex items-center space-x-1.5">
                        <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="truncate">{job?.workTime}</span>
                      </div>
                      <div className="flex items-center space-x-1.5 col-span-2 sm:col-span-1">
                        <Briefcase className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>Trạng thái job: <strong>{job?.status}</strong></span>
                      </div>
                    </div>

                    {/* Cover Letter */}
                    {app.coverLetter && (
                      <div className="text-xs space-y-1 bg-blue-50/40 p-3 rounded-xl border border-blue-100/60">
                        <span className="font-bold text-slate-700">Lời nhắn gửi kèm:</span>
                        <p className="text-slate-600 italic leading-relaxed">&ldquo;{app.coverLetter}&rdquo;</p>
                      </div>
                    )}

                    {/* Rejection / Withdraw Feedback Reason */}
                    {app.rejectReason && (
                      <div className="text-xs space-y-1 bg-amber-50 p-3 rounded-xl border border-amber-200 text-amber-900">
                        <span className="font-bold flex items-center">
                          <HelpCircle className="w-3.5 h-3.5 mr-1 text-amber-600" />
                          Ghi chú / Lý do:
                        </span>
                        <p className="text-amber-800">{app.rejectReason}</p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center space-x-2 pt-6">
                <button
                  disabled={page <= 1}
                  onClick={() => setPage(page - 1)}
                  className="px-4 py-2 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-40 flex items-center transition"
                >
                  <ChevronLeft className="w-4 h-4 mr-1" />
                  <span>Trang trước</span>
                </button>

                <div className="text-xs font-bold text-slate-600 px-3">
                  Trang {page} / {totalPages}
                </div>

                <button
                  disabled={page >= totalPages}
                  onClick={() => setPage(page + 1)}
                  className="px-4 py-2 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-40 flex items-center transition"
                >
                  <span>Trang sau</span>
                  <ChevronRight className="w-4 h-4 ml-1" />
                </button>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Withdraw Modal */}
      {withdrawApp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-md w-full p-6 space-y-4 animate-in zoom-in-95 duration-150">
            <div className="flex items-center space-x-3 text-rose-600">
              <div className="w-10 h-10 rounded-2xl bg-rose-50 flex items-center justify-center">
                <XCircle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Xác nhận Rút đơn ứng tuyển</h3>
                <p className="text-xs text-slate-500">Hành động này không thể hoàn tác.</p>
              </div>
            </div>

            {withdrawError && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start space-x-2">
                <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                <span>{withdrawError}</span>
              </div>
            )}

            <p className="text-xs text-slate-600 leading-relaxed">
              Bạn có chắc chắn muốn rút đơn ứng tuyển cho công việc{' '}
              <strong>&ldquo;{withdrawApp.job?.title}&rdquo;</strong>?
            </p>

            <form onSubmit={handleWithdrawSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Lý do rút đơn (tùy chọn):</label>
                <textarea
                  value={withdrawReason}
                  onChange={(e) => setWithdrawReason(e.target.value)}
                  placeholder="Nhập lý do rút đơn để thông báo cho nhà tuyển dụng..."
                  rows={3}
                  maxLength={500}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:bg-white focus:border-[#0065c9] focus:outline-hidden"
                />
              </div>

              <div className="flex items-center justify-end space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setWithdrawApp(null)}
                  disabled={isWithdrawing}
                  className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 text-xs font-bold hover:bg-slate-200 transition"
                >
                  Giữ lại đơn
                </button>
                <button
                  type="submit"
                  disabled={isWithdrawing}
                  className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition shadow-sm inline-flex items-center space-x-1.5"
                >
                  {isWithdrawing ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Đang xử lý...</span>
                    </>
                  ) : (
                    <span>Xác nhận rút đơn</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Review Modal */}
      {reviewModalTarget && (
        <ReviewModal
          applicationId={reviewModalTarget.applicationId}
          jobTitle={reviewModalTarget.jobTitle}
          revieweeName={reviewModalTarget.employerName}
          revieweeRole="EMPLOYER"
          onClose={() => setReviewModalTarget(null)}
          onSuccess={handleReviewSuccess}
        />
      )}
    </div>
  );
};
