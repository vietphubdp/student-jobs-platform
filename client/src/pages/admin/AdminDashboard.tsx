import React, { useState, useEffect } from 'react';
import { adminApi } from '../../api/admin';
import { AdminStats, AdminUser, AdminJob, AdminReview } from '../../types/admin';
import { useAuth } from '../../context/AuthContext';
import { Navbar } from '../../components/layout/Navbar';
import { StatusBadge } from '../../components/common/StatusBadge';
import { RatingStars } from '../../components/common/RatingStars';
import {
  ShieldCheck,
  BarChart3,
  Users,
  Briefcase,
  Star,
  Search,
  Eye,
  EyeOff,
  Ban,
  CheckCircle,
  AlertCircle,
  Loader2,
  ChevronLeft,
  ChevronRight,
  UserX,
  UserCheck,
  TrendingUp,
  FileCheck2,
  ExternalLink,
  RotateCcw
} from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const { user: currentAdmin } = useAuth();

  const [activeTab, setActiveTab] = useState<'STATS' | 'USERS' | 'JOBS' | 'REVIEWS'>('STATS');

  // Stats state
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [isStatsLoading, setIsStatsLoading] = useState<boolean>(false);

  // Users state
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [userRoleFilter, setUserRoleFilter] = useState<string>('');
  const [userStatusFilter, setUserStatusFilter] = useState<string>('');
  const [userSearch, setUserSearch] = useState<string>('');
  const [userPage, setUserPage] = useState<number>(1);
  const [userTotalPages, setUserTotalPages] = useState<number>(1);
  const [isUsersLoading, setIsUsersLoading] = useState<boolean>(false);

  // Jobs state
  const [jobs, setJobs] = useState<AdminJob[]>([]);
  const [jobStatusFilter, setJobStatusFilter] = useState<string>('');
  const [jobHiddenFilter, setJobHiddenFilter] = useState<string>('');
  const [jobSearch, setJobSearch] = useState<string>('');
  const [jobPage, setJobPage] = useState<number>(1);
  const [jobTotalPages, setJobTotalPages] = useState<number>(1);
  const [isJobsLoading, setIsJobsLoading] = useState<boolean>(false);

  // Reviews state
  const [reviews, setReviews] = useState<AdminReview[]>([]);
  const [reviewHiddenFilter, setReviewHiddenFilter] = useState<string>('');
  const [reviewRatingFilter, setReviewRatingFilter] = useState<string>('');
  const [reviewPage, setReviewPage] = useState<number>(1);
  const [reviewTotalPages, setReviewTotalPages] = useState<number>(1);
  const [isReviewsLoading, setIsReviewsLoading] = useState<boolean>(false);

  // Feedback notifications
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Modals / Action Confirmation States
  const [userActionTarget, setUserActionTarget] = useState<{
    user: AdminUser;
    nextStatus: 'ACTIVE' | 'BANNED';
  } | null>(null);
  const [isProcessingAction, setIsProcessingAction] = useState<boolean>(false);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Fetch Stats
  const fetchStats = async () => {
    try {
      setIsStatsLoading(true);
      const data = await adminApi.getStats();
      setStats(data);
    } catch (err: any) {
      console.error('Failed to fetch stats:', err);
    } finally {
      setIsStatsLoading(false);
    }
  };

  // Fetch Users
  const fetchUsers = async () => {
    try {
      setIsUsersLoading(true);
      const res = await adminApi.getUsers({
        page: userPage,
        limit: 10,
        role: userRoleFilter || undefined,
        status: userStatusFilter || undefined,
        q: userSearch.trim() || undefined,
      });
      setUsers(res.users);
      setUserTotalPages(res.pagination?.totalPages || 1);
    } catch (err: any) {
      console.error('Failed to fetch users:', err);
    } finally {
      setIsUsersLoading(false);
    }
  };

  // Fetch Jobs
  const fetchJobs = async () => {
    try {
      setIsJobsLoading(true);
      const res = await adminApi.getJobs({
        page: jobPage,
        limit: 10,
        status: jobStatusFilter || undefined,
        isHidden: jobHiddenFilter === 'true' ? true : jobHiddenFilter === 'false' ? false : undefined,
        q: jobSearch.trim() || undefined,
      });
      setJobs(res.jobs);
      setJobTotalPages(res.pagination?.totalPages || 1);
    } catch (err: any) {
      console.error('Failed to fetch jobs:', err);
    } finally {
      setIsJobsLoading(false);
    }
  };

  // Fetch Reviews
  const fetchReviews = async () => {
    try {
      setIsReviewsLoading(true);
      const res = await adminApi.getReviews({
        page: reviewPage,
        limit: 10,
        isHidden: reviewHiddenFilter === 'true' ? true : reviewHiddenFilter === 'false' ? false : undefined,
        rating: reviewRatingFilter ? parseInt(reviewRatingFilter, 10) : undefined,
      });
      setReviews(res.reviews);
      setReviewTotalPages(res.pagination?.totalPages || 1);
    } catch (err: any) {
      console.error('Failed to fetch reviews:', err);
    } finally {
      setIsReviewsLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'STATS') fetchStats();
    if (activeTab === 'USERS') fetchUsers();
    if (activeTab === 'JOBS') fetchJobs();
    if (activeTab === 'REVIEWS') fetchReviews();
  }, [
    activeTab,
    userPage,
    userRoleFilter,
    userStatusFilter,
    jobPage,
    jobStatusFilter,
    jobHiddenFilter,
    reviewPage,
    reviewHiddenFilter,
    reviewRatingFilter,
  ]);

  const handleUserSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setUserPage(1);
    fetchUsers();
  };

  const handleJobSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setJobPage(1);
    fetchJobs();
  };

  // Action Handlers
  const handleConfirmUserStatus = async () => {
    if (!userActionTarget) return;
    try {
      setIsProcessingAction(true);
      await adminApi.updateUserStatus(userActionTarget.user.id, userActionTarget.nextStatus);
      showToast(
        userActionTarget.nextStatus === 'BANNED'
          ? `Đã khóa tài khoản ${userActionTarget.user.email}`
          : `Đã mở khóa tài khoản ${userActionTarget.user.email}`
      );
      setUserActionTarget(null);
      fetchUsers();
    } catch (err: any) {
      setErrorMessage(
        err.response?.data?.error?.message || 'Không thể cập nhật trạng thái người dùng'
      );
    } finally {
      setIsProcessingAction(false);
    }
  };

  const handleToggleJobHide = async (job: AdminJob) => {
    try {
      const updated = await adminApi.toggleJobHide(job.id);
      showToast(updated.isHidden ? 'Đã ẩn tin tuyển dụng vi phạm' : 'Đã hiển thị lại tin việc làm');
      fetchJobs();
    } catch (err: any) {
      setErrorMessage(
        err.response?.data?.error?.message || 'Không thể thao tác ẩn/hiện công việc'
      );
    }
  };

  const handleToggleReviewHide = async (review: AdminReview) => {
    try {
      const updated = await adminApi.toggleReviewHide(review.id);
      showToast(updated.isHidden ? 'Đã ẩn đánh giá vi phạm (BR6)' : 'Đã hiển thị lại đánh giá');
      fetchReviews();
    } catch (err: any) {
      setErrorMessage(
        err.response?.data?.error?.message || 'Không thể thao tác ẩn/hiện đánh giá'
      );
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Welcome Header */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1.5">
              <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-purple-50 text-purple-700 border border-purple-200 text-xs font-bold">
                <ShieldCheck className="w-4 h-4" />
                <span>Bảng điều khiển Quản trị viên (ADMIN)</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
                Hệ thống Quản trị & Kiểm duyệt Vận hành
              </h1>
              <p className="text-sm text-slate-500">
                Đăng nhập: <strong>{currentAdmin?.email}</strong> • Toàn quyền kiểm soát tài khoản, việc làm, và đánh giá.
              </p>
            </div>

            <button
              onClick={() => {
                if (activeTab === 'STATS') fetchStats();
                if (activeTab === 'USERS') fetchUsers();
                if (activeTab === 'JOBS') fetchJobs();
                if (activeTab === 'REVIEWS') fetchReviews();
              }}
              className="inline-flex items-center px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition self-start sm:self-auto space-x-1.5"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Làm mới dữ liệu</span>
            </button>
          </div>

          {/* Tab Navigation */}
          <div className="flex items-center space-x-2 overflow-x-auto pt-4 border-t border-slate-100">
            <button
              onClick={() => setActiveTab('STATS')}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center space-x-2 whitespace-nowrap ${
                activeTab === 'STATS'
                  ? 'bg-purple-600 text-white shadow-sm'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              <span>Tổng quan & Báo cáo</span>
            </button>

            <button
              onClick={() => setActiveTab('USERS')}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center space-x-2 whitespace-nowrap ${
                activeTab === 'USERS'
                  ? 'bg-purple-600 text-white shadow-sm'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>Quản lý Người dùng</span>
            </button>

            <button
              onClick={() => setActiveTab('JOBS')}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center space-x-2 whitespace-nowrap ${
                activeTab === 'JOBS'
                  ? 'bg-purple-600 text-white shadow-sm'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              <Briefcase className="w-4 h-4" />
              <span>Kiểm duyệt Việc làm</span>
            </button>

            <button
              onClick={() => setActiveTab('REVIEWS')}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center space-x-2 whitespace-nowrap ${
                activeTab === 'REVIEWS'
                  ? 'bg-purple-600 text-white shadow-sm'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              <Star className="w-4 h-4" />
              <span>Kiểm duyệt Đánh giá (BR6)</span>
            </button>
          </div>
        </div>

        {/* Feedback Alerts */}
        {toastMessage && (
          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm flex items-center space-x-2 animate-in fade-in">
            <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
            <span className="font-semibold">{toastMessage}</span>
          </div>
        )}

        {errorMessage && (
          <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-sm flex items-center justify-between animate-in fade-in">
            <div className="flex items-center space-x-2">
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
              <span className="font-semibold">{errorMessage}</span>
            </div>
            <button
              onClick={() => setErrorMessage(null)}
              className="text-xs font-bold text-rose-600 hover:underline"
            >
              Đóng
            </button>
          </div>
        )}

        {/* TAB 1: STATS & OVERVIEW */}
        {activeTab === 'STATS' && (
          <div className="space-y-6">
            {isStatsLoading || !stats ? (
              <div className="py-20 flex flex-col items-center justify-center space-y-3 text-slate-500">
                <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
                <p className="text-sm">Đang tổng hợp số liệu thống kê...</p>
              </div>
            ) : (
              <>
                {/* 4 Key Metric Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {/* Users */}
                  <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                        Người dùng
                      </span>
                      <div className="p-2.5 rounded-2xl bg-blue-50 text-[#0065c9]">
                        <Users className="w-5 h-5" />
                      </div>
                    </div>
                    <p className="text-3xl font-black text-slate-900">{stats.users.total}</p>
                    <p className="text-xs text-slate-500">
                      {stats.users.students} sinh viên • {stats.users.employers} NTD
                    </p>
                  </div>

                  {/* Jobs */}
                  <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                        Tin Tuyển Dụng
                      </span>
                      <div className="p-2.5 rounded-2xl bg-emerald-50 text-emerald-600">
                        <Briefcase className="w-5 h-5" />
                      </div>
                    </div>
                    <p className="text-3xl font-black text-slate-900">{stats.jobs.total}</p>
                    <p className="text-xs text-slate-500">
                      {stats.jobs.open} đang mở • {stats.jobs.completed} hoàn thành
                    </p>
                  </div>

                  {/* Applications */}
                  <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                        Lượt Ứng Tuyển
                      </span>
                      <div className="p-2.5 rounded-2xl bg-amber-50 text-amber-600">
                        <TrendingUp className="w-5 h-5" />
                      </div>
                    </div>
                    <p className="text-3xl font-black text-slate-900">{stats.applications.total}</p>
                    <p className="text-xs text-slate-500">
                      {stats.applications.accepted} đã nhận việc ({Math.round((stats.applications.accepted / (stats.applications.total || 1)) * 100)}%)
                    </p>
                  </div>

                  {/* Reviews */}
                  <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                        Đánh giá Hai chiều
                      </span>
                      <div className="p-2.5 rounded-2xl bg-purple-50 text-purple-600">
                        <Star className="w-5 h-5" />
                      </div>
                    </div>
                    <p className="text-3xl font-black text-slate-900">
                      {stats.reviews.averageRating.toFixed(1)}{' '}
                      <span className="text-sm font-semibold text-slate-400">/ 5.0 ⭐</span>
                    </p>
                    <p className="text-xs text-slate-500">
                      Tổng {stats.reviews.total} lượt đánh giá
                    </p>
                  </div>
                </div>

                {/* Detailed Breakdown Grids */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* User Distribution */}
                  <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
                    <h3 className="text-base font-bold text-slate-900 flex items-center space-x-2">
                      <Users className="w-4 h-4 text-purple-600" />
                      <span>Phân bố Người dùng</span>
                    </h3>
                    <div className="space-y-2.5 text-xs">
                      <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50">
                        <span className="text-slate-600">Sinh viên (STUDENT):</span>
                        <strong className="text-slate-900 font-bold">{stats.users.students}</strong>
                      </div>
                      <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50">
                        <span className="text-slate-600">Nhà tuyển dụng (EMPLOYER):</span>
                        <strong className="text-slate-900 font-bold">{stats.users.employers}</strong>
                      </div>
                      <div className="flex items-center justify-between p-2.5 rounded-xl bg-rose-50 text-rose-800">
                        <span>Tài khoản bị khóa (BANNED):</span>
                        <strong className="font-bold">{stats.users.banned}</strong>
                      </div>
                    </div>
                  </div>

                  {/* Job Status Breakdown */}
                  <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
                    <h3 className="text-base font-bold text-slate-900 flex items-center space-x-2">
                      <Briefcase className="w-4 h-4 text-emerald-600" />
                      <span>Trạng thái Công việc</span>
                    </h3>
                    <div className="space-y-2.5 text-xs">
                      <div className="flex items-center justify-between p-2.5 rounded-xl bg-emerald-50 text-emerald-800">
                        <span>Đang tuyển (OPEN):</span>
                        <strong className="font-bold">{stats.jobs.open}</strong>
                      </div>
                      <div className="flex items-center justify-between p-2.5 rounded-xl bg-blue-50 text-blue-800">
                        <span>Đã đủ người (FILLED):</span>
                        <strong className="font-bold">{stats.jobs.filled}</strong>
                      </div>
                      <div className="flex items-center justify-between p-2.5 rounded-xl bg-purple-50 text-purple-800">
                        <span>Đã hoàn thành (COMPLETED):</span>
                        <strong className="font-bold">{stats.jobs.completed}</strong>
                      </div>
                      <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-100 text-slate-700">
                        <span>Tin bị ẩn vi phạm (HIDDEN):</span>
                        <strong className="font-bold">{stats.jobs.hidden}</strong>
                      </div>
                    </div>
                  </div>

                  {/* Application Funnel */}
                  <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
                    <h3 className="text-base font-bold text-slate-900 flex items-center space-x-2">
                      <FileCheck2 className="w-4 h-4 text-[#0065c9]" />
                      <span>Tiến độ Tuyển dụng</span>
                    </h3>
                    <div className="space-y-2.5 text-xs">
                      <div className="flex items-center justify-between p-2.5 rounded-xl bg-amber-50 text-amber-800">
                        <span>Chờ duyệt (PENDING):</span>
                        <strong className="font-bold">{stats.applications.pending}</strong>
                      </div>
                      <div className="flex items-center justify-between p-2.5 rounded-xl bg-emerald-50 text-emerald-800">
                        <span>Được nhận (ACCEPTED):</span>
                        <strong className="font-bold">{stats.applications.accepted}</strong>
                      </div>
                      <div className="flex items-center justify-between p-2.5 rounded-xl bg-rose-50 text-rose-800">
                        <span>Bị từ chối (REJECTED):</span>
                        <strong className="font-bold">{stats.applications.rejected}</strong>
                      </div>
                      <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 text-slate-600">
                        <span>Đã rút đơn (WITHDRAWN):</span>
                        <strong className="font-bold">{stats.applications.withdrawn}</strong>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {/* TAB 2: USER MANAGEMENT */}
        {activeTab === 'USERS' && (
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <h2 className="text-lg font-bold text-slate-900">Danh sách Người dùng Hệ thống</h2>

              {/* Filters */}
              <div className="flex items-center flex-wrap gap-2">
                <form onSubmit={handleUserSearchSubmit} className="relative">
                  <input
                    type="text"
                    value={userSearch}
                    onChange={(e) => setUserSearch(e.target.value)}
                    placeholder="Tìm tên hoặc email..."
                    className="pl-9 pr-4 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:bg-white focus:outline-hidden w-48 sm:w-64"
                  />
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                </form>

                <select
                  value={userRoleFilter}
                  onChange={(e) => {
                    setUserRoleFilter(e.target.value);
                    setUserPage(1);
                  }}
                  className="px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 font-semibold focus:outline-hidden"
                >
                  <option value="">Tất cả Vai trò</option>
                  <option value="STUDENT">Sinh viên</option>
                  <option value="EMPLOYER">Nhà tuyển dụng</option>
                  <option value="ADMIN">Quản trị viên</option>
                </select>

                <select
                  value={userStatusFilter}
                  onChange={(e) => {
                    setUserStatusFilter(e.target.value);
                    setUserPage(1);
                  }}
                  className="px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 font-semibold focus:outline-hidden"
                >
                  <option value="">Tất cả Trạng thái</option>
                  <option value="ACTIVE">Hoạt động (ACTIVE)</option>
                  <option value="BANNED">Đã bị khóa (BANNED)</option>
                </select>
              </div>
            </div>

            {/* Users Table */}
            {isUsersLoading ? (
              <div className="py-20 flex flex-col items-center justify-center space-y-3 text-slate-500">
                <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
                <p className="text-sm">Đang tải danh sách người dùng...</p>
              </div>
            ) : users.length === 0 ? (
              <div className="py-12 text-center text-slate-500 text-xs">
                Không tìm thấy người dùng nào phù hợp với bộ lọc.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-400 uppercase tracking-wider font-bold">
                      <th className="pb-3 px-2">Người dùng</th>
                      <th className="pb-3 px-2">Vai trò</th>
                      <th className="pb-3 px-2">Trạng thái</th>
                      <th className="pb-3 px-2">Ngày tham gia</th>
                      <th className="pb-3 px-2 text-right">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {users.map((u) => {
                      const isStudent = u.role === 'STUDENT';
                      const displayName = isStudent
                        ? u.studentProfile?.fullName || 'Sinh viên'
                        : u.role === 'EMPLOYER'
                        ? u.employerProfile?.companyName || 'Nhà tuyển dụng'
                        : 'Quản trị viên';

                      return (
                        <tr key={u.id} className="hover:bg-slate-50/60 transition">
                          <td className="py-3.5 px-2">
                            <div className="flex items-center space-x-3">
                              <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-700 border border-purple-100 flex items-center justify-center font-bold text-xs shrink-0">
                                {displayName.charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <a
                                  href={`/users/${u.id}`}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="font-bold text-slate-900 hover:text-[#0065c9] inline-flex items-center space-x-1"
                                >
                                  <span>{displayName}</span>
                                  <ExternalLink className="w-3 h-3 text-slate-400" />
                                </a>
                                <p className="text-slate-400 text-[11px]">{u.email}</p>
                              </div>
                            </div>
                          </td>

                          <td className="py-3.5 px-2">
                            <span
                              className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                                u.role === 'ADMIN'
                                  ? 'bg-purple-100 text-purple-800'
                                  : u.role === 'EMPLOYER'
                                  ? 'bg-blue-100 text-[#0065c9]'
                                  : 'bg-emerald-100 text-emerald-800'
                              }`}
                            >
                              {u.role}
                            </span>
                          </td>

                          <td className="py-3.5 px-2">
                            <span
                              className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                                u.status === 'BANNED'
                                  ? 'bg-rose-100 text-rose-800'
                                  : 'bg-emerald-100 text-emerald-800'
                              }`}
                            >
                              {u.status}
                            </span>
                          </td>

                          <td className="py-3.5 px-2 text-slate-500">
                            {new Date(u.createdAt).toLocaleDateString('vi-VN')}
                          </td>

                          <td className="py-3.5 px-2 text-right">
                            {u.id !== currentAdmin?.id && u.role !== 'ADMIN' && (
                              <button
                                onClick={() =>
                                  setUserActionTarget({
                                    user: u,
                                    nextStatus: u.status === 'BANNED' ? 'ACTIVE' : 'BANNED',
                                  })
                                }
                                className={`px-3 py-1.5 rounded-xl font-bold text-xs transition inline-flex items-center space-x-1 ${
                                  u.status === 'BANNED'
                                    ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200'
                                    : 'bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200'
                                }`}
                              >
                                {u.status === 'BANNED' ? (
                                  <>
                                    <UserCheck className="w-3.5 h-3.5" />
                                    <span>Mở khóa</span>
                                  </>
                                ) : (
                                  <>
                                    <UserX className="w-3.5 h-3.5" />
                                    <span>Khóa TK</span>
                                  </>
                                )}
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>

                {/* Pagination */}
                {userTotalPages > 1 && (
                  <div className="flex items-center justify-center space-x-2 pt-6">
                    <button
                      disabled={userPage <= 1}
                      onClick={() => setUserPage(userPage - 1)}
                      className="px-4 py-2 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-40 flex items-center transition"
                    >
                      <ChevronLeft className="w-4 h-4 mr-1" />
                      <span>Trước</span>
                    </button>
                    <div className="text-xs font-bold text-slate-600 px-3">
                      Trang {userPage} / {userTotalPages}
                    </div>
                    <button
                      disabled={userPage >= userTotalPages}
                      onClick={() => setUserPage(userPage + 1)}
                      className="px-4 py-2 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-40 flex items-center transition"
                    >
                      <span>Sau</span>
                      <ChevronRight className="w-4 h-4 ml-1" />
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* TAB 3: JOB MODERATION */}
        {activeTab === 'JOBS' && (
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <h2 className="text-lg font-bold text-slate-900">Kiểm duyệt Tin Tuyển Dụng</h2>

              {/* Filters */}
              <div className="flex items-center flex-wrap gap-2">
                <form onSubmit={handleJobSearchSubmit} className="relative">
                  <input
                    type="text"
                    value={jobSearch}
                    onChange={(e) => setJobSearch(e.target.value)}
                    placeholder="Tìm tiêu đề, địa điểm..."
                    className="pl-9 pr-4 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:bg-white focus:outline-hidden w-48 sm:w-64"
                  />
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                </form>

                <select
                  value={jobStatusFilter}
                  onChange={(e) => {
                    setJobStatusFilter(e.target.value);
                    setJobPage(1);
                  }}
                  className="px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 font-semibold focus:outline-hidden"
                >
                  <option value="">Tất cả Trạng thái</option>
                  <option value="OPEN">OPEN</option>
                  <option value="FILLED">FILLED</option>
                  <option value="COMPLETED">COMPLETED</option>
                  <option value="CLOSED">CLOSED</option>
                </select>

                <select
                  value={jobHiddenFilter}
                  onChange={(e) => {
                    setJobHiddenFilter(e.target.value);
                    setJobPage(1);
                  }}
                  className="px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 font-semibold focus:outline-hidden"
                >
                  <option value="">Tất cả Hiển thị</option>
                  <option value="false">Đang hiển thị</option>
                  <option value="true">Bị ẩn vi phạm</option>
                </select>
              </div>
            </div>

            {isJobsLoading ? (
              <div className="py-20 flex flex-col items-center justify-center space-y-3 text-slate-500">
                <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
                <p className="text-sm">Đang tải danh sách việc làm...</p>
              </div>
            ) : jobs.length === 0 ? (
              <div className="py-12 text-center text-slate-500 text-xs">
                Không tìm thấy việc làm nào phù hợp với bộ lọc.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-400 uppercase tracking-wider font-bold">
                      <th className="pb-3 px-2">Công việc</th>
                      <th className="pb-3 px-2">Nhà tuyển dụng</th>
                      <th className="pb-3 px-2">Trạng thái</th>
                      <th className="pb-3 px-2">Hiển thị</th>
                      <th className="pb-3 px-2 text-right">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {jobs.map((j) => (
                      <tr key={j.id} className="hover:bg-slate-50/60 transition">
                        <td className="py-3.5 px-2">
                          <div>
                            <a
                              href={`/jobs/${j.id}`}
                              target="_blank"
                              rel="noreferrer"
                              className="font-bold text-slate-900 hover:text-[#0065c9] inline-flex items-center space-x-1"
                            >
                              <span>{j.title}</span>
                              <ExternalLink className="w-3 h-3 text-slate-400" />
                            </a>
                            <p className="text-slate-400 text-[11px]">
                              {j.category?.name} • {j.city} • Slots: {j.slots}
                            </p>
                          </div>
                        </td>

                        <td className="py-3.5 px-2 text-slate-700">
                          <span className="font-semibold">
                            {j.employer?.employerProfile?.companyName || j.employer?.email}
                          </span>
                        </td>

                        <td className="py-3.5 px-2">
                          <StatusBadge status={j.status as any} />
                        </td>

                        <td className="py-3.5 px-2">
                          {j.isHidden ? (
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800">
                              Bị ẩn vi phạm
                            </span>
                          ) : (
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                              Công khai
                            </span>
                          )}
                        </td>

                        <td className="py-3.5 px-2 text-right">
                          <button
                            onClick={() => handleToggleJobHide(j)}
                            className={`px-3 py-1.5 rounded-xl font-bold text-xs transition inline-flex items-center space-x-1 ${
                              j.isHidden
                                ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200'
                                : 'bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200'
                            }`}
                          >
                            {j.isHidden ? (
                              <>
                                <Eye className="w-3.5 h-3.5" />
                                <span>Hiện tin</span>
                              </>
                            ) : (
                              <>
                                <EyeOff className="w-3.5 h-3.5" />
                                <span>Ẩn tin</span>
                              </>
                            )}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {/* Pagination */}
                {jobTotalPages > 1 && (
                  <div className="flex items-center justify-center space-x-2 pt-6">
                    <button
                      disabled={jobPage <= 1}
                      onClick={() => setJobPage(jobPage - 1)}
                      className="px-4 py-2 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-40 flex items-center transition"
                    >
                      <ChevronLeft className="w-4 h-4 mr-1" />
                      <span>Trước</span>
                    </button>
                    <div className="text-xs font-bold text-slate-600 px-3">
                      Trang {jobPage} / {jobTotalPages}
                    </div>
                    <button
                      disabled={jobPage >= jobTotalPages}
                      onClick={() => setJobPage(jobPage + 1)}
                      className="px-4 py-2 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-40 flex items-center transition"
                    >
                      <span>Sau</span>
                      <ChevronRight className="w-4 h-4 ml-1" />
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* TAB 4: REVIEW MODERATION */}
        {activeTab === 'REVIEWS' && (
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <h2 className="text-lg font-bold text-slate-900">Kiểm duyệt Đánh giá Hai chiều (BR6)</h2>

              {/* Filters */}
              <div className="flex items-center flex-wrap gap-2">
                <select
                  value={reviewRatingFilter}
                  onChange={(e) => {
                    setReviewRatingFilter(e.target.value);
                    setReviewPage(1);
                  }}
                  className="px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 font-semibold focus:outline-hidden"
                >
                  <option value="">Tất cả Số sao</option>
                  <option value="5">5 ⭐</option>
                  <option value="4">4 ⭐</option>
                  <option value="3">3 ⭐</option>
                  <option value="2">2 ⭐</option>
                  <option value="1">1 ⭐</option>
                </select>

                <select
                  value={reviewHiddenFilter}
                  onChange={(e) => {
                    setReviewHiddenFilter(e.target.value);
                    setReviewPage(1);
                  }}
                  className="px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 font-semibold focus:outline-hidden"
                >
                  <option value="">Tất cả Hiển thị</option>
                  <option value="false">Đang hiển thị</option>
                  <option value="true">Bị ẩn vi phạm (BR6)</option>
                </select>
              </div>
            </div>

            {isReviewsLoading ? (
              <div className="py-20 flex flex-col items-center justify-center space-y-3 text-slate-500">
                <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
                <p className="text-sm">Đang tải danh sách đánh giá...</p>
              </div>
            ) : reviews.length === 0 ? (
              <div className="py-12 text-center text-slate-500 text-xs">
                Không tìm thấy đánh giá nào phù hợp với bộ lọc.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-400 uppercase tracking-wider font-bold">
                      <th className="pb-3 px-2">Người đánh giá → Người nhận</th>
                      <th className="pb-3 px-2">Đánh giá & Nhận xét</th>
                      <th className="pb-3 px-2">Công việc</th>
                      <th className="pb-3 px-2">Trạng thái</th>
                      <th className="pb-3 px-2 text-right">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {reviews.map((r) => {
                      const reviewerName =
                        r.reviewer?.studentProfile?.fullName ||
                        r.reviewer?.employerProfile?.companyName ||
                        'Người dùng';
                      const revieweeName =
                        r.reviewee?.studentProfile?.fullName ||
                        r.reviewee?.employerProfile?.companyName ||
                        'Người dùng';

                      return (
                        <tr key={r.id} className="hover:bg-slate-50/60 transition">
                          <td className="py-3.5 px-2">
                            <div className="space-y-0.5">
                              <p className="font-bold text-slate-900">{reviewerName}</p>
                              <span className="text-slate-400 text-[11px]">gửi tới </span>
                              <span className="font-semibold text-slate-700">{revieweeName}</span>
                            </div>
                          </td>

                          <td className="py-3.5 px-2 max-w-xs sm:max-w-sm">
                            <div className="space-y-1">
                              <RatingStars value={r.rating} size="xs" />
                              <p className="text-slate-600 line-clamp-2 italic">
                                {r.comment ? `"${r.comment}"` : '(Không có nhận xét)'}
                              </p>
                            </div>
                          </td>

                          <td className="py-3.5 px-2 text-slate-600">
                            {r.application?.job?.title || 'Công việc'}
                          </td>

                          <td className="py-3.5 px-2">
                            {r.isHidden ? (
                              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800">
                                Đã ẩn vi phạm
                              </span>
                            ) : (
                              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                                Công khai
                              </span>
                            )}
                          </td>

                          <td className="py-3.5 px-2 text-right">
                            <button
                              onClick={() => handleToggleReviewHide(r)}
                              className={`px-3 py-1.5 rounded-xl font-bold text-xs transition inline-flex items-center space-x-1 ${
                                r.isHidden
                                  ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200'
                                  : 'bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200'
                              }`}
                            >
                              {r.isHidden ? (
                                <>
                                  <Eye className="w-3.5 h-3.5" />
                                  <span>Hiện lại</span>
                                </>
                              ) : (
                                <>
                                  <EyeOff className="w-3.5 h-3.5" />
                                  <span>Ẩn đánh giá</span>
                                </>
                              )}
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>

                {/* Pagination */}
                {reviewTotalPages > 1 && (
                  <div className="flex items-center justify-center space-x-2 pt-6">
                    <button
                      disabled={reviewPage <= 1}
                      onClick={() => setReviewPage(reviewPage - 1)}
                      className="px-4 py-2 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-40 flex items-center transition"
                    >
                      <ChevronLeft className="w-4 h-4 mr-1" />
                      <span>Trước</span>
                    </button>
                    <div className="text-xs font-bold text-slate-600 px-3">
                      Trang {reviewPage} / {reviewTotalPages}
                    </div>
                    <button
                      disabled={reviewPage >= reviewTotalPages}
                      onClick={() => setReviewPage(reviewPage + 1)}
                      className="px-4 py-2 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-40 flex items-center transition"
                    >
                      <span>Sau</span>
                      <ChevronRight className="w-4 h-4 ml-1" />
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </main>

      {/* User Action Confirmation Modal */}
      {userActionTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl border border-slate-200 max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center space-x-3 text-purple-600">
              <div className="w-10 h-10 rounded-2xl bg-purple-50 flex items-center justify-center">
                {userActionTarget.nextStatus === 'BANNED' ? (
                  <Ban className="w-6 h-6 text-rose-600" />
                ) : (
                  <CheckCircle className="w-6 h-6 text-emerald-600" />
                )}
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  {userActionTarget.nextStatus === 'BANNED'
                    ? 'Khóa tài khoản người dùng'
                    : 'Mở khóa tài khoản'}
                </h3>
                <p className="text-xs text-slate-500">{userActionTarget.user.email}</p>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              {userActionTarget.nextStatus === 'BANNED'
                ? 'Người dùng bị khóa sẽ không thể đăng nhập hoặc thực hiện bất kỳ hành động nào trên nền tảng.'
                : 'Người dùng sẽ được khôi phục quyền truy cập và hoạt động bình thường.'}
            </p>

            <div className="flex items-center justify-end space-x-3 pt-2">
              <button
                type="button"
                disabled={isProcessingAction}
                onClick={() => setUserActionTarget(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 text-xs font-bold hover:bg-slate-200 transition"
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                disabled={isProcessingAction}
                onClick={handleConfirmUserStatus}
                className={`px-5 py-2 rounded-xl text-white text-xs font-bold transition shadow-sm inline-flex items-center space-x-1.5 ${
                  userActionTarget.nextStatus === 'BANNED'
                    ? 'bg-rose-600 hover:bg-rose-700'
                    : 'bg-emerald-600 hover:bg-emerald-700'
                }`}
              >
                {isProcessingAction && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                <span>
                  {userActionTarget.nextStatus === 'BANNED' ? 'Xác nhận khóa' : 'Mở khóa ngay'}
                </span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
