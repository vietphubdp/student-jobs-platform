import React from 'react';
import { Category } from '../../types/job';
import { Search, MapPin, Briefcase, DollarSign, ArrowUpDown, RotateCcw } from 'lucide-react';

interface JobFilterProps {
  categories: Category[];
  filters: {
    q: string;
    category: string;
    city: string;
    salaryMin: string;
    sort: string;
  };
  onFilterChange: (key: string, value: string) => void;
  onResetFilters: () => void;
}

export const JobFilter: React.FC<JobFilterProps> = ({
  categories,
  filters,
  onFilterChange,
  onResetFilters,
}) => {
  const cities = [
    'Tất cả địa điểm',
    'TP. Hồ Chí Minh',
    'Hà Nội',
    'Đà Nẵng',
    'Cần Thơ',
    'Hải Phòng',
    'Bình Dương',
    'Đồng Nai',
    'Toàn quốc',
  ];

  const hasActiveFilters =
    filters.q !== '' ||
    filters.category !== '' ||
    filters.city !== '' ||
    filters.salaryMin !== '' ||
    filters.sort !== 'newest';

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
          <Search className="w-4 h-4 text-[#0065c9]" />
          <span>Bộ lọc tìm kiếm việc làm</span>
        </h3>

        {hasActiveFilters && (
          <button
            type="button"
            onClick={onResetFilters}
            className="text-xs font-bold text-slate-500 hover:text-rose-600 flex items-center space-x-1 transition"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Đặt lại</span>
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        {/* Keyword Search */}
        <div className="space-y-1">
          <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">Từ khóa</label>
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
            <input
              type="text"
              value={filters.q}
              onChange={(e) => onFilterChange('q', e.target.value)}
              placeholder="Tên việc, kỹ năng..."
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:bg-white focus:border-[#0065c9] focus:outline-none transition"
            />
          </div>
        </div>

        {/* Category Filter */}
        <div className="space-y-1">
          <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">Ngành nghề</label>
          <div className="relative">
            <Briefcase className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
            <select
              value={filters.category}
              onChange={(e) => onFilterChange('category', e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:bg-white focus:border-[#0065c9] focus:outline-none transition"
            >
              <option value="">Tất cả ngành nghề</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* City Filter */}
        <div className="space-y-1">
          <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">Tỉnh / Thành phố</label>
          <div className="relative">
            <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
            <select
              value={filters.city}
              onChange={(e) => onFilterChange('city', e.target.value === 'Tất cả địa điểm' ? '' : e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:bg-white focus:border-[#0065c9] focus:outline-none transition"
            >
              {cities.map((city) => (
                <option key={city} value={city === 'Tất cả địa điểm' ? '' : city}>
                  {city}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Min Salary Filter */}
        <div className="space-y-1">
          <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">Lương tối thiểu</label>
          <div className="relative">
            <DollarSign className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
            <select
              value={filters.salaryMin}
              onChange={(e) => onFilterChange('salaryMin', e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:bg-white focus:border-[#0065c9] focus:outline-none transition"
            >
              <option value="">Tất cả mức lương</option>
              <option value="20000">Từ 20.000đ/h</option>
              <option value="30000">Từ 30.000đ/h</option>
              <option value="100000">Từ 100.000đ/ngày</option>
              <option value="2000000">Từ 2.000.000đ/tháng</option>
            </select>
          </div>
        </div>

        {/* Sort By */}
        <div className="space-y-1">
          <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">Sắp xếp theo</label>
          <div className="relative">
            <ArrowUpDown className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
            <select
              value={filters.sort}
              onChange={(e) => onFilterChange('sort', e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:bg-white focus:border-[#0065c9] focus:outline-none transition font-semibold"
            >
              <option value="newest">Mới đăng nhất</option>
              <option value="salary_desc">Lương cao nhất</option>
              <option value="salary_asc">Lương thấp nhất</option>
              <option value="deadline">Hạn nộp gần nhất</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
};
