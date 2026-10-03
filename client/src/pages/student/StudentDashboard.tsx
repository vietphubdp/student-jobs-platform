import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { Navbar } from '../../components/layout/Navbar';
import { 
  GraduationCap, 
  FileText, 
  Star, 
  User, 
  ArrowRight,
  UploadCloud,
  Briefcase
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const StudentDashboard: React.FC = () => {
  const { user } = useAuth();
  const profile = user?.studentProfile;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Welcome Banner */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-xs relative overflow-hidden">
          <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-2">
              <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold">
                <GraduationCap className="w-3.5 h-3.5" />
                <span>Không gian Sinh viên</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
                Xin chào, {profile?.fullName || user?.email}! 👋
              </h1>
              <p className="text-sm text-slate-600">
                {profile?.university ? `${profile.university} ${profile.major ? `• ${profile.major}` : ''}` : 'Tìm kiếm việc làm part-time linh hoạt phù hợp lịch học.'}
              </p>
            </div>

            <div className="flex items-center space-x-3">
              <Link
                to="/jobs"
                className="inline-flex items-center px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-sm font-bold transition active:scale-95 shadow-xs"
              >
                <Briefcase className="w-4 h-4 mr-2 text-[#0065c9]" />
                <span>Tìm việc làm</span>
              </Link>
              <Link
                to="/student/profile"
                className="inline-flex items-center px-5 py-2.5 rounded-xl bg-[#0065c9] hover:bg-[#0054a6] text-white text-sm font-bold transition shadow-md shadow-blue-500/20 active:scale-95"
              >
                <UploadCloud className="w-4 h-4 mr-2" />
                <span>Cập nhật CV & Hồ sơ</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Modules Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1: Profile & CV */}
          <Link
            to="/student/profile"
            className="bg-white border border-slate-200 hover:border-[#0065c9] hover:shadow-md rounded-2xl p-6 space-y-3 transition group flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="p-3 rounded-xl bg-blue-50 text-[#0065c9] group-hover:scale-105 transition">
                  <User className="w-6 h-6" />
                </div>
                <ArrowRight className="w-4 h-4 text-[#0065c9] opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition" />
              </div>
              <h3 className="text-base font-bold text-slate-900 group-hover:text-[#0065c9] transition">
                Hồ sơ cá nhân & CV
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Cập nhật kỹ năng, trường đại học và tải lên file CV PDF (&le;5MB) để tăng tỷ lệ được duyệt.
              </p>
            </div>
            <div className="pt-2 flex items-center text-xs font-bold text-[#0065c9]">
              <span>Cập nhật hồ sơ &rarr;</span>
            </div>
          </Link>

          {/* Card 2: Applications */}
          <Link
            to="/student/applications"
            className="bg-white border border-slate-200 hover:border-[#0065c9] hover:shadow-md rounded-2xl p-6 space-y-3 transition group flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="p-3 rounded-xl bg-emerald-50 text-emerald-600 group-hover:scale-105 transition">
                  <FileText className="w-6 h-6" />
                </div>
                <ArrowRight className="w-4 h-4 text-[#0065c9] opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition" />
              </div>
              <h3 className="text-base font-bold text-slate-900 group-hover:text-[#0065c9] transition">
                Đơn ứng tuyển của tôi
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Theo dõi tiến độ duyệt hồ sơ, xem phản hồi từ NTD hoặc thực hiện rút đơn ứng tuyển khi cần.
              </p>
            </div>
            <div className="pt-2 flex items-center text-xs font-bold text-[#0065c9]">
              <span>Xem danh sách đơn &rarr;</span>
            </div>
          </Link>

          {/* Card 3: Reviews */}
          <Link
            to="/student/applications"
            className="bg-white border border-slate-200 hover:border-[#0065c9] hover:shadow-md rounded-2xl p-6 space-y-3 transition group flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="p-3 rounded-xl bg-amber-50 text-amber-600 group-hover:scale-105 transition">
                  <Star className="w-6 h-6" />
                </div>
                <ArrowRight className="w-4 h-4 text-[#0065c9] opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition" />
              </div>
              <h3 className="text-base font-bold text-slate-900 group-hover:text-[#0065c9] transition">
                Đánh giá Nhà tuyển dụng
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Đánh giá sao và nhận xét môi trường làm việc đối với các công việc bạn đã hoàn thành.
              </p>
            </div>
            <div className="pt-2 flex items-center text-xs font-bold text-[#0065c9]">
              <span>Đến trang đánh giá &rarr;</span>
            </div>
          </Link>
        </div>

        {/* Profile Details Card */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4 shadow-xs">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <h2 className="text-lg font-bold text-slate-900 flex items-center space-x-2">
              <User className="w-5 h-5 text-[#0065c9]" />
              <span>Tóm tắt Hồ sơ Sinh viên</span>
            </h2>
            <Link to="/student/profile" className="text-xs font-bold text-[#0065c9] hover:underline">
              Chỉnh sửa
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">Email</span>
              <span className="font-semibold text-slate-900 truncate block">{user?.email}</span>
            </div>
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">Họ và tên</span>
              <span className="font-semibold text-slate-900">{profile?.fullName || 'Chưa cập nhật'}</span>
            </div>
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">Trường</span>
              <span className="font-semibold text-slate-900">{profile?.university || 'Chưa cập nhật'}</span>
            </div>
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">File CV</span>
              <span className="font-bold text-[#0065c9]">
                {profile?.cvUrl ? 'Đã tải lên' : 'Chưa có CV'}
              </span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};
