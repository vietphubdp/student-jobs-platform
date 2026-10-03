import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link, useNavigate } from 'react-router-dom';
import { jobApi } from '../api/jobs';
import { 
  Search, 
  MapPin, 
  Briefcase, 
  TrendingUp, 
  Sparkles, 
  Loader2, 
  ArrowRight,
  ShieldCheck,
  Clock,
  Award,
  Building2,
  GraduationCap,
  CheckCircle2
} from 'lucide-react';
import { Navbar } from '../components/layout/Navbar';
import { JobCard } from '../components/jobs/JobCard';
import { useAuth } from '../context/AuthContext';

export const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [keyword, setKeyword] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');

  // Fetch categories
  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: () => jobApi.getCategories(),
  });

  // Fetch latest open jobs
  const { data: jobsData, isLoading: isJobsLoading } = useQuery({
    queryKey: ['latest-jobs'],
    queryFn: () => jobApi.getPublicJobs({ limit: 6 }),
  });

  const handleHeroSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (keyword.trim()) params.set('q', keyword.trim());
    if (selectedCity) params.set('city', selectedCity);
    if (selectedCategory) params.set('category', selectedCategory);
    navigate(`/jobs?${params.toString()}`);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      {/* Navbar */}
      <Navbar />

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
        {/* Hero Section */}
        <section className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-12 shadow-xs relative overflow-hidden">
          <div className="max-w-3xl mx-auto text-center space-y-4">
            <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-blue-50 border border-blue-200 text-[#0065c9] font-bold text-xs tracking-wide uppercase">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Nền tảng kết nối việc làm sinh viên hàng đầu</span>
            </div>
            <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-slate-900 leading-tight">
              Tìm việc bán thời gian <br />
              <span className="text-[#0065c9]">
                Linh hoạt & Đáng tin cậy
              </span>
            </h1>
            <p className="text-slate-600 text-sm sm:text-base max-w-2xl mx-auto">
              Hàng trăm công việc part-time từ các doanh nghiệp uy tín dành riêng cho sinh viên. Thu nhập rõ ràng, lịch làm linh hoạt và hồ sơ ứng tuyển minh bạch.
            </p>

            {/* Hero Search Box */}
            <form onSubmit={handleHeroSearch} className="pt-4 max-w-3xl mx-auto">
              <div className="bg-white p-2.5 rounded-2xl border-2 border-[#0065c9]/30 shadow-lg shadow-blue-500/5 flex flex-col md:flex-row items-center gap-2">
                <div className="flex-1 flex items-center space-x-2 px-3 py-1.5 w-full">
                  <Search className="w-5 h-5 text-slate-400 shrink-0" />
                  <input
                    type="text"
                    value={keyword}
                    onChange={(e) => setKeyword(e.target.value)}
                    placeholder="Tên công việc, kỹ năng..."
                    className="w-full text-sm bg-transparent border-none focus:outline-hidden text-slate-800 placeholder-slate-400"
                  />
                </div>

                <div className="h-6 w-[1px] bg-slate-200 hidden md:block" />

                <div className="flex items-center space-x-2 px-3 py-1.5 w-full md:w-48">
                  <MapPin className="w-5 h-5 text-slate-400 shrink-0" />
                  <select
                    value={selectedCity}
                    onChange={(e) => setSelectedCity(e.target.value)}
                    className="w-full text-sm bg-transparent border-none focus:outline-hidden text-slate-700 font-medium"
                  >
                    <option value="">Tất cả địa điểm</option>
                    <option value="Hà Nội">Hà Nội</option>
                    <option value="Hồ Chí Minh">TP. Hồ Chí Minh</option>
                    <option value="Đà Nẵng">Đà Nẵng</option>
                    <option value="Cần Thơ">Cần Thơ</option>
                  </select>
                </div>

                <div className="h-6 w-[1px] bg-slate-200 hidden md:block" />

                <div className="flex items-center space-x-2 px-3 py-1.5 w-full md:w-52">
                  <Briefcase className="w-5 h-5 text-slate-400 shrink-0" />
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full text-sm bg-transparent border-none focus:outline-hidden text-slate-700 font-medium"
                  >
                    <option value="">Tất cả ngành nghề</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>

                <button
                  type="submit"
                  className="w-full md:w-auto px-6 py-3 rounded-xl bg-[#0065c9] hover:bg-[#0054a6] text-white font-bold text-sm transition shadow-sm active:scale-95 shrink-0"
                >
                  Tìm kiếm
                </button>
              </div>
            </form>
          </div>
        </section>

        {/* Category Quick Links */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-slate-900 flex items-center space-x-2">
              <TrendingUp className="w-5 h-5 text-[#0065c9]" />
              <span>Ngành nghề phổ biến</span>
            </h2>
            <Link to="/jobs" className="text-xs font-bold text-[#0065c9] hover:underline flex items-center">
              <span>Xem tất cả</span>
              <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
            {categories.map((cat) => (
              <Link
                key={cat.id}
                to={`/jobs?category=${cat.id}`}
                className="bg-white border border-slate-200 rounded-2xl p-4 text-center hover:border-[#0065c9] hover:shadow-md transition group"
              >
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#0065c9] flex items-center justify-center mx-auto mb-2 group-hover:scale-110 transition">
                  <Briefcase className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-xs text-slate-800 line-clamp-1 group-hover:text-[#0065c9] transition">
                  {cat.name}
                </h3>
              </Link>
            ))}
          </div>
        </section>

        {/* Featured / Latest Jobs Grid */}
        <section className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h2 className="text-xl font-bold text-slate-900 flex items-center space-x-2">
                <Briefcase className="w-5 h-5 text-[#0065c9]" />
                <span>Việc làm mới nhất</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">Các cơ hội việc làm part-time vừa được đăng tải</p>
            </div>
            <Link
              to="/jobs"
              className="inline-flex items-center px-4 py-2 rounded-xl bg-white border border-slate-200 text-xs font-bold text-[#0065c9] hover:bg-slate-50 transition shadow-xs self-start sm:self-auto"
            >
              <span>Xem tất cả việc làm ({jobsData?.pagination.total || 0})</span>
              <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
            </Link>
          </div>

          {isJobsLoading ? (
            <div className="py-12 flex flex-col items-center justify-center space-y-2 text-slate-400">
              <Loader2 className="w-6 h-6 animate-spin text-[#0065c9]" />
              <p className="text-xs">Đang tải việc làm mới nhất...</p>
            </div>
          ) : (jobsData?.jobs && jobsData.jobs.length > 0) ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {jobsData.jobs.map((job) => (
                <JobCard key={job.id} job={job} />
              ))}
            </div>
          ) : (
            <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center text-slate-500 text-sm">
              Chưa có công việc nào đang mở tuyển.
            </div>
          )}
        </section>

        {/* Value Proposition / Benefits Section */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* For Students */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 space-y-4 shadow-xs">
            <div className="w-12 h-12 rounded-xl bg-blue-50 text-[#0065c9] flex items-center justify-center">
              <GraduationCap className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-slate-900">Dành cho Sinh viên</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Dễ dàng tìm kiếm việc làm part-time phù hợp với lịch học, tích lũy kinh nghiệm thực tế và gia tăng thu nhập an toàn.
            </p>
            <ul className="space-y-2.5 pt-2">
              <li className="flex items-center text-xs sm:text-sm text-slate-700">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 mr-2 shrink-0" />
                <span>Hồ sơ trực tuyến & đính kèm CV chuyên nghiệp</span>
              </li>
              <li className="flex items-center text-xs sm:text-sm text-slate-700">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 mr-2 shrink-0" />
                <span>Theo dõi trạng thái đơn ứng tuyển theo thời gian thực</span>
              </li>
              <li className="flex items-center text-xs sm:text-sm text-slate-700">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 mr-2 shrink-0" />
                <span>Đánh giá hai chiều minh bạch sau khi hoàn thành công việc</span>
              </li>
            </ul>
            <div className="pt-2">
              <Link
                to="/jobs"
                className="inline-flex items-center text-xs sm:text-sm font-bold text-[#0065c9] hover:underline"
              >
                <span>Khám phá việc làm ngay</span>
                <ArrowRight className="w-4 h-4 ml-1" />
              </Link>
            </div>
          </div>

          {/* For Employers */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 space-y-4 shadow-xs">
            <div className="w-12 h-12 rounded-xl bg-blue-50 text-[#0065c9] flex items-center justify-center">
              <Building2 className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-slate-900">Dành cho Nhà tuyển dụng</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Tiếp cận nguồn nhân sự sinh viên năng động, nhiệt huyết. Đăng tin nhanh chóng và quản lý hồ sơ ứng viên dễ dàng.
            </p>
            <ul className="space-y-2.5 pt-2">
              <li className="flex items-center text-xs sm:text-sm text-slate-700">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 mr-2 shrink-0" />
                <span>Đăng tin tuyển dụng theo ca, mức lương và địa điểm cụ thể</span>
              </li>
              <li className="flex items-center text-xs sm:text-sm text-slate-700">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 mr-2 shrink-0" />
                <span>Hệ thống duyệt ứng viên và tự động kiểm soát số lượng slot</span>
              </li>
              <li className="flex items-center text-xs sm:text-sm text-slate-700">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 mr-2 shrink-0" />
                <span>Xây dựng uy tín qua hệ thống đánh giá của ứng viên</span>
              </li>
            </ul>
            <div className="pt-2">
              {user?.role === 'EMPLOYER' ? (
                <Link
                  to="/employer/jobs/create"
                  className="inline-flex items-center text-xs sm:text-sm font-bold text-[#0065c9] hover:underline"
                >
                  <span>Đăng tin tuyển dụng</span>
                  <ArrowRight className="w-4 h-4 ml-1" />
                </Link>
              ) : (
                <Link
                  to="/register"
                  className="inline-flex items-center text-xs sm:text-sm font-bold text-[#0065c9] hover:underline"
                >
                  <span>Đăng ký tài khoản tuyển dụng</span>
                  <ArrowRight className="w-4 h-4 ml-1" />
                </Link>
              )}
            </div>
          </div>
        </section>

        {/* Feature Highlights Banner */}
        <section className="bg-gradient-to-r from-[#0065c9] to-[#004b96] rounded-3xl p-8 sm:p-10 text-white shadow-md">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center md:text-left">
            <div className="flex flex-col items-center md:items-start space-y-2">
              <div className="p-3 bg-white/10 rounded-2xl w-fit">
                <ShieldCheck className="w-6 h-6 text-white" />
              </div>
              <h4 className="font-bold text-base">Thông tin xác thực</h4>
              <p className="text-xs text-blue-100">
                Tin tuyển dụng và thông tin doanh nghiệp được kiểm duyệt minh bạch, an toàn cho sinh viên.
              </p>
            </div>

            <div className="flex flex-col items-center md:items-start space-y-2">
              <div className="p-3 bg-white/10 rounded-2xl w-fit">
                <Clock className="w-6 h-6 text-white" />
              </div>
              <h4 className="font-bold text-base">Linh hoạt thời gian</h4>
              <p className="text-xs text-blue-100">
                Lọc theo ca làm việc, thời gian phù hợp với lịch học tập của sinh viên tại các trường.
              </p>
            </div>

            <div className="flex flex-col items-center md:items-start space-y-2">
              <div className="p-3 bg-white/10 rounded-2xl w-fit">
                <Award className="w-6 h-6 text-white" />
              </div>
              <h4 className="font-bold text-base">Đánh giá thực tế</h4>
              <p className="text-xs text-blue-100">
                Hệ thống đánh giá hai chiều giúp cả sinh viên và nhà tuyển dụng xây dựng uy tín lâu dài.
              </p>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 mt-16 py-8 text-center text-xs text-slate-500 bg-white">
        <div className="max-w-7xl mx-auto px-4 space-y-2">
          <p className="font-semibold text-slate-700">Nền tảng việc làm part-time cho sinh viên &copy; 2026</p>
          <p>Kết nối cơ hội, chắp cánh tương lai cho sinh viên Việt Nam.</p>
        </div>
      </footer>
    </div>
  );
};
