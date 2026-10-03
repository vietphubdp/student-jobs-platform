import React from 'react';
import { JobStatus } from '../../types/job';
import { ApplicationStatus } from '../../types/application';

type AnyStatus = JobStatus | ApplicationStatus | string;

interface StatusBadgeProps {
  status: AnyStatus;
  size?: 'sm' | 'md';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'md' }) => {
  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-[11px]' : 'px-2.5 py-1 text-xs';

  switch (status) {
    // Job statuses
    case 'OPEN':
      return (
        <span className={`inline-flex items-center font-bold rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 ${sizeClasses}`}>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1.5 animate-pulse"></span>
          Đang tuyển
        </span>
      );
    case 'FILLED':
      return (
        <span className={`inline-flex items-center font-bold rounded-full bg-blue-50 text-[#0065c9] border border-blue-200 ${sizeClasses}`}>
          <span className="w-1.5 h-1.5 rounded-full bg-[#0065c9] mr-1.5"></span>
          Đã đủ người
        </span>
      );
    case 'COMPLETED':
      return (
        <span className={`inline-flex items-center font-bold rounded-full bg-purple-50 text-purple-700 border border-purple-200 ${sizeClasses}`}>
          <span className="w-1.5 h-1.5 rounded-full bg-purple-500 mr-1.5"></span>
          Hoàn thành
        </span>
      );
    case 'CLOSED':
      return (
        <span className={`inline-flex items-center font-bold rounded-full bg-slate-100 text-slate-600 border border-slate-200 ${sizeClasses}`}>
          <span className="w-1.5 h-1.5 rounded-full bg-slate-400 mr-1.5"></span>
          Đã đóng
        </span>
      );
    case 'DRAFT':
      return (
        <span className={`inline-flex items-center font-bold rounded-full bg-amber-50 text-amber-700 border border-amber-200 ${sizeClasses}`}>
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mr-1.5"></span>
          Bản nháp
        </span>
      );

    // Application statuses
    case 'PENDING':
      return (
        <span className={`inline-flex items-center font-bold rounded-full bg-amber-50 text-amber-700 border border-amber-200 ${sizeClasses}`}>
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mr-1.5 animate-pulse"></span>
          Chờ xét duyệt
        </span>
      );
    case 'ACCEPTED':
      return (
        <span className={`inline-flex items-center font-bold rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 ${sizeClasses}`}>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1.5"></span>
          Được nhận (Accepted)
        </span>
      );
    case 'REJECTED':
      return (
        <span className={`inline-flex items-center font-bold rounded-full bg-rose-50 text-rose-700 border border-rose-200 ${sizeClasses}`}>
          <span className="w-1.5 h-1.5 rounded-full bg-rose-500 mr-1.5"></span>
          Đã từ chối
        </span>
      );
    case 'WITHDRAWN':
      return (
        <span className={`inline-flex items-center font-bold rounded-full bg-slate-100 text-slate-600 border border-slate-200 ${sizeClasses}`}>
          <span className="w-1.5 h-1.5 rounded-full bg-slate-400 mr-1.5"></span>
          Đã rút đơn
        </span>
      );

    default:
      return (
        <span className={`inline-flex items-center font-semibold rounded-full bg-slate-100 text-slate-700 ${sizeClasses}`}>
          {status}
        </span>
      );
  }
};
