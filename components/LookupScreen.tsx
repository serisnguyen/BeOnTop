
import React, { useState, useEffect, useMemo } from 'react';
import { Search, ShieldCheck, ShieldAlert, AlertTriangle, ThumbsDown, UserCheck, ArrowLeft, Loader2, PhoneOff, TrendingUp, Globe, BarChart3, Clock, Lock, Crown } from 'lucide-react';
import { useAuth, LIMITS } from '../context/AuthContext';
import { PhoneLookupResult } from '../types';
import PremiumUpgradeModal from './PremiumUpgradeModal';
import { MOCK_PHONE_DATABASE } from '../data/mockData';

interface LookupScreenProps {
    onBack: () => void;
}

const LookupScreen: React.FC<LookupScreenProps> = ({ onBack }) => {
    const { lookupPhoneNumber, reportPhoneNumber, isSeniorMode, checkLimit, incrementUsage, user } = useAuth();
    const [searchTerm, setSearchTerm] = useState('');
    const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
    const [result, setResult] = useState<PhoneLookupResult | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [showReportModal, setShowReportModal] = useState(false);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [showPremiumModal, setShowPremiumModal] = useState(false);

    // Dynamic Top Spammers
    const topSpammers = useMemo(() => {
        return Object.values(MOCK_PHONE_DATABASE)
            .filter(p => p.tags.includes('scam') || p.tags.includes('spam'))
            .sort((a, b) => b.reportCount - a.reportCount)
            .slice(0, 5)
            .map(p => ({
                phone: p.phoneNumber,
                label: p.communityLabel || 'Spam',
                reports: p.reportCount > 1000 ? `${(p.reportCount/1000).toFixed(1)}k` : p.reportCount.toString(),
                trend: Math.random() > 0.5 ? 'up' : 'down',
                isScam: p.tags.includes('scam')
            }));
    }, []);

    const suggestedSearches = [
        "0909112233", "0888999000", "02477778888"
    ];

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedSearchTerm(searchTerm);
        }, 300);
        return () => clearTimeout(handler);
    }, [searchTerm]);

    const handleSearch = async (phoneToSearch?: string) => {
        const query = phoneToSearch || searchTerm;
        if (!query || query.length < 3) return;
        
        // CHECK LIMITS
        if (!checkLimit('lookup')) {
            setShowPremiumModal(true);
            return;
        }

        setIsLoading(true);
        setResult(null);
        if (phoneToSearch) setSearchTerm(phoneToSearch);
        setShowSuggestions(false);

        try {
            const data = await lookupPhoneNumber(query);
            setResult(data);
            incrementUsage('lookup');
        } catch (e) {
            console.error(e);
        } finally {
            setIsLoading(false);
        }
    };

    const handleReport = async (type: 'scam' | 'spam' | 'safe') => {
        if (!searchTerm) return;
        setIsLoading(true);
        const labels = {
            scam: 'Lừa đảo',
            spam: 'Làm phiền',
            safe: 'An toàn'
        };
        await reportPhoneNumber(searchTerm, type, labels[type]);
        // Refresh result
        const data = await lookupPhoneNumber(searchTerm);
        setResult(data);
        setIsLoading(false);
        setShowReportModal(false);
        alert(`Đã báo cáo số ${searchTerm} là ${labels[type]}!`);
    };

    const getScoreColor = (score: number) => {
        if (score > 80) return 'text-green-600';
        if (score > 50) return 'text-amber-600';
        return 'text-red-600';
    };

    const getTagBadge = (tag: string) => {
        const classes = `rounded-full font-bold uppercase border ${isSeniorMode ? 'px-4 py-2 text-base' : 'px-3 py-1 text-xs'}`;
        switch (tag) {
            case 'scam': return <span className={`${classes} bg-red-100 text-red-700 border-red-200`}>Lừa đảo</span>;
            case 'spam': return <span className={`${classes} bg-amber-100 text-amber-700 border-amber-200`}>Spam / QC</span>;
            case 'delivery': return <span className={`${classes} bg-blue-100 text-blue-700 border-blue-200`}>Shipper</span>;
            case 'safe': return <span className={`${classes} bg-green-100 text-green-700 border-green-200`}>An toàn</span>;
            default: return null;
        }
    };

    const remaining = user?.plan !== 'free' ? 999 : Math.max(0, LIMITS.FREE.CALL_LOOKUPS - (user?.usage?.callLookups || 0));
    const isLimitReached = user?.plan === 'free' && remaining === 0;

    return (
        <div className={`p-4 md:p-6 pt-20 md:pt-10 pb-32 min-h-screen max-w-3xl mx-auto animate-in fade-in ${isSeniorMode ? 'text-lg' : ''}`}>
            
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                    <button onClick={onBack} className="p-2 hover:bg-slate-100 rounded-full transition-colors" aria-label="Quay lại">
                        <ArrowLeft size={isSeniorMode ? 32 : 24} />
                    </button>
                    <div>
                        <h2 className={`font-black text-slate-900 ${isSeniorMode ? 'text-3xl' : 'text-2xl'}`}>Tra Cứu Số</h2>
                        <p className="text-slate-500 text-sm">Cơ sở dữ liệu Global Spam</p>
                    </div>
                </div>
                {user?.plan === 'free' && (
                    <div className={`px-3 py-1 rounded-lg text-xs font-bold whitespace-nowrap ${isLimitReached ? 'bg-red-100 text-red-600' : 'bg-amber-100 text-amber-800'}`}>
                        {isLimitReached ? "Hết lượt" : `Còn ${remaining} lượt`}
                    </div>
                )}
            </div>

            {/* Search Bar */}
            <div className="relative mb-8 z-20">
                <div className={`bg-white rounded-3xl shadow-lg shadow-blue-50 border flex items-center relative z-20 ${isSeniorMode ? 'p-4 border-slate-300' : 'p-2 border-slate-200'} ${isLimitReached ? 'opacity-50 pointer-events-none' : ''}`}>
                    <input 
                        type="tel" 
                        placeholder="Nhập số điện thoại..." 
                        className={`flex-1 bg-transparent outline-none px-4 font-bold text-slate-800 placeholder:text-slate-400 ${isSeniorMode ? 'text-2xl py-2' : 'text-lg'}`}
                        value={searchTerm}
                        onChange={(e) => {
                            setSearchTerm(e.target.value);
                            setShowSuggestions(true);
                        }}
                        onFocus={() => setShowSuggestions(true)}
                        onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                        disabled={isLimitReached}
                        aria-label="Nhập số điện thoại cần tra cứu"
                    />
                    <button 
                        onClick={() => handleSearch()}
                        disabled={isLoading || searchTerm.length < 3 || isLimitReached}
                        className={`bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold transition-all flex items-center gap-2 shadow-md active:scale-95 disabled:opacity-50 ${isSeniorMode ? 'px-8 py-4 text-xl' : 'px-6 py-3'}`}
                        aria-label="Thực hiện tra cứu"
                    >
                        {isLoading ? <Loader2 className="animate-spin" /> : <Search size={isSeniorMode ? 28 : 20} />}
                        {isSeniorMode ? '' : 'Kiểm tra'}
                    </button>
                </div>

                {/* Limit Reached Banner */}
                {isLimitReached && (
                    <div className="absolute top-full left-0 right-0 mt-4 bg-slate-900 text-white rounded-2xl p-4 shadow-xl z-30 flex items-center justify-between animate-in slide-in-from-top-2">
                        <div className="flex items-center gap-3">
                            <div className="bg-white/20 p-2 rounded-full"><Lock size={20} /></div>
                            <div>
                                <div className="font-bold text-sm">Hết lượt tra cứu hôm nay</div>
                                <div className="text-xs text-slate-300">Nâng cấp để tra cứu không giới hạn</div>
                            </div>
                        </div>
                        <button 
                            onClick={() => setShowPremiumModal(true)}
                            className="bg-white text-slate-900 px-4 py-2 rounded-xl font-bold text-sm hover:bg-blue-50 transition-colors flex items-center gap-2"
                            aria-label="Nâng cấp Premium"
                        >
                            <Crown size={14} className="text-yellow-500 fill-current" /> Nâng cấp
                        </button>
                    </div>
                )}

                {/* Suggestions Dropdown */}
                {showSuggestions && debouncedSearchTerm.length > 0 && !isLimitReached && (
                    <div className="absolute top-full left-4 right-4 bg-white rounded-b-3xl shadow-xl border border-t-0 border-slate-200 -mt-4 pt-6 pb-2 px-2 z-10 animate-in fade-in slide-in-from-top-2">
                         <div className="text-xs font-bold text-slate-400 uppercase px-3 mb-2">Gợi ý tìm kiếm</div>
                         {suggestedSearches.filter(s => s.includes(debouncedSearchTerm)).map(s => (
                             <button 
                                key={s} 
                                onClick={() => handleSearch(s)}
                                className={`w-full text-left hover:bg-slate-50 rounded-xl font-bold text-slate-700 flex items-center gap-3 ${isSeniorMode ? 'p-4 text-xl' : 'p-3'}`}
                             >
                                 <Clock size={isSeniorMode ? 20 : 16} className="text-slate-400"/> {s}
                             </button>
                         ))}
                    </div>
                )}
            </div>

            {/* Result Area */}
            {result ? (
                <div className="animate-in slide-in-from-bottom duration-500">
                    <div className="bg-white rounded-[32px] border border-slate-200 shadow-xl overflow-hidden mb-6">
                        <div className={`p-8 text-center relative ${
                            result.reputationScore < 50 ? 'bg-red-50' : 
                            result.reputationScore < 80 ? 'bg-amber-50' : 'bg-green-50'
                        }`}>
                            <div className={`mx-auto rounded-full flex items-center justify-center mb-4 border-4 bg-white shadow-sm ${
                                result.reputationScore < 50 ? 'border-red-200 text-red-600' : 
                                result.reputationScore < 80 ? 'border-amber-200 text-amber-600' : 'border-green-200 text-green-600'
                            } ${isSeniorMode ? 'w-32 h-32' : 'w-24 h-24'}`}>
                                {result.reputationScore < 50 ? <ShieldAlert size={isSeniorMode ? 64 : 48} /> : 
                                 result.reputationScore < 80 ? <AlertTriangle size={isSeniorMode ? 64 : 48} /> : <ShieldCheck size={isSeniorMode ? 64 : 48} />}
                            </div>
                            
                            <h3 className={`font-black mb-1 ${isSeniorMode ? 'text-5xl' : 'text-3xl'}`}>{result.phoneNumber}</h3>
                            <p className={`font-bold text-slate-500 mb-4 ${isSeniorMode ? 'text-2xl' : ''}`}>{result.carrier}</p>
                            
                            <div className="flex justify-center gap-2 mb-6">
                                {result.tags.map((tag, i) => <div key={i}>{getTagBadge(tag)}</div>)}
                                {result.tags.length === 0 && <span className="text-slate-400 italic text-sm">Chưa có nhãn</span>}
                            </div>

                            <div className="flex justify-center gap-8 border-t border-black/5 pt-6">
                                <div>
                                    <div className={`font-black ${getScoreColor(result.reputationScore)} ${isSeniorMode ? 'text-5xl' : 'text-2xl'}`}>{result.reputationScore}/100</div>
                                    <div className="text-xs font-bold text-slate-400 uppercase tracking-wide">Điểm Uy tín</div>
                                </div>
                                <div>
                                    <div className={`font-black text-slate-800 ${isSeniorMode ? 'text-5xl' : 'text-2xl'}`}>{result.reportCount}</div>
                                    <div className="text-xs font-bold text-slate-400 uppercase tracking-wide">Lượt báo cáo</div>
                                </div>
                            </div>
                        </div>

                        <div className={`p-6 ${isSeniorMode ? 'p-8' : ''}`}>
                            <h4 className="font-bold text-slate-500 uppercase text-xs tracking-wider mb-4">Thông tin cộng đồng</h4>
                            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 mb-6">
                                <p className={`font-medium text-slate-800 ${isSeniorMode ? 'text-2xl' : 'text-base'}`}>
                                    {result.communityLabel ? `"${result.communityLabel}"` : "Số điện thoại này chưa có nhiều dữ liệu báo cáo từ cộng đồng. Hãy cẩn trọng nếu là số lạ."}
                                </p>
                            </div>

                            <button 
                                onClick={() => setShowReportModal(true)}
                                className={`w-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl flex items-center justify-center gap-2 transition-colors ${isSeniorMode ? 'py-6 text-2xl' : 'py-4'}`}
                                aria-label="Báo cáo số điện thoại này"
                            >
                                <ThumbsDown size={isSeniorMode ? 28 : 20} /> Báo cáo số này
                            </button>
                        </div>
                    </div>
                </div>
            ) : (
                /* GLOBAL STATS & TOP SPAMMERS (Default View) */
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    
                    {/* Global Stats Cards */}
                    <div className="grid grid-cols-2 gap-3">
                         <div className={`bg-blue-600 text-white rounded-3xl relative overflow-hidden shadow-lg shadow-blue-200 ${isSeniorMode ? 'p-8' : 'p-5'}`}>
                             <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -mr-10 -mt-10 blur-xl"></div>
                             <Globe className="mb-3 opacity-80" size={isSeniorMode ? 32 : 24} />
                             <h4 className={`font-black ${isSeniorMode ? 'text-4xl' : 'text-3xl'}`}>56 Tỷ</h4>
                             <p className="text-xs font-bold text-blue-200 uppercase tracking-wide mt-1">Spam đã bị chặn</p>
                         </div>
                         <div className={`bg-slate-900 text-white rounded-3xl relative overflow-hidden shadow-lg shadow-slate-300 ${isSeniorMode ? 'p-8' : 'p-5'}`}>
                             <div className="absolute bottom-0 left-0 w-24 h-24 bg-red-500/20 rounded-full -ml-10 -mb-10 blur-xl"></div>
                             <BarChart3 className="mb-3 opacity-80" size={isSeniorMode ? 32 : 24} />
                             <h4 className={`font-black ${isSeniorMode ? 'text-4xl' : 'text-3xl'}`}>12.5M</h4>
                             <p className="text-xs font-bold text-slate-400 uppercase tracking-wide mt-1">Báo cáo hôm nay</p>
                         </div>
                    </div>

                    {/* Top Spammers List */}
                    <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
                        <div className={`border-b border-slate-100 bg-slate-50/50 flex justify-between items-center ${isSeniorMode ? 'p-6' : 'p-5'}`}>
                            <h3 className={`font-black text-slate-800 flex items-center gap-2 ${isSeniorMode ? 'text-xl' : 'text-base'}`}>
                                <TrendingUp className="text-red-500" size={isSeniorMode ? 24 : 20} />
                                Top Spam Hôm Nay
                            </h3>
                            <span className="text-[10px] font-bold bg-red-100 text-red-600 px-2 py-1 rounded">LIVE</span>
                        </div>
                        <div className="divide-y divide-slate-100">
                            {topSpammers.map((spammer, idx) => (
                                <div 
                                    key={idx} 
                                    onClick={() => handleSearch(spammer.phone)}
                                    className={`hover:bg-slate-50 cursor-pointer flex items-center justify-between group transition-colors ${isSeniorMode ? 'p-6' : 'p-4'}`}
                                >
                                    <div className="flex items-center gap-4">
                                        <div className={`font-black text-slate-400 w-6 ${isSeniorMode ? 'text-2xl' : 'text-lg'}`}>{idx + 1}</div>
                                        <div>
                                            <div className={`font-bold text-slate-800 group-hover:text-blue-600 transition-colors ${isSeniorMode ? 'text-xl' : ''}`}>
                                                {spammer.phone}
                                            </div>
                                            <div className={`font-medium ${spammer.isScam ? 'text-red-500' : 'text-amber-500'} flex items-center gap-1 ${isSeniorMode ? 'text-base' : 'text-xs'}`}>
                                                <ShieldAlert size={isSeniorMode ? 14 : 10} /> {spammer.label}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className={`font-bold text-slate-500 ${isSeniorMode ? 'text-base' : 'text-xs'}`}>{spammer.reports} lượt báo</div>
                                        {spammer.trend === 'up' && <span className="text-[10px] text-red-500 font-bold">▲ Tăng mạnh</span>}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                </div>
            )}

            {/* Report Modal */}
            {showReportModal && (
                <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-white w-full max-w-sm rounded-3xl p-6 shadow-2xl animate-in zoom-in duration-200">
                        <h3 className={`font-bold text-slate-900 mb-4 text-center ${isSeniorMode ? 'text-2xl' : 'text-xl'}`}>Báo cáo số {searchTerm}</h3>
                        <div className="grid gap-3">
                            <button onClick={() => handleReport('scam')} className={`bg-red-50 text-red-700 rounded-xl font-bold flex items-center gap-3 border border-red-100 hover:bg-red-100 transition-colors ${isSeniorMode ? 'p-6 text-xl' : 'p-4'}`}>
                                <ShieldAlert size={isSeniorMode ? 32 : 24} /> Lừa đảo / Giả danh
                            </button>
                            <button onClick={() => handleReport('spam')} className={`bg-amber-50 text-amber-700 rounded-xl font-bold flex items-center gap-3 border border-amber-100 hover:bg-amber-100 transition-colors ${isSeniorMode ? 'p-6 text-xl' : 'p-4'}`}>
                                <PhoneOff size={isSeniorMode ? 32 : 24} /> Spam / Quảng cáo
                            </button>
                            <button onClick={() => handleReport('safe')} className={`bg-green-50 text-green-700 rounded-xl font-bold flex items-center gap-3 border border-green-100 hover:bg-green-100 transition-colors ${isSeniorMode ? 'p-6 text-xl' : 'p-4'}`}>
                                <UserCheck size={isSeniorMode ? 32 : 24} /> An toàn (Shipper...)
                            </button>
                        </div>
                        <button onClick={() => setShowReportModal(false)} className={`w-full mt-4 text-slate-400 font-bold hover:text-slate-600 ${isSeniorMode ? 'py-4' : 'py-2'}`}>
                            Hủy bỏ
                        </button>
                    </div>
                </div>
            )}
            
            {showPremiumModal && <PremiumUpgradeModal onClose={() => setShowPremiumModal(false)} triggerSource="lookup_limit" />}
        </div>
    );
};

export default LookupScreen;
