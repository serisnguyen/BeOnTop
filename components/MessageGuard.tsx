
import React, { useState, useMemo, useCallback } from 'react';
import { MessageSquareText, Sparkles, AlertTriangle, CheckCircle, Copy, Search, ArrowRight, ShieldAlert, ChevronDown, ChevronUp, Clock, Trash2, Share2, Crown, Lock } from 'lucide-react';
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

  // Memoize history sorting or processing if needed in future
  const hasHistory = useMemo(() => user?.messageHistory && user.messageHistory.length > 0, [user?.messageHistory]);

  const analyzeMessage = useCallback(async () => {
    if (!input.trim()) return;

    // CHECK LIMITS
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

  const handleShare = useCallback(async () => {
    if (!result) return;
    
    const resultText = result === 'safe' ? 'AN TOÀN' : result === 'scam' ? 'LỪA ĐẢO' : 'CẦN CẢNH GIÁC';
    const shareData = {
        title: 'Cảnh báo từ TruthShield AI',
        text: `[Kiểm tra tin nhắn]\nKết quả: ${resultText}\n\nĐánh giá: ${explanation}\n\nNội dung gốc: "${input}"`,
    };

    if (navigator.share) {
        try {
            await navigator.share(shareData);
        } catch (err) {
            console.log('Share canceled');
        }
    } else {
        try {
            await navigator.clipboard.writeText(shareData.text);
            alert('Đã sao chép thông tin cảnh báo vào bộ nhớ tạm!');
        } catch (e) {
            alert('Không thể chia sẻ nội dung này.');
        }
    }
  }, [result, explanation, input]);

  const getResultColor = (res: 'safe' | 'suspicious' | 'scam') => {
      switch(res) {
          case 'safe': return 'text-green-600 bg-green-50 border-green-200';
          case 'scam': return 'text-red-600 bg-red-50 border-red-200';
          default: return 'text-amber-600 bg-amber-50 border-amber-200';
      }
  };

  const remaining = user?.plan !== 'free' ? 999 : Math.max(0, LIMITS.FREE.MESSAGE_SCANS - (user?.usage?.messageScans || 0));
  const isLimitReached = user?.plan === 'free' && remaining === 0;

  return (
    <div className={`p-4 pt-20 md:pt-10 pb-32 min-h-screen flex flex-col max-w-3xl mx-auto animate-in fade-in duration-300 ${isSeniorMode ? 'bg-slate-50' : ''}`}>
      <div className="mb-6 md:mb-8 flex justify-between items-end">
        <div>
            <h2 className={`${isSeniorMode ? 'text-4xl' : 'text-2xl md:text-3xl'} font-bold text-slate-800 mb-2`}>
            Kiểm Tra <span className={isSeniorMode ? "text-pink-600" : "text-blue-600"}>Tin Nhắn</span>
            </h2>
            <p className={`${isSeniorMode ? 'text-xl text-slate-600 font-medium' : 'text-slate-500 text-sm md:text-base'}`}>
            {isSeniorMode ? 'Bác dán hoặc nhập tin nhắn lạ vào ô bên dưới:' : 'Dán nội dung tin nhắn vào bên dưới để hệ thống AI kiểm tra.'}
            </p>
        </div>
        {user?.plan === 'free' && (
            <div className={`px-3 py-1 rounded-lg text-xs font-bold whitespace-nowrap ${isLimitReached ? 'bg-red-100 text-red-600' : 'bg-amber-100 text-amber-800'}`}>
                {isLimitReached ? "Hết lượt" : `Còn ${remaining} lượt`}
            </div>
        )}
      </div>

      <div className="flex-1 flex flex-col gap-4 md:gap-6">
        
        {/* Input Area */}
        <div className={`relative bg-white rounded-3xl shadow-sm border overflow-hidden ${isSeniorMode ? 'border-slate-300 shadow-md' : 'border-slate-200'}`}>
          {!isSeniorMode && <div className="p-1 bg-gradient-to-r from-blue-400 to-purple-400 opacity-20"></div>}
          
          <div className="p-4 md:p-6 relative">
            
            {/* Limit Reached Overlay */}
            {isLimitReached && (
                <div className="absolute inset-0 z-20 bg-slate-50/80 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center">
                    <div className="bg-white p-4 rounded-full shadow-lg mb-3">
                        <Lock size={32} className="text-red-500" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 mb-1">Đã hết lượt quét miễn phí hôm nay</h3>
                    <p className="text-slate-500 text-sm mb-4">Nâng cấp Premium để quét không giới hạn</p>
                    <button 
                        onClick={() => setShowPremiumModal(true)}
                        className="bg-slate-900 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 shadow-lg hover:scale-105 transition-transform"
                        aria-label="Nâng cấp Premium"
                    >
                        <Crown size={18} className="text-yellow-400 fill-current" /> Nâng cấp ngay
                    </button>
                </div>
            )}

            <textarea 
              className={`w-full bg-slate-50 text-slate-900 placeholder-slate-400 focus:outline-none resize-none p-3 md:p-4 rounded-xl border focus:border-blue-400 transition-colors ${
                  isSeniorMode ? 'text-2xl h-48 border-slate-300 font-medium' : 'text-base md:text-lg h-32 md:h-40 border-slate-200'
              }`}
              placeholder={isSeniorMode ? "Ví dụ: Con đang cấp cứu, chuyển tiền gấp..." : "Ví dụ: 'Con đang cấp cứu, chuyển tiền gấp vào số này...'"}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={isLimitReached}
              aria-label="Nhập nội dung tin nhắn cần kiểm tra"
            ></textarea>
            
            <div className="flex flex-col md:flex-row gap-3 md:justify-between md:items-center mt-4 pt-4 border-t border-slate-100">
               <button 
                 onClick={async () => {
                    try {
                        const text = await navigator.clipboard.readText();
                        setInput(text);
                    } catch (e) {
                        alert("Không thể truy cập bộ nhớ tạm. Vui lòng dán thủ công.");
                    }
                 }}
                 disabled={isLimitReached}
                 className={`font-medium flex items-center justify-center md:justify-start gap-1.5 transition-colors py-3 md:py-0 bg-slate-100 md:bg-transparent rounded-xl md:rounded-none ${
                     isSeniorMode ? 'text-lg text-slate-700 hover:bg-slate-200' : 'text-sm text-slate-500 hover:text-blue-600'
                 }`}
                 aria-label="Dán tin nhắn từ bộ nhớ tạm"
               >
                 <Copy size={isSeniorMode ? 24 : 16} /> {isSeniorMode ? 'Dán tin nhắn' : 'Dán từ bộ nhớ'}
               </button>
               <button 
                 onClick={analyzeMessage}
                 disabled={analyzing || !input || isLimitReached}
                 className={`text-white w-full md:w-auto rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-md active:scale-95 ${
                     isSeniorMode 
                     ? 'bg-pink-600 hover:bg-pink-700 text-xl px-8 py-4 shadow-pink-200' 
                     : 'bg-blue-600 hover:bg-blue-700 px-6 py-3 text-base shadow-blue-200'
                 } ${analyzing || isLimitReached ? 'opacity-70' : ''}`}
                 aria-label="Bắt đầu kiểm tra tin nhắn"
               >
                 {analyzing ? <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : <Sparkles size={isSeniorMode ? 28 : 20} />}
                 {analyzing ? 'Đang kiểm tra...' : 'KIỂM TRA NGAY'}
               </button>
            </div>
          </div>
        </div>

        {/* Result Area */}
        {result && (
          <div className={`rounded-3xl p-5 md:p-6 border-2 animate-in slide-in-from-bottom duration-500 shadow-sm ${
            result === 'safe' ? 'bg-green-50 border-green-200' : 
            result === 'scam' ? 'bg-red-50 border-red-200' : 
            'bg-amber-50 border-amber-200'
          }`}>
             <div className="flex flex-col md:flex-row items-start md:items-center gap-3 md:gap-4">
                <div className="flex-shrink-0 self-start">
                    {result === 'safe' && <CheckCircle className="text-green-600 fill-green-100" size={isSeniorMode ? 48 : 32} />}
                    {result === 'scam' && <ShieldAlert className="text-red-600 fill-red-100" size={isSeniorMode ? 48 : 32} />}
                    {result === 'suspicious' && <Search className="text-amber-600 fill-amber-100" size={isSeniorMode ? 48 : 32} />}
                </div>
                
                <div className="flex-1">
                    <h3 className={`font-black uppercase tracking-wide ${
                    result === 'safe' ? 'text-green-700' : 
                    result === 'scam' ? 'text-red-700' : 'text-amber-700'
                    } ${isSeniorMode ? 'text-2xl md:text-3xl' : 'text-lg md:text-xl'}`}>
                    {result === 'safe' ? 'An Toàn' : result === 'scam' ? 'CẢNH BÁO LỪA ĐẢO' : 'Cần Cảnh Giác'}
                    </h3>
                    <p className={`text-slate-700 font-medium mt-1 ${isSeniorMode ? 'text-xl' : 'text-sm md:text-base'}`}>
                    {explanation}
                    </p>
                </div>

                <button 
                    onClick={handleShare}
                    className={`flex items-center justify-center gap-2 font-bold transition-all active:scale-95 border-2 mt-2 md:mt-0 ${
                        result === 'safe' ? 'bg-white border-green-200 text-green-700 hover:bg-green-100' :
                        result === 'scam' ? 'bg-white border-red-200 text-red-700 hover:bg-red-100' :
                        'bg-white border-amber-200 text-amber-700 hover:bg-amber-100'
                    } ${isSeniorMode ? 'w-full md:w-auto px-6 py-3 rounded-xl text-lg' : 'p-2 md:px-4 md:py-2 rounded-xl text-sm'}`}
                    aria-label="Chia sẻ kết quả kiểm tra"
                >
                    <Share2 size={isSeniorMode ? 24 : 18} />
                    <span className={isSeniorMode ? '' : 'md:inline'}>Chia sẻ</span>
                </button>
             </div>
          </div>
        )}

        {/* HISTORY SECTION */}
        {hasHistory && (
          <div className={`bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden animate-in slide-in-from-bottom duration-500 delay-150`}>
              <button 
                  onClick={() => setShowHistory(!showHistory)}
                  className={`w-full flex items-center justify-between hover:bg-slate-50 transition-colors ${isSeniorMode ? 'p-6' : 'p-4'}`}
                  aria-expanded={showHistory}
              >
                  <div className="flex items-center gap-3">
                      <Clock size={isSeniorMode ? 28 : 20} className="text-slate-400" />
                      <span className={`font-bold text-slate-700 ${isSeniorMode ? 'text-xl' : 'text-base'}`}>
                          Lịch sử kiểm tra ({user?.messageHistory?.length})
                      </span>
                  </div>
                  {showHistory ? <ChevronUp size={isSeniorMode ? 28 : 20} className="text-slate-400" /> : <ChevronDown size={isSeniorMode ? 28 : 20} className="text-slate-400" />}
              </button>

              {showHistory && (
                  <div className="border-t border-slate-100 bg-slate-50/50">
                      <div className="max-h-80 overflow-y-auto">
                          {user?.messageHistory.map((item) => (
                              <div key={item.id} className={`border-b border-slate-100 last:border-0 ${isSeniorMode ? 'p-6' : 'p-4'}`}>
                                  <div className="flex justify-between items-start mb-2">
                                      <span className={`text-xs font-bold uppercase px-2 py-1 rounded border ${getResultColor(item.result)}`}>
                                          {item.result === 'safe' ? 'An Toàn' : item.result === 'scam' ? 'Lừa Đảo' : 'Nghi Ngờ'}
                                      </span>
                                      <span className="text-xs text-slate-400 flex items-center gap-1">
                                          {new Date(item.timestamp).toLocaleString('vi-VN')}
                                      </span>
                                  </div>
                                  <p className={`text-slate-600 mb-2 line-clamp-2 italic ${isSeniorMode ? 'text-lg' : 'text-sm'}`}>
                                      "{item.text}"
                                  </p>
                                  <p className={`font-medium ${isSeniorMode ? 'text-base text-slate-800' : 'text-sm text-slate-700'}`}>
                                      ➔ {item.explanation}
                                  </p>
                              </div>
                          ))}
                      </div>
                      <div className="p-3 bg-white border-t border-slate-100 flex justify-center">
                          <button 
                              onClick={clearMessageHistory}
                              className={`text-red-500 hover:bg-red-50 px-4 py-2 rounded-lg font-bold flex items-center gap-2 transition-colors ${isSeniorMode ? 'text-base' : 'text-xs'}`}
                              aria-label="Xóa toàn bộ lịch sử"
                          >
                              <Trash2 size={14} /> Xóa lịch sử
                          </button>
                      </div>
                  </div>
              )}
          </div>
        )}

        {/* Tips */}
        {!result && !showHistory && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
             <div className={`bg-white border border-slate-200 p-4 rounded-2xl shadow-sm flex items-start gap-3 ${isSeniorMode ? 'p-6' : ''}`}>
                <div className={`rounded-lg flex items-center justify-center text-blue-600 flex-shrink-0 ${isSeniorMode ? 'w-12 h-12 bg-blue-100' : 'w-8 h-8 bg-blue-100'}`}>
                  <MessageSquareText size={isSeniorMode ? 24 : 18} />
                </div>
                <div>
                    <h4 className={`text-slate-900 font-bold mb-0.5 ${isSeniorMode ? 'text-lg' : 'text-sm'}`}>Tin nhắn ngân hàng giả</h4>
                    <p className={`text-slate-500 ${isSeniorMode ? 'text-base' : 'text-xs'}`}>Phát hiện tin nhắn mạo danh yêu cầu mật khẩu.</p>
                </div>
             </div>
             <div className={`bg-white border border-slate-200 p-4 rounded-2xl shadow-sm flex items-start gap-3 ${isSeniorMode ? 'p-6' : ''}`}>
                <div className={`rounded-lg flex items-center justify-center text-purple-600 flex-shrink-0 ${isSeniorMode ? 'w-12 h-12 bg-purple-100' : 'w-8 h-8 bg-purple-100'}`}>
                  <ArrowRight size={isSeniorMode ? 24 : 18} />
                </div>
                <div>
                    <h4 className={`text-slate-900 font-bold mb-0.5 ${isSeniorMode ? 'text-lg' : 'text-sm'}`}>Đường link lạ</h4>
                    <p className={`text-slate-500 ${isSeniorMode ? 'text-base' : 'text-xs'}`}>Kiểm tra các đường dẫn đáng ngờ chứa mã độc.</p>
                </div>
             </div>
          </div>
        )}

      </div>
      {showPremiumModal && <PremiumUpgradeModal onClose={() => setShowPremiumModal(false)} triggerSource="message_limit" />}
    </div>
  );
};

export default React.memo(MessageGuard);
