import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { reviewApi } from '../api/reviews';
import { jobApi } from '../api/jobs';
import { UserReviewsResponse } from '../types/review';
import { Job } from '../types/job';
import { Navbar } from '../components/layout/Navbar';
import { RatingStars } from '../components/common/RatingStars';
import { RatingSummaryCard } from '../components/reviews/RatingSummaryCard';
import { ReviewCard } from '../components/reviews/ReviewCard';
import { JobCard } from '../components/jobs/JobCard';
import {
  GraduationCap,
  MapPin,
  Globe,
  Calendar,
  Sparkles,
  Briefcase,
  MessageSquare,
  ChevronLeft,
  ChevronRight,
  Loader2,
  AlertCircle,
  CheckCircle2
} from 'lucide-react';

export const UserProfilePage: React.FC = () => {
  const { id: userId } = useParams<{ id: string }>();

  const [data, setData] = useState<UserReviewsResponse | null>(null);
  const [activeJobs, setActiveJobs] = useState<Job[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<'REVIEWS' | 'JOBS'>('REVIEWS');
  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [error, setError] = useState<string | null>(null);

  const fetchUserReviews = async () => {
    if (!userId) return;
    try {
      setIsLoading(true);
      setError(null);
      const res = await reviewApi.getUserReviews(userId, { page, limit: 10 });
      setData(res);
      setTotalPages(res.pagination?.totalPages || 1);

      // If user is employer, also fetch their public jobs
      if (res.user?.role === 'EMPLOYER') {
        try {
          const jobsRes = await jobApi.getPublicJobs({
            page: 1,
            limit: 6,
          });
          // Filter jobs belonging to this employer
          const employerJobs = (jobsRes.jobs || []).filter(
            (j) => j.employerId === userId || j.employer?.id === userId
          );
          setActiveJobs(employerJobs);
        } catch (e) {
          console.error('Failed to load employer jobs:', e);
        }
      }
    } catch (err: any) {
      setError(
        err.response?.data?.error?.message ||
          'Không thể tải thông tin hồ sơ và đánh giá của người dùng này.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUserReviews();
  }, [userId, page]);

  if (isLoading && !data) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center space-y-3">
          <Loader2 className="w-8 h-8 animate-spin text-[#0065c9]" />
          <p className="text-sm text-slate-500">Đang tải hồ sơ & đánh giá...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
        <Navbar />
        <main className="flex-1 max-w-3xl w-full mx-auto px-4 py-16 text-center space-y-4">
          <div className="w-16 h-16 rounded-3xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
            <AlertCircle className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-black text-slate-900">Không tìm thấy hồ sơ</h2>
          <p className="text-sm text-slate-500">{error || 'Người dùng không tồn tại hoặc đã bị ẩn.'}</p>
          <Link
            to="/jobs"
            className="inline-flex items-center px-5 py-2.5 rounded-xl bg-[#0065c9] text-white text-xs font-bold shadow-sm"
          >
            Quay lại trang Việc làm
          </Link>
        </main>
      </div>
    );
  }

  const user = data.user;
  const isEmployer = user.role === 'EMPLOYER';
  const displayName = isEmployer
    ? user.employerProfile?.companyName || 'Nhà tuyển dụng'
    : user.studentProfile?.fullName || 'Sinh viên';

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Back navigation */}
        <div>
          <Link
            to="/jobs"
            className="inline-flex items-center text-xs font-semibold text-[#0065c9] hover:underline"
          >
            <ChevronLeft className="w-4 h-4 mr-1" />
            <span>Quay lại danh sách việc làm</span>
          </Link>
        </div>

        {/* User Hero Profile Card */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6">
            <div className="flex items-start space-x-5">
              {/* Avatar Icon */}
              <div
                className={`w-16 h-16 sm:w-20 sm:h-20 rounded-3xl flex items-center justify-center font-black text-2xl sm:text-3xl shrink-0 shadow-inner ${
                  isEmployer
                    ? 'bg-blue-50 text-[#0065c9] border border-blue-200'
                    : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                }`}
              >
                {displayName.charAt(0).toUpperCase()}
              </div>

              <div className="space-y-2">
                <div className="flex items-center space-x-2.5 flex-wrap gap-y-1">
                  <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
                    {displayName}
                  </h1>
                  <span
                    className={`text-xs font-bold px-3 py-1 rounded-full ${
                      isEmployer
                        ? 'bg-blue-50 text-[#0065c9] border border-blue-200'
                        : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    }`}
                  >
                    {isEmployer ? 'Nhà tuyển dụng' : 'Sinh viên'}
                  </span>
                  {isEmployer && user.employerProfile?.isVerified && (
                    <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-sky-50 text-sky-700 border border-sky-200 flex items-center space-x-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Đã xác minh</span>
                    </span>
                  )}
                </div>

                {/* Star rating preview */}
                <div className="flex items-center space-x-2 text-xs">
                  <RatingStars
                    value={data.summary.averageRating}
                    showScore={true}
                    totalReviews={data.summary.totalReviews}
                    size="md"
                  />
                </div>

                {/* Metadata list */}
                <div className="flex items-center space-x-4 text-xs text-slate-600 flex-wrap gap-y-2 pt-1">
                  {isEmployer ? (
                    <>
                      {user.employerProfile?.address && (
                        <div className="flex items-center space-x-1">
                          <MapPin className="w-3.5 h-3.5 text-slate-400" />
                          <span>{user.employerProfile.address}</span>
                        </div>
                      )}
                      {user.employerProfile?.website && (
                        <a
                          href={
                            user.employerProfile.website.startsWith('http')
                              ? user.employerProfile.website
                              : `https://${user.employerProfile.website}`
                          }
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center space-x-1 text-[#0065c9] hover:underline"
                        >
                          <Globe className="w-3.5 h-3.5" />
                          <span>Website công ty</span>
                        </a>
                      )}
                    </>
                  ) : (
                    <>
                      {user.studentProfile?.university && (
                        <div className="flex items-center space-x-1 font-semibold text-slate-700">
                          <GraduationCap className="w-3.5 h-3.5 text-[#0065c9]" />
                          <span>
                            {user.studentProfile.university}
                            {user.studentProfile.major ? ` • ${user.studentProfile.major}` : ''}
                          </span>
                        </div>
                      )}
                    </>
                  )}

                  <div className="flex items-center space-x-1 text-slate-400">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>
                      Tham gia: {new Date(user.createdAt).toLocaleDateString('vi-VN')}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Bio / Description */}
          {((isEmployer && user.employerProfile?.description) ||
            (!isEmployer && user.studentProfile?.bio)) && (
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 text-xs sm:text-sm text-slate-700 leading-relaxed space-y-1">
              <span className="font-bold text-slate-900 block">
                {isEmployer ? 'Giới thiệu công ty:' : 'Giới thiệu bản thân:'}
              </span>
              <p className="whitespace-pre-wrap">
                {isEmployer
                  ? user.employerProfile?.description
                  : user.studentProfile?.bio}
              </p>
            </div>
          )}

          {/* Student Skills tags */}
          {!isEmployer && user.studentProfile?.skills && user.studentProfile.skills.length > 0 && (
            <div className="space-y-2 pt-2 border-t border-slate-100">
              <div className="flex items-center space-x-1.5 text-xs font-bold text-slate-700">
                <Sparkles className="w-3.5 h-3.5 text-[#0065c9]" />
                <span>Kỹ năng nổi bật:</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {user.studentProfile.skills.map((skill, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1 rounded-xl bg-blue-50 text-[#0065c9] text-xs font-semibold border border-blue-100"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Tab switcher for Employer (Reviews vs Posted Jobs) */}
        {isEmployer && (
          <div className="flex items-center space-x-2 border-b border-slate-200 pb-1">
            <button
              onClick={() => setActiveTab('REVIEWS')}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center space-x-2 ${
                activeTab === 'REVIEWS'
                  ? 'bg-[#0065c9] text-white shadow-sm'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              <MessageSquare className="w-4 h-4" />
              <span>Đánh giá từ sinh viên ({data.summary.totalReviews})</span>
            </button>
            <button
              onClick={() => setActiveTab('JOBS')}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center space-x-2 ${
                activeTab === 'JOBS'
                  ? 'bg-[#0065c9] text-white shadow-sm'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              <Briefcase className="w-4 h-4" />
              <span>Việc làm đang tuyển ({activeJobs.length})</span>
            </button>
          </div>
        )}

        {/* Content Section */}
        {activeTab === 'REVIEWS' ? (
          <div className="space-y-8">
            {/* Rating Summary Breakdown Card */}
            <RatingSummaryCard
              summary={data.summary}
              title={`Tổng quan đánh giá của ${displayName}`}
            />

            {/* Reviews List */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-slate-900 flex items-center space-x-2">
                  <span>Tất cả nhận xét & đánh giá</span>
                  <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-slate-200 text-slate-700">
                    {data.summary.totalReviews}
                  </span>
                </h3>
              </div>

              {data.reviews.length === 0 ? (
                <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center space-y-3 shadow-sm">
                  <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto">
                    <MessageSquare className="w-6 h-6" />
                  </div>
                  <h4 className="text-base font-bold text-slate-900">Chưa có đánh giá nào</h4>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto">
                    Người dùng này chưa có đánh giá nào từ các công việc đã hoàn thành trên hệ thống.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {data.reviews.map((review) => (
                    <ReviewCard key={review.id} review={review} />
                  ))}

                  {/* Pagination */}
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
            </div>
          </div>
        ) : (
          /* Employer Jobs List Tab */
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-slate-900">
              Công việc đang tuyển của {displayName}
            </h3>

            {activeJobs.length === 0 ? (
              <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center space-y-3 shadow-sm">
                <div className="w-12 h-12 rounded-2xl bg-blue-50 text-[#0065c9] flex items-center justify-center mx-auto">
                  <Briefcase className="w-6 h-6" />
                </div>
                <h4 className="text-base font-bold text-slate-900">
                  Hiện không có tin tuyển dụng nào mở
                </h4>
                <p className="text-xs text-slate-500">
                  Nhà tuyển dụng chưa có công việc mới hoặc đã đủ người.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {activeJobs.map((job) => (
                  <JobCard key={job.id} job={job} />
                ))}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
};
