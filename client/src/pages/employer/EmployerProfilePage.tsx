import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { profileApi } from '../../api/profile';
import { Navbar } from '../../components/layout/Navbar';
import { 
  Building, 
  MapPin, 
  Phone, 
  Globe, 
  FileText, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  Save,
  ShieldCheck,
  ExternalLink
} from 'lucide-react';

export const EmployerProfilePage: React.FC = () => {
  const { user, refetchUser } = useAuth();
  const profile = user?.employerProfile;

  const [companyName, setCompanyName] = useState('');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [website, setWebsite] = useState('');
  const [description, setDescription] = useState('');

  const [isSaving, setIsSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (profile) {
      setCompanyName(profile.companyName || '');
      setAddress(profile.address || '');
      setPhone(profile.phone || '');
      setWebsite(profile.website || '');
      setDescription(profile.description || '');
    }
  }, [profile]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSaving(true);
      setErrorMessage(null);
      await profileApi.updateProfile({
        companyName,
        address,
        phone,
        website: website.trim() ? website.trim() : null,
        description,
      });
      await refetchUser();
      setSuccessMessage('Cập nhật hồ sơ nhà tuyển dụng thành công!');
      setTimeout(() => setSuccessMessage(null), 4000);
    } catch (err: any) {
      setErrorMessage(err.response?.data?.error?.message || 'Cập nhật thông tin thất bại.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      <Navbar />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 flex items-center space-x-3">
              <span className="p-2 rounded-xl bg-blue-50 text-[#0065c9] border border-blue-100">
                <Building className="w-6 h-6" />
              </span>
              <span>Hồ sơ Doanh nghiệp & Nhà tuyển dụng</span>
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Cung cấp đầy đủ thông tin để tạo niềm tin và thu hút nhiều ứng viên sinh viên chất lượng.
            </p>
          </div>

          <div className="flex items-center space-x-3">
            {profile?.isVerified ? (
              <span className="inline-flex items-center px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold">
                <ShieldCheck className="w-4 h-4 mr-1 text-emerald-600" />
                <span>Doanh nghiệp đã xác thực</span>
              </span>
            ) : (
              <span className="inline-flex items-center px-3 py-1.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200 text-xs font-semibold">
                <span>Chờ xác thực</span>
              </span>
            )}

            {user?.id && (
              <Link
                to={`/users/${user.id}`}
                className="inline-flex items-center px-3.5 py-1.5 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold transition shadow-2xs space-x-1.5"
              >
                <ExternalLink className="w-3.5 h-3.5 text-[#0065c9]" />
                <span>Trang công khai & Đánh giá</span>
              </Link>
            )}
          </div>
        </div>

        {/* Notifications */}
        {successMessage && (
          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm flex items-center space-x-2 animate-in fade-in">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span className="font-semibold">{successMessage}</span>
          </div>
        )}

        {errorMessage && (
          <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-sm flex items-center space-x-2 animate-in fade-in">
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
            <span className="font-semibold">{errorMessage}</span>
          </div>
        )}

        {/* Form Container */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
          <form onSubmit={handleSaveProfile} className="space-y-5">
            {/* Company name */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Tên công ty / Cơ sở / Cá nhân *</label>
              <div className="relative">
                <Building className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  required
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="Công ty TNHH Cà phê & Trà Sữa"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm focus:bg-white focus:border-[#0065c9] focus:ring-2 focus:ring-blue-100 outline-none transition"
                />
              </div>
            </div>

            {/* Email (Readonly) */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Email liên hệ tài khoản</label>
              <input
                type="email"
                disabled
                value={user?.email || ''}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-100 border border-slate-200 text-slate-500 text-sm cursor-not-allowed"
              />
            </div>

            {/* Phone & Website */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Số điện thoại liên hệ</label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="0901234567"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm focus:bg-white focus:border-[#0065c9] focus:ring-2 focus:ring-blue-100 outline-none transition"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Trang web / Fanpage (nếu có)</label>
                <div className="relative">
                  <Globe className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="url"
                    value={website}
                    onChange={(e) => setWebsite(e.target.value)}
                    placeholder="https://example.com"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm focus:bg-white focus:border-[#0065c9] focus:ring-2 focus:ring-blue-100 outline-none transition"
                  />
                </div>
              </div>
            </div>

            {/* Address */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Địa chỉ trụ sở / Nơi làm việc</label>
              <div className="relative">
                <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Số 123 Đường Nguyễn Huệ, Phường Bến Nghé, Quận 1, TP.HCM"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm focus:bg-white focus:border-[#0065c9] focus:ring-2 focus:ring-blue-100 outline-none transition"
                />
              </div>
            </div>

            {/* Description */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Giới thiệu về doanh nghiệp / môi trường làm việc</label>
              <div className="relative">
                <FileText className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <textarea
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Mô tả ngành nghề kinh doanh, văn hóa doanh nghiệp, các chế độ đãi ngộ hoặc môi trường làm việc thân thiện với sinh viên..."
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm focus:bg-white focus:border-[#0065c9] focus:ring-2 focus:ring-blue-100 outline-none transition resize-none"
                ></textarea>
              </div>
            </div>

            {/* Submit */}
            <div className="pt-4 border-t border-slate-100">
              <button
                type="submit"
                disabled={isSaving}
                className="px-6 py-2.5 rounded-xl bg-[#0065c9] hover:bg-[#0054a6] text-white font-bold text-sm transition shadow-md shadow-blue-500/20 flex items-center space-x-2 disabled:opacity-50 active:scale-95"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Đang lưu...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    <span>Lưu thông tin công ty</span>
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
