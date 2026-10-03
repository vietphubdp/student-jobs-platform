import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Navbar } from '../../components/layout/Navbar';
import { 
  LogIn, 
  Mail, 
  Lock, 
  Loader2, 
  AlertCircle, 
  Sparkles,
  ShieldCheck,
  Building,
  GraduationCap
} from 'lucide-react';

const loginFormSchema = z.object({
  email: z.string().email('Email không đúng định dạng'),
  password: z.string().min(1, 'Vui lòng nhập mật khẩu'),
});

type LoginFormValues = z.infer<typeof loginFormSchema>;

export const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as any)?.from?.pathname || '/';

  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginFormSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (values: LoginFormValues) => {
    try {
      setIsSubmitting(true);
      setErrorMessage(null);
      const user = await login(values);
      
      // Smart redirect based on role if coming from root
      if (from === '/') {
        if (user.role === 'ADMIN') navigate('/admin/dashboard');
        else if (user.role === 'EMPLOYER') navigate('/employer/dashboard');
        else if (user.role === 'STUDENT') navigate('/student/dashboard');
        else navigate('/');
      } else {
        navigate(from, { replace: true });
      }
    } catch (err: any) {
      const errorMsg =
        err.response?.data?.error?.message ||
        'Đăng nhập không thành công. Vui lòng kiểm tra lại email hoặc mật khẩu.';
      setErrorMessage(errorMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleQuickLogin = (email: string, pass: string) => {
    setValue('email', email);
    setValue('password', pass);
    onSubmit({ email, password: pass });
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      <Navbar />

      <div className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8 py-12">
        <div className="max-w-md w-full space-y-6">
          {/* Header */}
          <div className="text-center space-y-2">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-blue-50 text-[#0065c9] mb-1 border border-blue-200 shadow-xs">
              <LogIn className="w-6 h-6" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
              Đăng nhập tài khoản
            </h1>
            <p className="text-sm text-slate-500">
              Chào mừng bạn quay trở lại với nền tảng StudentJobs
            </p>
          </div>

          {/* Form Card */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-sm">
            {errorMessage && (
              <div className="mb-5 p-3.5 rounded-xl bg-rose-50 border border-rose-200 flex items-start space-x-2 text-rose-700 text-sm">
                <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-rose-600" />
                <span>{errorMessage}</span>
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {/* Email */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Email đăng nhập</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
                  <input
                    type="email"
                    {...register('email')}
                    placeholder="name@example.com"
                    className={`w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 border ${
                      errors.email ? 'border-rose-500 focus:ring-rose-200' : 'border-slate-200 focus:border-[#0065c9] focus:ring-blue-100'
                    } text-slate-900 placeholder-slate-400 text-sm focus:bg-white focus:outline-none focus:ring-2 transition`}
                  />
                </div>
                {errors.email && (
                  <p className="text-xs text-rose-600 mt-1 font-medium">{errors.email.message}</p>
                )}
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Mật khẩu</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
                  <input
                    type="password"
                    {...register('password')}
                    placeholder="••••••••"
                    className={`w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 border ${
                      errors.password ? 'border-rose-500 focus:ring-rose-200' : 'border-slate-200 focus:border-[#0065c9] focus:ring-blue-100'
                    } text-slate-900 placeholder-slate-400 text-sm focus:bg-white focus:outline-none focus:ring-2 transition`}
                  />
                </div>
                {errors.password && (
                  <p className="text-xs text-rose-600 mt-1 font-medium">{errors.password.message}</p>
                )}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full mt-2 py-3 px-4 rounded-xl bg-[#0065c9] hover:bg-[#0054a6] text-white font-bold text-sm transition shadow-md shadow-blue-500/20 flex items-center justify-center space-x-2 disabled:opacity-50 active:scale-[0.99]"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Đang xác thực...</span>
                  </>
                ) : (
                  <>
                    <LogIn className="w-4 h-4" />
                    <span>Đăng nhập</span>
                  </>
                )}
              </button>
            </form>

            {/* Quick Login */}
            <div className="mt-6 pt-5 border-t border-slate-100">
              <div className="flex items-center justify-center space-x-1 text-xs font-semibold text-slate-500 mb-3">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>Đăng nhập nhanh (Tài khoản mẫu):</span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => handleQuickLogin('admin@studentjobs.vn', 'Admin@123456')}
                  className="p-2.5 rounded-xl bg-purple-50 hover:bg-purple-100 border border-purple-200 text-purple-700 text-xs font-bold flex flex-col items-center transition active:scale-95"
                >
                  <ShieldCheck className="w-4 h-4 mb-0.5" />
                  <span>Admin</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickLogin('employer@demo.com', 'Employer@123456')}
                  className="p-2.5 rounded-xl bg-blue-50 hover:bg-blue-100 border border-blue-200 text-[#0065c9] text-xs font-bold flex flex-col items-center transition active:scale-95"
                >
                  <Building className="w-4 h-4 mb-0.5" />
                  <span>Nhà tuyển dụng</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickLogin('student@demo.com', 'Student@123456')}
                  className="p-2.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-700 text-xs font-bold flex flex-col items-center transition active:scale-95"
                >
                  <GraduationCap className="w-4 h-4 mb-0.5" />
                  <span>Sinh viên</span>
                </button>
              </div>
            </div>

            {/* Register Link */}
            <div className="mt-5 text-center text-xs text-slate-500">
              Chưa có tài khoản?{' '}
              <Link to="/register" className="text-[#0065c9] hover:underline font-bold">
                Đăng ký ngay
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
