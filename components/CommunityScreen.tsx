
import React, { useState, useEffect } from 'react';
import { Globe, TrendingUp, Shield, User, Award, ArrowUpRight, MessageCircle, Activity, MapPin, ThumbsUp } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const CommunityScreen: React.FC = () => {
  const { isSeniorMode } = useAuth();
  const [activeUsers, setActiveUsers] = useState(12543);
  
  // Mock Real-time Feed
  const [feed, setFeed] = useState([
    { id: 1, user: 'Minh T.', action: 'báo cáo số', target: '090...123', type: 'scam', time: 'Vừa xong', location: 'Hà Nội' },
    { id: 2, user: 'Hạnh P.', action: 'xác nhận an toàn', target: '098...999', type: 'safe', time: '1 phút trước', location: 'TP.HCM' },
    { id: 3, user: 'Tuấn A.', action: 'chia sẻ cảnh báo', target: 'Deepfake', type: 'warning', time: '2 phút trước', location: 'Đà Nẵng' },
    { id: 4, user: 'Bác Ba', action: 'chặn số rác', target: '028...111', type: 'block', time: '5 phút trước', location: 'Cần Thơ' },
  ]);

  // Simulate Live Activity
  useEffect(() => {
    const interval = setInterval(() => {
        setActiveUsers(prev => prev + Math.floor(Math.random() * 5) - 2);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const getTypeColor = (type: string) => {
      switch(type) {
          case 'scam': return 'text-red-600 bg-red-50 border-red-100';
          case 'safe': return 'text-green-600 bg-green-50 border-green-100';
          case 'warning': return 'text-amber-600 bg-amber-50 border-amber-100';
          default: return 'text-slate-600 bg-slate-50 border-slate-100';
      }
  };

  return (
    <div className={`p-4 md:p-6 pt-20 md:pt-10 pb-32 min-h-screen max-w-5xl mx-auto animate-in fade-in duration-300 ${isSeniorMode ? 'text-lg' : ''}`}>
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
            <div>
                <h1 className={`${isSeniorMode ? 'text-4xl' : 'text-3xl'} font-black text-slate-900 mb-2 flex items-center gap-3`}>
                    <Globe size={isSeniorMode ? 40 : 32} className="text-blue-600" />
                    Cộng Đồng TruthShield
                </h1>
                <p className="text-slate-500 font-medium">
                    Mạng lưới {activeUsers.toLocaleString()} người dùng đang bảo vệ lẫn nhau.
                </p>
            </div>
            <div className="flex gap-3">
                <div className="bg-white px-5 py-3 rounded-2xl border border-slate-200 shadow-sm flex flex-col items-center">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Báo cáo hôm nay</span>
                    <span className="text-2xl font-black text-slate-900">12.5k</span>
                </div>
                <div className="bg-blue-600 text-white px-5 py-3 rounded-2xl shadow-lg shadow-blue-200 flex flex-col items-center">
                    <span className="text-xs font-bold text-blue-200 uppercase tracking-wider">Đã ngăn chặn</span>
                    <span className="text-2xl font-black">85.2k</span>
                </div>
            </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Left Column: Live Feed */}
            <div className="lg:col-span-2 space-y-6">
                <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                        <h3 className="font-bold text-slate-800 flex items-center gap-2">
                            <Activity className="text-green-500" size={20} /> Hoạt Động Trực Tuyến
                        </h3>
                        <span className="flex items-center gap-1.5 text-xs font-bold text-green-600 bg-green-100 px-2 py-1 rounded-full animate-pulse">
                            <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span> LIVE
                        </span>
                    </div>
                    <div className="divide-y divide-slate-100">
                        {feed.map((item) => (
                            <div key={item.id} className="p-5 flex items-start gap-4 hover:bg-slate-50 transition-colors">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${item.type === 'scam' ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'}`}>
                                    {item.user.charAt(0)}
                                </div>
                                <div className="flex-1">
                                    <div className="flex justify-between items-start">
                                        <p className="text-slate-900 font-bold">
                                            {item.user} <span className="font-medium text-slate-500">{item.action}</span>
                                        </p>
                                        <span className="text-xs text-slate-400 font-medium">{item.time}</span>
                                    </div>
                                    <div className="flex items-center gap-2 mt-1">
                                        <span className={`text-xs font-bold px-2 py-0.5 rounded border ${getTypeColor(item.type)} uppercase`}>
                                            {item.target}
                                        </span>
                                        <span className="text-xs text-slate-400 flex items-center gap-1">
                                            <MapPin size={10} /> {item.location}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                    <button className="w-full p-4 text-center text-blue-600 font-bold text-sm hover:bg-blue-50 transition-colors">
                        Xem thêm hoạt động
                    </button>
                </div>

                {/* Trending Scams Banner */}
                <div className="bg-gradient-premium rounded-3xl p-6 text-white relative overflow-hidden shadow-xl">
                    <div className="relative z-10 flex items-center justify-between">
                        <div>
                            <div className="flex items-center gap-2 text-red-300 font-bold uppercase text-xs tracking-wider mb-2">
                                <TrendingUp size={16} /> Đang bùng nổ
                            </div>
                            <h3 className={`${isSeniorMode ? 'text-2xl' : 'text-xl'} font-bold mb-2`}>Cảnh báo: Lừa đảo "Khóa SIM 2 chiều"</h3>
                            <p className="text-slate-300 text-sm max-w-md mb-4">
                                Hơn 500 báo cáo trong 1 giờ qua về các cuộc gọi mạo danh nhà mạng dọa khóa SIM.
                            </p>
                            <button className="bg-white text-slate-900 px-4 py-2 rounded-lg font-bold text-sm hover:bg-slate-100 transition-colors">
                                Xem chi tiết
                            </button>
                        </div>
                        <div className="w-24 h-24 bg-red-500 rounded-full flex items-center justify-center text-3xl font-black opacity-20 rotate-12 absolute -right-4 -bottom-4">
                            !
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Column: Leaderboard & Stats */}
            <div className="space-y-6">
                
                {/* Leaderboard */}
                <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="p-5 border-b border-slate-100 bg-yellow-50/50">
                        <h3 className="font-bold text-slate-800 flex items-center gap-2">
                            <Award className="text-yellow-500" size={20} /> Top "Thám Tử" Tuần
                        </h3>
                    </div>
                    <div className="p-2">
                        {[
                            { name: 'Nguyễn Văn A', points: 1540, badge: 'Vàng' },
                            { name: 'Trần Thị B', points: 1200, badge: 'Bạc' },
                            { name: 'Le Hoang', points: 980, badge: 'Đồng' },
                        ].map((user, idx) => (
                            <div key={idx} className="flex items-center justify-between p-3 hover:bg-slate-50 rounded-xl transition-colors">
                                <div className="flex items-center gap-3">
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white shadow-sm ${
                                        idx === 0 ? 'bg-yellow-400' : idx === 1 ? 'bg-slate-300' : 'bg-amber-600'
                                    }`}>
                                        {idx + 1}
                                    </div>
                                    <div>
                                        <p className="font-bold text-slate-800 text-sm">{user.name}</p>
                                        <p className="text-xs text-slate-400">{user.points} điểm uy tín</p>
                                    </div>
                                </div>
                                <ArrowUpRight size={16} className="text-green-500" />
                            </div>
                        ))}
                    </div>
                    <div className="p-4 bg-slate-50 text-center border-t border-slate-100">
                        <p className="text-xs text-slate-500">Báo cáo số lạ để nhận điểm thưởng!</p>
                    </div>
                </div>

                {/* Join CTA */}
                <div className="bg-indigo-600 rounded-3xl p-6 text-white text-center shadow-lg shadow-indigo-200">
                    <Shield size={40} className="mx-auto mb-3 opacity-90" />
                    <h3 className="font-bold text-lg mb-2">Bạn có số lạ?</h3>
                    <p className="text-indigo-100 text-sm mb-4">
                        Đóng góp vào cơ sở dữ liệu chung để bảo vệ mọi người.
                    </p>
                    <button className="w-full py-3 bg-white text-indigo-600 rounded-xl font-bold text-sm hover:bg-indigo-50 transition-colors">
                        Báo cáo ngay
                    </button>
                </div>

            </div>
        </div>
    </div>
  );
};

export default CommunityScreen;
