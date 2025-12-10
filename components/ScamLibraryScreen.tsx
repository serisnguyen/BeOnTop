
import React, { useState, useRef, useEffect, useMemo } from 'react';
import { BookOpen, ShieldAlert, Zap, Banknote, Heart, RefreshCw, AlertTriangle, Volume2, StopCircle, PlayCircle, XCircle, Search, Filter, ArrowLeft } from 'lucide-react';
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
  const [selectedScam, setSelectedScam] = useState<ScamCase | null>(null);
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

  // --- TTS Logic ---
  const speak = (scam: ScamCase) => {
    if (!('speechSynthesis' in window)) return setErrorMsg("Thiết bị không hỗ trợ đọc văn bản.");
    const synth = window.speechSynthesis;

    if (speakingId === scam.id) {
      synth.cancel();
      setSpeakingId(null);
      return;
    }
    
    synth.cancel();
    
    const text = `Cảnh báo: ${scam.title}. ${scam.description}. Ví dụ thực tế: ${scam.realCase}`;
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
    const size = isSeniorMode ? 32 : 24;
    switch (type) {
      case 'Deepfake': return <ShieldAlert size={size} className={isSeniorMode ? "text-red-700" : "text-red-600"} />;
      case 'Giả danh': return <Banknote size={size} className={isSeniorMode ? "text-blue-700" : "text-blue-600"} />;
      case 'Đầu tư': return <Zap size={size} className={isSeniorMode ? "text-amber-700" : "text-yellow-600"} />;
      case 'Tình cảm': return <Heart size={size} className={isSeniorMode ? "text-pink-700" : "text-pink-600"} />;
      default: return <AlertTriangle size={size} className="text-slate-600" />;
    }
  };

  // --- THEME CONSTANTS ---
  const theme = isSeniorMode ? {
      bg: 'bg-[#FFFBEB]', // Warm background
      textMain: 'text-slate-900',
      textSub: 'text-slate-600',
      headerIcon: 'text-amber-600',
      cardBg: 'bg-white', // Pure white cards
      cardBorder: 'border-transparent', // REMOVED AMBER BORDER
      cardShadow: 'shadow-md shadow-amber-900/5', // Soft shadow instead of border
      badgeHigh: 'bg-red-100 text-red-800 border-red-200',
      badgeMed: 'bg-amber-100 text-amber-800 border-amber-200',
      badgeLow: 'bg-blue-100 text-blue-800 border-blue-200',
      inputBorder: 'border-slate-200 focus:ring-amber-500',
      activeTab: 'bg-amber-600 text-white border-amber-600',
      inactiveTab: 'bg-white text-amber-900 border-amber-100 hover:bg-amber-50',
      iconBg: 'bg-amber-50 border-amber-100',
      detailBg: 'bg-[#FFFDE7]', // Cream for detail view background
  } : {
      bg: 'bg-[#F8FAFC]',
      textMain: 'text-slate-900',
      textSub: 'text-slate-500',
      headerIcon: 'text-blue-600',
      cardBg: 'bg-white',
      cardBorder: 'border-slate-200',
      cardShadow: 'shadow-slate-100',
      badgeHigh: 'bg-red-100 text-red-700',
      badgeMed: 'bg-amber-100 text-amber-700',
      badgeLow: 'bg-blue-100 text-blue-700',
      inputBorder: 'border-slate-200 focus:ring-blue-500',
      activeTab: 'bg-blue-600 text-white border-blue-600',
      inactiveTab: 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50',
      iconBg: 'bg-slate-50 border-slate-100',
      detailBg: 'bg-[#F8FAFC]',
  };

  // --- FONT SCALING ---
  const titleClass = isSeniorMode ? 'text-2xl font-black mb-3' : 'text-lg font-bold mb-1';
  const descClass = isSeniorMode ? 'text-xl leading-relaxed text-slate-800' : 'text-sm text-slate-600';
  const badgeClass = isSeniorMode ? 'text-sm px-3 py-1 border' : 'text-[10px] px-2 py-0.5';
  const detailTitleClass = isSeniorMode ? 'text-3xl font-black mb-4' : 'text-2xl font-bold mb-2';
  const detailTextClass = isSeniorMode ? 'text-2xl leading-loose text-slate-900' : 'text-base leading-relaxed text-slate-700';

  // --- DETAIL VIEW (When scam is selected) ---
  if (selectedScam) {
      return (
          <div className={`p-4 md:p-6 pt-20 md:pt-10 pb-32 min-h-screen max-w-4xl mx-auto animate-in fade-in duration-300 ${theme.bg}`}>
              <button 
                  onClick={() => {
                      window.speechSynthesis.cancel();
                      setSpeakingId(null);
                      setSelectedScam(null);
                  }} 
                  className={`mb-4 flex items-center gap-2 font-bold hover:opacity-80 transition-opacity ${isSeniorMode ? 'text-amber-800' : 'text-slate-500'}`}
              >
                  <ArrowLeft size={isSeniorMode ? 28 : 20} /> Quay lại
              </button>
              
              <div className={`${theme.cardBg} rounded-[2rem] p-6 shadow-xl ${theme.cardShadow} border ${theme.cardBorder}`}>
                  <div className="flex items-start gap-4 mb-6">
                       <div className={`p-3 rounded-2xl flex-shrink-0 ${theme.iconBg}`}>
                           {getIcon(selectedScam.type)}
                       </div>
                       <div>
                           <span className={`text-xs font-bold uppercase ${theme.textSub}`}>{selectedScam.type}</span>
                           <h1 className={`${detailTitleClass} ${theme.textMain}`}>{selectedScam.title}</h1>
                       </div>
                  </div>

                  {/* BIG TTS BUTTON - ONLY IN DETAIL VIEW */}
                  <button 
                      onClick={(e) => { e.stopPropagation(); speak(selectedScam); }}
                      className={`w-full mb-6 flex items-center justify-center gap-3 rounded-xl font-bold transition-all shadow-sm active:scale-95 ${
                          speakingId === selectedScam.id 
                          ? 'bg-red-100 text-red-600 border border-red-200' 
                          : isSeniorMode ? 'bg-amber-600 text-white shadow-amber-200 hover:bg-amber-700' : 'bg-blue-600 text-white hover:bg-blue-700 shadow-blue-200'
                      } ${isSeniorMode ? 'py-5 text-2xl' : 'py-3 text-base'}`}
                  >
                      {speakingId === selectedScam.id ? <StopCircle size={isSeniorMode ? 32 : 24} /> : <Volume2 size={isSeniorMode ? 32 : 24} />}
                      {speakingId === selectedScam.id ? 'Dừng đọc' : 'Đọc nội dung này'}
                  </button>

                  <div className={detailTextClass}>
                      {selectedScam.description}
                  </div>
                  
                  {/* Real Case Box */}
                  <div className={`mt-8 p-6 rounded-2xl border ${theme.cardBorder} ${isSeniorMode ? 'bg-amber-50' : 'bg-slate-50'}`}>
                       <h4 className={`font-bold uppercase text-xs mb-3 flex items-center gap-2 ${theme.textSub}`}>
                           <AlertTriangle size={16} /> Ví dụ thực tế
                       </h4>
                       <p className={`font-medium mb-3 ${isSeniorMode ? 'text-xl text-slate-900' : 'text-sm text-slate-900'}`}>
                           "{selectedScam.realCase}"
                       </p>
                       <p className={`font-bold ${isSeniorMode ? 'text-xl text-red-700' : 'text-sm text-red-600'}`}>
                           Thiệt hại: {selectedScam.damage}
                       </p>
                  </div>
              </div>
          </div>
      );
  }

  // --- LIST VIEW ---
  return (
    <div className={`p-4 md:p-6 pt-20 md:pt-10 pb-32 min-h-screen max-w-4xl mx-auto animate-in fade-in duration-300 ${theme.bg}`}>
      {errorMsg && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[110] bg-red-600 text-white px-6 py-3 rounded-full shadow-xl font-bold flex items-center gap-2">
            <XCircle size={20} /> {errorMsg}
        </div>
      )}

      {/* HEADER */}
      <div className={`mb-6 border-b pb-4 ${isSeniorMode ? 'border-amber-200' : 'border-slate-200'}`}>
          <h2 className={`${isSeniorMode ? 'text-3xl' : 'text-2xl'} font-black ${theme.textMain} mb-1 flex items-center gap-2`}>
            <BookOpen size={isSeniorMode ? 32 : 24} className={theme.headerIcon} /> 
            {isSeniorMode ? 'THƯ VIỆN CẢNH BÁO' : 'Thư Viện'}
          </h2>
          <p className={`${isSeniorMode ? 'text-xl font-medium' : 'text-sm'} ${theme.textSub}`}>
            {isSeniorMode ? 'Danh sách các thủ đoạn lừa đảo phổ biến.' : 'Kiến thức phòng chống lừa đảo công nghệ cao.'}
          </p>
      </div>

      {/* TOOLS */}
      <div className="mb-6 space-y-4">
           {/* Search */}
           <div className={`flex items-center bg-white border rounded-2xl shadow-sm px-4 py-2 focus-within:ring-2 focus-within:ring-opacity-50 ${theme.inputBorder}`}>
                <Search size={24} className={isSeniorMode ? "text-amber-400" : "text-slate-400"} />
                <input 
                    type="text" 
                    placeholder="Tìm kiếm thủ đoạn..."
                    className={`w-full bg-transparent outline-none font-bold text-slate-800 placeholder:text-slate-400 ml-3 ${isSeniorMode ? 'text-xl py-2' : 'text-sm'}`}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
                {searchTerm && <button onClick={() => setSearchTerm('')}><XCircle size={20} className="text-slate-400" /></button>}
           </div>

           {/* Categories */}
           <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
                {categories.map(cat => (
                    <button
                        key={cat}
                        onClick={() => setActiveCategory(cat)}
                        className={`rounded-xl font-bold whitespace-nowrap transition-all border shadow-sm ${
                            activeCategory === cat ? theme.activeTab : theme.inactiveTab
                        } ${isSeniorMode ? 'px-5 py-3 text-lg' : 'px-3 py-1.5 text-xs'}`}
                    >
                        {cat}
                    </button>
                ))}
           </div>
      </div>

      {/* SCAM LIST */}
      <div className="space-y-4">
        {filteredScams.length > 0 ? filteredScams.map((scam) => (
          <div 
            key={scam.id} 
            onClick={() => setSelectedScam(scam)}
            className={`${theme.cardBg} rounded-[2rem] shadow-sm border ${theme.cardBorder} overflow-hidden group cursor-pointer hover:shadow-md transition-all ${isSeniorMode ? 'p-6' : 'p-4'}`}
          >
             <div className="flex justify-between items-start gap-4 mb-3">
                 <div className="flex items-start gap-4">
                     <div className={`p-3 rounded-2xl flex-shrink-0 ${theme.iconBg}`}>
                         {getIcon(scam.type)}
                     </div>
                     <div>
                         <span className={`${theme.textSub} font-bold uppercase tracking-wider block mb-1 ${isSeniorMode ? 'text-sm' : 'text-[10px]'}`}>
                             {scam.type}
                         </span>
                         <h3 className={`${theme.textMain} leading-tight ${titleClass}`}>{scam.title}</h3>
                     </div>
                 </div>
             </div>

             {/* Risk Badge */}
             <div className="mb-4">
                 <span className={`rounded-lg font-bold inline-flex items-center gap-1.5 ${
                   scam.risk === 'Cao' ? theme.badgeHigh : scam.risk === 'Trung bình' ? theme.badgeMed : theme.badgeLow
                 } ${badgeClass}`}>
                    <AlertTriangle size={isSeniorMode ? 16 : 10} fill="currentColor" /> {scam.risk}
                 </span>
             </div>
            
             <p className={`${descClass} mb-4 line-clamp-3`}>{scam.description}</p>
             
             <div className={`${isSeniorMode ? 'text-amber-700 text-lg' : 'text-blue-600 text-sm'} font-bold flex items-center gap-1`}>
                 Xem chi tiết <Search size={isSeniorMode ? 18 : 14} />
             </div>
          </div>
        )) : (
            <div className="text-center py-20">
                <Search size={isSeniorMode ? 64 : 48} className={`mx-auto mb-4 opacity-50 ${isSeniorMode ? 'text-amber-300' : 'text-slate-300'}`} />
                <p className={`${theme.textSub} font-bold ${isSeniorMode ? 'text-xl' : 'text-base'}`}>Không tìm thấy kết quả nào.</p>
            </div>
        )}
      </div>
    </div>
  );
};

export default ScamLibraryScreen;
