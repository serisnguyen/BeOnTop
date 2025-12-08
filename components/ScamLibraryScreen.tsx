
import React, { useState, useRef, useEffect, useMemo } from 'react';
import { BookOpen, ShieldAlert, Zap, Banknote, Heart, RefreshCw, AlertTriangle, Volume2, StopCircle, PlayCircle, XCircle, Search, Filter } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { SCAM_LIBRARY_DATA, ScamCase } from '../data/mockData';

interface ScamLibraryScreenProps {
  onOpenTutorial?: () => void;
}

const ScamLibraryScreen: React.FC<ScamLibraryScreenProps> = ({ onOpenTutorial }) => {
  const { isSeniorMode } = useAuth();
  const [activeCategory, setActiveCategory] = useState<string>('Tất cả');
  const [searchTerm, setSearchTerm] = useState('');
  const [speakingId, setSpeakingId] = useState<number | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  const categories = ['Tất cả', 'Deepfake', 'Giả danh', 'Đầu tư', 'Tình cảm', 'Mã độc'];

  const filteredScams = useMemo(() => {
      return SCAM_LIBRARY_DATA.filter(scam => {
          const matchesCategory = activeCategory === 'Tất cả' || scam.type === activeCategory;
          const matchesSearch = 
            scam.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
            scam.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
            scam.keywords.some(k => k.toLowerCase().includes(searchTerm.toLowerCase()));
          return matchesCategory && matchesSearch;
      });
  }, [activeCategory, searchTerm]);

  // Voice logic remains similar but streamlined
  const speak = (scam: ScamCase) => {
    if (!('speechSynthesis' in window)) return setErrorMsg("Thiết bị không hỗ trợ đọc văn bản.");
    const synth = window.speechSynthesis;

    if (speakingId === scam.id) {
      synth.cancel();
      setSpeakingId(null);
      return;
    }
    synth.cancel();
    
    const text = `Cảnh báo lừa đảo dạng ${scam.type}. ${scam.title}. ${scam.description}`;
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'vi-VN';
    utterance.rate = isSeniorMode ? 0.85 : 1.0;
    
    utterance.onstart = () => setSpeakingId(scam.id);
    utterance.onend = () => setSpeakingId(null);
    utterance.onerror = () => { setSpeakingId(null); setErrorMsg("Lỗi đọc văn bản."); };
    
    utteranceRef.current = utterance;
    synth.speak(utterance);
  };

  useEffect(() => {
      return () => { window.speechSynthesis.cancel(); };
  }, []);

  const getIcon = (type: string) => {
    const size = isSeniorMode ? 40 : 20;
    switch (type) {
      case 'Deepfake': return <ShieldAlert size={size} className="text-red-600" />;
      case 'Giả danh': return <Banknote size={size} className="text-blue-600" />;
      case 'Đầu tư': return <Zap size={size} className="text-yellow-600" />;
      case 'Tình cảm': return <Heart size={size} className="text-pink-600" />;
      default: return <AlertTriangle size={size} className="text-slate-600" />;
    }
  };

  return (
    <div className={`p-4 md:p-6 pt-20 md:pt-10 pb-32 min-h-screen max-w-4xl mx-auto animate-in fade-in duration-300 ${isSeniorMode ? 'bg-slate-50' : 'bg-[#F8FAFC]'}`}>
      {errorMsg && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[110] bg-red-600 text-white px-6 py-3 rounded-full shadow-xl font-bold flex items-center gap-2">
            <XCircle size={20} /> {errorMsg}
        </div>
      )}

      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-6 gap-4 border-b border-slate-200 pb-4">
        <div>
          <h2 className={`${isSeniorMode ? 'text-3xl md:text-4xl' : 'text-3xl'} font-black text-slate-900 mb-2 flex items-center gap-2`}>
            <BookOpen size={isSeniorMode ? 48 : 32} className="text-blue-600" /> 
            {isSeniorMode ? 'THƯ VIỆN CẢNH BÁO' : 'Thư Viện Cảnh Báo'}
          </h2>
          <p className={`${isSeniorMode ? 'text-lg md:text-xl font-medium' : 'text-base'} text-slate-500`}>
            {isSeniorMode ? 'Tổng hợp các thủ đoạn lừa đảo. Bác bấm vào để nghe.' : 'Kiến thức phòng chống lừa đảo công nghệ cao.'}
          </p>
        </div>
      </div>

      {/* TOOLS: SEARCH & CATEGORIES */}
      <div className="mb-6 space-y-4">
           {/* Search Bar - REFACTORED STYLE */}
           <div className={`flex items-center bg-white border border-slate-200 rounded-2xl shadow-sm transition-all focus-within:ring-2 focus-within:ring-blue-500/20 focus-within:border-blue-400 ${isSeniorMode ? 'p-4' : 'p-3'}`}>
                <Search size={isSeniorMode ? 32 : 24} className="text-slate-400 flex-shrink-0 ml-1" />
                <input 
                    type="text" 
                    placeholder={isSeniorMode ? "Tìm kiếm (Ví dụ: Công an, Deepfake...)" : "Tìm kiếm thủ đoạn (VD: Deepfake, Công an...)"}
                    className={`w-full bg-transparent outline-none px-3 font-bold text-slate-800 placeholder:text-slate-400 placeholder:font-medium ${isSeniorMode ? 'text-xl' : 'text-base'}`}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
                {searchTerm && (
                    <button onClick={() => setSearchTerm('')} className="p-1 text-slate-400 hover:text-slate-600">
                        <XCircle size={20} />
                    </button>
                )}
           </div>

           {/* Category Tabs */}
           <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
                {categories.map(cat => (
                    <button
                        key={cat}
                        onClick={() => setActiveCategory(cat)}
                        className={`px-4 py-2 rounded-xl font-bold whitespace-nowrap transition-all border ${
                            activeCategory === cat 
                            ? 'bg-blue-600 text-white border-blue-600 shadow-md' 
                            : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50'
                        } ${isSeniorMode ? 'text-lg px-6 py-3' : 'text-sm'}`}
                    >
                        {cat}
                    </button>
                ))}
           </div>
      </div>

      {/* SCAM LIST */}
      <div className="space-y-6">
        {filteredScams.length > 0 ? filteredScams.map((scam) => (
          <div 
            key={scam.id} 
            onClick={() => isSeniorMode && speak(scam)} 
            className={`bg-white rounded-3xl shadow-sm hover:shadow-lg transition-all relative overflow-hidden group cursor-pointer ${
                isSeniorMode ? 'border-4 border-slate-200 p-6 active:bg-blue-50' : 'border border-slate-200 p-5'
            }`}
          >
             <div className={`absolute top-0 right-0 rounded-bl-2xl text-white font-bold uppercase tracking-wide shadow-sm flex items-center gap-1 ${
               scam.risk === 'Cao' ? 'bg-red-600' : scam.risk === 'Trung bình' ? 'bg-amber-500' : 'bg-blue-600'
             } ${isSeniorMode ? 'text-lg px-6 py-2' : 'text-xs px-3 py-1'}`}>
                <AlertTriangle size={isSeniorMode ? 20 : 12} fill="currentColor" />
                {scam.risk}
             </div>

            <div className="flex flex-col md:flex-row md:items-start gap-4 mb-3 pt-8 md:pt-0">
              <div className={`flex-shrink-0 bg-slate-100 rounded-2xl flex items-center justify-center border-2 border-slate-200 ${isSeniorMode ? 'w-20 h-20' : 'w-12 h-12'}`}>
                {getIcon(scam.type)}
              </div>

              <div className="flex-1 pr-4">
                <span className={`font-bold text-slate-500 uppercase tracking-wide block mb-1 ${isSeniorMode ? 'text-base' : 'text-xs'}`}>
                    {scam.type}
                </span>
                <h3 className={`font-black text-slate-900 leading-tight ${isSeniorMode ? 'text-2xl md:text-3xl' : 'text-xl'}`}>
                    {scam.title}
                </h3>
              </div>
              
              {isSeniorMode && (
                  <button 
                    onClick={(e) => {
                        e.stopPropagation();
                        speak(scam);
                    }}
                    className={`flex-shrink-0 w-full md:w-auto px-6 py-4 rounded-2xl border-2 flex items-center justify-center gap-3 transition-all shadow-md active:scale-95 mt-4 md:mt-0 ${
                        speakingId === scam.id 
                        ? 'bg-red-100 border-red-500 text-red-700 animate-pulse' 
                        : 'bg-white border-blue-600 text-blue-700 hover:bg-blue-50'
                    }`}
                  >
                      {speakingId === scam.id ? <StopCircle size={32} /> : <Volume2 size={32} />}
                      <span className="font-bold text-xl uppercase">
                          {speakingId === scam.id ? 'Dừng Lại' : 'Đọc Nghe'}
                      </span>
                  </button>
              )}
            </div>
            
            <p className={`text-slate-700 leading-relaxed mb-4 mt-2 ${isSeniorMode ? 'text-xl font-medium' : 'text-base'}`}>
              {scam.description}
            </p>

            {/* Real Case Info */}
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 mb-4">
                 <div className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase mb-1">
                     <BookOpen size={12} /> Ví dụ thực tế:
                 </div>
                 <p className={`font-bold text-slate-800 ${isSeniorMode ? 'text-lg' : 'text-sm'}`}>
                     "{scam.realCase}" <span className="text-red-600 font-black">- {scam.damage}</span>
                 </p>
            </div>
            
            <div className="flex flex-wrap gap-2 pt-4 border-t-2 border-slate-100">
              <span className={`font-bold text-red-600 mr-2 uppercase tracking-wide py-1 flex items-center gap-1 ${isSeniorMode ? 'text-base' : 'text-xs'}`}>
                  <Zap size={16} /> Từ khóa:
              </span>
              {scam.keywords.map((kw, idx) => (
                <span key={idx} className={`bg-red-50 text-red-700 font-bold rounded-lg border border-red-100 ${isSeniorMode ? 'text-base px-3 py-1.5' : 'text-xs px-2 py-1'}`}>
                  {kw}
                </span>
              ))}
            </div>
          </div>
        )) : (
            <div className="text-center py-20">
                <Search size={48} className="mx-auto text-slate-300 mb-4" />
                <p className="text-slate-500 font-bold">Không tìm thấy kết quả nào.</p>
            </div>
        )}
      </div>
    </div>
  );
};

export default ScamLibraryScreen;
