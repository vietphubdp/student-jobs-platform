import React from 'react';
import { Link } from 'react-router-dom';
import { Job } from '../../types/job';
import { 
  Building, 
  MapPin, 
  DollarSign, 
  Clock, 
  Calendar, 
  Users, 
  ShieldCheck, 
  ArrowRight 
} from 'lucide-react';

interface JobCardProps {
  job: Job;
}

export const JobCard: React.FC<JobCardProps> = ({ job }) => {
  const companyName = job.employer?.employerProfile?.companyName || 'Nhà tuyển dụng';
  const isVerified = job.employer?.employerProfile?.isVerified;

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

  return (
    <Link
      to={`/jobs/${job.id}`}
      className="bg-white border border-slate-200 hover:border-[#0065c9] hover:shadow-md rounded-2xl p-5 transition flex flex-col justify-between space-y-4 group"
    >
      <div className="space-y-3">
        {/* Category & Verified Badge */}
        <div className="flex items-center justify-between gap-2">
          {job.category && (
            <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-blue-50 text-[#0065c9] border border-blue-100">
              {job.category.name}
            </span>
          )}
          <span className="text-[11px] text-slate-400 font-medium">
            {job.city}
          </span>
        </div>

        {/* Title */}
        <h3 className="text-base font-bold text-slate-900 group-hover:text-[#0065c9] transition line-clamp-2 leading-snug">
          {job.title}
        </h3>

        {/* Company Name */}
        <div className="flex items-center space-x-1.5 text-xs text-slate-600">
          <Building className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <span className="font-semibold text-slate-700 truncate">{companyName}</span>
          {isVerified && (
            <span title="Đã xác thực">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            </span>
          )}
        </div>

        {/* Details Grid */}
        <div className="space-y-1.5 text-xs text-slate-500 pt-1">
          <div className="flex items-center space-x-1.5">
            <DollarSign className="w-3.5 h-3.5 text-[#0065c9] shrink-0" />
            <span className="font-bold text-[#0065c9]">
              {formatSalary(job.salaryMin, job.salaryMax, job.salaryUnit)}
            </span>
          </div>

          <div className="flex items-center space-x-1.5">
            <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span className="truncate">{job.workTime}</span>
          </div>

          <div className="flex items-center space-x-1.5">
            <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span className="truncate">{job.location}</span>
          </div>
        </div>
      </div>

      {/* Footer Meta */}
      <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
        <div className="flex items-center space-x-2">
          <span className="flex items-center text-slate-600">
            <Users className="w-3.5 h-3.5 mr-1 text-slate-400" />
            <span>Tuyển <strong>{job.slots}</strong> bạn</span>
          </span>
          <span>•</span>
          <span className="flex items-center text-slate-500">
            <Calendar className="w-3.5 h-3.5 mr-1 text-slate-400" />
            <span>Hạn: {new Date(job.deadline).toLocaleDateString('vi-VN')}</span>
          </span>
        </div>

        <span className="font-bold text-[#0065c9] flex items-center group-hover:translate-x-0.5 transition">
          <span>Chi tiết</span>
          <ArrowRight className="w-3.5 h-3.5 ml-1" />
        </span>
      </div>
    </Link>
  );
};
