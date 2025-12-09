
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
      case 'Deepfake': return <ShieldAlert size={size} className="text-red-600" />;
      case 'Giả danh': return <Banknote size={size} className="text-blue-600" />;
      case 'Đầu tư': return <Zap size={size} className="text-yellow-600" />;
      case 'Tình cảm': return <Heart size={size} className="text-pink-600" />;
      default: return <AlertTriangle size={size} className="text-slate-600" />;
    }
  };

  // --- FONT SCALING CONSTANTS ---
  const titleClass = isSeniorMode ? 'text-2xl font-black mb-3' : 'text-lg font-bold mb-1';
  const descClass = isSeniorMode ? 'text-xl leading-relaxed text-slate-700' : 'text-sm text-slate-600';
  const badgeClass = isSeniorMode ? 'text-sm px-3 py-1' : 'text-[10px] px-2 py-0.5';
  
  const detailTitleClass = isSeniorMode ? 'text-3xl font-black mb-4' : 'text-2xl font-bold mb-2';
  const detailTextClass = isSeniorMode ? 'text-2xl leading-loose text-slate-800' : 'text-base leading-relaxed text-slate-700';

  // --- DETAIL VIEW (When scam is selected) ---
  if (selectedScam) {
      return (
          <div className={`p-4 md:p-6 pt-20 md:pt-10 pb-32 min-h-screen max-w-4xl mx-auto animate-in fade-in duration-300 ${isSeniorMode ? 'bg-slate-50' : 'bg-[#F8FAFC]'}`}>
              <button 
                  onClick={() => {
                      window.speechSynthesis.cancel();
                      setSpeakingId(null);
                      setSelectedScam(null);
                  }} 
                  className="mb-4 flex items-center gap-2 text-slate-500 font-bold hover:text-blue-600 transition-colors"
              >
                  <ArrowLeft size={isSeniorMode ? 28 : 20} /> Quay lại
              </button>
              
              <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200">
                  <div className="flex items-start gap-4 mb-6">
                       <div className="p-3 bg-blue-50 rounded-2xl text-blue-600 flex-shrink-0">{getIcon(selectedScam.type)}</div>
                       <div>
                           <span className="text-xs font-bold uppercase text-slate-400">{selectedScam.type}</span>
                           <h1 className={detailTitleClass}>{selectedScam.title}</h1>
                       </div>
                  </div>

                  {/* BIG TTS BUTTON - ONLY IN DETAIL VIEW */}
                  <button 
                      onClick={(e) => { e.stopPropagation(); speak(selectedScam); }}
                      className={`w-full mb-6 flex items-center justify-center gap-3 rounded-xl font-bold transition-all shadow-sm active:scale-95 ${
                          speakingId === selectedScam.id 
                          ? 'bg-red-100 text-red-600 border border-red-200' 
                          : 'bg-blue-600 text-white hover:bg-blue-700 shadow-blue-200'
                      } ${isSeniorMode ? 'py-5 text-2xl' : 'py-3 text-base'}`}
                  >
                      {speakingId === selectedScam.id ? <StopCircle size={isSeniorMode ? 32 : 24} /> : <Volume2 size={isSeniorMode ? 32 : 24} />}
                      {speakingId === selectedScam.id ? 'Dừng đọc' : 'Đọc nội dung này'}
                  </button>

                  <div className={detailTextClass}>
                      {selectedScam.description}
                  </div>
                  
                  {/* Real Case Box */}
                  <div className="mt-8 bg-slate-50 p-6 rounded-2xl border border-slate-100">
                       <h4 className="font-bold text-slate-500 uppercase text-xs mb-3 flex items-center gap-2">
                           <AlertTriangle size={16} /> Ví dụ thực tế
                       </h4>
                       <p className={`font-medium mb-3 text-slate-900 ${isSeniorMode ? 'text-xl' : 'text-sm'}`}>
                           "{selectedScam.realCase}"
                       </p>
                       <p className={`text-red-600 font-bold ${isSeniorMode ? 'text-xl' : 'text-sm'}`}>
                           Thiệt hại: {selectedScam.damage}
                       </p>
                  </div>
              </div>
          </div>
      );
  }

  // --- LIST VIEW ---
  return (
    <div className={`p-4 md:p-6 pt-20 md:pt-10 pb-32 min-h-screen max-w-4xl mx-auto animate-in fade-in duration-300 ${isSeniorMode ? 'bg-slate-50' : 'bg-[#F8FAFC]'}`}>
      {errorMsg && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[110] bg-red-600 text-white px-6 py-3 rounded-full shadow-xl font-bold flex items-center gap-2">
            <XCircle size={20} /> {errorMsg}
        </div>
      )}

      {/* HEADER */}
      <div className="mb-6 border-b border-slate-200 pb-4">
          <h2 className={`${isSeniorMode ? 'text-3xl' : 'text-2xl'} font-black text-slate-900 mb-1 flex items-center gap-2`}>
            <BookOpen size={isSeniorMode ? 32 : 24} className="text-blue-600" /> 
            {isSeniorMode ? 'THƯ VIỆN CẢNH BÁO' : 'Thư Viện'}
          </h2>
          <p className={`${isSeniorMode ? 'text-lg' : 'text-sm'} text-slate-500`}>
            {isSeniorMode ? 'Danh sách các thủ đoạn lừa đảo phổ biến.' : 'Kiến thức phòng chống lừa đảo công nghệ cao.'}
          </p>
      </div>

      {/* TOOLS */}
      <div className="mb-6 space-y-4">
           {/* Search */}
           <div className={`flex items-center bg-white border border-slate-200 rounded-xl shadow-sm px-3 py-2 focus-within:ring-2 focus-within:ring-blue-500/20`}>
                <Search size={20} className="text-slate-400 mr-2" />
                <input 
                    type="text" 
                    placeholder="Tìm kiếm thủ đoạn..."
                    className={`w-full bg-transparent outline-none font-medium text-slate-800 placeholder:text-slate-400 ${isSeniorMode ? 'text-lg py-1' : 'text-sm'}`}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
                {searchTerm && <button onClick={() => setSearchTerm('')}><XCircle size={16} className="text-slate-400" /></button>}
           </div>

           {/* Categories */}
           <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
                {categories.map(cat => (
                    <button
                        key={cat}
                        onClick={() => setActiveCategory(cat)}
                        className={`rounded-lg font-bold whitespace-nowrap transition-all border ${
                            activeCategory === cat 
                            ? 'bg-blue-600 text-white border-blue-600 shadow-sm' 
                            : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50'
                        } ${isSeniorMode ? 'px-4 py-2 text-base' : 'px-3 py-1.5 text-xs'}`}
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
            className={`bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden group cursor-pointer hover:border-blue-300 transition-colors ${isSeniorMode ? 'p-5' : 'p-4'}`}
          >
             <div className="flex justify-between items-start gap-4 mb-3">
                 <div className="flex items-start gap-3">
                     <div className={`p-2 rounded-xl bg-slate-50 border border-slate-100 flex-shrink-0`}>
                         {getIcon(scam.type)}
                     </div>
                     <div>
                         <span className={`text-slate-400 font-bold uppercase tracking-wider block mb-0.5 ${isSeniorMode ? 'text-xs' : 'text-[10px]'}`}>
                             {scam.type}
                         </span>
                         <h3 className={`text-slate-900 leading-tight ${titleClass}`}>{scam.title}</h3>
                     </div>
                 </div>
             </div>

             {/* Risk Badge */}
             <div className="mb-3">
                 <span className={`rounded font-bold inline-flex items-center gap-1 ${
                   scam.risk === 'Cao' ? 'bg-red-100 text-red-700' : scam.risk === 'Trung bình' ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'
                 } ${badgeClass}`}>
                    <AlertTriangle size={isSeniorMode ? 14 : 10} fill="currentColor" /> {scam.risk}
                 </span>
             </div>
            
             <p className={`${descClass} mb-4 line-clamp-3`}>{scam.description}</p>
             
             <div className="text-blue-600 font-bold text-sm flex items-center gap-1">
                 Xem chi tiết <Search size={14} />
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
