
import React, { useState, useEffect } from 'react';
import { Shield, ShieldCheck, Activity, AlertTriangle, ChevronRight, Truck, Search, Scan, ScanFace, ArrowUpRight, BellRing, Clock, Zap, Globe, Battery, MessageSquareText, Phone, Play, Wifi, Lock, Radar } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Tab } from '../App';

interface HomeScreenProps {
  onNavigate: (tab: Tab) => void;
}

const HomeScreen: React.FC<HomeScreenProps> = ({ onNavigate }) => {
  const { user, setIncomingCall, isSeniorMode } = useAuth();
  const [systemStatus, setSystemStatus] = useState<'optimizing' | 'secure'>('secure');

  // --- DEMO TRIGGERS ---
  const triggerSafeCall = () => {
      setIncomingCall({
          id: Date.now().toString(),
          phoneNumber: '0909112233', 
          contactName: 'Shipper Giao Hàng', // Simulate known context
          direction: 'incoming',
          timestamp: Date.now(),
          duration: 0,
          riskStatus: 'safe' 
      });
  };

  const triggerSuspiciousCall = () => {
      setIncomingCall({
          id: Date.now().toString(),
          phoneNumber: '0288889999', 
          direction: 'incoming',
          timestamp: Date.now(),
          duration: 0,
          riskStatus: 'suspicious' // AMBER WARNING
      });
  };

  const triggerScamCall = () => {
      setIncomingCall({
          id: Date.now().toString(),
          phoneNumber: '0888999000', 
          direction: 'incoming',
          timestamp: Date.now(),
          duration: 0,
          riskStatus: 'scam' // RED WARNING
      });
  };

  const handleSystemCheck = () => {
      setSystemStatus('optimizing');
      setTimeout(() => setSystemStatus('secure'), 2000);
  };

  // --- SENIOR MODE: WARM, TACTILE, LARGE ---
  if (isSeniorMode) {
      return (
          <div className="p-4 space-y-6 max-w-lg mx-auto animate-in fade-in duration-500 pb-40">
              
              {/* Welcome Card */}
              <div className="bg-[#FFFDE7] p-6 rounded-[2rem] shadow-lg shadow-amber-100/50 border-2 border-amber-100 flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-amber-200 flex items-center justify-center border-4 border-white shadow-sm flex-shrink-0">
                      <ShieldCheck size={32} className="text-amber-800" />
                  </div>
                  <div>
                      <h1 className="text-2xl font-black text-slate-900">Chào bác {user?.name}!</h1>
                      <p className="text-amber-800 font-bold text-lg">Máy đang an toàn.</p>
                  </div>
              </div>

              {/* Status Indicator */}
              <div onClick={handleSystemCheck} className="bg-white p-6 rounded-[2.5rem] shadow-xl shadow-amber-900/5 flex flex-col items-center justify-center text-center active:scale-95 transition-transform border border-amber-50">
                   <div className={`w-32 h-32 rounded-full flex items-center justify-center mb-4 transition-all duration-1000 ${systemStatus === 'optimizing' ? 'bg-amber-100 animate-pulse' : 'bg-green-100'}`}>
                       <Shield size={64} className={systemStatus === 'optimizing' ? 'text-amber-600' : 'text-green-600'} fill="currentColor" />
                   </div>
                   <h2 className="text-3xl font-black text-slate-900 mb-1">
                       {systemStatus === 'optimizing' ? 'Đang kiểm tra...' : 'Đã Bảo Vệ'}
                   </h2>
                   <p className="text-slate-500 font-medium text-lg">
                       Bấm vào đây để kiểm tra lại
                   </p>
              </div>

              {/* Demo Section (Senior) */}
              <div className="bg-white p-6 rounded-[2rem] border-2 border-slate-100">
                  <h3 className="text-center text-slate-400 font-bold uppercase tracking-widest text-sm mb-4 flex items-center justify-center gap-2">
                      <Play size={16} /> Giả lập cuộc gọi
                  </h3>
                  <div className="grid grid-cols-3 gap-2">
                      <button onClick={triggerSafeCall} className="flex flex-col items-center gap-2 p-2 rounded-xl bg-green-50 active:bg-green-100 active:scale-95 transition-all">
                          <div className="w-12 h-12 rounded-full bg-green-500 text-white flex items-center justify-center shadow-lg shadow-green-200">
                              <ShieldCheck size={24} />
                          </div>
                          <span className="text-xs font-bold text-green-700 whitespace-nowrap">An Toàn</span>
                      </button>

                      <button onClick={triggerSuspiciousCall} className="flex flex-col items-center gap-2 p-2 rounded-xl bg-amber-50 active:bg-amber-100 active:scale-95 transition-all">
                          <div className="w-12 h-12 rounded-full bg-amber-500 text-white flex items-center justify-center shadow-lg shadow-amber-200">
                              <AlertTriangle size={24} />
                          </div>
                          <span className="text-xs font-bold text-amber-700 whitespace-nowrap">Cảnh Giác</span>
                      </button>

                      <button onClick={triggerScamCall} className="flex flex-col items-center gap-2 p-2 rounded-xl bg-red-50 active:bg-red-100 active:scale-95 transition-all">
                          <div className="w-12 h-12 rounded-full bg-red-600 text-white flex items-center justify-center shadow-lg shadow-red-200">
                              <Shield size={24} />
                          </div>
                          <span className="text-xs font-bold text-red-700 whitespace-nowrap">Lừa Đảo</span>
                      </button>
                  </div>
              </div>

              {/* Big Action Buttons */}
              <div className="grid grid-cols-1 gap-4">
                  <button onClick={() => onNavigate('lookup')} className="bg-white p-6 rounded-[2rem] shadow-lg shadow-amber-900/5 flex items-center gap-6 active:scale-95 transition-transform border border-amber-50 group hover:border-amber-200">
                      <div className="w-20 h-20 bg-blue-100 rounded-2xl flex items-center justify-center group-hover:bg-blue-200 transition-colors flex-shrink-0">
                          <Search size={40} className="text-blue-700" />
                      </div>
                      <div className="text-left flex-1 min-w-0">
                          <h3 className="text-2xl font-black text-slate-900 truncate">Tra cứu số lạ</h3>
                          <p className="text-slate-500 font-medium text-lg truncate">Kiểm tra ai đang gọi</p>
                      </div>
                      <ChevronRight size={32} className="text-amber-300 flex-shrink-0" />
                  </button>
              </div>
          </div>
      );
  }

  // --- NORMAL MODE: BENTO GRID / MODERN ---
  return (
    <div className="p-4 md:p-6 space-y-6 max-w-7xl mx-auto animate-in fade-in duration-500 pb-40">
       
       {/* Greeting & Demo Tools */}
       <div className="flex flex-col gap-4">
           <div>
               <h1 className="text-2xl font-bold text-slate-900">Xin chào, {user?.name}</h1>
               <p className="text-slate-500 text-sm">Hệ thống đang hoạt động ổn định.</p>
           </div>
           
           {/* Improved Touch-Friendly Toolbar - FIXED OVERFLOW */}
           <div className="w-full overflow-x-auto no-scrollbar pb-1 -mx-4 px-4">
               <div className="flex items-center gap-2 min-w-max">
                   <span className="px-3 text-xs font-bold text-slate-400 uppercase whitespace-nowrap bg-white/50 rounded-full py-2 border border-slate-100 backdrop-blur-sm">
                       GIẢ LẬP:
                   </span>
                   
                   <button onClick={triggerSafeCall} className="flex items-center gap-2 px-4 py-2 rounded-full bg-green-100 text-green-700 flex-shrink-0 active:scale-95 transition-transform shadow-sm border border-green-200">
                       <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center text-white"><ShieldCheck size={10}/></div>
                       <span className="text-xs font-bold whitespace-nowrap">An toàn</span>
                   </button>

                   <button onClick={triggerSuspiciousCall} className="flex items-center gap-2 px-4 py-2 rounded-full bg-amber-100 text-amber-700 flex-shrink-0 active:scale-95 transition-transform shadow-sm border border-amber-200">
                       <div className="w-5 h-5 rounded-full bg-amber-500 flex items-center justify-center text-white"><AlertTriangle size={10}/></div>
                       <span className="text-xs font-bold whitespace-nowrap">Rủi ro</span>
                   </button>

                   <button onClick={triggerScamCall} className="flex items-center gap-2 px-4 py-2 rounded-full bg-red-100 text-red-700 flex-shrink-0 active:scale-95 transition-transform shadow-sm border border-red-200">
                       <div className="w-5 h-5 rounded-full bg-red-600 flex items-center justify-center text-white"><Shield size={10}/></div>
                       <span className="text-xs font-bold whitespace-nowrap">Lừa đảo</span>
                   </button>

                   <div className="w-px h-6 bg-slate-300 mx-1 flex-shrink-0"></div>

                   <button onClick={handleSystemCheck} className="bg-slate-900 text-white px-5 py-2 rounded-full font-bold text-xs flex items-center gap-2 active:scale-95 transition-all whitespace-nowrap shadow-lg shadow-slate-200">
                       <Zap size={14} className={systemStatus === 'optimizing' ? 'animate-pulse' : ''} fill="currentColor" />
                       {systemStatus === 'optimizing' ? 'Đang tối ưu...' : 'Tối ưu hóa'}
                   </button>
               </div>
           </div>
       </div>

       {/* BENTO GRID LAYOUT */}
       <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
           
           {/* 1. Main Status Card - NEW ANIMATED RADAR/SHIELD DESIGN */}
           <div className="md:col-span-2 min-h-[340px] relative overflow-hidden rounded-[2.5rem] bg-slate-900 shadow-2xl shadow-blue-900/40 group touch-manipulation flex flex-col items-center justify-center py-8">
               {/* Animated Background Mesh */}
               <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#4f46e5_1.5px,transparent_1.5px)] [background-size:24px_24px]"></div>
               <div className="absolute top-0 w-full h-full bg-gradient-to-b from-blue-500/10 to-transparent"></div>

               <div className="relative z-10 flex flex-col items-center">
                   {/* The Animated Shield/Scanner */}
                   <div className="relative w-48 h-48 flex items-center justify-center mb-6">
                        {/* Outer Radar Rings */}
                        <div className="absolute inset-0 border border-blue-500/20 rounded-full animate-[ping_3s_cubic-bezier(0,0,0.2,1)_infinite]"></div>
                        <div className="absolute inset-4 border border-blue-400/30 rounded-full animate-[spin_8s_linear_infinite]"></div>
                        <div className="absolute inset-4 border-t-2 border-t-blue-400/80 rounded-full animate-[spin_3s_linear_infinite]"></div>
                        <div className="absolute inset-8 border border-indigo-400/30 rounded-full animate-[spin_5s_linear_infinite_reverse]"></div>
                        
                        {/* Glowing Core */}
                        <div className="absolute inset-0 bg-blue-500/10 blur-3xl rounded-full animate-pulse"></div>

                        {/* Central Shield Icon */}
                        <div className="relative z-20 transform group-hover:scale-105 transition-transform duration-500">
                            <ShieldCheck size={96} className="text-white drop-shadow-[0_0_25px_rgba(59,130,246,0.6)]" fill="currentColor" fillOpacity={0.2} />
                        </div>
                   </div>

                   {/* Status Text */}
                   <div className="text-center">
                       <h2 className="text-4xl font-black text-white tracking-tight mb-2">
                           Hệ thống đang bảo vệ
                       </h2>
                       <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/10 backdrop-blur-md shadow-lg">
                           <span className="relative flex h-3 w-3">
                             <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                             <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                           </span>
                           <span className="text-sm font-bold text-slate-200 uppercase tracking-widest">Hoạt động ổn định</span>
                       </div>
                   </div>
               </div>
           </div>

           {/* 2. Deepfake Scanner (Tall) */}
           <div 
                onClick={() => onNavigate('scanner')}
                className="bg-white rounded-[2.5rem] p-6 shadow-xl shadow-purple-100/50 border border-white relative overflow-hidden group cursor-pointer hover:border-purple-200 transition-all hover:translate-y-[-4px] active:scale-[0.98]"
           >
               <div className="absolute top-0 right-0 p-6 opacity-30 group-hover:opacity-100 transition-opacity">
                   <ArrowUpRight size={24} className="text-purple-400 group-hover:text-purple-600" />
               </div>
               
               <div className="flex flex-col h-full justify-between gap-6">
                   <div className="w-16 h-16 bg-purple-50 rounded-[1.5rem] flex items-center justify-center text-purple-600 group-hover:scale-110 transition-transform shadow-inner">
                       <ScanFace size={32} />
                   </div>
                   <div>
                       <h3 className="text-xl font-bold text-slate-900 mb-1">Quét Deepfake</h3>
                       <p className="text-slate-500 text-sm leading-relaxed line-clamp-2">
                           Phát hiện khuôn mặt & giọng nói giả mạo bằng AI.
                       </p>
                   </div>
               </div>
           </div>

           {/* 3. Message Guard (Wide) */}
           <div 
                onClick={() => onNavigate('messagescan')}
                className="bg-white rounded-[2.5rem] p-6 shadow-xl shadow-blue-100/50 border border-white flex items-center justify-between cursor-pointer hover:border-blue-200 transition-all hover:translate-y-[-2px] group active:scale-[0.98]"
           >
               <div className="flex items-center gap-5">
                   <div className="w-16 h-16 bg-blue-50 rounded-[1.5rem] flex items-center justify-center text-blue-600 group-hover:scale-110 transition-transform shadow-inner flex-shrink-0">
                       <MessageSquareText size={32} />
                   </div>
                   <div className="min-w-0">
                       <h3 className="text-xl font-bold text-slate-900">Kiểm tra tin nhắn</h3>
                       <p className="text-slate-500 text-sm font-medium line-clamp-1">Copy nội dung để phân tích</p>
                   </div>
               </div>
               <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-colors flex-shrink-0">
                   <ChevronRight size={20} />
               </div>
           </div>

           {/* 4. Number Lookup (Wide) */}
           <div 
                onClick={() => onNavigate('lookup')}
                className="md:col-span-2 bg-slate-900 rounded-[2.5rem] p-1 shadow-xl shadow-slate-200 cursor-pointer group relative overflow-hidden active:scale-[0.99] transition-transform"
           >
               <div className="absolute inset-0 bg-gradient-to-r from-slate-800 to-slate-900"></div>
               <div className="relative z-10 flex items-center justify-between p-6">
                   <div className="flex items-center gap-5">
                       <div className="w-16 h-16 bg-white/10 rounded-[1.5rem] flex items-center justify-center border border-white/10 backdrop-blur-sm shadow-inner group-hover:scale-105 transition-transform flex-shrink-0">
                           <Search size={32} className="text-white" />
                       </div>
                       <div className="min-w-0">
                           <h3 className="text-xl font-bold text-white">Tra cứu số lạ</h3>
                           <p className="text-slate-400 text-sm font-medium line-clamp-1">Kiểm tra danh tính người gọi</p>
                       </div>
                   </div>
                   <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full border border-white/10 group-hover:bg-white group-hover:text-slate-900 transition-colors flex-shrink-0">
                       <Globe size={14} />
                       <span className="text-xs font-bold uppercase whitespace-nowrap">Global DB</span>
                   </div>
               </div>
           </div>
       </div>

       {/* News Ticker */}
       <div 
         onClick={() => onNavigate('library')}
         className="bg-red-50 border border-red-100 rounded-2xl p-4 flex items-center gap-4 cursor-pointer hover:bg-red-100 transition-colors shadow-sm active:scale-95"
       >
           <div className="flex-shrink-0 bg-red-600 text-white text-[10px] font-bold px-3 py-1 rounded-lg animate-pulse shadow-sm whitespace-nowrap">
               CẢNH BÁO MỚI
           </div>
           <p className="text-sm font-bold text-red-800 flex-1 truncate">
               Cảnh báo thủ đoạn: Giả danh nhân viên điện lực hoàn tiền 2024.
           </p>
           <ChevronRight size={16} className="text-red-400 flex-shrink-0" />
       </div>
    </div>
  );
};

export default HomeScreen;
