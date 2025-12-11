
import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { X, Check, ScanFace, MessageSquareWarning, Shield, Crown, ArrowRight, Lock } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface PremiumUpgradeModalProps {
  onClose: () => void;
  triggerSource?: string; 
}

type PlanDuration = 'monthly' | 'yearly';

const PremiumUpgradeModal: React.FC<PremiumUpgradeModalProps> = ({ onClose, triggerSource }) => {
  const { upgradeSubscription } = useAuth();
  const [processing, setProcessing] = useState(false);
  const [selectedDuration, setSelectedDuration] = useState<PlanDuration>('monthly'); 
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
          saving: '89k', 
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

  const modalContent = (
    <div 
        className="fixed inset-0 z-[9999] flex items-center justify-center p-4 animate-in fade-in duration-300"
        role="dialog"
        aria-modal="true"
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-md transition-opacity" onClick={onClose}></div>

      <div 
        onClick={(e) => e.stopPropagation()}
        className="bg-white w-full max-w-sm md:w-full rounded-[2rem] shadow-2xl overflow-hidden relative flex flex-col animate-in zoom-in-95 duration-300 z-10 border border-white/20"
        style={{ maxHeight: '90vh' }}
      >
        
        {/* Close Button */}
        <button 
            ref={closeButtonRef}
            onClick={onClose} 
            className="absolute top-3 right-3 z-30 p-1.5 bg-black/20 hover:bg-black/30 text-white rounded-full transition-colors backdrop-blur-md"
        >
            <X size={16} />
        </button>

        {/* COMPACT HEADER */}
        <div className="bg-[#0F172A] relative pt-8 pb-6 px-6 text-center overflow-hidden shrink-0">
            {/* Glow Effects */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-gradient-to-b from-blue-900/30 to-transparent opacity-50 pointer-events-none"></div>
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-purple-500/20 rounded-full blur-[50px] pointer-events-none"></div>
            
            <div className="relative z-10">
                <div className="w-12 h-12 mx-auto bg-gradient-to-br from-amber-300 to-yellow-500 rounded-2xl flex items-center justify-center shadow-[0_0_25px_rgba(245,158,11,0.4)] mb-3 animate-float border border-white/10">
                    <Crown size={24} className="text-white drop-shadow-md" fill="currentColor" />
                </div>
                <h2 className="text-xl font-black text-white mb-1 tracking-tight">
                    Nâng cấp TruthShield Pro
                </h2>
                <p className="text-slate-400 font-medium text-xs">
                    Bảo vệ toàn diện trước mọi thủ đoạn lừa đảo.
                </p>
            </div>
        </div>

        {/* CONTENT BODY */}
        <div className="flex-1 overflow-y-auto bg-white px-5 py-5 no-scrollbar">
            
            {/* COMPACT PLAN SWITCH */}
            <div className="flex justify-center mb-5">
                <div className="bg-slate-100 p-1 rounded-xl inline-flex relative w-full max-w-[240px]">
                    <div 
                        className={`absolute top-1 bottom-1 w-[calc(50%-4px)] bg-white rounded-lg shadow-sm transition-all duration-300 ease-out ${
                            selectedDuration === 'yearly' ? 'left-[calc(50%)]' : 'left-1'
                        }`}
                    ></div>
                    
                    <button 
                        onClick={() => setSelectedDuration('monthly')}
                        className={`relative z-10 flex-1 py-2 rounded-lg text-xs font-bold transition-colors text-center ${selectedDuration === 'monthly' ? 'text-slate-900' : 'text-slate-500'}`}
                    >
                        Theo Tháng
                    </button>
                    <button 
                        onClick={() => setSelectedDuration('yearly')}
                        className={`relative z-10 flex-1 py-2 rounded-lg text-xs font-bold transition-colors text-center ${selectedDuration === 'yearly' ? 'text-slate-900' : 'text-slate-500'}`}
                    >
                        Theo Năm <span className="text-[9px] bg-green-100 text-green-700 px-1 py-0.5 rounded ml-1">-15%</span>
                    </button>
                </div>
            </div>

            {/* COMPACT PRICING */}
            <div className="text-center mb-6">
                 <div className="inline-flex items-baseline justify-center gap-1">
                    <span className="text-4xl font-black text-slate-900 tracking-tighter">{currentPrice.monthlyPrice}</span>
                    <span className="text-2xl font-bold text-slate-400">đ</span>
                    <span className="text-sm font-bold text-slate-400">/tháng</span>
                 </div>
                 <p className="text-[10px] text-slate-400 font-medium mt-1">
                     Thanh toán linh hoạt từng tháng. Hủy bất kỳ lúc nào.
                 </p>
            </div>

            {/* COMPACT FEATURES LIST */}
            <div className="space-y-3">
                {[
                    { icon: <ScanFace size={18} />, title: "Quét Deepfake Không Giới Hạn", desc: "Phân tích Video/Audio độ chính xác 99%.", color: "text-blue-600", bg: "bg-blue-50" },
                    { icon: <MessageSquareWarning size={18} />, title: "Chặn Tin Nhắn Lừa Đảo", desc: "AI tự động quét và cảnh báo link độc hại.", color: "text-purple-600", bg: "bg-purple-50" },
                    { icon: <Shield size={18} />, title: "Cơ Sở Dữ Liệu Global", desc: "Tra cứu số lạ từ nguồn dữ liệu toàn cầu.", color: "text-amber-600", bg: "bg-amber-50" }
                ].map((item, idx) => (
                    <div key={idx} className="flex items-center gap-3 p-1">
                        <div className={`w-9 h-9 rounded-xl ${item.bg} ${item.color} flex items-center justify-center flex-shrink-0`}>
                            {item.icon}
                        </div>
                        <div className="flex-1 min-w-0">
                            <h4 className="font-bold text-slate-900 text-xs truncate">{item.title}</h4>
                            <p className="text-[10px] text-slate-500 font-medium truncate">{item.desc}</p>
                        </div>
                        <div className={`w-5 h-5 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center`}>
                            <Check size={12} strokeWidth={3} />
                        </div>
                    </div>
                ))}
            </div>

        </div>

        {/* FOOTER CTA */}
        <div className="p-5 bg-slate-50 border-t border-slate-100 z-20 shrink-0">
            <button 
                onClick={handleUpgrade}
                disabled={processing}
                className="w-full relative group overflow-hidden bg-slate-900 text-white rounded-xl shadow-lg transform active:scale-95 transition-all"
            >
                <div className="absolute inset-0 bg-gradient-to-r from-slate-800 to-slate-900"></div>
                <div className="relative py-3.5 flex items-center justify-center gap-2">
                    {processing ? (
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    ) : (
                        <>
                            <span className="font-bold text-sm">Dùng thử miễn phí 7 ngày</span>
                            <ArrowRight size={18} />
                        </>
                    )}
                </div>
            </button>
            <div className="text-center mt-3">
                <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wide flex items-center justify-center gap-1">
                    <Lock size={10} /> Hủy bất kỳ lúc nào • Không cam kết
                </p>
            </div>
        </div>

      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};

export default PremiumUpgradeModal;
