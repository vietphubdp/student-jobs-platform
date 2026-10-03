import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { applicationApi } from '../../api/applications';
import { jobApi } from '../../api/jobs';
import { JobStatus } from '../../types/job';
import { Application, JobApplicationsSummary } from '../../types/application';
import { Navbar } from '../../components/layout/Navbar';
import { StatusBadge } from '../../components/common/StatusBadge';
import { RatingStars } from '../../components/common/RatingStars';
import { ReviewModal } from '../../components/reviews/ReviewModal';
import {
  Users,
  Briefcase,
  ChevronLeft,
  CheckCircle2,
  XCircle,
  Clock,
  FileText,
  Mail,
  Phone,
  GraduationCap,
  Calendar,
  AlertCircle,
  ExternalLink,
  Loader2,
  Sparkles,
  RotateCcw,
  CheckCircle,
  PartyPopper,
  Star,
  Award
} from 'lucide-react';

export const JobApplicationsPage: React.FC = () => {
  const { id: jobId } = useParams<{ id: string }>();
  const { user } = useAuth();

  const [jobInfo, setJobInfo] = useState<{ id: string; title: string; slots: number; status: string } | null>(null);
  const [applications, setApplications] = useState<Application[]>([]);
  const [summary, setSummary] = useState<JobApplicationsSummary | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Status Action Modal State for Candidate
  const [actionTarget, setActionTarget] = useState<{
    app: Application;
    nextStatus: 'ACCEPTED' | 'REJECTED';
  } | null>(null);
  const [rejectReason, setRejectReason] = useState<string>('');
  const [isUpdating, setIsUpdating] = useState<boolean>(false);

  // Job Status Action Modal State
  const [jobStatusModal, setJobStatusModal] = useState<JobStatus | null>(null);
  const [isChangingJobStatus, setIsChangingJobStatus] = useState<boolean>(false);

  // Review Modal State
  const [reviewModalTarget, setReviewModalTarget] = useState<{
    applicationId: string;
    jobTitle: string;
    studentName: string;
  } | null>(null);

  const fetchApplications = async () => {
    if (!jobId) return;
    try {
      setIsLoading(true);
      setErrorMessage(null);
      const params: any = { limit: 50 };
      if (selectedStatus !== 'ALL') {
        params.status = selectedStatus;
      }
      const data = await applicationApi.getJobApplications(jobId, params);
      setJobInfo(data.job);
      setApplications(data.applications);
      setSummary(data.summary);
    } catch (err: any) {
      setErrorMessage(
        err.response?.data?.error?.message ||
          'Không thể tải danh sách ứng viên cho công việc này.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, [jobId, selectedStatus]);

  const handleOpenActionModal = (app: Application, nextStatus: 'ACCEPTED' | 'REJECTED') => {
    setActionTarget({ app, nextStatus });
    setRejectReason('');
  };

  const handleConfirmStatusChange = async () => {
    if (!actionTarget) return;
    try {
      setIsUpdating(true);
      setErrorMessage(null);
      await applicationApi.updateApplicationStatus(
        actionTarget.app.id,
        actionTarget.nextStatus,
        actionTarget.nextStatus === 'REJECTED' ? rejectReason : undefined
      );

      const actionText =
        actionTarget.nextStatus === 'ACCEPTED'
          ? 'Đã duyệt chấp nhận ứng viên thành công!'
          : 'Đã từ chối đơn ứng tuyển.';
      setSuccessMessage(actionText);
      setActionTarget(null);
      setTimeout(() => setSuccessMessage(null), 3500);

      // Refresh list & summary
      await fetchApplications();
    } catch (err: any) {
      setErrorMessage(
        err.response?.data?.error?.message ||
          'Không thể cập nhật trạng thái ứng viên. Vui lòng thử lại.'
      );
    } finally {
      setIsUpdating(false);
    }
  };

  const handleConfirmJobStatusChange = async () => {
    if (!jobId || !jobStatusModal) return;
    try {
      setIsChangingJobStatus(true);
      setErrorMessage(null);
      await jobApi.changeJobStatus(jobId, jobStatusModal);
      const msgMap: Record<string, string> = {
        COMPLETED: 'Đã đánh dấu hoàn thành công việc và mở chức năng đánh giá hai chiều!',
        FILLED: 'Đã đánh dấu công việc đã đủ người.',
        OPEN: 'Đã mở lại đợt tuyển dụng công việc!',
        CLOSED: 'Đã đóng tin tuyển dụng.',
      };
      setSuccessMessage(msgMap[jobStatusModal] || 'Đã cập nhật trạng thái công việc thành công!');
      setJobStatusModal(null);
      setTimeout(() => setSuccessMessage(null), 4000);
      await fetchApplications();
    } catch (err: any) {
      setErrorMessage(
        err.response?.data?.error?.message || 'Không thể cập nhật trạng thái công việc.'
      );
    } finally {
      setIsChangingJobStatus(false);
    }
  };

  const handleReviewSuccess = () => {
    setReviewModalTarget(null);
    setSuccessMessage('Đã gửi đánh giá sinh viên thành công!');
    setTimeout(() => setSuccessMessage(null), 4000);
    fetchApplications();
  };

  const remainingSlots = summary ? Math.max(0, summary.slots - summary.acceptedCount) : 0;

  const tabs = [
    { label: 'Tất cả ứng viên', value: 'ALL', count: summary?.totalApplications },
    { label: 'Chờ duyệt', value: 'PENDING', count: summary?.pendingCount },
    { label: 'Đã nhận việc', value: 'ACCEPTED', count: summary?.acceptedCount },
    { label: 'Đã từ chối', value: 'REJECTED', count: summary?.rejectedCount },
    { label: 'Đã rút đơn', value: 'WITHDRAWN', count: summary?.withdrawnCount },
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Navigation Breadcrumb */}
        <div>
          <Link
            to="/employer/jobs"
            className="inline-flex items-center text-xs font-semibold text-[#0065c9] hover:underline"
          >
            <ChevronLeft className="w-4 h-4 mr-1" />
            <span>Quay lại Quản lý Job của tôi</span>
          </Link>
        </div>

        {/* Header and Summary Box */}
        {summary && jobInfo && (
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-100 pb-6">
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <span className="p-1.5 rounded-lg bg-blue-50 text-[#0065c9]">
                    <Briefcase className="w-5 h-5" />
                  </span>
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Quản lý Ứng viên & Trạng thái Công việc
                  </span>
                  <StatusBadge status={jobInfo.status} />
                </div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
                  {jobInfo.title}
                </h1>
              </div>

              {/* Action Buttons for this Job */}
              <div className="flex items-center flex-wrap gap-2">
                {/* Mark as Completed Button */}
                {(jobInfo.status === 'OPEN' || jobInfo.status === 'FILLED') && (
                  <button
                    onClick={() => setJobStatusModal('COMPLETED')}
                    className="inline-flex items-center px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold transition shadow-sm"
                  >
                    <PartyPopper className="w-4 h-4 mr-1.5" />
                    <span>Đánh dấu Hoàn thành việc (COMPLETED)</span>
                  </button>
                )}

                {/* Mark as Filled if OPEN */}
                {jobInfo.status === 'OPEN' && (
                  <button
                    onClick={() => setJobStatusModal('FILLED')}
                    className="inline-flex items-center px-3 py-2 rounded-xl bg-blue-50 hover:bg-blue-100 text-[#0065c9] text-xs font-bold border border-blue-200 transition"
                  >
                    <CheckCircle className="w-4 h-4 mr-1" />
                    <span>Đã đủ người (FILLED)</span>
                  </button>
                )}

                {/* Reopen if FILLED */}
                {jobInfo.status === 'FILLED' && (
                  <button
                    onClick={() => setJobStatusModal('OPEN')}
                    className="inline-flex items-center px-3 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-bold border border-emerald-200 transition"
                  >
                    <RotateCcw className="w-4 h-4 mr-1" />
                    <span>Mở lại tuyển (OPEN)</span>
                  </button>
                )}

                <Link
                  to={`/jobs/${jobId}`}
                  target="_blank"
                  className="inline-flex items-center px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition"
                >
                  <ExternalLink className="w-4 h-4 mr-1" />
                  <span>Xem tin gốc</span>
                </Link>

                <Link
                  to={`/employer/jobs/${jobId}/edit`}
                  className="inline-flex items-center px-3 py-2 rounded-xl bg-[#0065c9] hover:bg-[#0054a6] text-white text-xs font-bold transition shadow-xs"
                >
                  <span>Chỉnh sửa tin</span>
                </Link>
              </div>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="p-4 rounded-2xl bg-blue-50/60 border border-blue-100">
                <p className="text-xs font-semibold text-blue-600">Chỉ tiêu tuyển (Slots)</p>
                <p className="text-2xl font-black text-[#0065c9] mt-1">{summary.slots}</p>
                <p className="text-[11px] text-slate-500 mt-0.5">Số lượng cần tuyển</p>
              </div>

              <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-100">
                <p className="text-xs font-semibold text-emerald-700">Đã tuyển (Accepted)</p>
                <p className="text-2xl font-black text-emerald-800 mt-1">
                  {summary.acceptedCount}{' '}
                  <span className="text-sm font-semibold text-emerald-600">/ {summary.slots}</span>
                </p>
                <p className="text-[11px] text-emerald-600 mt-0.5">
                  {summary.isFull ? '🔥 Đã đủ chỉ tiêu!' : `Còn trống ${remainingSlots} chỗ`}
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-100">
                <p className="text-xs font-semibold text-amber-700">Đang chờ duyệt</p>
                <p className="text-2xl font-black text-amber-800 mt-1">{summary.pendingCount}</p>
                <p className="text-[11px] text-amber-600 mt-0.5">Cần xem xét và duyệt</p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                <p className="text-xs font-semibold text-slate-600">Tổng hồ sơ nộp</p>
                <p className="text-2xl font-black text-slate-800 mt-1">
                  {summary.totalApplications}
                </p>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  {summary.rejectedCount} từ chối, {summary.withdrawnCount} rút đơn
                </p>
              </div>
            </div>

            {/* Job Completed State Banner */}
            {jobInfo.status === 'COMPLETED' && (
              <div className="p-4 rounded-2xl bg-purple-50 border border-purple-200 flex items-center space-x-3 text-purple-900 text-xs">
                <CheckCircle2 className="w-5 h-5 text-purple-600 shrink-0" />
                <div>
                  <span className="font-bold">Công việc này đã được đánh dấu HOÀN THÀNH (COMPLETED).</span>{' '}
                  Các bạn sinh viên đã nhận việc đều nhận được thông báo hoàn thành công việc. Hai bên hiện đã có thể tiến hành đánh giá lẫn nhau.
                </div>
              </div>
            )}

            {summary.isFull && jobInfo.status !== 'COMPLETED' && (
              <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 flex items-center space-x-3 text-amber-900 text-xs">
                <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />
                <div>
                  <span className="font-bold">Công việc đã đủ chỉ tiêu ({summary.slots}/{summary.slots}).</span>{' '}
                  Tin tuyển dụng đã tự động chuyển sang trạng thái <strong>FILLED</strong>. Để nhận thêm ứng viên, vui lòng tăng số lượng Slots trong mục chỉnh sửa hoặc từ chối bớt ứng viên đã nhận.
                </div>
              </div>
            )}
          </div>
        )}

        {/* Notifications */}
        {successMessage && (
          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm flex items-center space-x-2 animate-in fade-in">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span className="font-semibold">{successMessage}</span>
          </div>
        )}

        {errorMessage && (
          <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-sm flex items-center space-x-2 animate-in fade-in">
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
            <span className="font-semibold">{errorMessage}</span>
          </div>
        )}

        {/* Status Filter Tabs */}
        <div className="flex items-center space-x-2 overflow-x-auto pb-2 border-b border-slate-200">
          {tabs.map((tab) => (
            <button
              key={tab.value}
              onClick={() => setSelectedStatus(tab.value)}
              className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition flex items-center space-x-1.5 ${
                selectedStatus === tab.value
                  ? 'bg-[#0065c9] text-white shadow-sm'
                  : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200'
              }`}
            >
              <span>{tab.label}</span>
              {typeof tab.count === 'number' && (
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                    selectedStatus === tab.value
                      ? 'bg-white/25 text-white'
                      : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Applicants List */}
        {isLoading ? (
          <div className="py-20 flex flex-col items-center justify-center space-y-3 text-slate-500">
            <Loader2 className="w-8 h-8 animate-spin text-[#0065c9]" />
            <p className="text-sm">Đang tải danh sách hồ sơ ứng tuyển...</p>
          </div>
        ) : applications.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center space-y-4 shadow-sm">
            <div className="w-16 h-16 rounded-2xl bg-blue-50 text-[#0065c9] flex items-center justify-center mx-auto">
              <Users className="w-8 h-8" />
            </div>
            <div className="space-y-1">
              <h3 className="text-lg font-bold text-slate-900">Không có ứng viên nào</h3>
              <p className="text-sm text-slate-500 max-w-md mx-auto">
                {selectedStatus === 'ALL'
                  ? 'Chưa có sinh viên nào nộp hồ sơ ứng tuyển cho vị trí này.'
                  : `Không có ứng viên nào ở trạng thái ${selectedStatus}.`}
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {applications.map((app) => {
              const profile = app.student?.studentProfile;
              const studentName = profile?.fullName || app.student?.email || 'Sinh viên';
              const cvUrl = profile?.cvUrl
                ? profile.cvUrl.startsWith('http')
                  ? profile.cvUrl
                  : `http://localhost:5000${profile.cvUrl}`
                : null;

              // Reviews
              const myReview = app.reviews?.find((r) => r.reviewerId === user?.id);
              const studentReview = app.reviews?.find((r) => r.revieweeId === user?.id);

              return (
                <div
                  key={app.id}
                  className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-7 shadow-sm hover:border-[#0065c9]/40 transition space-y-5"
                >
                  {/* Card Header */}
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                    <div className="flex items-start space-x-4">
                      {/* Avatar */}
                      <Link
                        to={`/users/${app.studentId}`}
                        className="w-12 h-12 rounded-2xl bg-blue-50 text-[#0065c9] border border-blue-100 flex items-center justify-center font-black text-lg shrink-0 hover:bg-blue-100 transition"
                      >
                        {studentName.charAt(0).toUpperCase()}
                      </Link>

                      <div className="space-y-1">
                        <div className="flex items-center space-x-3 flex-wrap gap-y-1">
                          <Link
                            to={`/users/${app.studentId}`}
                            className="text-lg font-bold text-slate-900 hover:text-[#0065c9] transition"
                          >
                            {studentName}
                          </Link>
                          <StatusBadge status={app.status} />
                        </div>

                        <div className="flex items-center space-x-4 text-xs text-slate-500 flex-wrap gap-y-1">
                          <div className="flex items-center space-x-1">
                            <Mail className="w-3.5 h-3.5 text-slate-400" />
                            <span>{app.student?.email}</span>
                          </div>
                          {profile?.phone && (
                            <div className="flex items-center space-x-1">
                              <Phone className="w-3.5 h-3.5 text-slate-400" />
                              <span>{profile.phone}</span>
                            </div>
                          )}
                          <div className="flex items-center space-x-1">
                            <Clock className="w-3.5 h-3.5 text-slate-400" />
                            <span>
                              Nộp ngày: {new Date(app.createdAt).toLocaleDateString('vi-VN')}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Quick Action Buttons for Employer */}
                    <div className="flex items-center space-x-2 shrink-0 self-start sm:self-auto">
                      {app.status === 'PENDING' && (
                        <>
                          <button
                            disabled={summary?.isFull}
                            onClick={() => handleOpenActionModal(app, 'ACCEPTED')}
                            className="inline-flex items-center px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition shadow-xs disabled:opacity-40 disabled:cursor-not-allowed"
                            title={summary?.isFull ? 'Đã đủ số lượng slot' : 'Chấp nhận ứng viên'}
                          >
                            <CheckCircle2 className="w-4 h-4 mr-1.5" />
                            <span>Duyệt nhận (Accept)</span>
                          </button>
                          <button
                            onClick={() => handleOpenActionModal(app, 'REJECTED')}
                            className="inline-flex items-center px-4 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold border border-rose-200 transition"
                          >
                            <XCircle className="w-4 h-4 mr-1.5" />
                            <span>Từ chối</span>
                          </button>
                        </>
                      )}

                      {app.status === 'ACCEPTED' && jobInfo?.status !== 'COMPLETED' && (
                        <button
                          onClick={() => handleOpenActionModal(app, 'REJECTED')}
                          className="inline-flex items-center px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-rose-50 hover:text-rose-600 text-slate-600 text-xs font-semibold transition"
                          title="Hủy chấp nhận và đánh dấu từ chối"
                        >
                          <XCircle className="w-3.5 h-3.5 mr-1" />
                          <span>Hủy nhận</span>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Two-way Review Section when Job is Completed and App is Accepted */}
                  {app.status === 'ACCEPTED' && jobInfo?.status === 'COMPLETED' && (
                    <div className="p-4 rounded-2xl bg-gradient-to-r from-purple-50/90 to-amber-50/70 border border-purple-200 text-purple-900 text-xs space-y-3">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-purple-100 pb-2.5">
                        <div className="flex items-center space-x-2">
                          <Award className="w-4 h-4 text-purple-600 shrink-0" />
                          <span className="font-bold text-purple-950">
                            Công việc hoàn thành: Đánh giá hai chiều cho ứng viên này
                          </span>
                        </div>

                        {!myReview && (
                          <button
                            onClick={() =>
                              setReviewModalTarget({
                                applicationId: app.id,
                                jobTitle: jobInfo.title,
                                studentName,
                              })
                            }
                            className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs shadow-sm transition inline-flex items-center space-x-1.5 self-start sm:self-auto"
                          >
                            <Star className="w-3.5 h-3.5 fill-white" />
                            <span>Đánh giá Sinh viên ngay</span>
                          </button>
                        )}
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {/* Employer's Review of Student */}
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

                        {/* Student's Review of Employer */}
                        <div className="p-3 rounded-xl bg-white border border-purple-100/80 shadow-2xs space-y-1.5">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-slate-700">Đánh giá từ Sinh viên:</span>
                            {studentReview ? (
                              <RatingStars value={studentReview.rating} size="sm" showScore={true} />
                            ) : (
                              <span className="text-[11px] text-slate-400">
                                Sinh viên chưa gửi đánh giá
                              </span>
                            )}
                          </div>
                          {studentReview?.comment && (
                            <p className="text-slate-600 italic text-[11px]">
                              &ldquo;{studentReview.comment}&rdquo;
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Student Educational & Professional Info */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 rounded-2xl bg-slate-50 border border-slate-100 text-xs text-slate-700">
                    <div>
                      <span className="text-slate-400 block mb-0.5">Trường / Ngành học:</span>
                      <p className="font-semibold text-slate-900 flex items-center space-x-1.5">
                        <GraduationCap className="w-4 h-4 text-[#0065c9] shrink-0" />
                        <span>
                          {profile?.university || 'Chưa cập nhật'}
                          {profile?.major ? ` • ${profile.major}` : ''}
                        </span>
                      </p>
                    </div>

                    <div>
                      <span className="text-slate-400 block mb-0.5">Năm tốt nghiệp dự kiến:</span>
                      <p className="font-semibold text-slate-900 flex items-center space-x-1.5">
                        <Calendar className="w-4 h-4 text-slate-400 shrink-0" />
                        <span>{profile?.graduationYear || 'Chưa cập nhật'}</span>
                      </p>
                    </div>

                    <div>
                      <span className="text-slate-400 block mb-0.5">Hồ sơ đính kèm (CV):</span>
                      {cvUrl ? (
                        <a
                          href={cvUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center font-bold text-[#0065c9] hover:underline"
                        >
                          <FileText className="w-4 h-4 mr-1 text-[#0065c9]" />
                          <span>Mở xem CV (PDF)</span>
                          <ExternalLink className="w-3 h-3 ml-1" />
                        </a>
                      ) : (
                        <span className="text-slate-400 italic">Chưa đính kèm file CV</span>
                      )}
                    </div>
                  </div>

                  {/* Skills tags if any */}
                  {profile?.skills && profile.skills.length > 0 && (
                    <div className="space-y-1.5">
                      <div className="flex items-center space-x-1 text-xs font-semibold text-slate-500">
                        <Sparkles className="w-3.5 h-3.5 text-[#0065c9]" />
                        <span>Kỹ năng của ứng viên:</span>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {profile.skills.map((skill, idx) => (
                          <span
                            key={idx}
                            className="px-2.5 py-1 rounded-lg bg-blue-50 text-[#0065c9] text-xs font-semibold border border-blue-100"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Cover Letter */}
                  {app.coverLetter && (
                    <div className="space-y-1.5">
                      <span className="text-xs font-bold text-slate-700">Thư giới thiệu:</span>
                      <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 leading-relaxed whitespace-pre-wrap">
                        {app.coverLetter}
                      </div>
                    </div>
                  )}

                  {/* Rejection Note if REJECTED */}
                  {app.status === 'REJECTED' && app.rejectReason && (
                    <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 space-y-1">
                      <span className="font-bold">Lý do từ chối:</span>
                      <p>{app.rejectReason}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* Candidate Action Confirmation Modal */}
      {actionTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl border border-slate-200 max-w-md w-full p-6 space-y-5 shadow-2xl">
            <div className="space-y-2">
              <h3 className="text-lg font-bold text-slate-900">
                {actionTarget.nextStatus === 'ACCEPTED'
                  ? 'Xác nhận chấp nhận ứng viên'
                  : 'Xác nhận từ chối đơn ứng tuyển'}
              </h3>
              <p className="text-xs text-slate-600">
                Ứng viên: <strong>{actionTarget.app.student?.studentProfile?.fullName || actionTarget.app.student?.email}</strong>
              </p>
            </div>

            {actionTarget.nextStatus === 'ACCEPTED' ? (
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs leading-relaxed">
                Ứng viên sẽ được đưa vào danh sách <strong>Đã nhận việc (ACCEPTED)</strong>. Số lượng slot đã nhận sẽ tự động tăng thêm 1. Khi đủ số lượng slots, tin tuyển dụng sẽ tự động chuyển sang trạng thái <strong>FILLED</strong>.
              </div>
            ) : (
              <div className="space-y-3">
                <label className="block text-xs font-bold text-slate-700">
                  Lý do từ chối (tùy chọn):
                </label>
                <textarea
                  rows={3}
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  placeholder="Ví dụ: Đã đủ số lượng hồ sơ phù hợp hơn, chưa đáp ứng lịch làm việc..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs focus:outline-none focus:ring-2 focus:ring-[#0065c9] focus:border-transparent"
                />
                <p className="text-[11px] text-slate-500">
                  Lý do này sẽ được gửi thông báo đến sinh viên.
                </p>
              </div>
            )}

            <div className="flex items-center justify-end space-x-3 pt-2">
              <button
                disabled={isUpdating}
                onClick={() => setActionTarget(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition disabled:opacity-50"
              >
                Hủy bỏ
              </button>
              <button
                disabled={isUpdating}
                onClick={handleConfirmStatusChange}
                className={`px-5 py-2 rounded-xl text-white text-xs font-bold transition shadow-sm flex items-center space-x-1.5 ${
                  actionTarget.nextStatus === 'ACCEPTED'
                    ? 'bg-emerald-600 hover:bg-emerald-700'
                    : 'bg-rose-600 hover:bg-rose-700'
                }`}
              >
                {isUpdating && <Loader2 className="w-3.5 h-3.5 animate-spin mr-1" />}
                <span>
                  {actionTarget.nextStatus === 'ACCEPTED' ? 'Chấp nhận ngay' : 'Xác nhận từ chối'}
                </span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Job Status Transition Confirmation Modal */}
      {jobStatusModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl border border-slate-200 max-w-md w-full p-6 space-y-5 shadow-2xl">
            <div className="space-y-2">
              <h3 className="text-lg font-bold text-slate-900">
                {jobStatusModal === 'COMPLETED'
                  ? 'Xác nhận hoàn thành công việc'
                  : `Chuyển trạng thái sang ${jobStatusModal}`}
              </h3>
              <p className="text-xs text-slate-600">
                Công việc: <strong>{jobInfo?.title}</strong>
              </p>
            </div>

            {jobStatusModal === 'COMPLETED' ? (
              <div className="p-4 rounded-2xl bg-purple-50 border border-purple-200 text-purple-900 text-xs leading-relaxed space-y-2">
                <p className="font-semibold">
                  🎉 Bạn đang đánh dấu công việc này là <strong>HOÀN THÀNH (COMPLETED)</strong>.
                </p>
                <p>
                  - Toàn bộ các bạn sinh viên đã nhận việc ({summary?.acceptedCount} người) sẽ nhận được thông báo hoàn thành công việc.
                  <br />- Cả hai bên sẽ được mở quyền đánh giá review lẫn nhau.
                </p>
              </div>
            ) : (
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 text-xs">
                Bạn có chắc chắn muốn chuyển trạng thái công việc này sang <strong>{jobStatusModal}</strong>?
              </div>
            )}

            <div className="flex items-center justify-end space-x-3 pt-2">
              <button
                disabled={isChangingJobStatus}
                onClick={() => setJobStatusModal(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition disabled:opacity-50"
              >
                Hủy bỏ
              </button>
              <button
                disabled={isChangingJobStatus}
                onClick={handleConfirmJobStatusChange}
                className={`px-5 py-2 rounded-xl text-white text-xs font-bold transition shadow-sm flex items-center space-x-1.5 ${
                  jobStatusModal === 'COMPLETED'
                    ? 'bg-purple-600 hover:bg-purple-700'
                    : 'bg-[#0065c9] hover:bg-[#0054a6]'
                }`}
              >
                {isChangingJobStatus && <Loader2 className="w-3.5 h-3.5 animate-spin mr-1" />}
                <span>Xác nhận</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Review Modal for Employer reviewing candidate */}
      {reviewModalTarget && (
        <ReviewModal
          applicationId={reviewModalTarget.applicationId}
          jobTitle={reviewModalTarget.jobTitle}
          revieweeName={reviewModalTarget.studentName}
          revieweeRole="STUDENT"
          onClose={() => setReviewModalTarget(null)}
          onSuccess={handleReviewSuccess}
        />
      )}
    </div>
  );
};
