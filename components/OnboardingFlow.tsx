
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

  // Permission Toggles State (Simulated)
  const [permissions, setPermissions] = useState({
      contacts: true,
      notifications: true,
      background: true,
      calls: true
  });

  const togglePermission = (key: keyof typeof permissions) => {
      setPermissions(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const isValidVietnamesePhone = (phone: string): boolean => {
    // Allows formats: 0912345678, +84912345678, 84912345678
    const cleanPhone = phone.replace(/[\s\-\.]/g, '');
    const vnPhoneRegex = /^(0|84|\+84)(3|5|7|8|9)([0-9]{8})$/;
    return vnPhoneRegex.test(cleanPhone);
  };

  // --- STEP 1: INFO COLLECTION ---
  const handleStep1Submit = async () => {
      setError(null);
      if (!name.trim()) { setError("Vui lòng nhập họ và tên đầy đủ."); return; }
      if (!isValidVietnamesePhone(phone)) { setError("Số điện thoại không hợp lệ (VD: 0912...)."); return; }

      setIsLoading(true);
      await login(phone);
      updateSettings({ name: name, email: email });
      setIsLoading(false);
      setStep(2); 
  };

  // --- STEP 2: PERMISSIONS ---
  const handleStep2Submit = () => {
      completeOnboarding();
  };

  return (
    <div className="fixed inset-0 bg-[#F8FAFC] z-50 flex flex-col font-sans">
       {/* Progress Bar */}
       <div className="h-1.5 bg-slate-100 w-full">
           <div className="h-full bg-blue-600 transition-all duration-700 ease-out" style={{ width: `${(step/2)*100}%` }}></div>
       </div>

       <div className="flex-1 overflow-y-auto p-6 flex flex-col items-center justify-center max-w-md mx-auto w-full relative">
           
           {/* --- STEP 1: BASIC INFO --- */}
           {step === 1 && (
               <div className="w-full animate-in fade-in slide-in-from-bottom-8 duration-500 flex flex-col h-full justify-center">
                   <div className="text-center mb-10">
                        <div className="w-24 h-24 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-[2rem] flex items-center justify-center shadow-2xl shadow-blue-200 mb-8 mx-auto rotate-3 hover:rotate-0 transition-transform duration-500">
                           <Shield size={48} className="text-white" />
                        </div>
                        <h1 className="text-3xl font-black text-slate-900 mb-3 tracking-tight">Đăng Ký Tài Khoản</h1>
                        <p className="text-slate-500 font-medium text-base px-4">
                           Nhập thông tin để kích hoạt lá chắn bảo vệ TruthShield AI.
                        </p>
                   </div>

                   <div className="space-y-6 bg-white p-6 rounded-[2rem] shadow-xl shadow-slate-100 border border-white">
                       {/* Full Name */}
                       <div>
                           <label className="text-[11px] font-bold text-slate-400 uppercase ml-4 mb-2 block tracking-wider">Họ và tên</label>
                           <div className="relative group">
                               <User className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" size={20} />
                               <input 
                                   type="text"
                                   value={name}
                                   onChange={(e) => setName(e.target.value)}
                                   placeholder="Nguyễn Văn A"
                                   className="w-full pl-14 pr-6 py-4 bg-slate-50/50 rounded-2xl border-2 border-slate-100 focus:border-blue-500 focus:bg-white focus:outline-none font-bold text-slate-800 transition-all"
                                   autoFocus
                               />
                           </div>
                       </div>

                       {/* Phone */}
                       <div>
                           <label className="text-[11px] font-bold text-slate-400 uppercase ml-4 mb-2 block tracking-wider">Số điện thoại</label>
                           <div className="relative group">
                               <Phone className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" size={20} />
                               <input 
                                   type="tel"
                                   value={phone}
                                   onChange={(e) => {
                                       setPhone(e.target.value);
                                       setError(null);
                                   }}
                                   placeholder="0912..."
                                   className="w-full pl-14 pr-6 py-4 bg-slate-50/50 rounded-2xl border-2 border-slate-100 focus:border-blue-500 focus:bg-white focus:outline-none font-bold text-slate-800 tracking-wider transition-all"
                               />
                           </div>
                       </div>

                       {error && <div className="text-red-500 text-sm font-bold text-center bg-red-50 p-3 rounded-xl border border-red-100 flex items-center justify-center gap-2 animate-pulse"><Shield size={16}/> {error}</div>}

                       <button 
                           onClick={handleStep1Submit}
                           disabled={isLoading}
                           className="w-full py-4 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl font-bold text-lg shadow-xl shadow-slate-300 transition-all active:scale-95 disabled:opacity-70 flex items-center justify-center gap-3 mt-2"
                       >
                           {isLoading ? <Loader2 className="animate-spin" /> : 'Tiếp Tục'} <ArrowRight size={20} />
                       </button>
                   </div>
               </div>
           )}

           {/* --- STEP 2: PERMISSIONS --- */}
           {step === 2 && (
               <div className="w-full animate-in fade-in slide-in-from-right-8 duration-500 flex flex-col h-full max-w-lg mx-auto">
                   <div className="text-center mt-6 mb-8">
                       <h2 className="text-3xl font-black text-slate-900 mb-2">Cấp Quyền Bảo Vệ</h2>
                       <p className="text-slate-500 font-medium px-4">
                           Để AI hoạt động tối ưu, ứng dụng cần các quyền sau:
                       </p>
                   </div>

                   <div className="flex-1 space-y-4 overflow-y-auto pr-1 pb-4 no-scrollbar">
                        
                        {/* Permission Item Component */}
                        {[
                            { 
                                key: 'contacts', icon: <Users size={22} />, color: 'text-blue-600', bg: 'bg-blue-100', 
                                title: "Đọc danh bạ", desc: "Phân biệt Người quen vs Số lạ." 
                            },
                            { 
                                key: 'notifications', icon: <Bell size={22} />, color: 'text-amber-600', bg: 'bg-amber-100', 
                                title: "Thông báo", desc: "Gửi cảnh báo ngay khi phát hiện lừa đảo." 
                            },
                            { 
                                key: 'background', icon: <Zap size={22} />, color: 'text-purple-600', bg: 'bg-purple-100', 
                                title: "Chạy nền (Foreground)", desc: "Quét tự động 24/7." 
                            },
                            { 
                                key: 'calls', icon: <Phone size={22} />, color: 'text-green-600', bg: 'bg-green-100', 
                                title: "Truy cập cuộc gọi", desc: "Phân tích AI thời gian thực." 
                            }
                        ].map((item: any) => (
                            <div 
                                key={item.key}
                                onClick={() => togglePermission(item.key)}
                                className="flex items-center gap-4 p-5 bg-white border border-white shadow-lg shadow-slate-100 rounded-[1.5rem] cursor-pointer active:scale-[0.98] transition-all hover:border-blue-100 group"
                            >
                               <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${item.bg} ${item.color} shadow-sm group-hover:scale-110 transition-transform`}>
                                   {item.icon}
                               </div>
                               <div className="flex-1">
                                   <h3 className="font-bold text-slate-900 text-base mb-0.5">{item.title}</h3>
                                   <p className="text-xs font-medium text-slate-500 leading-tight">
                                       {item.desc}
                                   </p>
                               </div>
                               {/* Custom iOS Toggle */}
                               <div className={`w-14 h-8 rounded-full p-1 transition-colors duration-300 ${permissions[item.key as keyof typeof permissions] ? 'bg-blue-600' : 'bg-slate-200'}`}>
                                    <div className={`w-6 h-6 bg-white rounded-full shadow-md transition-transform duration-300 ${permissions[item.key as keyof typeof permissions] ? 'translate-x-6' : 'translate-x-0'}`}></div>
                               </div>
                           </div>
                        ))}
                   </div>

                   <div className="mt-4 pt-4 border-t border-slate-100 bg-[#F8FAFC]">
                       <div className="flex items-start gap-3 bg-green-50 p-4 rounded-2xl border border-green-100 mb-6">
                            <div className="bg-green-100 p-1.5 rounded-full text-green-700 mt-0.5"><Lock size={14} /></div>
                            <p className="text-[11px] font-bold text-green-800 leading-tight pt-0.5">
                                Cam kết bảo mật: Dữ liệu danh bạ & cuộc gọi được xử lý cục bộ trên thiết bị. Không gửi lên máy chủ.
                            </p>
                       </div>

                       <button 
                           onClick={handleStep2Submit}
                           className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold text-lg shadow-xl shadow-blue-200 transition-all active:scale-95 flex items-center justify-center gap-3 group"
                       >
                           Cấp Quyền & Hoàn Tất <CheckCircle2 className="group-hover:scale-110 transition-transform" />
                       </button>
                   </div>
               </div>
           )}
       </div>
    </div>
  );
};

export default OnboardingFlow;
