import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate, Link } from 'react-router-dom';
import { jobApi } from '../../api/jobs';
import { Category, SalaryUnit } from '../../types/job';
import { Navbar } from '../../components/layout/Navbar';
import { 
  PlusCircle, 
  Briefcase, 
  MapPin, 
  DollarSign, 
  Calendar, 
  Users, 
  Clock, 
  FileText, 
  ArrowLeft, 
  Loader2, 
  AlertCircle 
} from 'lucide-react';

const createJobFormSchema = z
  .object({
    title: z.string().min(3, 'Tiêu đề công việc phải có ít nhất 3 ký tự'),
    categoryId: z.string().min(1, 'Vui lòng chọn ngành nghề công việc'),
    description: z.string().min(10, 'Mô tả công việc phải có ít nhất 10 ký tự'),
    workTime: z.string().min(2, 'Vui lòng nhập thời gian làm việc (ví dụ: Ca 4h/ngày)'),
    salaryMin: z.coerce.number().int().min(0, 'Mức lương tối thiểu không được âm'),
    salaryMax: z.coerce.number().int().min(0).optional().nullable(),
    salaryUnit: z.enum(['HOUR', 'DAY', 'MONTH', 'JOB'] as const),
    location: z.string().min(2, 'Vui lòng nhập địa chỉ cụ thể'),
    city: z.string().min(2, 'Vui lòng chọn hoặc nhập Tỉnh/Thành phố'),
    slots: z.coerce.number().int().min(1, 'Số lượng cần tuyển tối thiểu là 1'),
    deadline: z.string().min(1, 'Vui lòng chọn hạn nộp hồ sơ'),
    status: z.enum(['DRAFT', 'OPEN'] as const),
  })
  .refine(
    (data) => {
      if (data.salaryMax !== undefined && data.salaryMax !== null && data.salaryMax > 0) {
        return data.salaryMax >= data.salaryMin;
      }
      return true;
    },
    {
      message: 'Mức lương tối đa phải lớn hơn hoặc bằng mức lương tối thiểu',
      path: ['salaryMax'],
    }
  );

type CreateJobFormValues = z.infer<typeof createJobFormSchema>;

