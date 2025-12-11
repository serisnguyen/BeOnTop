
import React, { useState, useEffect, useMemo } from 'react';
import { ArrowLeft, PhoneIncoming, PhoneOutgoing, ShieldCheck, ShieldAlert, AlertTriangle, Sparkles, Loader2, RefreshCw, Radio, Disc, Play, Calendar } from 'lucide-react';
import { useAuth, CallLogItem } from '../context/AuthContext';
import { analyzeCallRisk } from '../services/aiService';

interface CallHistoryScreenProps {
  onBack: () => void;
}

const CallHistoryScreen: React.FC<CallHistoryScreenProps> = ({ onBack }) => {
  const { user, isSeniorMode, updateCallHistoryItem } = useAuth();
  const [analyzingIds, setAnalyzingIds] = useState<string[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'risky' | 'safe'>('all');

  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleString('vi-VN', { hour: '2-digit', minute: '2-digit' });
  };

  const formatDuration = (seconds: number) => {
    const min = Math.floor(seconds / 60);
    const sec = seconds % 60;
    return `${min}p ${sec}s`;
  };

  const getDateLabel = (timestamp: number) => {
      const date = new Date(timestamp);
      const today = new Date();
      if (date.toDateString() === today.toDateString()) return 'Hôm nay';
      
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      if (date.toDateString() === yesterday.toDateString()) return 'Hôm qua';

      return date.toLocaleDateString('vi-VN', { weekday: 'long', day: '2-digit', month: '2-digit' });
  };

  // Grouped and Filtered Calls
  const groupedCalls = useMemo(() => {
      if (!user?.callHistory) return {};
      
      let filtered = user.callHistory;
      if (filter === 'risky') {
          filtered = filtered.filter(c => c.aiAnalysis && c.aiAnalysis.riskScore > 50);
      } else if (filter === 'safe') {
          filtered = filtered.filter(c => !c.aiAnalysis || c.aiAnalysis.riskScore <= 50);
      }

      const groups: Record<string, CallLogItem[]> = {};
      // Sort newest first
      const sorted = [...filtered].sort((a, b) => b.timestamp - a.timestamp);
      
      sorted.forEach(call => {
          const label = getDateLabel(call.timestamp);
          if (!groups[label]) groups[label] = [];
          groups[label].push(call);
      });
      return groups;
  }, [user?.callHistory, filter]);

  // Automatic "Real-time" Scan Logic
  useEffect(() => {
    const autoScanCalls = async () => {
        if (!user?.callHistory) return;
        const unanalyzedCalls = user.callHistory.filter(c => !c.aiAnalysis && !analyzingIds.includes(c.id));
        if (unanalyzedCalls.length === 0) return;

        setAnalyzingIds(prev => [...prev, ...unanalyzedCalls.map(c => c.id)]);

        for (const call of unanalyzedCalls) {
            try {
                await new Promise(r => setTimeout(r, 800));
                const analysis = await analyzeCallRisk(call);
                updateCallHistoryItem(call.id, {
                    aiAnalysis: {
                        riskScore: analysis.riskScore,
                        explanation: analysis.explanation,
                        detectedKeywords: [], 
                        timestamp: Date.now()
                    }
                });
                setAnalyzingIds(prev => prev.filter(id => id !== call.id));
            } catch (e) { console.error(e); }
        }
    };
    autoScanCalls();
  }, [user?.callHistory]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsRefreshing(false);
  };

  const getRiskColor = (score: number) => {
      if (score >= 70) return 'text-red-600 bg-red-50 border-red-200';
      if (score >= 30) return 'text-amber-600 bg-amber-50 border-amber-200';
      return 'text-green-600 bg-green-50 border-green-200';
  };

  return (
    <div className={`p-4 md:p-6 pt-20 md:pt-10 pb-32 min-h-screen max-w-2xl mx-auto animate-in fade-in duration-300`}>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-4">
            <button onClick={onBack} className="p-2 hover:bg-white bg-slate-100 rounded-full transition-colors">
              <ArrowLeft size={24} />
            </button>
            <div>
                 <h2 className="font-bold text-slate-900 text-2xl">Nhật Ký Cuộc Gọi</h2>
                 <p className="text-slate-500 text-sm">AI tự động phân tích</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
             <div className="flex bg-slate-100 p-1 rounded-lg">
                 {(['all', 'risky', 'safe'] as const).map(f => (
                     <button
                        key={f}
                        onClick={() => setFilter(f)}
                        className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all capitalize ${filter === f ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'}`}
                     >
                         {f === 'all' ? 'Tất cả' : f === 'risky' ? 'Rủi ro' : 'An toàn'}
                     </button>
                 ))}
             </div>
             <button 
                onClick={handleRefresh}
                disabled={isRefreshing}
                className={`p-2 rounded-full border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 transition-all active:scale-95 ${isRefreshing ? 'animate-spin text-blue-600 border-blue-200' : ''}`}
             >
                <RefreshCw size={18} />
             </button>
          </div>
      </div>

      <div className="space-y-6">
        {Object.keys(groupedCalls).length > 0 ? (
          Object.entries(groupedCalls).map(([dateLabel, calls]: [string, CallLogItem[]]) => (
              <div key={dateLabel}>
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 px-2 sticky top-0 bg-[#F8FAFC] py-2 z-10 flex items-center gap-2">
                      <Calendar size={12} /> {dateLabel}
                  </h3>
                  <div className="space-y-3">
                    {calls.map(call => (
                        <div 
                            key={call.id} 
                            onClick={() => setExpandedId(expandedId === call.id ? null : call.id)}
                            className={`bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden transition-all cursor-pointer hover:shadow-md ${isSeniorMode ? 'p-6' : 'p-0'}`}
                        >
                        <div className="p-5 flex items-center justify-between gap-4">
                            <div className="flex items-center gap-4 flex-1 min-w-0">
                                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 ${
                                call.direction === 'incoming' ? 'bg-blue-50' : 'bg-green-50'
                                }`}>
                                {call.direction === 'incoming' ? <PhoneIncoming className="text-blue-600" size={20} /> : <PhoneOutgoing className="text-green-600" size={20} />}
                                </div>
                                <div className="min-w-0 flex-1">
                                    <h3 className="font-bold text-slate-900 text-base truncate pr-2">
                                        {call.contactName || call.phoneNumber}
                                    </h3>
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs text-slate-400 font-medium whitespace-nowrap">{formatTime(call.timestamp)}</span>
                                        {call.hasRecording && (
                                            <span className="flex items-center gap-1 text-[10px] bg-red-50 text-red-500 px-1.5 py-0.5 rounded font-bold border border-red-100 whitespace-nowrap">
                                                <Disc size={10} /> REC
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                            
                            {/* Risk Score Bubble */}
                            {call.aiAnalysis && (
                                <div className={`w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center font-black text-[10px] border-4 ${
                                    call.aiAnalysis.riskScore > 70 ? 'border-red-100 bg-red-500 text-white' : 
                                    call.aiAnalysis.riskScore > 30 ? 'border-amber-100 bg-amber-500 text-white' : 
                                    'border-green-100 bg-green-500 text-white'
                                }`}>
                                    {call.aiAnalysis.riskScore}
                                </div>
                            )}
                        </div>

                        {/* Expanded / AI Analysis Section */}
                        {call.aiAnalysis && (
                            <div className={`px-5 pb-5 ${expandedId === call.id ? 'block' : 'hidden'}`}>
                                <div className={`p-4 rounded-2xl border ${getRiskColor(call.aiAnalysis.riskScore)}`}>
                                    <div className="flex justify-between items-center mb-2">
                                        <div className="flex items-center gap-2">
                                                {call.aiAnalysis.riskScore >= 70 ? <ShieldAlert size={16} /> : <ShieldCheck size={16} />}
                                                <span className="font-black uppercase text-xs">AI Đánh giá</span>
                                        </div>
                                    </div>
                                    <p className="text-sm font-medium mb-2 break-words">"{call.aiAnalysis.explanation}"</p>
                                    
                                    {/* Playback Simulation */}
                                    {call.hasRecording && (
                                        <div className="mt-4 bg-white/60 p-2 rounded-xl flex items-center gap-3 cursor-not-allowed opacity-80 border border-black/5" title="Chỉ mô phỏng">
                                            <button className="w-8 h-8 bg-current rounded-full flex items-center justify-center text-white">
                                                <Play size={12} fill="currentColor" />
                                            </button>
                                            <div className="h-1 bg-current/20 flex-1 rounded-full overflow-hidden">
                                                <div className="w-1/3 h-full bg-current"></div>
                                            </div>
                                            <span className="text-[10px] font-mono font-bold whitespace-nowrap">00:15 / {formatDuration(call.duration)}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                        </div>
                    ))}
                  </div>
              </div>
          ))
        ) : (
           <p className="text-center text-slate-500 mt-20">Chưa có lịch sử cuộc gọi nào.</p>
        )}
      </div>
    </div>
  );
};

export default CallHistoryScreen;
