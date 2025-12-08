
import React, { useState } from 'react';
import { Shield, Mic, Zap, CheckCircle, Smartphone } from 'lucide-react';

interface OnboardingModalProps {
  onClose: () => void;
}

const OnboardingModal: React.FC<OnboardingModalProps> = ({ onClose }) => {
  const [step, setStep] = useState(0);

  const steps = [
    {
      icon: <Shield size={64} className="text-blue-600" />,
      title: "Phân tích Âm thanh & Môi trường",
      desc: "TruthShield AI giám sát môi trường và phân tích âm thanh loa ngoài để phát hiện dấu hiệu lừa đảo theo thời gian thực."
    },
    {
      icon: <Mic size={64} className="text-purple-600" />,
      title: "Xử lý dữ liệu tại thiết bị",
      desc: "Ưu tiên quyền riêng tư. Mọi phân tích đều diễn ra cục bộ (On-Device) trên máy của bạn, không gửi dữ liệu nhạy cảm lên Cloud."
    },
    {
      icon: <Smartphone size={64} className="text-yellow-500" />,
      title: "Kết nối Gia Đình & Can thiệp từ xa",
      desc: "Con cái có thể nhận cảnh báo và thực hiện 'Ngắt kết nối khẩn cấp' để bảo vệ cha mẹ khỏi các cuộc gọi nguy hiểm."
    }
  ];

  const handleNext = () => {
    if (step < steps.length - 1) {
      setStep(step + 1);
    } else {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-[60] bg-blue-600 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-sm rounded-3xl p-8 shadow-2xl text-center relative overflow-hidden">
        
        {/* Decorative circles */}
        <div className="absolute top-0 left-0 w-32 h-32 bg-blue-50 rounded-full -translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-0 right-0 w-24 h-24 bg-purple-50 rounded-full translate-x-1/2 translate-y-1/2"></div>

        <div className="relative z-10 h-64 flex flex-col items-center justify-center">
          <div className="mb-6 bg-slate-50 p-6 rounded-full animate-in zoom-in duration-300 border border-slate-100 shadow-sm">
            {steps[step].icon}
          </div>
          <h2 className="text-2xl font-black text-slate-800 mb-3">{steps[step].title}</h2>
          <p className="text-slate-500 leading-relaxed text-sm px-2">{steps[step].desc}</p>
        </div>

        <div className="flex justify-center gap-2 mb-8 mt-4">
          {steps.map((_, idx) => (
            <div 
              key={idx} 
              className={`h-2 rounded-full transition-all duration-300 ${
                idx === step ? 'w-8 bg-blue-600' : 'w-2 bg-slate-200'
              }`} 
            />
          ))}
        </div>

        <button 
          onClick={handleNext}
          className="w-full bg-slate-900 text-white py-4 rounded-xl font-bold shadow-lg hover:bg-slate-800 transition-colors flex items-center justify-center gap-2"
        >
          {step === steps.length - 1 ? (
            <>Bắt đầu ngay <CheckCircle size={18} /></>
          ) : 'Tiếp theo'}
        </button>
      </div>
    </div>
  );
};

export default OnboardingModal;
