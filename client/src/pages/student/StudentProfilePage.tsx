import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { profileApi } from '../../api/profile';
import { Navbar } from '../../components/layout/Navbar';
import { 
  User, 
  GraduationCap, 
  BookOpen, 
  Phone, 
  FileText, 
  UploadCloud, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  Plus, 
  X, 
  ExternalLink, 
  Save 
} from 'lucide-react';

export const StudentProfilePage: React.FC = () => {
  const { user, refetchUser } = useAuth();
  const profile = user?.studentProfile;

  // Form states
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [university, setUniversity] = useState('');
  const [major, setMajor] = useState('');
  const [bio, setBio] = useState('');
  const [skills, setSkills] = useState<string[]>([]);
  const [newSkillInput, setNewSkillInput] = useState('');
  const [cvUrl, setCvUrl] = useState<string | null>(null);

  // Upload & Save states
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (profile) {
      setFullName(profile.fullName || '');
      setPhone(profile.phone || '');
      setUniversity(profile.university || '');
      setMajor(profile.major || '');
      setBio(profile.bio || '');
      setSkills(profile.skills || []);
      setCvUrl(profile.cvUrl || null);
    }
  }, [profile]);

  const handleAddSkill = (e: React.KeyboardEvent | React.MouseEvent) => {
    if ('key' in e && e.key !== 'Enter') return;
    e.preventDefault();
    const trimmed = newSkillInput.trim();
    if (trimmed && !skills.includes(trimmed)) {
      setSkills([...skills, trimmed]);
      setNewSkillInput('');
    }
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    setSkills(skills.filter((s) => s !== skillToRemove));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setErrorMessage(null);
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.type !== 'application/pdf' && !file.name.endsWith('.pdf')) {
        setErrorMessage('Chỉ chấp nhận file định dạng PDF.');
        setSelectedFile(null);
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        setErrorMessage('Dung lượng file vượt quá giới hạn 5MB.');
        setSelectedFile(null);
        return;
      }
      setSelectedFile(file);
    }
  };

  const handleUploadCv = async () => {
    if (!selectedFile) return;
    try {
      setIsUploading(true);
      setErrorMessage(null);
      const res = await profileApi.uploadCv(selectedFile);
      setCvUrl(res.cvUrl);
      setSelectedFile(null);
      await refetchUser();
      setSuccessMessage('Tải lên file CV PDF thành công!');
      setTimeout(() => setSuccessMessage(null), 4000);
    } catch (err: any) {
      setErrorMessage(err.response?.data?.error?.message || 'Tải file CV thất bại.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSaving(true);
      setErrorMessage(null);
      await profileApi.updateProfile({
        fullName,
        phone,
        university,
        major,
        bio,
        skills,
      });
      await refetchUser();
      setSuccessMessage('Cập nhật hồ sơ sinh viên thành công!');
      setTimeout(() => setSuccessMessage(null), 4000);
    } catch (err: any) {
      setErrorMessage(err.response?.data?.error?.message || 'Cập nhật hồ sơ thất bại.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      <Navbar />

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 flex items-center space-x-3">
              <span className="p-2 rounded-xl bg-blue-50 text-[#0065c9] border border-blue-100">
                <User className="w-6 h-6" />
              </span>
              <span>Hồ sơ Cá nhân & CV</span>
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Hoàn thiện thông tin và đính kèm CV để tăng tỷ lệ được nhà tuyển dụng duyệt đơn.
            </p>
          </div>

          {user?.id && (
            <Link
              to={`/users/${user.id}`}
              className="inline-flex items-center px-4 py-2.5 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold transition shadow-2xs self-start sm:self-auto space-x-1.5"
            >
              <ExternalLink className="w-4 h-4 text-[#0065c9]" />
              <span>Xem hồ sơ & Đánh giá công khai</span>
            </Link>
          )}
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

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Form Profile */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
              <h2 className="text-lg font-bold text-slate-900 pb-3 border-b border-slate-100">
                Thông tin sinh viên
              </h2>

              <form onSubmit={handleSaveProfile} className="space-y-4">
                {/* Full name */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Họ và tên *</label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Nguyễn Văn A"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm focus:bg-white focus:border-[#0065c9] focus:ring-2 focus:ring-blue-100 outline-none transition"
                    />
                  </div>
                </div>

                {/* Email (Read only) */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Email đăng nhập</label>
                  <input
                    type="email"
                    disabled
                    value={user?.email || ''}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-100 border border-slate-200 text-slate-500 text-sm cursor-not-allowed"
                  />
                </div>

                {/* Phone & University */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Số điện thoại</label>
                    <div className="relative">
                      <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="0987654321"
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm focus:bg-white focus:border-[#0065c9] focus:ring-2 focus:ring-blue-100 outline-none transition"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Trường Đại học / Cao đẳng</label>
                    <div className="relative">
                      <GraduationCap className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                      <input
                        type="text"
                        value={university}
                        onChange={(e) => setUniversity(e.target.value)}
                        placeholder="Đại học Quốc gia TP.HCM"
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm focus:bg-white focus:border-[#0065c9] focus:ring-2 focus:ring-blue-100 outline-none transition"
                      />
                    </div>
                  </div>
                </div>

                {/* Major */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Chuyên ngành học</label>
                  <div className="relative">
                    <BookOpen className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                    <input
                      type="text"
                      value={major}
                      onChange={(e) => setMajor(e.target.value)}
                      placeholder="Công nghệ Thông tin / Marketing / Ngôn ngữ Anh..."
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm focus:bg-white focus:border-[#0065c9] focus:ring-2 focus:ring-blue-100 outline-none transition"
                    />
                  </div>
                </div>

                {/* Bio */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Giới thiệu bản thân</label>
                  <textarea
                    rows={4}
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="Mô tả điểm mạnh, tính cách, kinh nghiệm làm việc hoặc thời gian rảnh bạn có thể làm thêm..."
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm focus:bg-white focus:border-[#0065c9] focus:ring-2 focus:ring-blue-100 outline-none transition resize-none"
                  ></textarea>
                </div>

                {/* Skills Tag Input */}
                <div className="space-y-2 pt-2">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Kỹ năng nổi bật</label>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {skills.map((skill, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-[#0065c9] border border-blue-200"
                      >
                        <span>{skill}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveSkill(skill)}
                          className="ml-1.5 text-blue-500 hover:text-blue-800"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </span>
                    ))}
                  </div>

                  <div className="flex space-x-2">
                    <input
                      type="text"
                      value={newSkillInput}
                      onChange={(e) => setNewSkillInput(e.target.value)}
                      onKeyDown={handleAddSkill}
                      placeholder="Nhập kỹ năng rồi nhấn Enter (vd: Pha chế, Giao tiếp, Tiếng Anh...)"
                      className="flex-1 px-4 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm focus:bg-white focus:border-[#0065c9] outline-none transition"
                    />
                    <button
                      type="button"
                      onClick={handleAddSkill}
                      className="px-4 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-sm transition"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Save button */}
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
                        <span>Lưu thông tin hồ sơ</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Right Column: CV Upload Section */}
          <div className="space-y-6">
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-5">
              <div className="flex items-center space-x-2 pb-3 border-b border-slate-100">
                <FileText className="w-5 h-5 text-[#0065c9]" />
                <h2 className="text-base font-bold text-slate-900">File CV đính kèm</h2>
              </div>

              {/* Current CV status */}
              {cvUrl ? (
                <div className="p-4 rounded-xl bg-blue-50/70 border border-blue-200 space-y-3">
                  <div className="flex items-center space-x-3">
                    <div className="p-2.5 rounded-lg bg-white text-[#0065c9] shadow-xs border border-blue-200">
                      <FileText className="w-6 h-6" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-[#0065c9] uppercase tracking-wider">Đã có CV</p>
                      <p className="text-xs text-slate-600 truncate font-mono mt-0.5">{cvUrl.split('/').pop()}</p>
                    </div>
                  </div>

                  <a
                    href={cvUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center justify-center w-full px-3.5 py-2 rounded-xl bg-white hover:bg-blue-50 text-[#0065c9] border border-blue-200 text-xs font-bold transition shadow-xs"
                  >
                    <ExternalLink className="w-3.5 h-3.5 mr-1.5" />
                    <span>Xem file CV (PDF)</span>
                  </a>
                </div>
              ) : (
                <div className="p-4 rounded-xl bg-slate-50 border border-dashed border-slate-300 text-center space-y-2">
                  <FileText className="w-8 h-8 text-slate-400 mx-auto" />
                  <p className="text-xs text-slate-500 font-medium">Bạn chưa tải lên CV nào.</p>
                </div>
              )}

              {/* Upload Dropzone */}
              <div className="space-y-3">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  {cvUrl ? 'Tải lên CV mới để thay thế' : 'Tải lên file CV (PDF)'}
                </label>

                <div className="relative border-2 border-dashed border-slate-300 hover:border-[#0065c9] rounded-xl p-6 text-center transition bg-slate-50/50 hover:bg-blue-50/30 cursor-pointer">
                  <input
                    type="file"
                    accept="application/pdf"
                    onChange={handleFileChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <div className="space-y-1">
                    <UploadCloud className="w-8 h-8 text-[#0065c9] mx-auto" />
                    <p className="text-xs font-semibold text-slate-700">
                      {selectedFile ? selectedFile.name : 'Nhấn để chọn file hoặc kéo thả vào đây'}
                    </p>
                    <p className="text-[11px] text-slate-400">Chỉ chấp nhận file PDF, dung lượng tối đa 5MB</p>
                  </div>
                </div>

                {selectedFile && (
                  <button
                    type="button"
                    onClick={handleUploadCv}
                    disabled={isUploading}
                    className="w-full py-2.5 px-4 rounded-xl bg-[#0065c9] hover:bg-[#0054a6] text-white font-bold text-xs transition shadow-md shadow-blue-500/20 flex items-center justify-center space-x-2 disabled:opacity-50 active:scale-95"
                  >
                    {isUploading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Đang tải lên server...</span>
                      </>
                    ) : (
                      <>
                        <UploadCloud className="w-4 h-4" />
                        <span>Tải lên "{selectedFile.name}"</span>
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};
