import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { jobApi } from '../../api/jobs';
import { Job, Category } from '../../types/job';
import { Navbar } from '../../components/layout/Navbar';
import { JobCard } from '../../components/jobs/JobCard';
import { JobFilter } from '../../components/jobs/JobFilter';
import { Search, Loader2, Briefcase, ChevronLeft, ChevronRight } from 'lucide-react';

export const JobListPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  // Read filters from URL search params
  const q = searchParams.get('q') || '';
  const category = searchParams.get('category') || '';
  const city = searchParams.get('city') || '';
  const salaryMin = searchParams.get('salaryMin') || '';
  const sort = searchParams.get('sort') || 'newest';
  const page = parseInt(searchParams.get('page') || '1', 10);

  const [jobs, setJobs] = useState<Job[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [totalJobs, setTotalJobs] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(1);

  // Fetch categories once
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const cats = await jobApi.getCategories();
        setCategories(cats);
      } catch (err) {
        console.error('Failed to fetch categories:', err);
      }
    };
    fetchCategories();
  }, []);

  // Fetch jobs whenever URL search params change
  useEffect(() => {
    const fetchJobs = async () => {
      try {
        setIsLoading(true);
        const params: any = {
          page,
          limit: 12,
          sort,
        };
        if (q) params.q = q;
        if (category) params.category = category;
        if (city) params.city = city;
        if (salaryMin) params.salaryMin = parseInt(salaryMin, 10);

        const data = await jobApi.getPublicJobs(params);
        setJobs(data.jobs);
        setTotalJobs(data.pagination.total);
        setTotalPages(data.pagination.totalPages || 1);
      } catch (err) {
        console.error('Failed to fetch jobs:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchJobs();
  }, [q, category, city, salaryMin, sort, page]);

  // Handle filter changes by updating URL search params
  const handleFilterChange = (key: string, value: string) => {
    const newParams = new URLSearchParams(searchParams);
    if (value) {
      newParams.set(key, value);
    } else {
      newParams.delete(key);
    }
    newParams.set('page', '1'); // Reset to page 1 on filter change
    setSearchParams(newParams);
  };

  const handleResetFilters = () => {
    setSearchParams(new URLSearchParams());
  };

  const handlePageChange = (newPage: number) => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set('page', newPage.toString());
    setSearchParams(newParams);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 flex items-center space-x-3">
              <span className="p-2 rounded-xl bg-blue-50 text-[#0065c9] border border-blue-100">
                <Search className="w-6 h-6" />
              </span>
              <span>Khám phá Việc làm Part-time</span>
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Tìm kiếm công việc bán thời gian phù hợp với lịch học, kỹ năng và mức thu nhập mong muốn.
            </p>
          </div>

          <div className="text-sm text-slate-600 font-medium">
            Tìm thấy <strong className="text-[#0065c9] font-bold">{totalJobs}</strong> công việc phù hợp
          </div>
        </div>

        {/* Filter Section */}
        <JobFilter
          categories={categories}
          filters={{ q, category, city, salaryMin, sort }}
          onFilterChange={handleFilterChange}
          onResetFilters={handleResetFilters}
        />

        {/* Jobs Grid */}
        {isLoading ? (
          <div className="py-20 flex flex-col items-center justify-center space-y-3 text-slate-500">
            <Loader2 className="w-8 h-8 animate-spin text-[#0065c9]" />
            <p className="text-sm">Đang tải danh sách việc làm...</p>
          </div>
        ) : jobs.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center space-y-4 shadow-sm">
            <div className="w-16 h-16 rounded-2xl bg-blue-50 text-[#0065c9] flex items-center justify-center mx-auto">
              <Briefcase className="w-8 h-8" />
            </div>
            <div className="space-y-1">
              <h3 className="text-lg font-bold text-slate-900">Không tìm thấy việc làm phù hợp</h3>
              <p className="text-sm text-slate-500 max-w-md mx-auto">
                Thử điều chỉnh hoặc xóa bớt tiêu chí lọc tìm kiếm để xem nhiều công việc hơn.
              </p>
            </div>
            <button
              onClick={handleResetFilters}
              className="inline-flex items-center px-5 py-2.5 rounded-xl bg-[#0065c9] hover:bg-[#0054a6] text-white text-xs font-bold transition shadow-sm"
            >
              Đặt lại tất cả bộ lọc
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {jobs.map((job) => (
                <JobCard key={job.id} job={job} />
              ))}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center space-x-2 pt-6">
                <button
                  disabled={page <= 1}
                  onClick={() => handlePageChange(page - 1)}
                  className="px-4 py-2 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-40 flex items-center transition"
                >
                  <ChevronLeft className="w-4 h-4 mr-1" />
                  <span>Trang trước</span>
                </button>

                <div className="flex items-center space-x-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                    <button
                      key={p}
                      onClick={() => handlePageChange(p)}
                      className={`w-9 h-9 rounded-xl text-xs font-bold transition ${
                        p === page
                          ? 'bg-[#0065c9] text-white shadow-sm'
                          : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>

                <button
                  disabled={page >= totalPages}
                  onClick={() => handlePageChange(page + 1)}
                  className="px-4 py-2 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-40 flex items-center transition"
                >
                  <span>Trang sau</span>
                  <ChevronRight className="w-4 h-4 ml-1" />
                </button>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
};
