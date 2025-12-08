import React, { useState } from 'react';
import { X, Play, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface TutorialModalProps {
  onClose: () => void;
}

const TutorialModal: React.FC<TutorialModalProps> = ({ onClose }) => {
  const { isSeniorMode } = useAuth();
  const [activeVideo, setActiveVideo] = useState(0);

  // YouTube Video IDs for real content
  const tutorials = [
    { id: 0, title: "1. Giới thiệu TruthShield", desc: "Cách bật bảo vệ và thiết lập ban đầu.", videoId: "z1-2hJ8tSbc" }, // Example: AI Security Intro
    { id: 1, title: "2. Cảnh báo Lừa Đảo", desc: "Cách nhận biết cuộc gọi giả mạo.", videoId: "XuR4F-3s2j0" }, // Example: Phishing
    { id: 2, title: "3. Bảo vệ Gia đình", desc: "Kết nối và giám sát người thân.", videoId: "9m3Xh6YkY4g" }, // Example: Family Safety
    { id: 3, title: "4. Công nghệ AI", desc: "AI phát hiện Deepfake như thế nào?", videoId: "m7YhXWj3gxE" }, // Example: AI Tech
  ];

  return (
    <div 
        className="fixed inset-0 z-[80] bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4 animate-in zoom-in duration-300"
        role="dialog"
        aria-modal="true"
        aria-labelledby="tutorial-title"
    >
      
      <div className="bg-white w-full max-w-4xl rounded-3xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden border border-slate-200">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-100 bg-white">
          <div className="flex items-center gap-4">
             <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
               <Play size={24} className="text-blue-600 fill-blue-600 ml-1" />
             </div>
             <div>
               <h2 id="tutorial-title" className={`${isSeniorMode ? 'text-3xl' : 'text-2xl'} font-bold text-slate-900`}>Hướng Dẫn Sử Dụng</h2>
               <p className={`${isSeniorMode ? 'text-lg' : 'text-base'} text-slate-500`}>Xem video để biết cách bảo vệ bản thân</p>
             </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-800 transition-colors bg-slate-100 p-3 rounded-full touch-target" aria-label="Đóng hướng dẫn">
            <X size={28} />
          </button>
        </div>

        <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
            
            {/* Video Player Area */}
            <div className="flex-1 bg-slate-900 p-0 flex items-center justify-center relative bg-black">
                <div className="w-full h-full relative group">
                    <iframe 
                        width="100%" 
                        height="100%" 
                        src={`https://www.youtube.com/embed/${tutorials[activeVideo].videoId}?autoplay=1&rel=0`}
                        title="YouTube video player" 
                        frameBorder="0" 
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
                        allowFullScreen
                        className="w-full h-full"
                    ></iframe>
                </div>
            </div>

            {/* Sidebar List */}
            <div className="w-full md:w-80 bg-white border-l border-slate-200 overflow-y-auto p-4 space-y-3">
                <h3 className="font-bold text-slate-500 uppercase text-xs tracking-wider mb-2 px-2">Danh sách bài học</h3>
                {tutorials.map((t, idx) => (
                    <button 
                        key={t.id}
                        onClick={() => setActiveVideo(idx)}
                        className={`w-full text-left rounded-2xl transition-all flex items-start gap-3 border-2 ${
                            isSeniorMode ? 'p-6' : 'p-4'
                        } ${
                            activeVideo === idx 
                            ? 'bg-blue-50 border-blue-500 shadow-sm' 
                            : 'bg-white border-slate-100 hover:bg-slate-50 hover:border-slate-300'
                        }`}
                    >
                        <div className={`mt-1 flex-shrink-0 ${activeVideo === idx ? 'text-blue-600' : 'text-slate-400'}`}>
                            {activeVideo === idx ? <Play size={isSeniorMode ? 24 : 20} fill="currentColor" /> : <div className="w-6 h-6 rounded-full border-2 border-slate-300 flex items-center justify-center text-[10px] font-bold">{idx + 1}</div>}
                        </div>
                        <div>
                            <h4 className={`font-bold ${isSeniorMode ? 'text-lg' : 'text-base'} ${activeVideo === idx ? 'text-blue-900' : 'text-slate-700'}`}>
                                {t.title}
                            </h4>
                            <p className={`${isSeniorMode ? 'text-base' : 'text-sm'} text-slate-500 mt-1 leading-tight`}>{t.desc}</p>
                        </div>
                    </button>
                ))}
            </div>
        </div>

        {/* Footer Action */}
        <div className="p-6 border-t border-slate-100 bg-slate-50 flex justify-end">
           <button 
             onClick={onClose}
             className="px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold flex items-center gap-2 transition-all shadow-lg shadow-blue-200 text-lg touch-target"
           >
             Đã Hiểu & Bắt Đầu <ArrowRight size={24} />
           </button>
        </div>

      </div>
    </div>
  );
};

export default TutorialModal;