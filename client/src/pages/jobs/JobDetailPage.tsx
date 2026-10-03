import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { jobApi } from '../../api/jobs';
import { Job } from '../../types/job';
import { useAuth } from '../../context/AuthContext';
import { Navbar } from '../../components/layout/Navbar';
import { StatusBadge } from '../../components/common/StatusBadge';
import { ApplyJobModal } from '../../components/applications/ApplyJobModal';
import { 
  Briefcase, 
  Building, 
  MapPin, 
  Clock, 
  Calendar, 
  Users, 
  ShieldCheck, 
  ArrowLeft, 
  Loader2, 
  AlertCircle, 
  Send, 
  Globe, 
  Phone
} from 'lucide-react';

export const JobDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();

  const [job, setJob] = useState<Job | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);

  useEffect(() => {
    const fetchJob = async () => {
      if (!id) return;
      try {
        setIsLoading(true);
        const data = await jobApi.getJobById(id);
        setJob(data);
      } catch (err: any) {
        setErrorMessage(err.response?.data?.error?.message || 'Không thể tải thông tin công việc.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchJob();
  }, [id]);

  const formatSalary = (min: number, max?: number | null, unit?: string) => {
    const unitMap: Record<string, string> = {
      HOUR: '/giờ',
      DAY: '/ngày',
      MONTH: '/tháng',
      JOB: '/việc',
    };
    const unitLabel = unit ? unitMap[unit] || '' : '';
    if (max && max > min) {
      return `${min.toLocaleString('vi-VN')} - ${max.toLocaleString('vi-VN')}đ ${unitLabel}`;
    }
    return `${min.toLocaleString('vi-VN')}đ ${unitLabel}`;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
        <Navbar />
        <div className="flex-1 flex items-center justify-center space-x-2 text-slate-500">
          <Loader2 className="w-6 h-6 animate-spin text-[#0065c9]" />
          <span>Đang tải thông tin chi tiết việc làm...</span>
        </div>
      </div>
    );
  }

  if (errorMessage || !job) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
        <Navbar />
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl p-8 max-w-md w-full text-center space-y-4 shadow-sm">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
              <AlertCircle className="w-6 h-6" />
            </div>
            <h2 className="text-lg font-bold text-slate-900">Không tìm thấy công việc</h2>
            <p className="text-xs text-slate-500">{errorMessage || 'Công việc này có thể đã bị xóa hoặc không còn tồn tại.'}</p>
            <Link
              to="/jobs"
              className="inline-flex items-center px-4 py-2 rounded-xl bg-[#0065c9] text-white text-xs font-bold transition shadow-sm"
            >
              <ArrowLeft className="w-4 h-4 mr-1.5" />
              <span>Quay lại danh sách việc làm</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const employer = job.employer;
  const employerProfile = employer?.employerProfile;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      <Navbar />

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between">
          <Link
            to="/jobs"
            className="inline-flex items-center text-xs font-bold text-slate-500 hover:text-[#0065c9] transition"
          >
            <ArrowLeft className="w-4 h-4 mr-1.5" />
            <span>Quay lại danh sách việc làm</span>
          </Link>
        </div>

        {/* Job Header Card */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div className="space-y-2 flex-1">
              <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                <StatusBadge status={job.status} />
                {job.category && (
                  <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-blue-50 text-[#0065c9] border border-blue-100">
                    {job.category.name}
                  </span>
                )}
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 leading-tight">
                {job.title}
              </h1>
              <div className="flex items-center space-x-2 text-sm text-slate-600">
                <Building className="w-4 h-4 text-slate-400 shrink-0" />
                <span className="font-bold text-slate-800">{employerProfile?.companyName || 'Nhà tuyển dụng'}</span>
                {employerProfile?.isVerified && (
                  <span className="inline-flex items-center text-xs text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                    <ShieldCheck className="w-3.5 h-3.5 mr-1" />
                    Đã xác thực
                  </span>
                )}
              </div>
            </div>

            {/* Quick Apply CTA */}
            <div className="sm:text-right shrink-0">
              <div className="text-xl font-extrabold text-[#0065c9] mb-2">
                {formatSalary(job.salaryMin, job.salaryMax, job.salaryUnit)}
              </div>

              {job.status === 'OPEN' ? (
                isAuthenticated && user?.role === 'STUDENT' ? (
                  <button
                    onClick={() => setIsApplyModalOpen(true)}
                    className="px-6 py-3 rounded-xl bg-[#0065c9] hover:bg-[#0054a6] text-white font-bold text-sm transition shadow-md shadow-blue-500/25 inline-flex items-center space-x-2 active:scale-95 cursor-pointer"
                  >
                    <Send className="w-4 h-4" />
                    <span>Ứng tuyển ngay</span>
                  </button>
                ) : !isAuthenticated ? (
                  <button
                    onClick={() => navigate('/login')}
                    className="px-6 py-3 rounded-xl bg-[#0065c9] hover:bg-[#0054a6] text-white font-bold text-sm transition shadow-md shadow-blue-500/25 inline-flex items-center space-x-2 active:scale-95 cursor-pointer"
                  >
                    <Send className="w-4 h-4" />
                    <span>Đăng nhập để ứng tuyển</span>
                  </button>
                ) : (
                  <span className="text-xs text-slate-500 bg-slate-100 px-3 py-2 rounded-xl block font-medium">
                    Tài khoản NTD không ứng tuyển được
                  </span>
                )
              ) : job.status === 'COMPLETED' ? (
                <span className="px-4 py-2 rounded-xl bg-purple-50 text-purple-700 border border-purple-200 text-xs font-bold block">
                  Công việc đã hoàn thành
                </span>
              ) : job.status === 'FILLED' ? (
                <span className="px-4 py-2 rounded-xl bg-blue-50 text-[#0065c9] border border-blue-200 text-xs font-bold block">
                  Đã đủ người ứng tuyển
                </span>
              ) : (
                <span className="px-4 py-2 rounded-xl bg-slate-100 text-slate-500 text-xs font-bold block">
                  Công việc này hiện đã đóng
                </span>
              )}
            </div>
          </div>

          {/* Quick Info Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-xl bg-slate-50 border border-slate-100 text-xs">
            <div className="space-y-1">
              <span className="text-slate-400 font-bold uppercase tracking-wider block">Thời gian làm việc</span>
              <div className="flex items-center space-x-1 font-semibold text-slate-800">
                <Clock className="w-3.5 h-3.5 text-[#0065c9] shrink-0" />
                <span>{job.workTime}</span>
              </div>
            </div>

            <div className="space-y-1">
              <span className="text-slate-400 font-bold uppercase tracking-wider block">Số lượng cần tuyển</span>
              <div className="flex items-center space-x-1 font-semibold text-slate-800">
                <Users className="w-3.5 h-3.5 text-[#0065c9] shrink-0" />
                <span>{job.slots} người</span>
              </div>
            </div>

            <div className="space-y-1">
              <span className="text-slate-400 font-bold uppercase tracking-wider block">Địa điểm</span>
              <div className="flex items-center space-x-1 font-semibold text-slate-800 truncate">
                <MapPin className="w-3.5 h-3.5 text-[#0065c9] shrink-0" />
                <span className="truncate">{job.city}</span>
              </div>
            </div>

            <div className="space-y-1">
              <span className="text-slate-400 font-bold uppercase tracking-wider block">Hạn nộp hồ sơ</span>
              <div className="flex items-center space-x-1 font-semibold text-slate-800">
                <Calendar className="w-3.5 h-3.5 text-[#0065c9] shrink-0" />
                <span>{new Date(job.deadline).toLocaleDateString('vi-VN')}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Content Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Description */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-4">
              <h2 className="text-lg font-bold text-slate-900 pb-3 border-b border-slate-100 flex items-center space-x-2">
                <Briefcase className="w-5 h-5 text-[#0065c9]" />
                <span>Mô tả chi tiết công việc</span>
              </h2>

              <div className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">
                {job.description}
              </div>

              <div className="pt-4 border-t border-slate-100 space-y-2">
                <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Địa chỉ nơi làm việc:</h3>
                <p className="text-sm text-slate-600 flex items-center space-x-1.5">
                  <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
                  <span>{job.location}, {job.city}</span>
                </p>
              </div>
            </div>
          </div>

          {/* Right Column: Company Profile Card */}
          <div className="space-y-6">
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
              <h2 className="text-base font-bold text-slate-900 pb-3 border-b border-slate-100 flex items-center space-x-2">
                <Building className="w-5 h-5 text-[#0065c9]" />
                <span>Thông tin nhà tuyển dụng</span>
              </h2>

              <div className="space-y-3 text-xs">
                <div>
                  <Link
                    to={`/users/${job.employerId || job.employer?.id}`}
                    className="font-bold text-sm text-slate-900 hover:text-[#0065c9] transition block"
                  >
                    {employerProfile?.companyName || 'Nhà tuyển dụng cá nhân'}
                  </Link>
                  <p className="text-slate-500 mt-1 text-xs line-clamp-3 leading-relaxed">
                    {employerProfile?.description || 'Chưa cập nhật mô tả giới thiệu doanh nghiệp.'}
                  </p>
                </div>

                {employerProfile?.address && (
                  <div className="flex items-start space-x-2 text-slate-600 pt-2 border-t border-slate-100">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 mt-0.5 shrink-0" />
                    <span>{employerProfile.address}</span>
                  </div>
                )}

                {employerProfile?.phone && (
                  <div className="flex items-center space-x-2 text-slate-600">
                    <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>{employerProfile.phone}</span>
                  </div>
                )}

                {employerProfile?.website && (
                  <div className="flex items-center space-x-2 text-[#0065c9]">
                    <Globe className="w-3.5 h-3.5 shrink-0" />
                    <a href={employerProfile.website} target="_blank" rel="noreferrer" className="hover:underline truncate">
                      {employerProfile.website}
                    </a>
                  </div>
                )}

                <div className="pt-3 border-t border-slate-100">
                  <Link
                    to={`/users/${job.employerId || job.employer?.id}`}
                    className="w-full py-2 px-3 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold text-xs flex items-center justify-center space-x-1.5 transition border border-slate-200"
                  >
                    <span>Xem uy tín & Đánh giá của NTD</span>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Apply Modal */}
      {job && (
        <ApplyJobModal
          job={job}
          isOpen={isApplyModalOpen}
          onClose={() => setIsApplyModalOpen(false)}
          onSuccess={() => {
            setIsApplyModalOpen(false);
            navigate('/student/applications');
          }}
        />
      )}
    </div>
  );
};
