import React from 'react';
import { Link } from 'react-router-dom';
import { Navbar } from '../components/layout/Navbar';
import { ShieldAlert, ArrowLeft, Home } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const UnauthorizedPage: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      <Navbar />

      <div className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8 py-16">
        <div className="max-w-md w-full text-center space-y-6 bg-white border border-slate-200 rounded-2xl p-8 shadow-sm">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-rose-50 border border-rose-200 text-rose-600">
            <ShieldAlert className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-rose-100 text-rose-700">
              Lỗi 403: Không có quyền truy cập
            </span>
            <h1 className="text-2xl font-extrabold text-slate-900">
              Bạn không thể truy cập trang này
            </h1>
            <p className="text-sm text-slate-500">
              Trang yêu cầu quyền hạn cao hơn vai trò hiện tại của bạn (<strong className="text-slate-800">{user?.role || 'Khách'}</strong>).
            </p>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              to="/"
              className="w-full sm:w-auto inline-flex items-center justify-center px-5 py-2.5 rounded-xl bg-[#0065c9] hover:bg-[#0054a6] text-white text-sm font-bold transition shadow-md shadow-blue-500/20 active:scale-95"
            >
              <Home className="w-4 h-4 mr-2" />
              <span>Về trang chủ</span>
            </Link>
            <button
              onClick={() => window.history.back()}
              className="w-full sm:w-auto inline-flex items-center justify-center px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-bold transition active:scale-95"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              <span>Quay lại</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
