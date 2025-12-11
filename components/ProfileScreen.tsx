
import React, { useState } from 'react';
import { 
  User, LogOut, ChevronRight, Settings, Shield, PhoneOff, Trash2, Ban, Eye, Type, Crown, Briefcase, Zap, Activity
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import PremiumUpgradeModal from './PremiumUpgradeModal';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const ProfileScreen: React.FC = () => {
  const { user, logout, updateSettings, toggleSeniorMode, isSeniorMode, unblockNumber } = useAuth();
  const [showBlocked, setShowBlocked] = useState(false);
  const [showPremiumModal, setShowPremiumModal] = useState(false);

  if (!user) return null;
  const isFree = user.plan === 'free';

  // Mock Data for Charts (Enhanced for Premium Dashboard)
  const activityData = [
    { day: 'T2', scan: 12, block: 2, threat: 1 },
    { day: 'T3', scan: 18, block: 5, threat: 3 },
    { day: 'T4', scan: 15, block: 1, threat: 0 },
    { day: 'T5', scan: 22, block: 8, threat: 4 },
    { day: 'T6', scan: 30, block: 12, threat: 6 },
    { day: 'T7', scan: 25, block: 4, threat: 2 },
    { day: 'CN', scan: 20, block: 3, threat: 1 },
  ];

  const pieData = [
    { name: 'An toàn', value: 65, color: '#22c55e' }, // Green
    { name: 'Spam', value: 25, color: '#f59e0b' },    // Amber
    { name: 'Scam', value: 10, color: '#ef4444' },    // Red
  ];

  return (
    <div className={`p-4 md:p-6 pt-20 md:pt-10 pb-40 min-h-screen max-w-4xl mx-auto animate-in fade-in ${isSeniorMode ? 'text-lg' : ''}`}>
        
        {/* Header - REDESIGNED */}
        <div className="relative mb-8 pt-4">
             {/* Decorative Background Elements */}
             <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 bg-blue-100/50 rounded-full blur-3xl"></div>
             <div className="absolute bottom-0 left-0 -ml-20 -mb-10 w-48 h-48 bg-purple-100/50 rounded-full blur-3xl"></div>

             <div className="bg-white/80 backdrop-blur-xl rounded-[2.5rem] p-6 md:p-8 shadow-xl shadow-slate-200/60 border border-white relative overflow-hidden group">
                 <div className="absolute inset-0 bg-gradient-to-br from-white via-white to-blue-50/30 opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
                 
                 <div className="relative z-10 flex flex-col md:flex-row items-center gap-6 md:gap-8 text-center md:text-left">
                     
                     {/* Avatar Area */}
                     <div className="relative">
                         <div className={`rounded-full bg-gradient-to-br from-slate-100 to-white flex items-center justify-center font-black text-slate-400 shadow-[0_8px_30px_rgb(0,0,0,0.06)] border-4 border-white ring-1 ring-slate-100 ${isSeniorMode ? 'w-32 h-32 text-5xl' : 'w-28 h-28 text-4xl'}`}>
                             {user.name?.charAt(0) || <User />}
                         </div>
                         
                         {/* Badge */}
                         {isFree ? (
                             <button 
                                onClick={() => setShowPremiumModal(true)}
                                className="absolute -bottom-1 -right-1 bg-slate-900 text-yellow-400 p-2.5 rounded-full border-4 border-white shadow-lg hover:scale-110 transition-transform active:scale-95"
                                title="Nâng cấp Premium"
                             >
                                 <Zap size={isSeniorMode ? 20 : 16} fill="currentColor" />
                             </button>
                         ) : (
                             <div className="absolute -bottom-1 -right-1 bg-gradient-to-r from-yellow-400 to-orange-500 text-white p-2.5 rounded-full border-4 border-white shadow-lg animate-bounce-slow">
                                 <Crown size={isSeniorMode ? 20 : 16} fill="currentColor" />
                             </div>
                         )}
                     </div>

                     {/* Info Area */}
                     <div className="flex-1 min-w-0">
                         <div className="flex flex-col md:flex-row items-center md:items-baseline gap-2 mb-2">
                             <h1 className={`font-black text-slate-900 tracking-tight leading-none truncate max-w-full ${isSeniorMode ? 'text-4xl' : 'text-3xl'}`}>
                                 {user.name}
                             </h1>
                             {/* Plan Badge */}
                             {isFree ? (
                                <span className="bg-slate-100 text-slate-500 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border border-slate-200">
                                    Thành viên Free
                                </span>
                             ) : (
                                <span className="bg-gradient-to-r from-yellow-100 to-amber-100 text-amber-700 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border border-amber-200 flex items-center gap-1">
                                    <Crown size={10} fill="currentColor" /> Premium
                                </span>
                             )}
                         </div>
                         
                         <p className={`font-mono font-bold text-slate-400 bg-slate-50 inline-block px-3 py-1 rounded-lg border border-slate-100 mb-5 ${isSeniorMode ? 'text-xl' : 'text-sm'}`}>
                            {user.phone}
                         </p>

                         {/* Stats Row */}
                         <div className="flex items-center justify-center md:justify-start gap-8 border-t border-slate-100 pt-5 w-full">
                            <div>
                                <div className={`font-black text-slate-900 leading-none ${isSeniorMode ? 'text-2xl' : 'text-xl'}`}>
                                    {user.alertHistory?.length || 0}
                                </div>
                                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-1">Cảnh báo</div>
                            </div>
                            <div className="w-px h-8 bg-slate-100"></div>
                            <div>
                                <div className={`font-black text-slate-900 leading-none ${isSeniorMode ? 'text-2xl' : 'text-xl'}`}>
                                    {user.messageHistory?.filter(m => m.result === 'safe').length || 0}
                                </div>
                                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-1">An toàn</div>
                            </div>
                            <div className="w-px h-8 bg-slate-100"></div>
                            <div>
                                <div className={`font-black leading-none ${user.riskThreshold < 60 ? 'text-red-500' : 'text-green-500'} ${isSeniorMode ? 'text-2xl' : 'text-xl'}`}>
                                    {user.riskThreshold}%
                                </div>
                                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-1">Bảo vệ</div>
                            </div>
                         </div>
                     </div>
                 </div>
             </div>
        </div>

        {/* --- PREMIUM UPGRADE BANNER (If Free) --- */}
        {isFree && (
            <div 
                onClick={() => setShowPremiumModal(true)}
                className="mb-8 bg-gradient-to-r from-slate-900 to-slate-800 rounded-3xl p-6 text-white shadow-xl shadow-slate-200 cursor-pointer relative overflow-hidden group border border-slate-700"
            >
                <div className="absolute right-0 top-0 w-32 h-32 bg-yellow-400/20 rounded-full blur-3xl -mr-10 -mt-10 group-hover:bg-yellow-400/30 transition-colors"></div>
                <div className="relative z-10 flex items-center justify-between">
                    <div>
                        <h3 className={`font-black mb-1 flex items-center gap-2 text-yellow-400 ${isSeniorMode ? 'text-2xl' : 'text-xl'}`}>
                            <Crown size={isSeniorMode ? 24 : 20} fill="currentColor" /> Nâng cấp Premium
                        </h3>
                        <p className={`text-slate-300 font-medium ${isSeniorMode ? 'text-base' : 'text-sm'}`}>Chỉ 49k/tháng. Quét AI không giới hạn & Dashboard độc quyền.</p>
                    </div>
                    <div className="bg-white/10 p-2 rounded-full backdrop-blur-sm">
                        <ChevronRight className="text-white" size={isSeniorMode ? 28 : 24} />
                    </div>
                </div>
            </div>
        )}

        {/* --- PREMIUM DASHBOARD - ALWAYS VISIBLE IF PAID, SCALED FOR SENIOR --- */}
        {!isFree && (
            <section className="mb-8 animate-in slide-in-from-bottom-4 duration-500">
                <div className="flex items-center justify-between mb-3 px-2">
                    <h3 className={`font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2 ${isSeniorMode ? 'text-sm' : 'text-xs'}`}>
                        <Activity size={isSeniorMode ? 18 : 14} className="text-blue-600" /> Trung tâm An ninh
                    </h3>
                    <span className={`font-bold bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full ${isSeniorMode ? 'text-xs' : 'text-[10px]'}`}>LIVE DATA</span>
                </div>
                
                <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden p-6 relative">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {/* Weekly Activity Bar Chart */}
                        <div className="md:col-span-2 h-64">
                            <h4 className={`font-bold text-slate-900 mb-6 ${isSeniorMode ? 'text-lg' : 'text-sm'}`}>Hoạt động tuần qua</h4>
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={activityData} barSize={isSeniorMode ? 16 : 12}>
                                    <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{fontSize: isSeniorMode ? 14 : 10, fill: '#94a3b8'}} dy={10} />
                                    <YAxis hide />
                                    <Tooltip 
                                        cursor={{fill: '#f1f5f9', radius: 4}} 
                                        contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)'}} 
                                    />
                                    <Bar dataKey="scan" stackId="a" fill="#3b82f6" radius={[0, 0, 4, 4]} name="Đã quét" />
                                    <Bar dataKey="block" stackId="a" fill="#f59e0b" name="Đã chặn" />
                                    <Bar dataKey="threat" stackId="a" fill="#ef4444" radius={[4, 4, 0, 0]} name="Nguy hiểm" />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>

                        {/* Risk Distribution Pie Chart */}
                        <div className="h-64 flex flex-col items-center justify-center relative">
                            <h4 className={`font-bold text-slate-900 mb-2 absolute top-0 left-0 ${isSeniorMode ? 'text-lg' : 'text-sm'}`}>Phân loại rủi ro</h4>
                            <ResponsiveContainer width="100%" height={180}>
                                <PieChart>
                                    <Pie 
                                        data={pieData} 
                                        innerRadius={50} 
                                        outerRadius={70} 
                                        paddingAngle={5} 
                                        dataKey="value"
                                        stroke="none"
                                    >
                                        {pieData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <Tooltip contentStyle={{borderRadius: '8px'}} />
                                </PieChart>
                            </ResponsiveContainer>
                            {/* Custom Legend */}
                            <div className={`flex gap-4 font-bold text-slate-500 mt-2 ${isSeniorMode ? 'text-sm' : 'text-[10px]'}`}>
                                <div className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-green-500"></span> An toàn</div>
                                <div className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-500"></span> Spam</div>
                                <div className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-500"></span> Scam</div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        )}

        {/* Settings Grid */}
        <div className="space-y-6">
            
            {/* Display / Accessibility */}
            <section>
                <h3 className={`font-bold text-slate-400 uppercase tracking-wider mb-3 px-2 flex items-center gap-2 ${isSeniorMode ? 'text-sm' : 'text-xs'}`}>
                    <Eye size={isSeniorMode ? 18 : 14} /> Hiển thị & Truy cập
                </h3>
                <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden p-6">
                     <div className="flex items-center justify-between">
                        <div>
                            <h4 className={`font-bold text-slate-800 flex items-center gap-2 ${isSeniorMode ? 'text-xl' : 'text-sm'}`}>
                                <Type size={isSeniorMode ? 24 : 16} className="text-purple-600" /> Chế độ Người Cao Tuổi
                            </h4>
                            <p className={`text-slate-400 mt-0.5 ${isSeniorMode ? 'text-base' : 'text-xs'}`}>Chữ to, giao diện đơn giản, dễ nhìn hơn.</p>
                        </div>
                        
                        {/* Custom iOS Toggle */}
                        <div 
                            onClick={toggleSeniorMode}
                            className={`w-14 h-8 rounded-full p-1 cursor-pointer transition-colors duration-300 relative ${isSeniorMode ? 'bg-purple-600' : 'bg-slate-200'}`}
                        >
                            <div className={`w-6 h-6 bg-white rounded-full shadow-md absolute top-1 transition-all duration-300 ${isSeniorMode ? 'left-[calc(100%-1.75rem)]' : 'left-1'}`}></div>
                        </div>
                    </div>
                </div>
            </section>

            {/* AI Customization */}
            <section>
                <h3 className={`font-bold text-slate-400 uppercase tracking-wider mb-3 px-2 flex items-center gap-2 ${isSeniorMode ? 'text-sm' : 'text-xs'}`}>
                    <Settings size={isSeniorMode ? 18 : 14} /> Cấu hình AI Bảo Vệ
                </h3>
                <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden p-6 space-y-6 relative">
                    
                    {/* Free Plan Lock Overlay for Advanced Settings */}
                    {isFree && (
                        <div className="absolute inset-0 bg-slate-50/60 backdrop-blur-[1px] z-10 flex items-center justify-center rounded-3xl">
                            <button 
                                onClick={() => setShowPremiumModal(true)}
                                className="bg-slate-900 text-white px-6 py-3 rounded-xl font-bold shadow-lg flex items-center gap-2 active:scale-95 transition-transform"
                            >
                                <Zap size={16} className="text-yellow-400" fill="currentColor" /> Mở khóa tính năng Pro
                            </button>
                        </div>
                    )}

                    {/* Risk Threshold Slider */}
                    <div>
                        <div className="flex justify-between items-center mb-2">
                            <label className={`font-bold text-slate-800 flex items-center gap-2 ${isSeniorMode ? 'text-lg' : 'text-sm'}`}>
                                <Shield size={isSeniorMode ? 20 : 16} className="text-blue-600" /> Ngưỡng Cảnh Báo
                            </label>
                            <span className={`font-black text-blue-600 bg-blue-50 px-3 py-1 rounded-lg ${isSeniorMode ? 'text-base' : 'text-sm'}`}>{user.riskThreshold || 70}/100</span>
                        </div>
                        <input 
                            type="range" 
                            min="50" 
                            max="95" 
                            value={user.riskThreshold || 70} 
                            onChange={(e) => updateSettings({ riskThreshold: parseInt(e.target.value) })}
                            className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-blue-600"
                            disabled={isFree}
                        />
                        <p className={`text-slate-400 mt-2 ${isSeniorMode ? 'text-base' : 'text-xs'}`}>
                            AI sẽ báo động đỏ khi điểm uy tín số gọi đến thấp hơn mức này.
                        </p>
                    </div>

                    <div className="h-px bg-slate-100 w-full"></div>

                    {/* Auto Hangup Toggle */}
                    <div className="flex items-center justify-between">
                        <div>
                            <h4 className={`font-bold text-slate-800 flex items-center gap-2 ${isSeniorMode ? 'text-lg' : 'text-sm'}`}>
                                <PhoneOff size={isSeniorMode ? 20 : 16} className="text-slate-700" /> Tự động Ngắt
                            </h4>
                            <p className={`text-slate-400 mt-0.5 ${isSeniorMode ? 'text-base' : 'text-xs'}`}>Tự tắt máy nếu số gọi đến là lừa đảo (Scam).</p>
                        </div>
                        {/* Standard toggle for other settings */}
                        <div 
                            onClick={() => updateSettings({ autoHangupHighRisk: !user.autoHangupHighRisk })}
                            className={`w-12 h-7 rounded-full relative cursor-pointer transition-colors duration-300 ${user.autoHangupHighRisk ? 'bg-slate-800' : 'bg-slate-200'}`}
                        >
                            <div className={`absolute top-1 bg-white w-5 h-5 rounded-full shadow-sm transition-transform duration-300 ${user.autoHangupHighRisk ? 'translate-x-6' : 'translate-x-1'}`}></div>
                        </div>
                    </div>
                </div>
            </section>

             {/* Blocked Numbers Section */}
             <section>
                <h3 className={`font-bold text-slate-400 uppercase tracking-wider mb-3 px-2 flex items-center gap-2 ${isSeniorMode ? 'text-sm' : 'text-xs'}`}>
                    <Ban size={isSeniorMode ? 18 : 14} /> Danh sách chặn
                </h3>
                <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
                     <button 
                        onClick={() => setShowBlocked(!showBlocked)}
                        className="w-full text-left p-6 flex items-center justify-between hover:bg-slate-50 transition-colors"
                     >
                         <div className="flex items-center gap-3">
                             <div className={`bg-red-50 rounded-full flex items-center justify-center text-red-600 ${isSeniorMode ? 'w-12 h-12' : 'w-10 h-10'}`}>
                                 <PhoneOff size={isSeniorMode ? 24 : 18} />
                             </div>
                             <div>
                                 <h4 className={`font-bold text-slate-800 ${isSeniorMode ? 'text-xl' : 'text-sm'}`}>
                                     Số đã chặn ({user.blockedNumbers?.length || 0})
                                 </h4>
                                 <p className={`text-slate-500 ${isSeniorMode ? 'text-base' : 'text-xs'}`}>Quản lý danh sách đen</p>
                             </div>
                         </div>
                         <ChevronRight className={`text-slate-300 transition-transform ${showBlocked ? 'rotate-90' : ''}`} size={isSeniorMode ? 28 : 20} />
                     </button>
                     
                     {showBlocked && (
                         <div className="border-t border-slate-100 bg-slate-50">
                             {user.blockedNumbers && user.blockedNumbers.length > 0 ? (
                                 <div className="divide-y divide-slate-200">
                                     {user.blockedNumbers.map(phone => (
                                         <div key={phone} className="p-4 flex items-center justify-between hover:bg-slate-100">
                                             <span className={`font-bold text-slate-700 ${isSeniorMode ? 'text-lg' : 'text-base'}`}>{phone}</span>
                                             <button 
                                                 onClick={() => unblockNumber(phone)}
                                                 className="text-red-500 hover:bg-red-100 p-2 rounded-lg text-sm font-bold flex items-center gap-1"
                                             >
                                                 <Trash2 size={16} /> Bỏ chặn
                                             </button>
                                         </div>
                                     ))}
                                 </div>
                             ) : (
                                 <div className="p-6 text-center text-slate-400 text-sm">Chưa chặn số nào.</div>
                             )}
                         </div>
                     )}
                </div>
            </section>

            <button 
                onClick={logout}
                className={`w-full bg-slate-100 hover:bg-red-50 text-slate-500 hover:text-red-600 font-bold rounded-2xl flex items-center justify-center gap-2 transition-colors ${isSeniorMode ? 'py-5 text-lg' : 'py-4 text-sm'}`}
            >
                <LogOut size={isSeniorMode ? 24 : 18} /> Đăng Xuất Tài Khoản
            </button>
            
            <div className="text-center text-[10px] text-slate-300 font-mono pb-4">
                TruthShield AI v5.1.0 • Powered by Carrier Data
            </div>
        </div>

        {showPremiumModal && <PremiumUpgradeModal onClose={() => setShowPremiumModal(false)} />}
    </div>
  );
};

export default ProfileScreen;
