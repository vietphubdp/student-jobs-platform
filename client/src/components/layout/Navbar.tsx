import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { NotificationBell } from './NotificationBell';
import { 
  Briefcase, 
  LogOut, 
  ChevronDown, 
  Bell, 
  ShieldCheck, 
  LayoutDashboard,
  User as UserIcon,
  Building,
  Send,
  Menu,
  X,
  Home,
  PlusCircle,
  LogIn,
  UserPlus
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const location = useLocation();

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close sidebar on route change
  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  // Lock body scroll when sidebar is open
  useEffect(() => {
    if (sidebarOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [sidebarOpen]);

  const handleLogout = async () => {
    await logout();
    setDropdownOpen(false);
    setSidebarOpen(false);
    navigate('/login');
  };

  const getRoleBadge = (isWhiteBg = false) => {
    if (!user) return null;
    switch (user.role) {
      case 'ADMIN':
        return <span className={`px-2 py-0.5 text-[11px] font-bold rounded-full ${isWhiteBg ? 'bg-purple-100 text-purple-800' : 'bg-purple-100 text-purple-800'}`}>Admin</span>;
      case 'EMPLOYER':
        return <span className={`px-2 py-0.5 text-[11px] font-bold rounded-full ${isWhiteBg ? 'bg-blue-100 text-[#0065c9]' : 'bg-blue-100 text-[#0065c9]'}`}>Nhà tuyển dụng</span>;
      case 'STUDENT':
        return <span className={`px-2 py-0.5 text-[11px] font-bold rounded-full ${isWhiteBg ? 'bg-emerald-100 text-emerald-800' : 'bg-emerald-100 text-emerald-800'}`}>Sinh viên</span>;
    }
  };

  const getUserDisplayName = () => {
    if (!user) return '';
    if (user.role === 'STUDENT' && user.studentProfile?.fullName) {
      return user.studentProfile.fullName;
    }
    if (user.role === 'EMPLOYER' && user.employerProfile?.companyName) {
      return user.employerProfile.companyName;
    }
    if (user.role === 'ADMIN') return 'Quản trị viên';
    return user.email.split('@')[0];
  };

  return (
    <>
      <nav className="bg-[#0065c9] text-white shadow-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Left Section: Mobile Menu Icon or Desktop Logo */}
          <div className="flex items-center space-x-4 md:space-x-8">
            {/* Mobile Hamburger Button (Only on Mobile) */}
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              className="md:hidden p-2 rounded-xl bg-white/15 hover:bg-white/25 active:scale-95 transition text-white focus:outline-hidden"
              aria-label="Mở menu điều hướng"
            >
              <Menu className="w-6 h-6" />
            </button>

            {/* Desktop Logo (Hidden on Mobile) */}
            <Link to="/" className="hidden md:flex items-center space-x-3 group">
              <div className="w-10 h-10 rounded-xl bg-white text-[#0065c9] flex items-center justify-center shadow-md group-hover:scale-105 transition">
                <Briefcase className="w-5 h-5" />
              </div>
              <div className="flex flex-col">
                <span className="font-extrabold text-xl tracking-tight text-white">
                  StudentJobs
                </span>
              </div>
            </Link>

            {/* Desktop Navigation Links */}
            <div className="hidden md:flex items-center space-x-1 text-sm font-medium">
              <Link
                to="/"
                className={`px-3 py-2 rounded-lg transition ${
                  location.pathname === '/' ? 'text-white font-bold bg-white/20' : 'text-white/80 hover:text-white hover:bg-white/10'
                }`}
              >
                Trang chủ
              </Link>
              <Link
                to="/jobs"
                className={`px-3 py-2 rounded-lg transition ${
                  location.pathname.startsWith('/jobs') ? 'text-white font-bold bg-white/20' : 'text-white/80 hover:text-white hover:bg-white/10'
                }`}
              >
                Tìm việc làm
              </Link>

              {user?.role === 'STUDENT' && (
                <>
                  <Link
                    to="/student/dashboard"
                    className={`px-3 py-2 rounded-lg transition ${
                      location.pathname === '/student/dashboard' ? 'text-white font-bold bg-white/20' : 'text-white/80 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    Dashboard SV
                  </Link>
                  <Link
                    to="/student/applications"
                    className={`px-3 py-2 rounded-lg transition ${
                      location.pathname === '/student/applications' ? 'text-white font-bold bg-white/20' : 'text-white/80 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    Đơn ứng tuyển
                  </Link>
                  <Link
                    to="/student/profile"
                    className={`px-3 py-2 rounded-lg transition ${
                      location.pathname === '/student/profile' ? 'text-white font-bold bg-white/20' : 'text-white/80 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    Hồ sơ & CV
                  </Link>
                </>
              )}

              {user?.role === 'EMPLOYER' && (
                <>
                  <Link
                    to="/employer/dashboard"
                    className={`px-3 py-2 rounded-lg transition ${
                      location.pathname === '/employer/dashboard' ? 'text-white font-bold bg-white/20' : 'text-white/80 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    Dashboard
                  </Link>
                  <Link
                    to="/employer/jobs"
                    className={`px-3 py-2 rounded-lg transition ${
                      location.pathname === '/employer/jobs' ? 'text-white font-bold bg-white/20' : 'text-white/80 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    Job của tôi
                  </Link>
                  <Link
                    to="/employer/jobs/create"
                    className={`px-3 py-2 rounded-lg transition ${
                      location.pathname === '/employer/jobs/create' ? 'text-white font-bold bg-white/20' : 'text-white/80 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    Đăng tin mới
                  </Link>
                  <Link
                    to="/employer/profile"
                    className={`px-3 py-2 rounded-lg transition ${
                      location.pathname === '/employer/profile' ? 'text-white font-bold bg-white/20' : 'text-white/80 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    Hồ sơ công ty
                  </Link>
                </>
              )}

              {user?.role === 'ADMIN' && (
                <Link
                  to="/admin/dashboard"
                  className={`px-3 py-2 rounded-lg transition ${
                    location.pathname.startsWith('/admin') ? 'text-white font-bold bg-white/20' : 'text-white/80 hover:text-white hover:bg-white/10'
                  }`}
                >
                  Quản trị Admin
                </Link>
              )}
            </div>
          </div>

          {/* Right Section: User Dropdown / Notification / Login / Register */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            {isAuthenticated && user ? (
              <div className="flex items-center space-x-2 sm:space-x-3">
                {/* In-App Notification Bell */}
                <NotificationBell />

                {/* User Dropdown */}
                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                    className="flex items-center space-x-2 sm:space-x-3 p-1.5 sm:pl-3 rounded-xl bg-white/15 hover:bg-white/25 border border-white/20 transition text-white"
                  >
                    <div className="hidden sm:flex flex-col text-left">
                      <span className="text-xs font-bold leading-tight truncate max-w-[120px]">{getUserDisplayName()}</span>
                      <div className="mt-0.5">{getRoleBadge()}</div>
                    </div>
                    <div className="w-8 h-8 rounded-lg bg-white text-[#0065c9] flex items-center justify-center font-bold text-xs shadow-xs">
                      {getUserDisplayName().charAt(0).toUpperCase()}
                    </div>
                    <ChevronDown className="w-4 h-4 text-white/70 hidden sm:block" />
                  </button>

                  {/* Dropdown Menu */}
                  {dropdownOpen && (
                    <div className="absolute right-0 mt-2 w-60 bg-white border border-slate-200 rounded-2xl shadow-2xl py-2 z-50 text-slate-800 animate-in fade-in zoom-in-95 duration-100">
                      <div className="px-4 py-2 border-b border-slate-100">
                        <p className="text-[11px] text-slate-400">Đăng nhập với email:</p>
                        <p className="text-xs font-semibold text-slate-800 truncate">{user.email}</p>
                        <div className="mt-1 sm:hidden">{getRoleBadge(true)}</div>
                      </div>

                      <div className="py-1">
                        {user.role === 'STUDENT' && (
                          <>
                            <Link
                              to="/student/dashboard"
                              onClick={() => setDropdownOpen(false)}
                              className="flex items-center space-x-2 px-4 py-2 text-xs font-medium text-slate-700 hover:text-[#0065c9] hover:bg-blue-50"
                            >
                              <LayoutDashboard className="w-4 h-4 text-[#0065c9]" />
                              <span>Bảng điều khiển SV</span>
                            </Link>
                            <Link
                              to="/student/applications"
                              onClick={() => setDropdownOpen(false)}
                              className="flex items-center space-x-2 px-4 py-2 text-xs font-medium text-slate-700 hover:text-[#0065c9] hover:bg-blue-50"
                            >
                              <Send className="w-4 h-4 text-[#0065c9]" />
                              <span>Đơn ứng tuyển của tôi</span>
                            </Link>
                            <Link
                              to="/student/profile"
                              onClick={() => setDropdownOpen(false)}
                              className="flex items-center space-x-2 px-4 py-2 text-xs font-medium text-slate-700 hover:text-[#0065c9] hover:bg-blue-50"
                            >
                              <UserIcon className="w-4 h-4 text-[#0065c9]" />
                              <span>Hồ sơ cá nhân & CV</span>
                            </Link>
                          </>
                        )}

                        {user.role === 'EMPLOYER' && (
                          <>
                            <Link
                              to="/employer/dashboard"
                              onClick={() => setDropdownOpen(false)}
                              className="flex items-center space-x-2 px-4 py-2 text-xs font-medium text-slate-700 hover:text-[#0065c9] hover:bg-blue-50"
                            >
                              <LayoutDashboard className="w-4 h-4 text-[#0065c9]" />
                              <span>Bảng điều khiển NTD</span>
                            </Link>
                            <Link
                              to="/employer/jobs"
                              onClick={() => setDropdownOpen(false)}
                              className="flex items-center space-x-2 px-4 py-2 text-xs font-medium text-slate-700 hover:text-[#0065c9] hover:bg-blue-50"
                            >
                              <Briefcase className="w-4 h-4 text-[#0065c9]" />
                              <span>Job của tôi</span>
                            </Link>
                            <Link
                              to="/employer/jobs/create"
                              onClick={() => setDropdownOpen(false)}
                              className="flex items-center space-x-2 px-4 py-2 text-xs font-medium text-slate-700 hover:text-[#0065c9] hover:bg-blue-50"
                            >
                              <PlusCircle className="w-4 h-4 text-[#0065c9]" />
                              <span>Đăng tin mới</span>
                            </Link>
                            <Link
                              to="/employer/profile"
                              onClick={() => setDropdownOpen(false)}
                              className="flex items-center space-x-2 px-4 py-2 text-xs font-medium text-slate-700 hover:text-[#0065c9] hover:bg-blue-50"
                            >
                              <Building className="w-4 h-4 text-[#0065c9]" />
                              <span>Hồ sơ Doanh nghiệp</span>
                            </Link>
                          </>
                        )}

                        {user.role === 'ADMIN' && (
                          <Link
                            to="/admin/dashboard"
                            onClick={() => setDropdownOpen(false)}
                            className="flex items-center space-x-2 px-4 py-2 text-xs font-medium text-slate-700 hover:text-[#0065c9] hover:bg-blue-50"
                          >
                            <ShieldCheck className="w-4 h-4 text-purple-600" />
                            <span>Quản trị hệ thống</span>
                          </Link>
                        )}

                        <Link
                          to="/notifications"
                          onClick={() => setDropdownOpen(false)}
                          className="flex items-center space-x-2 px-4 py-2 text-xs font-medium text-slate-700 hover:text-[#0065c9] hover:bg-blue-50 border-t border-slate-100 mt-1 pt-2"
                        >
                          <Bell className="w-4 h-4 text-[#0065c9]" />
                          <span>Trung tâm thông báo</span>
                        </Link>
                      </div>

                      <div className="border-t border-slate-100 pt-1">
                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center space-x-2 px-4 py-2 text-xs font-medium text-rose-600 hover:bg-rose-50 transition"
                        >
                          <LogOut className="w-4 h-4" />
                          <span>Đăng xuất</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link
                  to="/login"
                  className="px-3 sm:px-4 py-2 text-xs sm:text-sm font-semibold text-white/90 hover:text-white hover:bg-white/10 rounded-xl transition"
                >
                  Đăng nhập
                </Link>
                <Link
                  to="/register"
                  className="px-3 sm:px-4 py-2 text-xs sm:text-sm font-bold rounded-xl bg-white text-[#0065c9] hover:bg-slate-100 transition shadow-xs active:scale-95"
                >
                  Đăng ký
                </Link>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* Mobile Sidebar (Drawer) */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
            onClick={() => setSidebarOpen(false)}
          />

          {/* Sidebar Panel */}
          <div className="relative w-72 max-w-[85vw] bg-white text-slate-800 h-full shadow-2xl flex flex-col z-50 animate-in slide-in-from-left duration-200">
            {/* Sidebar Header with Logo & Close Button */}
            <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <Link
                to="/"
                onClick={() => setSidebarOpen(false)}
                className="flex items-center space-x-2.5"
              >
                <div className="w-9 h-9 rounded-xl bg-[#0065c9] text-white flex items-center justify-center shadow-sm">
                  <Briefcase className="w-5 h-5" />
                </div>
                <span className="font-extrabold text-lg text-slate-900 tracking-tight">
                  Student<span className="text-[#0065c9]">Jobs</span>
                </span>
              </Link>

              <button
                type="button"
                onClick={() => setSidebarOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition"
                aria-label="Đóng menu"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* User Info Card (if logged in) */}
            {isAuthenticated && user && (
              <div className="p-4 bg-blue-50/70 border-b border-blue-100 flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-[#0065c9] text-white flex items-center justify-center font-bold text-sm shadow-xs shrink-0">
                  {getUserDisplayName().charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-bold text-slate-900 truncate">{getUserDisplayName()}</div>
                  <div className="text-xs text-slate-500 truncate">{user.email}</div>
                  <div className="mt-1">{getRoleBadge(true)}</div>
                </div>
              </div>
            )}

            {/* Sidebar Navigation Items */}
            <div className="flex-1 overflow-y-auto p-4 space-y-6">
              {/* General Links */}
              <div className="space-y-1">
                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-3 mb-1">Menu chính</div>
                <Link
                  to="/"
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center space-x-3 px-3 py-2.5 rounded-xl text-sm font-medium transition ${
                    location.pathname === '/' ? 'bg-blue-50 text-[#0065c9] font-bold' : 'text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <Home className="w-4 h-4 text-[#0065c9]" />
                  <span>Trang chủ</span>
                </Link>

                <Link
                  to="/jobs"
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center space-x-3 px-3 py-2.5 rounded-xl text-sm font-medium transition ${
                    location.pathname.startsWith('/jobs') ? 'bg-blue-50 text-[#0065c9] font-bold' : 'text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <Briefcase className="w-4 h-4 text-[#0065c9]" />
                  <span>Tìm việc làm</span>
                </Link>
              </div>

              {/* Student Role Items */}
              {user?.role === 'STUDENT' && (
                <div className="space-y-1">
                  <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-3 mb-1">Dành cho Sinh viên</div>
                  <Link
                    to="/student/dashboard"
                    onClick={() => setSidebarOpen(false)}
                    className={`flex items-center space-x-3 px-3 py-2.5 rounded-xl text-sm font-medium transition ${
                      location.pathname === '/student/dashboard' ? 'bg-blue-50 text-[#0065c9] font-bold' : 'text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <LayoutDashboard className="w-4 h-4 text-[#0065c9]" />
                    <span>Bảng điều khiển SV</span>
                  </Link>
                  <Link
                    to="/student/applications"
                    onClick={() => setSidebarOpen(false)}
                    className={`flex items-center space-x-3 px-3 py-2.5 rounded-xl text-sm font-medium transition ${
                      location.pathname === '/student/applications' ? 'bg-blue-50 text-[#0065c9] font-bold' : 'text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <Send className="w-4 h-4 text-[#0065c9]" />
                    <span>Đơn ứng tuyển của tôi</span>
                  </Link>
                  <Link
                    to="/student/profile"
                    onClick={() => setSidebarOpen(false)}
                    className={`flex items-center space-x-3 px-3 py-2.5 rounded-xl text-sm font-medium transition ${
                      location.pathname === '/student/profile' ? 'bg-blue-50 text-[#0065c9] font-bold' : 'text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <UserIcon className="w-4 h-4 text-[#0065c9]" />
                    <span>Hồ sơ cá nhân & CV</span>
                  </Link>
                </div>
              )}

              {/* Employer Role Items */}
              {user?.role === 'EMPLOYER' && (
                <div className="space-y-1">
                  <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-3 mb-1">Dành cho Nhà tuyển dụng</div>
                  <Link
                    to="/employer/dashboard"
                    onClick={() => setSidebarOpen(false)}
                    className={`flex items-center space-x-3 px-3 py-2.5 rounded-xl text-sm font-medium transition ${
                      location.pathname === '/employer/dashboard' ? 'bg-blue-50 text-[#0065c9] font-bold' : 'text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <LayoutDashboard className="w-4 h-4 text-[#0065c9]" />
                    <span>Bảng điều khiển NTD</span>
                  </Link>
                  <Link
                    to="/employer/jobs"
                    onClick={() => setSidebarOpen(false)}
                    className={`flex items-center space-x-3 px-3 py-2.5 rounded-xl text-sm font-medium transition ${
                      location.pathname === '/employer/jobs' ? 'bg-blue-50 text-[#0065c9] font-bold' : 'text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <Briefcase className="w-4 h-4 text-[#0065c9]" />
                    <span>Job của tôi</span>
                  </Link>
                  <Link
                    to="/employer/jobs/create"
                    onClick={() => setSidebarOpen(false)}
                    className={`flex items-center space-x-3 px-3 py-2.5 rounded-xl text-sm font-medium transition ${
                      location.pathname === '/employer/jobs/create' ? 'bg-blue-50 text-[#0065c9] font-bold' : 'text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <PlusCircle className="w-4 h-4 text-[#0065c9]" />
                    <span>Đăng tin tuyển dụng mới</span>
                  </Link>
                  <Link
                    to="/employer/profile"
                    onClick={() => setSidebarOpen(false)}
                    className={`flex items-center space-x-3 px-3 py-2.5 rounded-xl text-sm font-medium transition ${
                      location.pathname === '/employer/profile' ? 'bg-blue-50 text-[#0065c9] font-bold' : 'text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <Building className="w-4 h-4 text-[#0065c9]" />
                    <span>Hồ sơ Doanh nghiệp</span>
                  </Link>
                </div>
              )}

              {/* Admin Role Items */}
              {user?.role === 'ADMIN' && (
                <div className="space-y-1">
                  <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-3 mb-1">Quản trị Hệ thống</div>
                  <Link
                    to="/admin/dashboard"
                    onClick={() => setSidebarOpen(false)}
                    className={`flex items-center space-x-3 px-3 py-2.5 rounded-xl text-sm font-medium transition ${
                      location.pathname.startsWith('/admin') ? 'bg-purple-50 text-purple-700 font-bold' : 'text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <ShieldCheck className="w-4 h-4 text-purple-600" />
                    <span>Quản trị Admin</span>
                  </Link>
                </div>
              )}

              {/* Notifications Link (for logged in users) */}
              {isAuthenticated && (
                <div className="space-y-1">
                  <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-3 mb-1">Hệ thống</div>
                  <Link
                    to="/notifications"
                    onClick={() => setSidebarOpen(false)}
                    className={`flex items-center space-x-3 px-3 py-2.5 rounded-xl text-sm font-medium transition ${
                      location.pathname === '/notifications' ? 'bg-blue-50 text-[#0065c9] font-bold' : 'text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <Bell className="w-4 h-4 text-[#0065c9]" />
                    <span>Trung tâm thông báo</span>
                  </Link>
                </div>
              )}

              {/* Guest Authentication Links */}
              {!isAuthenticated && (
                <div className="space-y-2 pt-2 border-t border-slate-100">
                  <Link
                    to="/login"
                    onClick={() => setSidebarOpen(false)}
                    className="flex items-center justify-center space-x-2 w-full py-2.5 px-4 rounded-xl border border-slate-200 text-slate-700 font-bold text-sm hover:bg-slate-50 transition"
                  >
                    <LogIn className="w-4 h-4" />
                    <span>Đăng nhập</span>
                  </Link>
                  <Link
                    to="/register"
                    onClick={() => setSidebarOpen(false)}
                    className="flex items-center justify-center space-x-2 w-full py-2.5 px-4 rounded-xl bg-[#0065c9] text-white font-bold text-sm hover:bg-[#0054a6] transition shadow-xs"
                  >
                    <UserPlus className="w-4 h-4" />
                    <span>Đăng ký tài khoản</span>
                  </Link>
                </div>
              )}
            </div>

            {/* Sidebar Footer */}
            {isAuthenticated && (
              <div className="p-4 border-t border-slate-100 bg-slate-50">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center justify-center space-x-2 py-2.5 px-4 rounded-xl bg-rose-50 text-rose-600 font-bold text-sm hover:bg-rose-100 transition"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Đăng xuất</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};
