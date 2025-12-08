
import React, { useState } from 'react';
import { ArrowLeft, MessageSquareText, ShieldCheck, ShieldAlert, AlertTriangle, Trash2, Clock, CheckCircle2, Search, ChevronDown, ChevronUp, Sparkles, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { analyzeMessageRisk } from '../services/aiService';

interface MessageHistoryScreenProps {
  onBack: () => void;
}

const MessageHistoryScreen: React.FC<MessageHistoryScreenProps> = ({ onBack }) => {
  const { user, clearMessageHistory, updateMessageHistoryItem, isSeniorMode } = useAuth();
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);

  const getResultColor = (res: 'safe' | 'suspicious' | 'scam') => {
      switch(res) {
          case 'safe': return 'text-green-600 bg-green-50 border-green-200';
          case 'scam': return 'text-red-600 bg-red-50 border-red-200';
          default: return 'text-amber-600 bg-amber-50 border-amber-200';
      }
  };

  const getResultIcon = (res: 'safe' | 'suspicious' | 'scam') => {
      switch(res) {
          case 'safe': return <ShieldCheck size={isSeniorMode ? 28 : 20} />;
          case 'scam': return <ShieldAlert size={isSeniorMode ? 28 : 20} />;
          default: return <AlertTriangle size={isSeniorMode ? 28 : 20} />;
      }
  };

  const getResultLabel = (res: 'safe' | 'suspicious' | 'scam') => {
      switch(res) {
          case 'safe': return 'An Toàn';
          case 'scam': return 'Lừa Đảo';
          default: return 'Nghi Ngờ';
      }
  };

  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
  };

  const toggleExpand = (id: string) => {
      setExpandedId(expandedId === id ? null : id);
  };

  const handleReScan = async () => {
    if (!user?.messageHistory || user.messageHistory.length === 0) return;
    setIsScanning(true);

    // Scan all messages again to get updated AI analysis
    for (const msg of user.messageHistory) {
        try {
            const analysis = await analyzeMessageRisk(msg.text);
            updateMessageHistoryItem(msg.id, analysis.result, analysis.explanation);
            // Small delay to show progress
            await new Promise(r => setTimeout(r, 200));
        } catch (e) {
            console.error(e);
        }
    }
    setIsScanning(false);
  };

  const handleClearHistory = () => {
    if (confirm("CẢNH BÁO: Bạn có chắc chắn muốn xóa toàn bộ lịch sử tin nhắn? Hành động này không thể hoàn tác.")) {
        clearMessageHistory();
    }
  };

  return (
    <div className={`p-4 md:p-6 pt-20 md:pt-10 pb-32 min-h-screen max-w-2xl mx-auto animate-in fade-in duration-300 ${isSeniorMode ? 'text-lg' : ''}`}>
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center gap-4 mb-8">
            <div className="flex items-center gap-4">
                <button 
                    onClick={onBack}
                    className="p-2 hover:bg-slate-100 rounded-full transition-colors"
                    aria-label="Quay lại"
                >
                    <ArrowLeft size={isSeniorMode ? 32 : 24} className="text-slate-700" />
                </button>
                <div className="flex-1">
                    <h2 className={`font-bold text-slate-900 ${isSeniorMode ? 'text-3xl' : 'text-2xl'}`}>Lịch Sử Kiểm Tra</h2>
                    <p className="text-slate-500 text-sm">Kết quả quét tin nhắn AI</p>
                </div>
            </div>

            <div className="flex items-center gap-2 self-end md:self-auto">
                <button 
                    onClick={handleReScan}
                    disabled={isScanning || !user?.messageHistory?.length}
                    className={`flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-bold shadow-md active:scale-95 transition-all disabled:opacity-50 ${isSeniorMode ? 'px-6 py-3 text-lg' : 'px-4 py-2 text-sm'}`}
                    aria-label="Quét lại rủi ro bằng AI"
                >
                    {isScanning ? <Loader2 size={20} className="animate-spin" /> : <Sparkles size={20} />}
                    {isScanning ? 'Đang quét...' : 'Quét Rủi Ro AI'}
                </button>

                {user?.messageHistory && user.messageHistory.length > 0 && (
                    <button 
                        onClick={handleClearHistory}
                        className="p-3 text-red-500 hover:bg-red-50 rounded-full transition-colors flex flex-col items-center"
                        title="Xóa lịch sử"
                        aria-label="Xóa toàn bộ lịch sử tin nhắn"
                    >
                        <Trash2 size={isSeniorMode ? 28 : 20} />
                    </button>
                )}
            </div>
        </div>

        {/* Stats */}
        {user?.messageHistory && user.messageHistory.length > 0 && (
             <div className="grid grid-cols-3 gap-3 mb-6" role="status" aria-label="Thống kê trạng thái tin nhắn">
                 <div className="bg-green-50 rounded-xl p-3 border border-green-100 text-center">
                     <span className="block text-2xl font-black text-green-600">
                         {user.messageHistory.filter(m => m.result === 'safe').length}
                     </span>
                     <span className="text-xs font-bold text-green-700 uppercase">An toàn</span>
                 </div>
                 <div className="bg-red-50 rounded-xl p-3 border border-red-100 text-center">
                     <span className="block text-2xl font-black text-red-600">
                         {user.messageHistory.filter(m => m.result === 'scam').length}
                     </span>
                     <span className="text-xs font-bold text-red-700 uppercase">Lừa đảo</span>
                 </div>
                 <div className="bg-amber-50 rounded-xl p-3 border border-amber-100 text-center">
                     <span className="block text-2xl font-black text-amber-600">
                         {user.messageHistory.filter(m => m.result === 'suspicious').length}
                     </span>
                     <span className="text-xs font-bold text-amber-700 uppercase">Nghi ngờ</span>
                 </div>
             </div>
        )}

        {/* List */}
        <div className="space-y-4">
            {user?.messageHistory && user.messageHistory.length > 0 ? (
                user.messageHistory.map((msg) => (
                    <div 
                        key={msg.id} 
                        onClick={() => toggleExpand(msg.id)}
                        className={`bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden transition-all ${isSeniorMode ? 'p-5' : 'p-4'} ${isScanning ? 'opacity-50' : ''}`}
                        role="button"
                        aria-expanded={expandedId === msg.id}
                        tabIndex={0}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                                toggleExpand(msg.id);
                            }
                        }}
                    >
                        <div className="flex justify-between items-start gap-3">
                            <div className={`flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center ${
                                msg.result === 'safe' ? 'bg-green-100 text-green-600' :
                                msg.result === 'scam' ? 'bg-red-100 text-red-600' : 'bg-amber-100 text-amber-600'
                            }`}>
                                {getResultIcon(msg.result)}
                            </div>
                            
                            <div className="flex-1 min-w-0">
                                <div className="flex justify-between items-center mb-1">
                                    <span className={`font-black uppercase text-xs px-2 py-0.5 rounded border ${getResultColor(msg.result)}`}>
                                        {getResultLabel(msg.result)}
                                    </span>
                                    <span className="text-xs text-slate-400 flex items-center gap-1">
                                        <Clock size={10} />
                                        {formatTime(msg.timestamp)}
                                    </span>
                                </div>
                                
                                {/* Message Preview (Truncated if collapsed) */}
                                <p className={`text-slate-600 italic mb-2 ${expandedId === msg.id ? '' : 'line-clamp-2'} ${isSeniorMode ? 'text-lg' : 'text-sm'}`}>
                                    "{msg.text}"
                                </p>
                                
                                {/* Explanation always visible but highlighted */}
                                <div className="flex items-start gap-2">
                                     <div className="mt-1 min-w-[4px] h-[4px] bg-blue-400 rounded-full"></div>
                                     <p className={`font-bold text-slate-800 leading-tight ${isSeniorMode ? 'text-lg' : 'text-sm'}`}>
                                         AI: {msg.explanation}
                                     </p>
                                </div>
                            </div>

                            <div className="text-slate-300 pt-2">
                                {expandedId === msg.id ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                            </div>
                        </div>

                        {/* Expanded Content */}
                        {expandedId === msg.id && (
                             <div className="mt-4 pt-4 border-t border-slate-100 bg-slate-50 -mx-5 -mb-5 p-5">
                                 <h4 className="font-bold text-slate-500 text-xs uppercase mb-2">Chi tiết đánh giá</h4>
                                 <p className="text-slate-700 text-sm mb-4">
                                     Hệ thống đã phân tích nội dung này dựa trên các từ khóa và ngữ cảnh lừa đảo phổ biến.
                                 </p>
                                 <div className="flex gap-2">
                                     <button 
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            navigator.clipboard.writeText(msg.text);
                                            alert("Đã sao chép nội dung!");
                                        }}
                                        className="w-full bg-white border border-slate-200 py-3 rounded-lg text-sm font-bold text-slate-600 shadow-sm hover:bg-slate-50"
                                        aria-label="Sao chép nội dung tin nhắn"
                                     >
                                         Sao chép nội dung
                                     </button>
                                 </div>
                             </div>
                        )}
                    </div>
                ))
            ) : (
                <div className="text-center py-20 px-6">
                    <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <MessageSquareText size={48} className="text-slate-300" />
                    </div>
                    <h3 className="text-slate-500 font-bold text-xl">Chưa có lịch sử tin nhắn</h3>
                    <p className="text-slate-400 mt-2">
                        Hãy dùng tính năng "Kiểm Tra Tin Nhắn" để phát hiện nội dung lừa đảo. Kết quả sẽ lưu tại đây.
                    </p>
                </div>
            )}
        </div>
    </div>
  );
};

export default MessageHistoryScreen;
