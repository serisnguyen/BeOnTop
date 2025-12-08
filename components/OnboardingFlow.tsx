
import React, { useState } from 'react';
import { 
  Shield, ChevronRight, Bell, Loader2, CheckCircle2, 
  User, Mail, Phone, Lock, ArrowRight, Smartphone, 
  Users, Zap, FileText 
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const OnboardingFlow: React.FC = () => {
  const { login, completeOnboarding, updateSettings } = useAuth();
  const [step, setStep] = useState<1|2>(1); 
  
  // Form State
  const [phone, setPhone] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  
  // UI State
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isValidVietnamesePhone = (phone: string): boolean => {
    // Allows formats: 0912345678, +84912345678, 84912345678
    // Removes spaces, dots, dashes before checking
    const cleanPhone = phone.replace(/[\s\-\.]/g, '');
    const vnPhoneRegex = /^(0|84|\+84)(3|5|7|8|9)([0-9]{8})$/;
    return vnPhoneRegex.test(cleanPhone);
  };

  // --- STEP 1: INFO COLLECTION ---
  const handleStep1Submit = async () => {
      setError(null);
      
      // Validation
      if (!name.trim()) {
          setError("Vui lòng nhập họ và tên đầy đủ.");
          return;
      }
      if (!isValidVietnamesePhone(phone)) {
          setError("Số điện thoại không hợp lệ (VD: 0912...).");
          return;
      }

      setIsLoading(true);
      
      // 1. Simulate Login/Register with Phone
      await login(phone);
      
      // 2. Update Profile Info immediately
      updateSettings({ name: name, email: email });
      
      setIsLoading(false);
      setStep(2); // Move to Permissions
  };

  // --- STEP 2: PERMISSIONS & PRIVACY ---
  const handleStep2Submit = () => {
      // In a real app, this would trigger native permission requests
      completeOnboarding();
  };

  return (
    <div className="fixed inset-0 bg-white z-50 flex flex-col font-sans">
       {/* Progress Bar */}
       <div className="h-1.5 bg-slate-100 w-full">
           <div className="h-full bg-blue-600 transition-all duration-700 ease-out" style={{ width: `${(step/2)*100}%` }}></div>
       </div>

       <div className="flex-1 overflow-y-auto p-6 flex flex-col items-center justify-center max-w-md mx-auto w-full relative">
           
           {/* --- STEP 1: BASIC INFO --- */}
           {step === 1 && (
               <div className="w-full animate-in fade-in slide-in-from-bottom-8 duration-500 flex flex-col h-full justify-center">
                   <div className="text-center mb-8">
                        <div className="w-20 h-20 bg-blue-600 rounded-3xl flex items-center justify-center shadow-xl shadow-blue-200 mb-6 mx-auto">
                           <Shield size={40} className="text-white" />
                        </div>
                        <h1 className="text-3xl font-black text-slate-900 mb-2">Đăng Ký Tài Khoản</h1>
                        <p className="text-slate-500 text-sm px-4">
                           Nhập thông tin để kích hoạt lá chắn bảo vệ TruthShield AI.
                        </p>
                   </div>

                   <div className="space-y-5">
                       {/* Full Name */}
                       <div>
                           <label className="text-xs font-bold text-slate-500 uppercase ml-1 mb-1 block">Họ và tên đầy đủ <span className="text-red-500">*</span></label>
                           <div className="relative">
                               <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                               <input 
                                   type="text"
                                   value={name}
                                   onChange={(e) => setName(e.target.value)}
                                   placeholder="Nguyễn Văn A"
                                   className="w-full pl-12 pr-4 py-4 bg-slate-50 rounded-xl border border-slate-200 focus:border-blue-500 focus:outline-none font-bold text-slate-800"
                                   autoFocus
                               />
                           </div>
                       </div>

                       {/* Phone */}
                       <div>
                           <label className="text-xs font-bold text-slate-500 uppercase ml-1 mb-1 block">Số điện thoại <span className="text-red-500">*</span></label>
                           <div className="relative">
                               <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                               <input 
                                   type="tel"
                                   value={phone}
                                   onChange={(e) => {
                                       setPhone(e.target.value);
                                       setError(null);
                                   }}
                                   placeholder="0912..."
                                   className="w-full pl-12 pr-4 py-4 bg-slate-50 rounded-xl border border-slate-200 focus:border-blue-500 focus:outline-none font-bold text-slate-800 tracking-wider"
                               />
                           </div>
                           <p className="text-[10px] text-slate-400 mt-1 ml-1">Sẽ gửi mã OTP để xác thực.</p>
                       </div>

                       {/* Email (Optional) */}
                       <div>
                           <div className="flex justify-between items-center mb-1">
                               <label className="text-xs font-bold text-slate-500 uppercase ml-1">Email (Tùy chọn)</label>
                           </div>
                           <div className="relative">
                               <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                               <input 
                                   type="email"
                                   value={email}
                                   onChange={(e) => setEmail(e.target.value)}
                                   placeholder="email@example.com"
                                   className="w-full pl-12 pr-4 py-4 bg-slate-50 rounded-xl border border-slate-200 focus:border-blue-500 focus:outline-none font-medium text-slate-800"
                               />
                           </div>
                           <p className="text-[10px] text-slate-400 mt-1 ml-1">Dùng để khôi phục tài khoản khi mất SIM.</p>
                       </div>

                       {error && <p className="text-red-500 text-sm font-bold text-center bg-red-50 p-3 rounded-xl border border-red-100 flex items-center justify-center gap-2"><Shield size={16}/> {error}</p>}

                       <button 
                           onClick={handleStep1Submit}
                           disabled={isLoading}
                           className="w-full py-4 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl font-bold text-lg shadow-xl shadow-slate-200 transition-all active:scale-95 disabled:opacity-70 flex items-center justify-center gap-3 mt-4"
                       >
                           {isLoading ? <Loader2 className="animate-spin" /> : 'Tiếp Tục'} <ArrowRight size={20} />
                       </button>
                   </div>
               </div>
           )}

           {/* --- STEP 2: PERMISSIONS --- */}
           {step === 2 && (
               <div className="w-full animate-in fade-in slide-in-from-right-8 duration-500 flex flex-col h-full">
                   <div className="text-center mt-8 mb-6">
                       <h2 className="text-2xl font-black text-slate-900 mb-2">Cấp Quyền Bảo Vệ</h2>
                       <p className="text-slate-500 text-sm px-2">
                           Để AI hoạt động tối ưu, ứng dụng cần các quyền sau:
                       </p>
                   </div>

                   <div className="flex-1 space-y-4 overflow-y-auto pr-1 custom-scrollbar">
                        {/* 1. Contacts */}
                        <div className="flex items-start gap-4 p-4 bg-white border border-slate-200 rounded-2xl shadow-sm">
                           <div className="p-2.5 bg-blue-50 rounded-xl text-blue-600 mt-1 flex-shrink-0"><Users size={20} /></div>
                           <div className="flex-1">
                               <h3 className="font-bold text-slate-900 text-sm">Đọc danh bạ</h3>
                               <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                                   Để phân biệt <span className="font-bold text-green-600">Người quen</span> vs <span className="font-bold text-red-500">Số lạ</span>.
                               </p>
                           </div>
                           <div className="relative">
                                <div className="w-10 h-6 bg-blue-600 rounded-full"></div>
                                <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full shadow-sm"></div>
                           </div>
                       </div>

                       {/* 2. Notifications */}
                       <div className="flex items-start gap-4 p-4 bg-white border border-slate-200 rounded-2xl shadow-sm">
                           <div className="p-2.5 bg-amber-50 rounded-xl text-amber-600 mt-1 flex-shrink-0"><Bell size={20} /></div>
                           <div className="flex-1">
                               <h3 className="font-bold text-slate-900 text-sm">Thông báo</h3>
                               <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                                   Gửi cảnh báo kịp thời khi phát hiện lừa đảo.
                               </p>
                           </div>
                           <div className="relative">
                                <div className="w-10 h-6 bg-blue-600 rounded-full"></div>
                                <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full shadow-sm"></div>
                           </div>
                       </div>

                       {/* 3. Background Service */}
                       <div className="flex items-start gap-4 p-4 bg-white border border-slate-200 rounded-2xl shadow-sm">
                           <div className="p-2.5 bg-purple-50 rounded-xl text-purple-600 mt-1 flex-shrink-0"><Zap size={20} /></div>
                           <div className="flex-1">
                               <h3 className="font-bold text-slate-900 text-sm">Chạy nền (Foreground)</h3>
                               <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                                   Quét tự động ngay khi có cuộc gọi đến.
                               </p>
                           </div>
                           <div className="relative">
                                <div className="w-10 h-6 bg-blue-600 rounded-full"></div>
                                <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full shadow-sm"></div>
                           </div>
                       </div>

                       {/* 4. Call Access */}
                       <div className="flex items-start gap-4 p-4 bg-white border border-slate-200 rounded-2xl shadow-sm">
                           <div className="p-2.5 bg-green-50 rounded-xl text-green-600 mt-1 flex-shrink-0"><Phone size={20} /></div>
                           <div className="flex-1">
                               <h3 className="font-bold text-slate-900 text-sm">Truy cập cuộc gọi</h3>
                               <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                                   Kích hoạt hệ thống phân tích AI thời gian thực.
                               </p>
                           </div>
                           <div className="relative">
                                <div className="w-10 h-6 bg-blue-600 rounded-full"></div>
                                <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full shadow-sm"></div>
                           </div>
                       </div>
                   </div>

                   {/* Privacy Pledge */}
                   <div className="mt-6 mb-6 bg-slate-50 p-4 rounded-xl border border-slate-200">
                        <div className="flex items-center gap-2 mb-1">
                            <Lock size={14} className="text-green-600" />
                            <span className="text-xs font-bold text-slate-700 uppercase">Cam kết bảo mật</span>
                        </div>
                        <p className="text-[11px] text-slate-500 leading-tight">
                            Chúng tôi <span className="font-bold">KHÔNG</span> lưu trữ nội dung cuộc gọi hay tin nhắn cá nhân của bạn. Dữ liệu được xử lý cục bộ trên thiết bị.
                        </p>
                   </div>

                   <button 
                       onClick={handleStep2Submit}
                       className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold text-lg shadow-lg shadow-blue-200 transition-all active:scale-95 flex items-center justify-center gap-2 group mb-4"
                   >
                       Cấp Quyền & Hoàn Tất <CheckCircle2 className="group-hover:scale-110 transition-transform" />
                   </button>
               </div>
           )}
       </div>
    </div>
  );
};

export default OnboardingFlow;
