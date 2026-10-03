import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Navbar } from '../../components/layout/Navbar';
import { 
  UserPlus, 
  Mail, 
  Lock, 
  Loader2, 
  AlertCircle, 
  GraduationCap, 
  Building,
  User,
  Phone,
  MapPin,
  BookOpen
} from 'lucide-react';
import { Role } from '../../types/auth';

const registerFormSchema = z
  .object({
    email: z.string().email('Email không đúng định dạng'),
    password: z.string().min(8, 'Mật khẩu phải có tối thiểu 8 ký tự'),
    confirmPassword: z.string().min(1, 'Vui lòng xác nhận mật khẩu'),
    role: z.enum(['STUDENT', 'EMPLOYER']),
    // Student fields
    fullName: z.string().optional(),
    university: z.string().optional(),
    major: z.string().optional(),
    // Employer fields
    companyName: z.string().optional(),
    phone: z.string().optional(),
    address: z.string().optional(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Mật khẩu xác nhận không khớp',
    path: ['confirmPassword'],
  })
  .refine(
    (data) => {
      if (data.role === 'STUDENT' && (!data.fullName || data.fullName.trim().length < 2)) {
        return false;
      }
      if (data.role === 'EMPLOYER' && (!data.companyName || data.companyName.trim().length < 2)) {
        return false;
      }
      return true;
    },
    {
      message: 'Vui lòng nhập họ và tên (Sinh viên) hoặc tên công ty/cơ sở (Nhà tuyển dụng)',
      path: ['fullName'],
    }
  );

type RegisterFormValues = z.infer<typeof registerFormSchema>;

export const RegisterPage: React.FC = () => {
  const { register: registerAuth } = useAuth();
  const navigate = useNavigate();
  const [selectedRole, setSelectedRole] = useState<Role>('STUDENT');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerFormSchema),
    defaultValues: {
      role: 'STUDENT',
      email: '',
      password: '',
      confirmPassword: '',
      fullName: '',
      university: '',
      major: '',
      companyName: '',
      phone: '',
      address: '',
    },
  });

  const handleRoleChange = (role: Role) => {
    setSelectedRole(role);
    setValue('role', role as 'STUDENT' | 'EMPLOYER');
  };

  const onSubmit = async (values: RegisterFormValues) => {
    try {
      setIsSubmitting(true);
      setErrorMessage(null);

      const user = await registerAuth({
        email: values.email,
        password: values.password,
        role: values.role as Role,
        fullName: values.fullName,
        university: values.university,
        major: values.major,
        companyName: values.companyName,
        phone: values.phone,
        address: values.address,
      });

      if (user.role === 'STUDENT') {
        navigate('/student/dashboard');
      } else {
        navigate('/employer/dashboard');
      }
    } catch (err: any) {
      const errorMsg =
        err.response?.data?.error?.message ||
        'Đăng ký tài khoản không thành công. Vui lòng thử lại.';
      setErrorMessage(errorMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      <Navbar />

      <div className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8 py-10">
        <div className="max-w-lg w-full space-y-6">
          {/* Header */}
          <div className="text-center space-y-2">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-blue-50 text-[#0065c9] mb-1 border border-blue-200 shadow-xs">
              <UserPlus className="w-6 h-6" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
              Tạo tài khoản mới
            </h1>
            <p className="text-sm text-slate-500">
              Gia nhập nền tảng việc làm thêm linh hoạt cho sinh viên
            </p>
          </div>

          {/* Form Card */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-sm">
            {/* Role Switcher */}
            <div className="mb-6">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-2">Bạn muốn tham gia với vai trò:</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => handleRoleChange('STUDENT')}
                  className={`p-3 rounded-xl border flex items-center justify-center space-x-2 transition ${
                    selectedRole === 'STUDENT'
                      ? 'bg-emerald-50 border-emerald-500 text-emerald-800 font-bold ring-2 ring-emerald-100'
                      : 'bg-slate-50 border-slate-200 text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <GraduationCap className="w-4 h-4 text-emerald-600" />
                  <span className="text-sm">Sinh viên tìm việc</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleRoleChange('EMPLOYER')}
                  className={`p-3 rounded-xl border flex items-center justify-center space-x-2 transition ${
                    selectedRole === 'EMPLOYER'
                      ? 'bg-blue-50 border-[#0065c9] text-[#0065c9] font-bold ring-2 ring-blue-100'
                      : 'bg-slate-50 border-slate-200 text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Building className="w-4 h-4 text-[#0065c9]" />
                  <span className="text-sm">Nhà tuyển dụng</span>
                </button>
              </div>
            </div>

            {errorMessage && (
              <div className="mb-5 p-3.5 rounded-xl bg-rose-50 border border-rose-200 flex items-start space-x-2 text-rose-700 text-sm">
                <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-rose-600" />
                <span>{errorMessage}</span>
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {/* Dynamic Role Fields */}
              {selectedRole === 'STUDENT' ? (
                <>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Họ và tên *</label>
                    <div className="relative">
                      <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
                      <input
                        type="text"
                        {...register('fullName')}
                        placeholder="Ví dụ: Nguyễn Văn A"
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 text-sm focus:bg-white focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-100 transition"
                      />
                    </div>
                    {errors.fullName && (
                      <p className="text-xs text-rose-600 mt-1">{errors.fullName.message}</p>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Trường đại học/CĐ</label>
                      <div className="relative">
                        <GraduationCap className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
                        <input
                          type="text"
                          {...register('university')}
                          placeholder="ĐH Bách Khoa"
                          className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 text-sm focus:bg-white focus:border-emerald-500 focus:outline-none transition"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Chuyên ngành</label>
                      <div className="relative">
                        <BookOpen className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
                        <input
                          type="text"
                          {...register('major')}
                          placeholder="Công nghệ thông tin"
                          className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 text-sm focus:bg-white focus:border-emerald-500 focus:outline-none transition"
                        />
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Tên công ty / Cửa hàng / Cá nhân *</label>
                    <div className="relative">
                      <Building className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
                      <input
                        type="text"
                        {...register('companyName')}
                        placeholder="Ví dụ: Chuỗi Cà phê The Lounge"
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 text-sm focus:bg-white focus:border-[#0065c9] focus:outline-none focus:ring-2 focus:ring-blue-100 transition"
                      />
                    </div>
                    {errors.companyName && (
                      <p className="text-xs text-rose-600 mt-1">{errors.companyName.message}</p>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Số điện thoại liên hệ</label>
                      <div className="relative">
                        <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
                        <input
                          type="text"
                          {...register('phone')}
                          placeholder="0912345678"
                          className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 text-sm focus:bg-white focus:border-[#0065c9] focus:outline-none transition"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Địa chỉ hoạt động</label>
                      <div className="relative">
                        <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
                        <input
                          type="text"
                          {...register('address')}
                          placeholder="Quận 1, TP.HCM"
                          className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 text-sm focus:bg-white focus:border-[#0065c9] focus:outline-none transition"
                        />
                      </div>
                    </div>
                  </div>
                </>
              )}

              {/* Email */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Email đăng nhập *</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
                  <input
                    type="email"
                    {...register('email')}
                    placeholder="email@example.com"
                    className={`w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 border ${
                      errors.email ? 'border-rose-500' : 'border-slate-200'
                    } text-slate-900 placeholder-slate-400 text-sm focus:bg-white focus:border-[#0065c9] focus:outline-none focus:ring-2 focus:ring-blue-100 transition`}
                  />
                </div>
                {errors.email && (
                  <p className="text-xs text-rose-600 mt-1">{errors.email.message}</p>
                )}
              </div>

              {/* Password & Confirm Password */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Mật khẩu (&ge;8 ký tự) *</label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
                    <input
                      type="password"
                      {...register('password')}
                      placeholder="••••••••"
                      className={`w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 border ${
                        errors.password ? 'border-rose-500' : 'border-slate-200'
                      } text-slate-900 placeholder-slate-400 text-sm focus:bg-white focus:border-[#0065c9] focus:outline-none focus:ring-2 focus:ring-blue-100 transition`}
                    />
                  </div>
                  {errors.password && (
                    <p className="text-xs text-rose-600 mt-1">{errors.password.message}</p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Xác nhận mật khẩu *</label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
                    <input
                      type="password"
                      {...register('confirmPassword')}
                      placeholder="••••••••"
                      className={`w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 border ${
                        errors.confirmPassword ? 'border-rose-500' : 'border-slate-200'
                      } text-slate-900 placeholder-slate-400 text-sm focus:bg-white focus:border-[#0065c9] focus:outline-none focus:ring-2 focus:ring-blue-100 transition`}
                    />
                  </div>
                  {errors.confirmPassword && (
                    <p className="text-xs text-rose-600 mt-1">{errors.confirmPassword.message}</p>
                  )}
                </div>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full mt-3 py-3 px-4 rounded-xl bg-[#0065c9] hover:bg-[#0054a6] text-white font-bold text-sm transition shadow-md shadow-blue-500/20 flex items-center justify-center space-x-2 disabled:opacity-50 active:scale-[0.99]"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Đang khởi tạo tài khoản...</span>
                  </>
                ) : (
                  <>
                    <UserPlus className="w-4 h-4" />
                    <span>Hoàn tất đăng ký</span>
                  </>
                )}
              </button>
            </form>

            {/* Login Link */}
            <div className="mt-5 text-center text-xs text-slate-500">
              Đã có tài khoản?{' '}
              <Link to="/login" className="text-[#0065c9] hover:underline font-bold">
                Đăng nhập
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
