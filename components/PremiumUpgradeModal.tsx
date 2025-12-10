
import React, { useState, useEffect, useRef } from 'react';
import { X, Check, Shield, Crown, Zap, MessageSquareWarning, ScanFace, Calendar, ArrowRight, Star, Lock } from 'lucide-react';
import { useAuth, LIMITS } from '../context/AuthContext';

interface PremiumUpgradeModalProps {
  onClose: () => void;
  triggerSource?: string; 
}

type PlanDuration = 'monthly' | 'yearly';

const PremiumUpgradeModal: React.FC<PremiumUpgradeModalProps> = ({ onClose, triggerSource }) => {
  const { upgradeSubscription, user } = useAuth();
  const [processing, setProcessing] = useState(false);
  const [selectedDuration, setSelectedDuration] = useState<PlanDuration>('monthly'); 
  const modalRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  // Focus Trap
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
          alert(`Chào mừng thành viên Premium! Gói ${selectedDuration === 'monthly' ? 'Tháng' : 'Năm'} đã được kích hoạt.`);
          onClose();
      }, 1500);
  };

  // Pricing Logic
  const pricing = {
      yearly: {
          monthlyPrice: '41.000',
          totalPrice: '499.000',
          saving: '89k', // Updated based on 49k/mo * 12 = 588k - 499k = 89k
          label: '1 Năm'
      },
      monthly: {
          monthlyPrice: '49.000',
          totalPrice: '49.000',
          saving: '0',
          label: '1 Tháng'
      }
  };

  const currentPrice = pricing[selectedDuration];

  return (
    <div 
        className="fixed inset-0 z-[100] flex items-end md:items-center justify-center p-0 md:p-4 animate-in fade-in duration-300"
        role="dialog"
        aria-modal="true"
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm transition-opacity" onClick={onClose}></div>

      <div 
        ref={modalRef}
        onClick={(e) => e.stopPropagation()}
        className="bg-white w-full md:max-w-md md:rounded-[2.5rem] rounded-t-[2.5rem] shadow-2xl overflow-hidden relative flex flex-col max-h-[90vh] md:max-h-[85vh] animate-in slide-in-from-bottom duration-300 z-10"
      >
        
        {/* iOS Grab Handle (Mobile Only) */}
        <div className="md:hidden absolute top-3 left-1/2 -translate-x-1/2 w-12 h-1.5 bg-white/20 rounded-full z-30"></div>

        {/* Close Button */}
        <button 
            ref={closeButtonRef}
            onClick={onClose} 
            className="absolute top-5 right-5 z-20 p-2 bg-black/20 hover:bg-black/30 text-white rounded-full transition-colors backdrop-blur-md"
        >
            <X size={20} />
        </button>

        {/* HERO HEADER - Deep Dark Blue Gradient */}
        <div className="bg-[#0F172A] relative pt-14 pb-6 px-6 text-center overflow-hidden shrink-0">
            {/* Glow Effects */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-gradient-to-b from-blue-900/20 to-transparent opacity-50 pointer-events-none"></div>
            <div className="absolute -top-20 -right-20 w-64 h-64 bg-purple-500/20 rounded-full blur-[80px] pointer-events-none"></div>
            <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-blue-500/20 rounded-full blur-[80px] pointer-events-none"></div>
            
            <div className="relative z-10">
                <div className="w-16 h-16 mx-auto bg-gradient-to-br from-amber-300 to-yellow-500 rounded-2xl flex items-center justify-center shadow-[0_0_40px_rgba(245,158,11,0.4)] mb-4 animate-float border-2 border-white/10">
                    <Crown size={32} className="text-white drop-shadow-md" fill="currentColor" />
                </div>
                <h2 className="text-2xl font-black text-white mb-1 tracking-tight">
                    Nâng cấp TruthShield Pro
                </h2>
                <p className="text-slate-400 font-medium leading-relaxed max-w-xs mx-auto text-xs">
                    Bảo vệ toàn diện trước mọi thủ đoạn lừa đảo.
                </p>
            </div>
        </div>

        {/* CONTENT BODY - Added no-scrollbar */}
        <div className="flex-1 overflow-y-auto bg-white px-6 py-6 pb-36 md:pb-6 relative rounded-t-[2rem] -mt-6 no-scrollbar">
            
            {/* PLAN SELECTOR SWITCH */}
            <div className="flex justify-center mb-6">
                <div className="bg-slate-100 p-1 rounded-xl inline-flex relative">
                    {/* Sliding Background */}
                    <div 
                        className={`absolute top-1 bottom-1 w-[50%] bg-white rounded-lg shadow-sm transition-all duration-300 ease-out ${
                            selectedDuration === 'yearly' ? 'left-[48%]' : 'left-1'
                        }`}
                    ></div>
                    
                    <button 
                        onClick={() => setSelectedDuration('monthly')}
                        className={`relative z-10 px-6 py-2 rounded-lg text-sm font-bold transition-colors ${selectedDuration === 'monthly' ? 'text-slate-900' : 'text-slate-500'}`}
                    >
                        Theo Tháng
                    </button>
                    <button 
                        onClick={() => setSelectedDuration('yearly')}
                        className={`relative z-10 px-6 py-2 rounded-lg text-sm font-bold transition-colors ${selectedDuration === 'yearly' ? 'text-slate-900' : 'text-slate-500'}`}
                    >
                        Theo Năm <span className="text-[9px] bg-green-100 text-green-700 px-1.5 py-0.5 rounded ml-1">-15%</span>
                    </button>
                </div>
            </div>

            {/* PRICING CARD */}
            <div className="text-center mb-8">
                 <div className="inline-flex items-baseline justify-center gap-1">
                    <span className="text-5xl font-black text-slate-900 tracking-tighter">{currentPrice.monthlyPrice}</span>
                    <span className="text-2xl font-bold text-slate-400">đ</span>
                    <span className="text-lg font-medium text-slate-400">/tháng</span>
                 </div>
                 <div className="mt-2 h-6"> {/* Fixed height to prevent jump */}
                    {selectedDuration === 'yearly' ? (
                        <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide border border-green-200 shadow-sm animate-in fade-in">
                            Thanh toán {currentPrice.totalPrice}đ / năm. Tiết kiệm {currentPrice.saving}.
                        </span>
                    ) : (
                        <span className="text-slate-400 text-xs font-bold animate-in fade-in">
                            Thanh toán linh hoạt từng tháng. Hủy bất kỳ lúc nào.
                        </span>
                    )}
                 </div>
            </div>

            {/* FEATURES LIST */}
            <div className="space-y-5">
                {/* Item 1 */}
                <div className="flex items-center gap-4 group">
                    <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0 group-hover:bg-blue-100 transition-colors border border-blue-100">
                        <ScanFace size={24} />
                    </div>
                    <div className="flex-1">
                        <h4 className="font-bold text-slate-900 text-sm">Quét Deepfake Không Giới Hạn</h4>
                        <p className="text-[11px] text-slate-500 font-medium mt-0.5">Phân tích Video/Audio với độ chính xác 99%.</p>
                    </div>
                    <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center">
                        <Check size={14} strokeWidth={4} />
                    </div>
                </div>

                {/* Item 2 */}
                <div className="flex items-center gap-4 group">
                    <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center flex-shrink-0 group-hover:bg-purple-100 transition-colors border border-purple-100">
                        <MessageSquareWarning size={24} />
                    </div>
                    <div className="flex-1">
                        <h4 className="font-bold text-slate-900 text-sm">Chặn Tin Nhắn Lừa Đảo</h4>
                        <p className="text-[11px] text-slate-500 font-medium mt-0.5">AI tự động quét và cảnh báo link độc hại.</p>
                    </div>
                    <div className="w-6 h-6 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center">
                        <Check size={14} strokeWidth={4} />
                    </div>
                </div>

                {/* Item 3 */}
                <div className="flex items-center gap-4 group">
                    <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center flex-shrink-0 group-hover:bg-amber-100 transition-colors border border-amber-100">
                        <Shield size={24} />
                    </div>
                    <div className="flex-1">
                        <h4 className="font-bold text-slate-900 text-sm">Cơ Sở Dữ Liệu Global</h4>
                        <p className="text-[11px] text-slate-500 font-medium mt-0.5">Tra cứu số lạ từ nguồn dữ liệu toàn cầu.</p>
                    </div>
                    <div className="w-6 h-6 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center">
                        <Check size={14} strokeWidth={4} />
                    </div>
                </div>
            </div>

        </div>

        {/* FOOTER CTA - Fixed at bottom on mobile */}
        <div className="absolute bottom-0 left-0 right-0 p-6 bg-white border-t border-slate-100 z-20 pb-safe md:relative md:border-0 md:pt-0">
            <button 
                onClick={handleUpgrade}
                disabled={processing}
                className="w-full relative group overflow-hidden bg-slate-900 text-white rounded-2xl p-1 shadow-xl shadow-slate-300 transform active:scale-95 transition-all"
            >
                <div className="absolute inset-0 bg-gradient-to-r from-slate-800 to-slate-900"></div>
                {/* Shimmer Effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover:animate-shimmer transition-transform duration-1000"></div>
                
                <div className="relative bg-slate-900 rounded-xl py-4 flex items-center justify-center gap-3">
                    {processing ? (
                        <>
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                            <span className="font-bold">Đang xử lý...</span>
                        </>
                    ) : (
                        <>
                            <span className="font-black text-lg">Dùng thử miễn phí 7 ngày</span>
                            <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                        </>
                    )}
                </div>
            </button>
            <div className="text-center mt-3">
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wide flex items-center justify-center gap-1">
                    <Lock size={10} /> Hủy bất kỳ lúc nào • Không cam kết
                </p>
            </div>
        </div>

      </div>
    </div>
  );
};

export default PremiumUpgradeModal;
