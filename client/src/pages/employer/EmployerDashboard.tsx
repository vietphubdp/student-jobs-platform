import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { Navbar } from '../../components/layout/Navbar';
import { 
  Building, 
  Briefcase, 
  Users, 
  PlusCircle, 
  Edit3,
  ArrowRight
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const EmployerDashboard: React.FC = () => {
  const { user } = useAuth();
  const profile = user?.employerProfile;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Welcome Header */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-xs relative overflow-hidden">
          <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-2">
              <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-blue-50 text-[#0065c9] border border-blue-200 text-xs font-bold">
                <Building className="w-3.5 h-3.5" />
                <span>Không gian Nhà tuyển dụng</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
                {profile?.companyName || user?.email}
              </h1>
              <p className="text-sm text-slate-600">
                {profile?.address || 'Quản lý tin tuyển dụng part-time và xét duyệt ứng viên sinh viên.'}
              </p>
            </div>

            <div className="flex items-center space-x-3">
              <Link
                to="/employer/jobs/create"
                className="inline-flex items-center px-5 py-2.5 rounded-xl bg-[#0065c9] hover:bg-[#0054a6] text-white text-sm font-bold transition shadow-md shadow-blue-500/20 active:scale-95"
              >
                <PlusCircle className="w-4 h-4 mr-2" />
                <span>Đăng tin tuyển dụng</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Modules Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Link
            to="/employer/jobs"
            className="bg-white border border-slate-200 hover:border-[#0065c9] hover:shadow-md rounded-2xl p-6 space-y-3 transition group flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="p-3 rounded-xl bg-blue-50 text-[#0065c9] group-hover:scale-105 transition">
                  <Briefcase className="w-6 h-6" />
                </div>
                <ArrowRight className="w-4 h-4 text-[#0065c9] opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition" />
              </div>
              <h3 className="text-base font-bold text-slate-900 group-hover:text-[#0065c9] transition">
                Quản lý Tin tuyển dụng
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Đăng tin, sửa tin, đóng tin và quản lý vòng đời OPEN &rarr; FILLED &rarr; COMPLETED.
              </p>
            </div>
            <div className="pt-2 flex items-center text-xs font-bold text-[#0065c9]">
              <span>Xem danh sách tin &rarr;</span>
            </div>
          </Link>

          <Link
            to="/employer/profile"
            className="bg-white border border-slate-200 hover:border-[#0065c9] hover:shadow-md rounded-2xl p-6 space-y-3 transition group flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="p-3 rounded-xl bg-indigo-50 text-indigo-600 group-hover:scale-105 transition">
                  <Building className="w-6 h-6" />
                </div>
                <ArrowRight className="w-4 h-4 text-[#0065c9] opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition" />
              </div>
              <h3 className="text-base font-bold text-slate-900 group-hover:text-[#0065c9] transition">
                Hồ sơ Doanh nghiệp
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Cập nhật thông tin giới thiệu, địa chỉ, số điện thoại và website công ty.
              </p>
            </div>
            <div className="pt-2 flex items-center text-xs font-bold text-[#0065c9]">
              <span>Cập nhật thông tin &rarr;</span>
            </div>
          </Link>

          <Link
            to="/employer/jobs"
            className="bg-white border border-slate-200 hover:border-[#0065c9] hover:shadow-md rounded-2xl p-6 space-y-3 transition group flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="p-3 rounded-xl bg-emerald-50 text-emerald-600 group-hover:scale-105 transition">
                  <Users className="w-6 h-6" />
                </div>
                <ArrowRight className="w-4 h-4 text-[#0065c9] opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition" />
              </div>
              <h3 className="text-base font-bold text-slate-900 group-hover:text-[#0065c9] transition">
                Duyệt Đơn & Khóa Slot
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Xem hồ sơ ứng viên sinh viên, duyệt hoặc từ chối đơn theo từng công việc đã đăng.
              </p>
            </div>
            <div className="pt-2 flex items-center text-xs font-bold text-[#0065c9]">
              <span>Quản lý ứng viên &rarr;</span>
            </div>
          </Link>
        </div>

        {/* Company Info Card */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4 shadow-xs">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <h2 className="text-lg font-bold text-slate-900 flex items-center space-x-2">
              <Building className="w-5 h-5 text-[#0065c9]" />
              <span>Tóm tắt Hồ sơ Doanh nghiệp</span>
            </h2>
            <Link to="/employer/profile" className="text-xs font-bold text-[#0065c9] hover:underline flex items-center">
              <Edit3 className="w-3.5 h-3.5 mr-1" />
              <span>Chỉnh sửa</span>
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">Email liên hệ</span>
              <span className="font-semibold text-slate-900 truncate block">{user?.email}</span>
            </div>
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">Tên đơn vị</span>
              <span className="font-semibold text-slate-900">{profile?.companyName || 'Chưa cập nhật'}</span>
            </div>
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">Số điện thoại</span>
              <span className="font-semibold text-slate-900">{profile?.phone || 'Chưa cập nhật'}</span>
            </div>
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">Xác thực</span>
              <span className="font-bold text-emerald-600">
                {profile?.isVerified ? 'Đã xác thực' : 'Chưa xác thực'}
              </span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};
