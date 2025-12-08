
import React, { useState, useEffect, useRef } from 'react';
import { X, Check, Shield, Crown, Zap, MessageSquareWarning, ScanFace, Calendar, ArrowRight } from 'lucide-react';
import { useAuth, LIMITS } from '../context/AuthContext';

interface PremiumUpgradeModalProps {
  onClose: () => void;
  triggerSource?: string; 
}

type PlanDuration = 'monthly' | 'yearly';

const PremiumUpgradeModal: React.FC<PremiumUpgradeModalProps> = ({ onClose, triggerSource }) => {
  const { upgradeSubscription, user } = useAuth();
  const [processing, setProcessing] = useState(false);
  const [selectedDuration, setSelectedDuration] = useState<PlanDuration>('yearly');
  const modalRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  const isFree = user?.plan === 'free';

  // Calculate Trial Date
  const trialEndDate = new Date();
  trialEndDate.setDate(trialEndDate.getDate() + 7);
  const trialDateString = trialEndDate.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' });

  // Focus Trap and Escape Key Handler
  useEffect(() => {
    closeButtonRef.current?.focus();
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const handleUpgrade = () => {
      setProcessing(true);
      setTimeout(() => {
          upgradeSubscription(selectedDuration); 
          setProcessing(false);
          alert(`Đăng ký gói ${selectedDuration === 'monthly' ? 'Tháng' : 'Năm'} thành công!`);
          onClose();
      }, 1500);
  };

  const getHeadline = () => {
      if (triggerSource === 'deepfake_limit') return "Hết lượt quét Deepfake hôm nay!";
      if (triggerSource === 'message_limit') return "Bạn đã dùng hết lượt quét tin nhắn!";
      if (triggerSource === 'lookup_limit') return "Hết lượt tra cứu số lạ hôm nay!";
      return "Mở khóa sức mạnh AI";
  };

  return (
    <div 
        className="fixed inset-0 z-[100] bg-slate-900/90 backdrop-blur-md flex items-center justify-center p-4 animate-in zoom-in duration-300"
        role="dialog"
        aria-modal="true"
        onClick={onClose} // Backdrop click
    >
      <div 
        ref={modalRef}
        onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside modal
        className="bg-white w-full max-w-lg rounded-[32px] shadow-2xl overflow-hidden relative flex flex-col focus:outline-none"
        tabIndex={-1}
      >
        
        <button 
            ref={closeButtonRef}
            onClick={onClose} 
            className="absolute top-4 right-4 z-20 p-2 bg-black/5 hover:bg-black/10 rounded-full transition-colors"
        >
            <X size={24} className="text-slate-700" />
        </button>

        {/* Header */}
        <div className="bg-gradient-premium h-48 relative overflow-hidden flex flex-col items-center justify-center text-center px-6 shrink-0">
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay"></div>
            <div className="relative z-10 mt-2">
                <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-lg border border-white/30">
                    <Crown size={36} className="text-yellow-300 fill-yellow-300 animate-pulse" />
                </div>
                <h2 className="text-2xl font-black text-white leading-tight drop-shadow-md">
                    {getHeadline()}
                </h2>
                <div className="mt-2 inline-flex items-center gap-1 bg-white/20 backdrop-blur-sm border border-white/20 px-3 py-1 rounded-full text-white text-xs font-bold">
                    <Calendar size={12} /> Dùng thử miễn phí 7 ngày
                </div>
            </div>
        </div>

        {/* Content */}
        <div className="p-6 md:p-8 bg-white flex-1 overflow-y-auto">
            
            {/* PLAN TOGGLE */}
            <div className="flex gap-4 mb-8">
                {/* Monthly Option */}
                <button 
                    onClick={() => setSelectedDuration('monthly')}
                    className={`flex-1 p-4 rounded-2xl border-2 text-left relative transition-all ${
                        selectedDuration === 'monthly' 
                        ? 'border-blue-600 bg-blue-50' 
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                >
                    <div className="flex justify-between items-start mb-2">
                        <span className={`font-bold ${selectedDuration === 'monthly' ? 'text-blue-700' : 'text-slate-500'}`}>Theo Tháng</span>
                        {selectedDuration === 'monthly' && <Check size={18} className="text-blue-600 bg-blue-200 rounded-full p-0.5" />}
                    </div>
                    <div className="text-2xl font-black text-slate-900">49.000đ</div>
                    <div className="text-xs text-slate-500 font-medium">mỗi tháng</div>
                </button>

                {/* Yearly Option */}
                <button 
                    onClick={() => setSelectedDuration('yearly')}
                    className={`flex-1 p-4 rounded-2xl border-2 text-left relative transition-all ${
                        selectedDuration === 'yearly' 
                        ? 'border-purple-600 bg-purple-50' 
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                >
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm whitespace-nowrap">
                        TIẾT KIỆM 15%
                    </div>
                    <div className="flex justify-between items-start mb-2">
                        <span className={`font-bold ${selectedDuration === 'yearly' ? 'text-purple-700' : 'text-slate-500'}`}>Theo Năm</span>
                        {selectedDuration === 'yearly' && <Check size={18} className="text-purple-600 bg-purple-200 rounded-full p-0.5" />}
                    </div>
                    <div className="text-2xl font-black text-slate-900">499.000đ</div>
                    <div className="text-xs text-slate-500 font-medium">~41.000đ / tháng</div>
                </button>
            </div>

            {/* FEATURES */}
            <div className="space-y-3 mb-8">
                <FeatureRow 
                    icon={<ScanFace size={20} />} 
                    color="blue" 
                    title="Quét Deepfake Không Giới Hạn" 
                    desc={isFree ? `Gói Free chỉ được ${LIMITS.FREE.DEEPFAKE_SCANS} lượt/ngày.` : "Phân tích Video/Audio nâng cao"} 
                />
                <FeatureRow 
                    icon={<MessageSquareWarning size={20} />} 
                    color="purple" 
                    title="Quét Tin Nhắn & Link Độc Hại" 
                    desc={isFree ? `Gói Free giới hạn ${LIMITS.FREE.MESSAGE_SCANS} tin nhắn/ngày.` : "Phát hiện lừa đảo thời gian thực"} 
                />
                <FeatureRow 
                    icon={<Shield size={20} />} 
                    color="red" 
                    title="Tra Cứu Số & Chặn Spam" 
                    desc={isFree ? `Gói Free chỉ tra cứu ${LIMITS.FREE.CALL_LOOKUPS} số/ngày.` : "Cơ sở dữ liệu Global"} 
                />
            </div>

            <button 
                onClick={handleUpgrade}
                disabled={processing}
                className={`w-full py-4 text-white rounded-2xl font-bold text-lg shadow-xl hover:shadow-2xl hover:scale-[1.02] transition-all active:scale-95 flex items-center justify-center gap-2 relative overflow-hidden group focus:ring-4 focus:outline-none ${
                    selectedDuration === 'monthly' 
                        ? 'bg-gradient-to-r from-blue-600 to-indigo-700 shadow-blue-200 focus:ring-blue-300' 
                        : 'bg-gradient-to-r from-purple-600 to-pink-600 shadow-purple-200 focus:ring-purple-300'
                }`}
            >
                {processing ? "Đang xử lý..." : (
                    <>
                        Bắt đầu 7 ngày miễn phí <ArrowRight size={20} />
                    </>
                )}
            </button>
            
            <p className="text-center text-[10px] text-slate-400 mt-4 leading-tight">
                Gia hạn tự động. Hủy bất kỳ lúc nào trước {trialDateString} để không mất phí.
            </p>
        </div>
      </div>
    </div>
  );
};

const FeatureRow = ({ icon, color, title, desc }: { icon: any, color: string, title: string, desc: string }) => {
    const bgMap: Record<string, string> = {
        blue: 'bg-blue-50 border-blue-100 text-blue-600',
        purple: 'bg-purple-50 border-purple-100 text-purple-600',
        red: 'bg-red-50 border-red-100 text-red-600',
    };
    
    const bgIconMap: Record<string, string> = {
        blue: 'bg-blue-100',
        purple: 'bg-purple-100',
        red: 'bg-red-100',
    };

    return (
        <div className={`flex items-center gap-4 p-3 rounded-2xl border ${bgMap[color]}`}>
            <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${bgIconMap[color]}`}>
                {icon}
            </div>
            <div>
                <h4 className="font-bold text-slate-900 flex items-center gap-2 text-sm">{title}</h4>
                <p className="text-xs text-slate-500">{desc}</p>
            </div>
            <Check className="text-green-500 ml-auto" size={20} />
        </div>
    );
};

export default PremiumUpgradeModal;
