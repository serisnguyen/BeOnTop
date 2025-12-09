
import React, { useState, useEffect } from 'react';
import { ShieldCheck, Activity, AlertTriangle, ChevronRight, Truck, Search, Scan, ArrowUpRight, BellRing, Shield, Battery, Clock, Zap, Globe } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Tab } from '../App';

interface HomeScreenProps {
  onNavigate: (tab: Tab) => void;
}

const HomeScreen: React.FC<HomeScreenProps> = ({ onNavigate }) => {
  const { user, setIncomingCall, isSeniorMode } = useAuth();
  const [systemStatus, setSystemStatus] = useState<'optimizing' | 'secure'>('secure');
  const [scannedItems, setScannedItems] = useState(12540);

  // Simulated Live Data
  useEffect(() => {
    const interval = setInterval(() => {
        setScannedItems(prev => prev + Math.floor(Math.random() * 3));
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  // 1. Shipper Call (Safe Context)
  const triggerShipperCall = () => {
      setIncomingCall({
          id: Date.now().toString(),
          phoneNumber: '0909112233', 
          direction: 'incoming',
          timestamp: Date.now(),
          duration: 0,
          riskStatus: 'safe' 
      });
  };

  // 2. Scam Call (Dangerous Context)
  const triggerScamCall = () => {
      setIncomingCall({
          id: Date.now().toString(),
          phoneNumber: '0888999000', 
          direction: 'incoming',
          timestamp: Date.now(),
          duration: 0,
          riskStatus: 'suspicious' 
      });
  };

  const handleSystemCheck = () => {
      setSystemStatus('optimizing');
      setTimeout(() => setSystemStatus('secure'), 2000);
  };

  return (
    <div className={`p-5 md:p-6 lg:p-8 pt-6 pb-32 max-w-7xl mx-auto animate-in fade-in duration-500 space-y-6`}>
       
       {/* Greeting Section */}
       <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 px-2 mt-2 md:mt-0">
           <div>
               <div className="flex items-center gap-2 mb-1">
                    <h1 className={`${isSeniorMode ? 'text-3xl' : 'text-3xl md:text-3xl'} font-black text-slate-900 tracking-tight`}>
                        Chào <span className="text-blue-600">{user?.name}</span>
                    </h1>
                    <span className="text-2xl md:text-2xl animate-wave origin-bottom">👋</span>
               </div>
               <div className={`${isSeniorMode ? 'text-lg' : 'text-sm md:text-base'} text-slate-500 font-bold flex items-center gap-2`}>
                   <div className="bg-green-100 p-1 rounded-full">
                       <ShieldCheck size={isSeniorMode ? 18 : 14} className="text-green-600 fill-current" />
                   </div>
                   Hệ thống an toàn.
               </div>
           </div>
           
           {/* System Check Button - Always visible, just bigger in Senior Mode */}
           <button onClick={handleSystemCheck} className={`self-start md:self-auto flex items-center gap-2 bg-white hover:bg-slate-50 transition-colors rounded-full border border-slate-200 shadow-sm active:scale-95 ${isSeniorMode ? 'px-6 py-3' : 'px-3 py-1.5 md:px-4 md:py-2'}`}>
               <Zap size={isSeniorMode ? 18 : 14} className={`text-yellow-500 ${systemStatus === 'optimizing' ? 'animate-pulse' : ''}`} fill="currentColor" />
               <span className={`${isSeniorMode ? 'text-base' : 'text-[10px] md:text-xs'} font-black text-slate-700 uppercase tracking-wide`}>
                   {systemStatus === 'optimizing' ? 'Đang tối ưu...' : 'Kiểm tra hệ thống'}
               </span>
           </button>
       </div>

       {/* HERO DASHBOARD */}
       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
           
           {/* MAIN PROTECTION CARD - "The Core" */}
           <div className="md:col-span-2 bg-slate-900 rounded-[2.5rem] md:rounded-[3rem] text-white shadow-2xl shadow-blue-900/20 relative overflow-hidden flex flex-col justify-between min-h-[340px] md:min-h-[360px] border border-slate-800 group">
               
               {/* Animated Background */}
               <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-900/40 via-slate-900 to-slate-900"></div>
               <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150 mix-blend-overlay"></div>
               
               {/* Main Content Area */}
               <div className="relative z-10 p-8 md:p-10 flex flex-col md:flex-row items-center md:items-start gap-8 md:gap-10 h-full">
                   
                   {/* Shield Reactor */}
                   <div className="relative w-36 h-36 md:w-48 md:h-48 flex-shrink-0 mt-4 cursor-pointer" onClick={handleSystemCheck}>
                       {/* Spinning Outer Ring */}
                       <div className={`absolute inset-0 rounded-full border border-blue-500/30 border-t-blue-400 border-r-blue-400 transition-all duration-1000 ${systemStatus === 'optimizing' ? 'animate-[spin_0.5s_linear_infinite]' : 'animate-[spin_10s_linear_infinite]'}`}></div>
                       
                       {/* Inner Pulsing Core */}
                       <div className="absolute inset-4 bg-blue-500/10 rounded-full animate-ping [animation-duration:3s]"></div>
                       
                       {/* Center Shield */}
                       <div className="absolute inset-0 flex items-center justify-center">
                           <div className={`bg-slate-900 p-6 md:p-6 rounded-full border border-blue-500/50 shadow-[0_0_30px_rgba(59,130,246,0.5)] relative z-10 transition-all ${systemStatus === 'optimizing' ? 'scale-90 shadow-[0_0_50px_rgba(59,130,246,0.8)]' : 'hover:scale-105'}`}>
                               <Shield size={isSeniorMode ? 50 : 40} className="text-blue-400 fill-blue-500/20 md:w-12 md:h-12" />
                           </div>
                       </div>
                   </div>

                   {/* Text Content */}
                   <div className="flex-1 text-center md:text-left flex flex-col justify-center h-full pt-2 md:pt-6">
                       <div className="inline-flex items-center justify-center md:justify-start gap-2 mb-3">
                           <div className="bg-blue-500/20 p-1.5 rounded-lg backdrop-blur-sm border border-blue-500/30">
                               <Activity size={14} className="text-blue-300" />
                           </div>
                           <span className={`${isSeniorMode ? 'text-base' : 'text-[10px] md:text-xs'} font-bold text-blue-200 uppercase tracking-widest glow-text`}>AI Sentinel Core</span>
                       </div>
                       
                       <h2 className={`${isSeniorMode ? 'text-5xl' : 'text-4xl md:text-5xl lg:text-6xl'} font-black text-white leading-tight mb-3 tracking-tight`}>
                           {systemStatus === 'optimizing' ? (
                               <span className="text-blue-300 animate-pulse">ĐANG QUÉT...</span>
                           ) : (
                               <>
                                   BẢO VỆ <br/>
                                   <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-cyan-300 to-blue-400 bg-[length:200%_auto] animate-gradient">
                                       TUYỆT ĐỐI
                                   </span>
                               </>
                           )}
                       </h2>
                       
                       <p className={`text-slate-400 font-medium leading-relaxed max-w-sm mx-auto md:mx-0 ${isSeniorMode ? 'text-lg block' : 'text-xs md:text-sm lg:text-base hidden sm:block'}`}>
                           AI đang giám sát {scannedItems.toLocaleString()} tín hiệu theo thời gian thực.
                       </p>
                   </div>
               </div>

               {/* Bottom Stats Bar */}
               <div className="relative z-10 bg-black/40 backdrop-blur-md border-t border-white/5 p-5 grid grid-cols-3 gap-px">
                   <div className="flex flex-col items-center justify-center border-r border-white/5">
                       <div className={`flex items-center gap-1 md:gap-2 text-white font-bold ${isSeniorMode ? 'text-xl' : 'text-sm md:text-lg'}`}>
                           <Clock size={isSeniorMode ? 20 : 16} className="text-emerald-400" /> 24/7
                       </div>
                   </div>
                   
                   <div className="flex flex-col items-center justify-center border-r border-white/5">
                       <div className={`flex items-center gap-1 md:gap-2 text-white font-bold ${isSeniorMode ? 'text-xl' : 'text-sm md:text-lg'}`}>
                           <Globe size={isSeniorMode ? 20 : 16} className="text-blue-400" /> Global
                       </div>
                   </div>
                   
                   <div className="flex flex-col items-center justify-center">
                       <div className={`flex items-center gap-1 md:gap-2 text-white font-bold ${isSeniorMode ? 'text-xl' : 'text-sm md:text-lg'}`}>
                           <Battery size={isSeniorMode ? 20 : 16} className="text-yellow-400" /> Tối ưu
                       </div>
                   </div>
               </div>
           </div>

           {/* STATS / ACTION COLUMN */}
           <div className="grid grid-cols-1 gap-5">
               {/* Scan Stat - Full Height */}
               <div onClick={() => onNavigate('scanner')} className="bg-white p-7 rounded-[2.5rem] cursor-pointer shadow-lg shadow-purple-200/50 border border-white relative overflow-hidden group hover:-translate-y-1 transition-transform duration-300 flex flex-col justify-between h-full min-h-[220px]">
                   <div className="absolute -right-4 -top-4 w-32 h-32 bg-purple-500/10 rounded-full blur-2xl group-hover:bg-purple-500/20 transition-colors"></div>
                   
                   <div className="flex justify-between items-start mb-4 relative z-10">
                       <div className="w-16 h-16 rounded-3xl bg-purple-50 flex items-center justify-center text-purple-600 shadow-sm border border-purple-100">
                           <Scan size={32} className="md:w-8 md:h-8" />
                       </div>
                       <ArrowUpRight size={28} className="text-slate-300 group-hover:text-purple-600 transition-colors" />
                   </div>
                   <div className="relative z-10">
                       <h3 className={`${isSeniorMode ? 'text-4xl' : 'text-3xl'} font-black text-slate-900 tracking-tight`}>AI Scan</h3>
                       <p className={`${isSeniorMode ? 'text-lg' : 'text-sm'} font-bold text-slate-500 mt-2`}>Quét Deepfake khuôn mặt & giọng nói.</p>
                       <div className="mt-4 flex items-center gap-2 text-xs font-bold text-purple-600 uppercase tracking-wide">
                           <span className="w-2 h-2 rounded-full bg-purple-600 animate-pulse"></span> Sẵn sàng
                       </div>
                   </div>
               </div>
           </div>
       </div>

       {/* QUICK ACTION: LOOKUP (Search Bar Style) */}
       <div 
         onClick={() => onNavigate('lookup')}
         className="bg-white rounded-[2.5rem] p-4 flex items-center shadow-lg shadow-blue-100 border border-slate-100 cursor-pointer group hover:shadow-xl transition-all"
       >
           <div className="w-16 h-16 bg-blue-600 rounded-[2rem] flex items-center justify-center text-white shadow-lg shadow-blue-200 group-hover:scale-105 transition-transform">
               <Search size={28} />
           </div>
           <div className="flex-1 px-5">
               <h3 className={`font-bold text-slate-900 ${isSeniorMode ? 'text-2xl' : 'text-xl'}`}>Tra cứu số lạ</h3>
               <p className={`text-slate-400 font-medium ${isSeniorMode ? 'text-lg' : 'text-base'}`}>Nhập số điện thoại để kiểm tra...</p>
           </div>
           <div className="pr-4">
               <div className="w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
                   <ChevronRight size={24} />
               </div>
           </div>
       </div>

       {/* DEMO ACTIONS ROW */}
       <div>
           <h2 className={`font-bold text-slate-400 uppercase tracking-wider mb-4 px-3 flex items-center gap-2 ${isSeniorMode ? 'text-sm' : 'text-xs'}`}>
               <Zap size={isSeniorMode ? 18 : 14} /> Giả lập tình huống
           </h2>
           <div className="grid grid-cols-2 gap-4">
                <button 
                    onClick={triggerShipperCall}
                    className="bg-white hover:bg-green-50 p-6 rounded-[2.5rem] text-left transition-all border border-slate-100 hover:border-green-200 shadow-sm group relative overflow-hidden"
                >
                    <div className="absolute right-0 bottom-0 opacity-5 -rotate-12 transform translate-x-4 translate-y-4">
                        <Truck size={80} className="text-green-600" />
                    </div>
                    <div className="w-12 h-12 bg-green-100 rounded-2xl flex items-center justify-center text-green-600 mb-4 group-hover:scale-110 transition-transform relative z-10">
                        <Truck size={24} />
                    </div>
                    <span className={`block font-bold text-slate-900 relative z-10 ${isSeniorMode ? 'text-xl' : 'text-lg'}`}>Shipper Gọi</span>
                    <span className={`text-slate-500 font-medium relative z-10 mt-1 block ${isSeniorMode ? 'text-base' : 'text-xs'}`}>Kịch bản an toàn</span>
                </button>

                <button 
                    onClick={triggerScamCall}
                    className="bg-white hover:bg-red-50 p-6 rounded-[2.5rem] text-left transition-all border border-slate-100 hover:border-red-200 shadow-sm group relative overflow-hidden"
                >
                     <div className="absolute right-0 bottom-0 opacity-5 -rotate-12 transform translate-x-4 translate-y-4">
                        <AlertTriangle size={80} className="text-red-600" />
                    </div>
                    <div className="w-12 h-12 bg-red-100 rounded-2xl flex items-center justify-center text-red-600 mb-4 group-hover:scale-110 transition-transform relative z-10">
                        <AlertTriangle size={24} />
                    </div>
                    <span className={`block font-bold text-slate-900 relative z-10 ${isSeniorMode ? 'text-xl' : 'text-lg'}`}>Lừa Đảo Gọi</span>
                    <span className={`text-slate-500 font-medium relative z-10 mt-1 block ${isSeniorMode ? 'text-base' : 'text-xs'}`}>Kịch bản nguy hiểm</span>
                </button>
           </div>
       </div>

       {/* News Widget */}
       <div 
         onClick={() => onNavigate('library')}
         className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-[2.5rem] p-8 text-white relative overflow-hidden cursor-pointer group mb-10"
       >
           <div className="absolute top-0 right-0 w-48 h-48 bg-blue-500/20 rounded-full blur-3xl translate-x-10 -translate-y-10 group-hover:bg-blue-500/30 transition-colors"></div>
           
           <div className="relative z-10 flex items-center gap-6">
               <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center backdrop-blur-sm border border-white/10 flex-shrink-0">
                   <BellRing size={24} className="text-yellow-400" />
               </div>
               <div className="flex-1 min-w-0">
                   <div className="flex items-center gap-2 mb-1.5">
                       <span className="bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full animate-pulse shadow-lg shadow-red-500/40">HOT</span>
                       <h3 className={`font-bold truncate ${isSeniorMode ? 'text-xl' : 'text-lg'}`}>Thủ đoạn mới: SIM 5G</h3>
                   </div>
                   <p className={`text-slate-400 line-clamp-2 ${isSeniorMode ? 'text-base' : 'text-sm'}`}>Cảnh báo chiêu trò nâng cấp SIM để chiếm đoạt OTP ngân hàng.</p>
               </div>
               <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center group-hover:bg-white group-hover:text-slate-900 transition-colors">
                   <ChevronRight size={24} />
               </div>
           </div>
       </div>
    </div>
  );
};

export default HomeScreen;
