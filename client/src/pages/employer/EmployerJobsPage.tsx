import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { jobApi } from '../../api/jobs';
import { Job, JobStatus } from '../../types/job';
import { Navbar } from '../../components/layout/Navbar';
import { StatusBadge } from '../../components/common/StatusBadge';
import { 
  Briefcase, 
  PlusCircle, 
  Edit3, 
  Trash2, 
  MapPin, 
  DollarSign, 
  Calendar, 
  Users, 
  Loader2, 
  AlertCircle, 
  CheckCircle2, 
  CheckCircle,
  XCircle,
  RotateCcw
} from 'lucide-react';

export const EmployerJobsPage: React.FC = () => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);

  const fetchJobs = async () => {
    try {
      setIsLoading(true);
      setErrorMessage(null);
      const params: any = { page, limit: 10 };
      if (selectedStatus !== 'ALL') {
        params.status = selectedStatus as JobStatus;
      }
      const data = await jobApi.getEmployerJobs(params);
      setJobs(data.jobs);
      setTotalPages(data.pagination.totalPages || 1);
    } catch (err: any) {
      setErrorMessage(err.response?.data?.error?.message || 'Không thể tải danh sách công việc.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, [selectedStatus, page]);

  const handleQuickStatusChange = async (jobId: string, nextStatus: JobStatus) => {
    try {
      setErrorMessage(null);
      await jobApi.changeJobStatus(jobId, nextStatus);
      setSuccessMessage(`Đã chuyển trạng thái công việc sang ${nextStatus} thành công!`);
      setTimeout(() => setSuccessMessage(null), 3500);
      fetchJobs();
    } catch (err: any) {
      setErrorMessage(err.response?.data?.error?.message || 'Không thể chuyển đổi trạng thái.');
    }
  };

  const handleDeleteJob = async (jobId: string, title: string) => {
    if (!window.confirm(`Bạn có chắc chắn muốn xóa công việc "${title}"?`)) {
      return;
    }
    try {
      setErrorMessage(null);
      await jobApi.deleteJob(jobId);
      setSuccessMessage('Đã xóa tin tuyển dụng thành công!');
      setTimeout(() => setSuccessMessage(null), 3500);
      fetchJobs();
    } catch (err: any) {
      setErrorMessage(err.response?.data?.error?.message || 'Xóa tin tuyển dụng thất bại.');
    }
  };

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

  const tabs = [
    { label: 'Tất cả tin', value: 'ALL' },
    { label: 'Đang tuyển (OPEN)', value: 'OPEN' },
    { label: 'Đã đủ người (FILLED)', value: 'FILLED' },
    { label: 'Hoàn thành (COMPLETED)', value: 'COMPLETED' },
    { label: 'Đã đóng (CLOSED)', value: 'CLOSED' },
    { label: 'Bản nháp (DRAFT)', value: 'DRAFT' },
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
                <Briefcase className="w-6 h-6" />
              </span>
              <span>Quản lý Tin Tuyển dụng ("Job của tôi")</span>
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Theo dõi vòng đời công việc, số lượng slot đã nhận và quản lý trạng thái tuyển dụng.
            </p>
          </div>

          <div>
            <Link
              to="/employer/jobs/create"
              className="inline-flex items-center px-5 py-2.5 rounded-xl bg-[#0065c9] hover:bg-[#0054a6] text-white text-sm font-bold transition shadow-md shadow-blue-500/20 active:scale-95"
            >
              <PlusCircle className="w-4 h-4 mr-2" />
              <span>Đăng việc mới</span>
            </Link>
          </div>
        </div>

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

        {/* Filter Tabs */}
        <div className="flex items-center space-x-2 overflow-x-auto pb-2 border-b border-slate-200">
          {tabs.map((tab) => (
            <button
              key={tab.value}
              onClick={() => {
                setSelectedStatus(tab.value);
                setPage(1);
              }}
              className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition ${
                selectedStatus === tab.value
                  ? 'bg-[#0065c9] text-white shadow-sm'
                  : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content Area */}
        {isLoading ? (
          <div className="py-20 flex flex-col items-center justify-center space-y-3 text-slate-500">
            <Loader2 className="w-8 h-8 animate-spin text-[#0065c9]" />
            <p className="text-sm">Đang tải danh sách công việc...</p>
          </div>
        ) : jobs.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center space-y-4 shadow-sm">
            <div className="w-16 h-16 rounded-2xl bg-blue-50 text-[#0065c9] flex items-center justify-center mx-auto">
              <Briefcase className="w-8 h-8" />
            </div>
            <div className="space-y-1">
              <h3 className="text-lg font-bold text-slate-900">Chưa có tin tuyển dụng nào</h3>
              <p className="text-sm text-slate-500 max-w-md mx-auto">
                {selectedStatus === 'ALL'
                  ? 'Bạn chưa đăng tin việc làm nào. Hãy tạo tin đăng đầu tiên để kết nối với các ứng viên sinh viên.'
                  : `Không có công việc nào ở trạng thái ${selectedStatus}.`}
              </p>
            </div>
            <Link
              to="/employer/jobs/create"
              className="inline-flex items-center px-5 py-2.5 rounded-xl bg-[#0065c9] hover:bg-[#0054a6] text-white text-sm font-bold transition shadow-sm"
            >
              <PlusCircle className="w-4 h-4 mr-2" />
              <span>Đăng việc làm ngay</span>
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {jobs.map((job) => (
              <div
                key={job.id}
                className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:border-[#0065c9]/40 transition space-y-4"
              >
                {/* Header Row */}
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div className="space-y-1 flex-1">
                    <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                      <StatusBadge status={job.status} />
                      {job.category && (
                        <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">
                          {job.category.name}
                        </span>
                      )}
                    </div>
                    <h2 className="text-lg font-bold text-slate-900 leading-snug">
                      {job.title}
                    </h2>
                  </div>

                  {/* Actions for this job */}
                  <div className="flex items-center space-x-2 shrink-0">
                    <Link
                      to={`/employer/jobs/${job.id}/applications`}
                      className="inline-flex items-center px-3 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-[#0065c9] text-xs font-bold border border-blue-200 transition"
                      title="Xem danh sách ứng viên"
                    >
                      <Users className="w-3.5 h-3.5 mr-1.5" />
                      <span>Xem ứng viên {job._count?.applications ? `(${job._count.applications})` : ''}</span>
                    </Link>
                    <Link
                      to={`/employer/jobs/${job.id}/edit`}
                      className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition"
                      title="Chỉnh sửa tin"
                    >
                      <Edit3 className="w-4 h-4" />
                    </Link>
                    <button
                      onClick={() => handleDeleteJob(job.id, job.title)}
                      className="p-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-100 transition"
                      title="Xóa tin"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Details Meta */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs text-slate-600 pt-2 border-t border-slate-100">
                  <div className="flex items-center space-x-1.5">
                    <DollarSign className="w-4 h-4 text-[#0065c9]" />
                    <span className="font-semibold text-slate-900">
                      {formatSalary(job.salaryMin, job.salaryMax, job.salaryUnit)}
                    </span>
                  </div>

                  <div className="flex items-center space-x-1.5">
                    <Users className="w-4 h-4 text-[#0065c9]" />
                    <span>
                      Đã nhận: <strong className="text-slate-900">{job.acceptedCount || 0}</strong> / {job.slots} slot
                    </span>
                  </div>

                  <div className="flex items-center space-x-1.5">
                    <MapPin className="w-4 h-4 text-slate-400" />
                    <span className="truncate">{job.city}</span>
                  </div>

                  <div className="flex items-center space-x-1.5">
                    <Calendar className="w-4 h-4 text-slate-400" />
                    <span>Hạn: {new Date(job.deadline).toLocaleDateString('vi-VN')}</span>
                  </div>
                </div>

                {/* Description snippet */}
                <p className="text-xs text-slate-500 line-clamp-2">
                  {job.description}
                </p>

                {/* State Machine Transition Actions */}
                <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
                  <div className="text-xs text-slate-400">
                    Đăng ngày: {new Date(job.createdAt).toLocaleDateString('vi-VN')}
                  </div>

                  <div className="flex items-center space-x-2">
                    {/* If OPEN -> allow FILLED, COMPLETED, or CLOSED */}
                    {job.status === 'OPEN' && (
                      <>
                        <button
                          onClick={() => handleQuickStatusChange(job.id, 'COMPLETED')}
                          className="px-3 py-1.5 rounded-lg bg-purple-50 hover:bg-purple-100 text-purple-700 text-xs font-bold border border-purple-200 transition"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5 inline mr-1" />
                          Hoàn thành việc (COMPLETED)
                        </button>
                        <button
                          onClick={() => handleQuickStatusChange(job.id, 'FILLED')}
                          className="px-3 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-[#0065c9] text-xs font-bold border border-blue-200 transition"
                        >
                          <CheckCircle className="w-3.5 h-3.5 inline mr-1" />
                          Đã đủ người (FILLED)
                        </button>
                        <button
                          onClick={() => handleQuickStatusChange(job.id, 'CLOSED')}
                          className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition"
                        >
                          <XCircle className="w-3.5 h-3.5 inline mr-1" />
                          Đóng tin (CLOSED)
                        </button>
                      </>
                    )}

                    {/* If FILLED -> allow OPEN, COMPLETED, CLOSED */}
                    {job.status === 'FILLED' && (
                      <>
                        <button
                          onClick={() => handleQuickStatusChange(job.id, 'COMPLETED')}
                          className="px-3 py-1.5 rounded-lg bg-purple-50 hover:bg-purple-100 text-purple-700 text-xs font-bold border border-purple-200 transition"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5 inline mr-1" />
                          Hoàn thành việc (COMPLETED)
                        </button>
                        <button
                          onClick={() => handleQuickStatusChange(job.id, 'OPEN')}
                          className="px-3 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-bold border border-emerald-200 transition"
                        >
                          <RotateCcw className="w-3.5 h-3.5 inline mr-1" />
                          Mở lại tuyển (OPEN)
                        </button>
                        <button
                          onClick={() => handleQuickStatusChange(job.id, 'CLOSED')}
                          className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition"
                        >
                          Đóng tin
                        </button>
                      </>
                    )}

                    {/* If COMPLETED -> Terminal state info */}
                    {job.status === 'COMPLETED' && (
                      <span className="text-xs font-semibold text-purple-700 bg-purple-50 px-3 py-1.5 rounded-lg border border-purple-200 inline-flex items-center">
                        <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                        Đã hoàn thành {job.completedAt ? `(${new Date(job.completedAt).toLocaleDateString('vi-VN')})` : ''}
                      </span>
                    )}

                    {/* If DRAFT -> allow OPEN or CLOSED */}
                    {job.status === 'DRAFT' && (
                      <button
                        onClick={() => handleQuickStatusChange(job.id, 'OPEN')}
                        className="px-3 py-1.5 rounded-lg bg-[#0065c9] hover:bg-[#0054a6] text-white text-xs font-bold transition shadow-xs"
                      >
                        Công khai tuyển (OPEN)
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center space-x-2 pt-4">
                <button
                  disabled={page <= 1}
                  onClick={() => setPage(page - 1)}
                  className="px-4 py-2 rounded-xl bg-white border border-slate-200 text-xs font-bold disabled:opacity-40"
                >
                  Trang trước
                </button>
                <span className="text-xs font-semibold text-slate-600">
                  Trang {page} / {totalPages}
                </span>
                <button
                  disabled={page >= totalPages}
                  onClick={() => setPage(page + 1)}
                  className="px-4 py-2 rounded-xl bg-white border border-slate-200 text-xs font-bold disabled:opacity-40"
                >
                  Trang sau
                </button>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
};