export const CreateJobPage: React.FC = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Default future deadline (30 days from now)
  const defaultDeadline = new Date();
  defaultDeadline.setDate(defaultDeadline.getDate() + 30);
  const defaultDeadlineString = defaultDeadline.toISOString().split('T')[0];

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateJobFormValues>({
    resolver: zodResolver(createJobFormSchema),
    defaultValues: {
      title: '',
      categoryId: '',
      description: '',
      workTime: '',
      salaryMin: 25000,
      salaryMax: null,
      salaryUnit: 'HOUR',
      location: '',
      city: 'TP. Hồ Chí Minh',
      slots: 1,
      deadline: defaultDeadlineString,
      status: 'OPEN',
    },
  });

  useEffect(() => {
    const fetchCats = async () => {
      try {
        setIsLoadingCategories(true);
        const data = await jobApi.getCategories();
        setCategories(data);
      } catch (err) {
        console.error('Error fetching categories:', err);
      } finally {
        setIsLoadingCategories(false);
      }
    };
    fetchCats();
  }, []);

  const onSubmit = async (values: CreateJobFormValues) => {
    try {
      setIsSubmitting(true);
      setErrorMessage(null);

      await jobApi.createJob({
        title: values.title,
        description: values.description,
        categoryId: values.categoryId,
        workTime: values.workTime,
        salaryMin: Number(values.salaryMin),
        salaryMax: values.salaryMax ? Number(values.salaryMax) : null,
        salaryUnit: values.salaryUnit as SalaryUnit,
        location: values.location,
        city: values.city,
        slots: Number(values.slots),
        deadline: new Date(values.deadline).toISOString(),
        status: values.status,
      });

      navigate('/employer/jobs');
    } catch (err: any) {
      setErrorMessage(err.response?.data?.error?.message || 'Không thể đăng tin việc làm. Vui lòng kiểm tra lại.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      <Navbar />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Breadcrumb & Navigation */}
        <div className="flex items-center justify-between">
          <Link
            to="/employer/jobs"
            className="inline-flex items-center text-xs font-bold text-slate-500 hover:text-[#0065c9] transition"
          >
            <ArrowLeft className="w-4 h-4 mr-1.5" />
            <span>Quay lại danh sách công việc</span>
          </Link>
        </div>

        {/* Page Header */}
        <div className="border-b border-slate-200 pb-5">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 flex items-center space-x-3">
            <span className="p-2 rounded-xl bg-blue-50 text-[#0065c9] border border-blue-100">
              <PlusCircle className="w-6 h-6" />
            </span>
            <span>Đăng tin Tuyển dụng Mới</span>
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Đăng thông tin công việc part-time chi tiết để tiếp cận hàng nghìn sinh viên năng động.
          </p>
        </div>

        {errorMessage && (
          <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-sm flex items-center space-x-2 animate-in fade-in">
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
            <span className="font-semibold">{errorMessage}</span>
          </div>
        )}

        {/* Form Container */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Title & Category */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="sm:col-span-2 space-y-1.5">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Tiêu đề việc làm *</label>
                <div className="relative">
                  <Briefcase className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
                  <input
                    type="text"
                    {...register('title')}
                    placeholder="Ví dụ: Nhân viên Phục vụ / Pha chế ca linh hoạt"
                    className={`w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 border ${
                      errors.title ? 'border-rose-500' : 'border-slate-200'
                    } text-slate-900 placeholder-slate-400 text-sm focus:bg-white focus:border-[#0065c9] focus:outline-none focus:ring-2 focus:ring-blue-100 transition`}
                  />
                </div>
                {errors.title && <p className="text-xs text-rose-600 mt-1">{errors.title.message}</p>}
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Ngành nghề *</label>
                <select
                  {...register('categoryId')}
                  disabled={isLoadingCategories}
                  className={`w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border ${
                    errors.categoryId ? 'border-rose-500' : 'border-slate-200'
                  } text-slate-900 text-sm focus:bg-white focus:border-[#0065c9] focus:outline-none transition`}
                >
                  <option value="">-- Chọn ngành nghề --</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
                {errors.categoryId && <p className="text-xs text-rose-600 mt-1">{errors.categoryId.message}</p>}
              </div>
            </div>

            {/* Description */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Mô tả chi tiết công việc *</label>
              <div className="relative">
                <FileText className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
                <textarea
                  rows={5}
                  {...register('description')}
                  placeholder="Mô tả các nhiệm vụ chính, yêu cầu kỹ năng, quyền lợi và môi trường làm việc..."
                  className={`w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 border ${
                    errors.description ? 'border-rose-500' : 'border-slate-200'
                  } text-slate-900 placeholder-slate-400 text-sm focus:bg-white focus:border-[#0065c9] focus:outline-none focus:ring-2 focus:ring-blue-100 transition resize-none`}
                ></textarea>
              </div>
              {errors.description && <p className="text-xs text-rose-600 mt-1">{errors.description.message}</p>}
            </div>

            {/* Work Time & Slots */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="sm:col-span-2 space-y-1.5">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Thời gian làm việc *</label>
                <div className="relative">
                  <Clock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
                  <input
                    type="text"
                    {...register('workTime')}
                    placeholder="Ví dụ: Ca sáng 8h-12h hoặc Ca tối 18h-22h (xoay ca)"
                    className={`w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 border ${
                      errors.workTime ? 'border-rose-500' : 'border-slate-200'
                    } text-slate-900 placeholder-slate-400 text-sm focus:bg-white focus:border-[#0065c9] focus:outline-none transition`}
                  />
                </div>
                {errors.workTime && <p className="text-xs text-rose-600 mt-1">{errors.workTime.message}</p>}
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Số lượng cần tuyển (Slots) *</label>
                <div className="relative">
                  <Users className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
                  <input
                    type="number"
                    min={1}
                    {...register('slots')}
                    className={`w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 border ${
                      errors.slots ? 'border-rose-500' : 'border-slate-200'
                    } text-slate-900 text-sm focus:bg-white focus:border-[#0065c9] focus:outline-none transition`}
                  />
                </div>
                {errors.slots && <p className="text-xs text-rose-600 mt-1">{errors.slots.message}</p>}
              </div>
            </div>

            {/* Salary Configuration */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 rounded-xl bg-slate-50/80 border border-slate-200">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Lương tối thiểu (VNĐ) *</label>
                <div className="relative">
                  <DollarSign className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
                  <input
                    type="number"
                    step={1000}
                    {...register('salaryMin')}
                    placeholder="25000"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-900 text-sm focus:border-[#0065c9] focus:outline-none transition"
                  />
                </div>
                {errors.salaryMin && <p className="text-xs text-rose-600 mt-1">{errors.salaryMin.message}</p>}
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Lương tối đa (tùy chọn)</label>
                <div className="relative">
                  <DollarSign className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
                  <input
                    type="number"
                    step={1000}
                    {...register('salaryMax')}
                    placeholder="35000"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-900 text-sm focus:border-[#0065c9] focus:outline-none transition"
                  />
                </div>
                {errors.salaryMax && <p className="text-xs text-rose-600 mt-1">{errors.salaryMax.message}</p>}
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Tính theo đơn vị *</label>
                <select
                  {...register('salaryUnit')}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-900 text-sm focus:border-[#0065c9] focus:outline-none transition"
                >
                  <option value="HOUR">/ Giờ (HOUR)</option>
                  <option value="DAY">/ Ngày (DAY)</option>
                  <option value="MONTH">/ Tháng (MONTH)</option>
                  <option value="JOB">/ Trọn gói công việc (JOB)</option>
                </select>
              </div>
            </div>

            {/* Location & City */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="sm:col-span-2 space-y-1.5">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Địa chỉ làm việc cụ thể *</label>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
                  <input
                    type="text"
                    {...register('location')}
                    placeholder="Ví dụ: 123 Đường Nguyễn Huệ, Phường Bến Nghé, Quận 1"
                    className={`w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 border ${
                      errors.location ? 'border-rose-500' : 'border-slate-200'
                    } text-slate-900 placeholder-slate-400 text-sm focus:bg-white focus:border-[#0065c9] focus:outline-none transition`}
                  />
                </div>
                {errors.location && <p className="text-xs text-rose-600 mt-1">{errors.location.message}</p>}
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Tỉnh / Thành phố *</label>
                <input
                  type="text"
                  {...register('city')}
                  placeholder="TP. Hồ Chí Minh"
                  className={`w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border ${
                    errors.city ? 'border-rose-500' : 'border-slate-200'
                  } text-slate-900 text-sm focus:bg-white focus:border-[#0065c9] focus:outline-none transition`}
                />
                {errors.city && <p className="text-xs text-rose-600 mt-1">{errors.city.message}</p>}
              </div>
            </div>

            {/* Deadline & Initial Status */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Hạn chót nhận hồ sơ *</label>
                <div className="relative">
                  <Calendar className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
                  <input
                    type="date"
                    {...register('deadline')}
                    className={`w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 border ${
                      errors.deadline ? 'border-rose-500' : 'border-slate-200'
                    } text-slate-900 text-sm focus:bg-white focus:border-[#0065c9] focus:outline-none transition`}
                  />
                </div>
                {errors.deadline && <p className="text-xs text-rose-600 mt-1">{errors.deadline.message}</p>}
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Trạng thái đăng *</label>
                <select
                  {...register('status')}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm focus:bg-white focus:border-[#0065c9] focus:outline-none transition"
                >
                  <option value="OPEN">Công khai ngay (OPEN - Đang tuyển)</option>
                  <option value="DRAFT">Lưu bản nháp (DRAFT - Chưa công khai)</option>
                </select>
              </div>
            </div>

            {/* Actions */}
            <div className="pt-6 border-t border-slate-100 flex items-center justify-end space-x-3">
              <Link
                to="/employer/jobs"
                className="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-sm transition"
              >
                Hủy bỏ
              </Link>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-2.5 rounded-xl bg-[#0065c9] hover:bg-[#0054a6] text-white font-bold text-sm transition shadow-md shadow-blue-500/20 flex items-center space-x-2 disabled:opacity-50 active:scale-95"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Đang đăng tin...</span>
                  </>
                ) : (
                  <>
                    <PlusCircle className="w-4 h-4" />
                    <span>Đăng tin tuyển dụng</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
};
