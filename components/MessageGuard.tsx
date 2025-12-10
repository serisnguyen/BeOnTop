
import React, { useState, useMemo, useCallback, useRef } from 'react';
import { MessageSquareText, Sparkles, AlertTriangle, CheckCircle, Copy, Search, ArrowRight, ShieldAlert, ChevronDown, ChevronUp, Clock, Trash2, Share2, Crown, Lock, History, X, Loader2 } from 'lucide-react';
import { analyzeMessageRisk } from '../services/aiService';
import { useAuth, LIMITS } from '../context/AuthContext';
import PremiumUpgradeModal from './PremiumUpgradeModal';

const MessageGuard: React.FC = () => {
  const { isSeniorMode, user, addMessageAnalysis, clearMessageHistory, checkLimit, incrementUsage } = useAuth();
  const [input, setInput] = useState('');
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<'safe' | 'suspicious' | 'scam' | null>(null);
  const [explanation, setExplanation] = useState('');
  const [showHistory, setShowHistory] = useState(false);
  const [showPremiumModal, setShowPremiumModal] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const analyzeMessage = useCallback(async () => {
    if (!input.trim()) return;

    if (!checkLimit('message')) {
        setShowPremiumModal(true);
        return;
    }

    setAnalyzing(true);
    setResult(null);

    try {
      const analysis = await analyzeMessageRisk(input);
      setResult(analysis.result);
      setExplanation(analysis.explanation);

      addMessageAnalysis({
        text: input,
        result: analysis.result,
        explanation: analysis.explanation
      });
      
      incrementUsage('message');

    } catch (error) {
      setResult('suspicious');
      setExplanation("Có lỗi xảy ra khi kết nối. Hãy cẩn trọng.");
    } finally {
      setAnalyzing(false);
    }
  }, [input, addMessageAnalysis, checkLimit, incrementUsage]);

  const handlePaste = async () => {
    try {
        const text = await navigator.clipboard.readText();
        setInput(text);
        if (textareaRef.current) textareaRef.current.focus();
    } catch (e) {
        alert("Không thể truy cập bộ nhớ tạm. Vui lòng dán thủ công.");
    }
  };

  const handleShare = useCallback(async () => {
    if (!result) return;
    const resultText = result === 'safe' ? 'AN TOÀN' : result === 'scam' ? 'LỪA ĐẢO' : 'CẦN CẢNH GIÁC';
    const shareData = {
        title: 'Cảnh báo từ TruthShield AI',
        text: `[Kiểm tra tin nhắn]\nKết quả: ${resultText}\n\nĐánh giá: ${explanation}\n\nNội dung gốc: "${input}"`,
    };
    if (navigator.share) {
        try { await navigator.share(shareData); } catch (err) { console.log('Share canceled'); }
    } else {
        try { await navigator.clipboard.writeText(shareData.text); alert('Đã sao chép!'); } catch (e) { alert('Lỗi sao chép.'); }
    }
  }, [result, explanation, input]);

  // Theme configuration
  const theme = isSeniorMode ? {
      containerBg: 'bg-[#FFFBEB]', 
      cardBg: 'bg-white', 
      cardBorder: 'border-transparent', 
      cardShadow: 'shadow-xl shadow-amber-900/5', 
      textMain: 'text-slate-900',
      textSub: 'text-slate-500',
      highlight: 'text-amber-600',
      footerBg: 'bg-slate-50/50', 
      buttonPaste: 'text-slate-600 hover:text-amber-600',
      buttonAction: 'bg-amber-600 text-white shadow-amber-200 hover:bg-amber-700',
      tipCard: 'bg-white hover:border-amber-200 border-transparent shadow-sm'
  } : {
      containerBg: '', 
      cardBg: 'bg-white',
      cardBorder: 'border-slate-100',
      cardShadow: 'shadow-lg shadow-blue-100/50',
      textMain: 'text-slate-900',
      textSub: 'text-slate-500',
      highlight: 'text-blue-600',
      footerBg: 'bg-slate-50/50',
      buttonPaste: 'text-slate-500 hover:text-blue-600',
      buttonAction: 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-blue-200',
      tipCard: 'bg-white hover:border-blue-200 border-slate-100'
  };

  const remaining = user?.plan !== 'free' ? 999 : Math.max(0, LIMITS.FREE.MESSAGE_SCANS - (user?.usage?.messageScans || 0));
  const isLimitReached = user?.plan === 'free' && remaining === 0;

  return (
    <div className={`p-4 md:p-6 pt-20 md:pt-10 pb-32 min-h-screen flex flex-col max-w-4xl mx-auto animate-in fade-in duration-300 ${theme.containerBg}`}>
      
      {/* HEADER */}
      <div className="flex items-center justify-between mb-6 md:mb-8">
        <div>
            <h2 className={`${isSeniorMode ? 'text-4xl' : 'text-3xl'} font-black ${theme.textMain} mb-2`}>
                Kiểm Tra <span className={theme.highlight}>Tin Nhắn</span>
            </h2>
            <p className={`${isSeniorMode ? 'text-xl' : 'text-base'} ${theme.textSub} font-medium`}>
                AI phân tích ngữ nghĩa để phát hiện lừa đảo.
            </p>
        </div>
        <button 
            onClick={() => setShowHistory(true)}
            className={`p-3 rounded-xl border transition-all active:scale-95 bg-white shadow-sm hover:bg-slate-50`}
        >
            <History size={isSeniorMode ? 28 : 24} className="text-slate-600" />
        </button>
      </div>

      <div className="flex-1 flex flex-col gap-6">
        
        {/* INPUT CARD */}
        <div className={`${theme.cardBg} rounded-[2.5rem] ${theme.cardShadow} border ${theme.cardBorder} overflow-hidden relative transition-all group`}>
           
           {isLimitReached && (
                <div className="absolute inset-0 z-20 bg-white/80 backdrop-blur-[2px] flex flex-col items-center justify-center p-6 text-center">
                    <Lock size={32} className="text-slate-400 mb-2" />
                    <button 
                        onClick={() => setShowPremiumModal(true)}
                        className="bg-slate-900 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 shadow-lg hover:scale-105 transition-transform"
                    >
                        <Crown size={16} className="text-yellow-400 fill-current" /> Nâng cấp ngay
                    </button>
                </div>
            )}

           <textarea 
              ref={textareaRef}
              className={`w-full bg-transparent ${theme.textMain} placeholder:text-slate-300 focus:outline-none resize-none p-8 font-medium transition-colors ${
                  isSeniorMode ? 'text-2xl h-64' : 'text-lg h-52'
              }`}
              placeholder={isSeniorMode ? "Ví dụ: Con đang cấp cứu, chuyển tiền gấp..." : "Dán nội dung tin nhắn vào đây..."}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={isLimitReached}
            ></textarea>

           {/* Footer Actions */}
           <div className={`${theme.footerBg} px-6 py-4 flex items-center justify-between gap-4 border-t border-slate-50`}>
               <button 
                 onClick={handlePaste}
                 className={`flex items-center gap-2 font-bold text-sm transition-colors px-4 py-2 rounded-lg hover:bg-slate-200/50 ${theme.buttonPaste}`}
               >
                 <Copy size={18} /> Dán nhanh
               </button>
               
               <button 
                 onClick={analyzeMessage}
                 disabled={analyzing || !input || isLimitReached}
                 className={`px-8 py-3 rounded-2xl font-black text-base flex items-center justify-center gap-2 shadow-lg active:scale-95 transition-all ${analyzing ? 'opacity-80' : ''} ${theme.buttonAction}`}
               >
                 {analyzing ? <Loader2 className="animate-spin" size={20} /> : <Sparkles size={20} className="fill-white/20" />}
                 {analyzing ? 'ĐANG QUÉT...' : 'KIỂM TRA'}
               </button>
           </div>
        </div>

        {/* RESULT SECTION */}
        {result && (
          <div className="animate-in slide-in-from-bottom duration-500">
             <div className={`rounded-[2.5rem] p-8 border-2 shadow-xl ${
                 result === 'safe' ? 'bg-green-50 border-green-200' :
                 result === 'scam' ? 'bg-red-50 border-red-200' : 'bg-amber-50 border-amber-200'
             }`}>
                 <div className="flex items-start gap-5">
                     <div className={`p-4 rounded-full border-4 border-white shadow-sm ${
                         result === 'safe' ? 'bg-green-100 text-green-600' :
                         result === 'scam' ? 'bg-red-100 text-red-600' : 'bg-amber-100 text-amber-600'
                     }`}>
                         {result === 'safe' ? <CheckCircle size={isSeniorMode ? 40 : 32} /> : 
                          result === 'scam' ? <ShieldAlert size={isSeniorMode ? 40 : 32} /> : 
                          <AlertTriangle size={isSeniorMode ? 40 : 32} />}
                     </div>
                     <div>
                         <h3 className={`font-black uppercase tracking-tight mb-2 ${isSeniorMode ? 'text-3xl' : 'text-2xl'} ${
                             result === 'safe' ? 'text-green-800' :
                             result === 'scam' ? 'text-red-800' : 'text-amber-800'
                         }`}>
                             {result === 'safe' ? 'Nội dung An toàn' : 
                              result === 'scam' ? 'CẢNH BÁO LỪA ĐẢO' : 
                              'Cần Cảnh Giác'}
                         </h3>
                         <p className={`font-medium ${isSeniorMode ? 'text-xl text-slate-900' : 'text-lg text-slate-800'}`}>
                             "{explanation}"
                         </p>
                     </div>
                 </div>
                 <div className="mt-6 pt-6 border-t border-black/5 flex justify-end">
                     <button onClick={handleShare} className="bg-white/60 hover:bg-white text-slate-800 px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 transition-colors">
                         <Share2 size={18} /> Chia sẻ cảnh báo
                     </button>
                 </div>
             </div>
          </div>
        )}

        {/* TIPS CARDS */}
        {!result && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             {[
                 { icon: <MessageSquareText size={24} />, title: "Giả mạo ngân hàng", desc: "Yêu cầu mật khẩu, OTP", text: "Tài khoản của bạn bị khóa, vui lòng đăng nhập..." },
                 { icon: <ArrowRight size={24} />, title: "Đường link lạ", desc: "Chứa mã độc, virus", text: "Nhận quà miễn phí tại http://bit.ly/..." }
             ].map((tip, idx) => (
                 <div 
                    key={idx}
                    onClick={() => setInput(tip.text)}
                    className={`${theme.tipCard} p-6 rounded-[2rem] border shadow-sm flex items-center gap-4 transition-all cursor-pointer group active:scale-95`}
                 >
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-colors ${isSeniorMode ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-blue-600 group-hover:bg-blue-600 group-hover:text-white'}`}>
                      {tip.icon}
                    </div>
                    <div>
                        <h4 className={`font-black text-slate-900 ${isSeniorMode ? 'text-xl' : 'text-base'}`}>{tip.title}</h4>
                        <p className={`text-slate-500 ${isSeniorMode ? 'text-lg' : 'text-sm'}`}>{tip.desc}</p>
                    </div>
                 </div>
             ))}
          </div>
        )}

      </div>

      {showHistory && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
              <div className="bg-white w-full max-w-lg rounded-[2.5rem] p-6 h-[80vh] flex flex-col shadow-2xl animate-in zoom-in">
                  <div className="flex justify-between items-center mb-6 pb-4 border-b border-slate-100">
                      <h3 className="text-2xl font-black text-slate-900">Lịch sử</h3>
                      <button onClick={() => setShowHistory(false)} className="p-2 bg-slate-100 rounded-full hover:bg-slate-200"><X size={24} /></button>
                  </div>
                  <div className="flex-1 overflow-y-auto space-y-4">
                      {user?.messageHistory?.length ? (
                          [...user.messageHistory].reverse().map(item => (
                              <div key={item.id} className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
                                  <div className={`text-xs font-bold uppercase mb-1 ${item.result === 'safe' ? 'text-green-600' : 'text-red-600'}`}>{item.result}</div>
                                  <p className="text-sm text-slate-600 line-clamp-2 italic">"{item.text}"</p>
                              </div>
                          ))
                      ) : <div className="text-center text-slate-400 mt-10">Trống</div>}
                  </div>
              </div>
          </div>
      )}

      {showPremiumModal && <PremiumUpgradeModal onClose={() => setShowPremiumModal(false)} triggerSource="message_limit" />}
    </div>
  );
};

export default React.memo(MessageGuard);
