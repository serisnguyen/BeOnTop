
import React, { useState, useEffect, useRef } from 'react';
import { PhoneOff, ShieldAlert, BrainCircuit, MessageSquareWarning, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface AlertOverlayProps {
  onClose: () => void;
}

const AlertOverlay: React.FC<AlertOverlayProps> = ({ onClose }) => {
  const { addAlertToHistory, user, isSeniorMode } = useAuth();
  const [riskScore, setRiskScore] = useState(0);
  const [challengeQuestion, setChallengeQuestion] = useState("");
  const [autoSMSStatus, setAutoSMSStatus] = useState<'sending' | 'sent' | 'idle'>('idle');
  
  // Ref to track if SMS has been triggered in this session to prevent duplicate sends
  const smsTriggeredRef = useRef(false);

  // Default challenges if user hasn't set one
  const defaultChallenges = [
    "Hôm qua nhà mình ăn món gì?",
    "Tên con vật nuôi đầu tiên là gì?",
    "Sinh nhật của Bà là ngày mấy?",
    "Chuyến đi du lịch gần nhất ở đâu?",
    "Món ăn mẹ nấu thích nhất là gì?"
  ];

  useEffect(() => {
    // 1. Pick a random question from User's list or Defaults
    const questions = (user?.securityQuestions && user.securityQuestions.length > 0) 
        ? user.securityQuestions 
        : defaultChallenges;
    
    const randomQ = questions[Math.floor(Math.random() * questions.length)];
    setChallengeQuestion(randomQ);

    // 2. Risk Score Animation
    const targetScore = Math.floor(Math.random() * (99 - 88 + 1) + 88);
    let current = 0;
    
    const interval = setInterval(() => {
      current += 2;
      
      // Check if we reached target
      if (current >= targetScore) {
        current = targetScore;
        clearInterval(interval);
        
        // 3. Trigger Auto-SMS when risk is high (Simulated)
        // Only trigger if not already triggered
        if (targetScore > 80 && !smsTriggeredRef.current) {
            smsTriggeredRef.current = true;
            setAutoSMSStatus('sending');
            
            setTimeout(() => {
                setAutoSMSStatus('sent');
                console.log("Auto SMS sent to emergency contacts");
            }, 2000);
        }
      }
      setRiskScore(current);
    }, 20);

    return () => clearInterval(interval);
  }, [user]); // Depend on user to refresh questions if user changes

  const handleAction = (action: 'dismiss' | 'block') => {
    addAlertToHistory({
      type: 'deepfake',
      riskScore: riskScore,
      details: action === 'block' ? 'Đã chặn cuộc gọi Deepfake' : 'Đã bỏ qua cảnh báo Deepfake'
    });
    onClose();
  };

  return (
    <div 
      className="fixed inset-0 z-[100] bg-slate-900/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
    >
      
      <div className={`relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col animate-in zoom-in duration-300 ${isSeniorMode ? 'max-w-xl' : ''}`}>
        
        <button 
            onClick={() => onClose()}
            className="absolute top-4 right-4 p-2 bg-slate-100 rounded-full text-slate-500 hover:bg-slate-200 z-10 transition-colors"
        >
            <X size={20} />
        </button>

        <div className="p-8 flex flex-col items-center text-center space-y-6">
           
           <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Kiểm tra an ninh</h2>

           {/* Risk Score & Auto SMS Status */}
           <div className="w-full flex justify-between items-center px-4 py-4 bg-slate-50 rounded-2xl border border-slate-200">
               <div className="text-left">
                    <div className="flex items-center gap-2 text-slate-500 font-bold uppercase text-xs tracking-wider">
                        <BrainCircuit size={16} /> Độ rủi ro
                    </div>
                    <div className={`${isSeniorMode ? 'text-6xl' : 'text-5xl'} font-black text-red-600 tracking-tighter leading-none mt-1`}>
                    {riskScore}%
                    </div>
               </div>
               
               {/* Simulated SMS Status */}
               <div className={`flex flex-col items-end text-sm font-bold transition-opacity duration-500 ${autoSMSStatus !== 'idle' ? 'opacity-100' : 'opacity-0'}`}>
                    <div className="flex items-center gap-1.5 text-slate-500 mb-1 text-xs uppercase">
                        <MessageSquareWarning size={14} /> Tin nhắn SOS
                    </div>
                    {autoSMSStatus === 'sending' ? (
                        <span className="text-amber-600 animate-pulse text-xs">Đang gửi...</span>
                    ) : (
                        <span className="text-green-600 flex items-center gap-1 text-xs">
                            Đã gửi <span className="bg-green-100 p-0.5 rounded-full">✓</span>
                        </span>
                    )}
               </div>
           </div>

           {/* Challenge Box - BIG AND CLEAR */}
           <div className="w-full bg-yellow-50 border-2 border-blue-500 rounded-2xl p-6 text-left relative shadow-sm">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-blue-600 text-white text-xs font-bold px-4 py-1 rounded-full uppercase tracking-wide">
                  HÃY HỎI CÂU NÀY
              </div>
              <div className="mt-2 text-center">
                 <p className={`text-slate-900 font-black leading-tight ${isSeniorMode ? 'text-2xl' : 'text-xl'}`}>
                   "{challengeQuestion}"
                 </p>
                 <div className="w-full h-px bg-yellow-200 my-4"></div>
                 <p className="text-red-600 text-sm font-bold flex items-center justify-center gap-2 uppercase">
                    <ShieldAlert size={18} /> Nếu trả lời sai ➔ Tắt máy!
                 </p>
              </div>
           </div>

           {/* Action Buttons */}
           <div className="w-full pt-2">
              <button 
                onClick={() => handleAction('block')}
                className="w-full h-20 bg-red-600 hover:bg-red-700 text-white rounded-2xl flex items-center justify-center gap-3 shadow-lg shadow-red-200 transition-transform active:scale-95 group"
              >
                 <PhoneOff size={32} className="fill-current" />
                 <span className="text-2xl font-black uppercase">NGẮT KẾT NỐI</span>
              </button>
              <button 
                onClick={() => handleAction('dismiss')}
                className="mt-4 text-slate-400 font-bold text-sm hover:text-slate-600"
              >
                Bỏ qua cảnh báo (Tôi biết người này)
              </button>
           </div>

        </div>
      </div>
    </div>
  );
};

export default AlertOverlay;
