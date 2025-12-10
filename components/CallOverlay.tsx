
import React, { useEffect, useState, useRef, useCallback } from 'react';
import { Phone, PhoneOff, ShieldCheck, ShieldAlert, AlertTriangle, User, Ban, UserCheck } from 'lucide-react';
import { CallLogItem } from '../context/AuthContext';
import { useAuth } from '../context/AuthContext';
import { PhoneLookupResult } from '../types';

interface CallOverlayProps {
    call: CallLogItem;
}

const formatDuration = (seconds: number) => {
    const min = Math.floor(seconds / 60);
    const sec = seconds % 60;
    return `${min.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
};

const CallOverlay: React.FC<CallOverlayProps> = ({ call }) => {
    const { setIncomingCall, user, updateCallHistoryItem, lookupPhoneNumber, isSeniorMode, blockNumber } = useAuth();
    
    // Status
    const [status, setStatus] = useState<'ringing' | 'connected' | 'ended' | 'auto_ended' | 'blocked'>('ringing');
    const [timer, setTimer] = useState(0);
    const [isProcessing, setIsProcessing] = useState(false); // Global interaction lock
    
    // Carrier / Community Data
    const [communityInfo, setCommunityInfo] = useState<PhoneLookupResult | null>(null);
    const [warningPlayed, setWarningPlayed] = useState(false);
    const [isLoadingData, setIsLoadingData] = useState(true);

    const audioRef = useRef<HTMLAudioElement | null>(null);
    const playPromiseRef = useRef<Promise<void> | null>(null);
    const AUTO_HANGUP = user?.autoHangupHighRisk ?? false;

    // --- 1. TIER CLASSIFICATION LOGIC (Fixed for Demos) ---
    
    // Check if name exists in Contacts OR was passed in the call object (Demo)
    const contactName = user?.contacts.find(c => c.phone === call.phoneNumber)?.name || call.contactName || null;
    
    // Explicit override from Demo/Simulation
    const demoRisk = call.riskStatus; 

    // Condition 1: Safe 
    // Is Safe if: Explicitly marked 'safe' OR found in contacts
    const isSafe = demoRisk === 'safe' || !!contactName;

    // Condition 2: Dangerous
    // Logic: If NOT safe AND (Explicitly 'scam' OR (Database says scam/high reports AND not explicitly 'suspicious'))
    const dbReportCount = communityInfo?.reportCount || 0;
    const dbIsScam = communityInfo?.tags.includes('scam') || false;
    
    const isDangerous = !isSafe && (
        demoRisk === 'scam' || 
        ((dbIsScam || dbReportCount >= 5) && demoRisk !== 'suspicious')
    );

    // Condition 3: Suspicious
    // Logic: Not Safe AND Not Dangerous
    const isSuspicious = !isSafe && !isDangerous;

    // --- AUDIO HELPERS ---
    const stopAudio = useCallback(() => {
        if (!audioRef.current) return;
        
        const pause = () => {
            if (audioRef.current) {
                audioRef.current.pause();
                audioRef.current.currentTime = 0;
            }
        };

        // If a play request is pending, wait for it to finish before pausing
        if (playPromiseRef.current) {
            playPromiseRef.current
                .then(() => pause())
                .catch(() => { });
        } else {
            pause();
        }
    }, []);

    const playAudio = useCallback(() => {
        if (audioRef.current) {
            playPromiseRef.current = audioRef.current.play();
            playPromiseRef.current.catch(e => {
                // Ignore AbortError
            });
        }
    }, []);

    // --- FETCH DATA ---
    useEffect(() => {
        let isMounted = true;
        const fetchInfo = async () => {
            setIsLoadingData(true);
            try {
                const info = await lookupPhoneNumber(call.phoneNumber);
                if (isMounted && info) {
                    setCommunityInfo(info);
                }
            } catch (e) {
                console.error("Failed to lookup phone", e);
            } finally {
                if (isMounted) setIsLoadingData(false);
            }
        };
        fetchInfo();
        return () => { isMounted = false; };
    }, [call.phoneNumber, lookupPhoneNumber]);

    // Initialize Audio
    useEffect(() => {
        // Different sounds for different risks could be implemented here
        audioRef.current = new Audio('https://actions.google.com/sounds/v1/alarms/spaceship_alarm.ogg');
        audioRef.current.loop = true; 
        audioRef.current.volume = 0.8;

        return () => {
            stopAudio();
            if (audioRef.current) {
                audioRef.current.src = "";
                audioRef.current = null;
            }
        };
    }, [stopAudio]);

    // Timer logic
    useEffect(() => {
        let interval: any;
        if (status === 'connected') {
            interval = setInterval(() => {
                setTimer(t => t + 1);
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [status]);

    // --- ACTIONS ---

    const handleAccept = useCallback(() => {
        if (isProcessing) return;
        stopAudio();
        setStatus('connected');
    }, [isProcessing, stopAudio]);

    const handleDecline = useCallback(async () => {
        if (isProcessing) return;
        setIsProcessing(true);
        stopAudio();
        setStatus('ended');
        
        updateCallHistoryItem(call.id, {
            duration: timer,
            communityInfo: communityInfo || undefined,
            contactName: contactName || undefined
        });

        setTimeout(() => {
            setIncomingCall(null);
            setIsProcessing(false);
        }, 1000);
    }, [isProcessing, call.id, timer, communityInfo, contactName, updateCallHistoryItem, setIncomingCall, stopAudio]);

    const handleHangup = useCallback(async () => {
        if (isProcessing) return;
        setIsProcessing(true);
        stopAudio();

        setStatus('ended');
        updateCallHistoryItem(call.id, {
            duration: timer,
            communityInfo: communityInfo || undefined,
            contactName: contactName || undefined
        });
        setTimeout(() => {
            setIncomingCall(null);
            setIsProcessing(false);
        }, 1000);
    }, [isProcessing, call.id, timer, communityInfo, contactName, updateCallHistoryItem, setIncomingCall, stopAudio]);

    const handleAutoHangup = useCallback(async () => {
        if (isProcessing) return;
        setIsProcessing(true);
        stopAudio();
        
        setStatus('auto_ended');
        updateCallHistoryItem(call.id, {
            duration: 0,
            riskStatus: 'scam',
            communityInfo: communityInfo || undefined,
            contactName: contactName || undefined
        });
        
        setTimeout(() => {
            setIncomingCall(null);
            setIsProcessing(false);
        }, 2000);
    }, [isProcessing, call.id, communityInfo, contactName, updateCallHistoryItem, setIncomingCall, stopAudio]);

    // --- AUTO LOGIC ---

    // 1. Play Warning if Dangerous & Ringing
    useEffect(() => {
        if (status === 'ringing' && isDangerous && !warningPlayed) {
            setWarningPlayed(true);
            playAudio();
        }
    }, [status, isDangerous, warningPlayed, playAudio]);

    // 2. Auto-Hangup Logic (Only for Dangerous)
    useEffect(() => {
        let timeoutId: any;
        if (status === 'ringing' && isDangerous && AUTO_HANGUP && !isProcessing) {
             timeoutId = setTimeout(() => {
                 handleAutoHangup();
             }, 3000); 
        }
        return () => { if (timeoutId) clearTimeout(timeoutId); };
    }, [status, isDangerous, AUTO_HANGUP, isProcessing, handleAutoHangup]);


    // --- UI HELPERS ---

    const getBgClass = () => {
        if (status === 'auto_ended') return 'bg-slate-900';
        if (status === 'connected') return 'bg-gradient-to-b from-slate-900 to-slate-800';
        
        // Tier 1: Safe (Green)
        if (isSafe) return 'bg-gradient-to-br from-green-600 to-emerald-800';
        
        // Tier 2: Dangerous (Red)
        if (isDangerous) return 'bg-gradient-to-br from-red-600 to-rose-800';
        
        // Tier 3: Suspicious (Amber)
        if (isSuspicious) return 'bg-gradient-to-br from-amber-500 to-orange-700';
        
        return 'bg-slate-800';
    };

    return (
        <div className={`fixed inset-0 z-[100] ${getBgClass()} transition-all duration-700 flex flex-col items-center justify-between py-12 px-6 text-white animate-in zoom-in-95 duration-300`}>
            
            {/* --- HEADER STATUS BADGE --- */}
            <div className="text-center w-full relative pt-8 h-24 flex items-end justify-center">
                 {status === 'auto_ended' ? (
                     <div className="bg-red-600 text-white font-black text-xl py-3 px-8 rounded-2xl inline-flex items-center gap-2 animate-pulse shadow-xl border-2 border-red-400">
                         <Ban size={24} /> AI ĐÃ CHẶN
                     </div>
                 ) : status === 'ringing' ? (
                     <>
                        {/* TIER 2: DANGEROUS */}
                        {isDangerous && (
                            <div className="bg-white text-red-700 font-black text-2xl py-3 px-8 rounded-2xl inline-flex items-center gap-3 animate-bounce shadow-2xl border-4 border-red-200">
                                <ShieldAlert size={32} /> CẢNH BÁO LỪA ĐẢO
                            </div>
                        )}
                        {/* TIER 3: SUSPICIOUS */}
                        {isSuspicious && (
                            <div className="bg-white text-amber-600 font-black text-xl py-3 px-8 rounded-2xl inline-flex items-center gap-3 shadow-xl border-4 border-amber-200">
                                <AlertTriangle size={28} /> SỐ LẠ - CẢNH GIÁC
                            </div>
                        )}
                        {/* TIER 1: SAFE */}
                        {isSafe && (
                            <div className="bg-white/20 backdrop-blur-md text-white font-black text-lg py-2 px-6 rounded-2xl inline-flex items-center gap-2 shadow-lg border border-white/30">
                                <UserCheck size={24} /> NGƯỜI QUEN
                            </div>
                        )}
                     </>
                 ) : null}
            </div>

            {/* --- CALLER INFO --- */}
            <div className="flex flex-col items-center text-center">
                {/* Avatar Ring */}
                <div className={`w-40 h-40 rounded-full flex items-center justify-center mb-6 shadow-[0_0_40px_rgba(0,0,0,0.3)] relative border-4 border-white/20 ${
                    isDangerous ? 'bg-red-600' : isSafe ? 'bg-green-600' : 'bg-amber-500'
                }`}>
                    {isSafe ? <User size={80} className="text-white" /> : 
                     isDangerous ? <ShieldAlert size={80} className="text-white" /> : 
                     <AlertTriangle size={80} className="text-white" />}
                    
                    {/* Ripple Effect for Ringing */}
                    {status === 'ringing' && (
                        <>
                            <div className="absolute inset-0 rounded-full border-4 border-white/40 animate-ping"></div>
                            <div className="absolute inset-0 rounded-full border-4 border-white/20 animate-ping delay-150"></div>
                        </>
                    )}
                </div>

                {/* Name / Number Display */}
                <h2 className={`font-black tracking-tight mb-2 drop-shadow-lg ${isSeniorMode ? 'text-5xl leading-tight' : 'text-4xl'}`}>
                    {contactName || call.phoneNumber}
                </h2>
                
                {/* Sub-info based on status */}
                {status === 'connected' ? (
                     <div className="text-3xl font-mono font-bold text-emerald-300 mt-2 tracking-widest">{formatDuration(timer)}</div>
                ) : (
                    <div className="space-y-1">
                        {isSafe ? (
                            <p className="text-xl text-white/90 font-medium">{call.phoneNumber}</p>
                        ) : (
                            <>
                                <p className={`font-bold text-white/90 ${isSeniorMode ? 'text-2xl' : 'text-lg'}`}>
                                     {communityInfo?.carrier || "Đang kết nối..."}
                                </p>
                                {isDangerous && (
                                    <div className="text-white font-bold bg-red-900/50 px-3 py-1 rounded-lg mt-2 inline-block">
                                        {dbReportCount > 0 ? `${dbReportCount} lượt báo cáo xấu` : "Phát hiện trong danh sách đen"}
                                    </div>
                                )}
                                {isSuspicious && !isDangerous && (
                                    <div className="text-white/80 font-medium text-sm mt-1">
                                        Chưa có thông tin xác thực
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                )}
            </div>

            {/* --- ACTIONS --- */}
            <div className="w-full max-w-sm pb-8">
                 
                 {/* Auto Ended State */}
                 {status === 'auto_ended' && (
                     <div className="text-center">
                         <p className="text-slate-300 mb-8 text-lg font-medium">Hệ thống đã tự động ngắt kết nối.</p>
                         <button 
                             onClick={() => setIncomingCall(null)}
                             className="bg-white hover:bg-slate-100 text-slate-900 w-full py-5 rounded-2xl font-black text-xl shadow-xl transition-transform active:scale-95"
                         >
                             Đóng
                         </button>
                     </div>
                 )}

                 {/* Ringing State */}
                 {status === 'ringing' && (
                     <div className={`flex items-center w-full ${isDangerous ? 'justify-center gap-6' : 'justify-around'}`}>
                         
                         {/* Decline Button (Left) */}
                         <div className="flex flex-col items-center gap-3">
                            <button 
                                onClick={handleDecline}
                                className={`${isDangerous ? 'w-16 h-16 bg-white/20 border-2 border-white/30 hover:bg-white/30' : 'w-20 h-20 bg-red-600 hover:bg-red-700 border-4 border-red-700'} rounded-full flex items-center justify-center text-white shadow-2xl transition-transform active:scale-95`}
                            >
                                <PhoneOff size={isDangerous ? 28 : 36} fill="currentColor" />
                            </button>
                            <span className="text-sm font-bold text-white/90 uppercase tracking-wide">Từ chối</span>
                         </div>

                         {/* Block Button (DANGEROUS ONLY - Center) */}
                         {isDangerous && (
                             <div className="flex flex-col items-center gap-3 -mt-6">
                                <button 
                                    onClick={() => {
                                        blockNumber(call.phoneNumber);
                                        handleDecline();
                                    }}
                                    className="w-28 h-28 bg-white border-4 border-red-500 rounded-full flex items-center justify-center text-red-600 shadow-[0_0_50px_rgba(239,68,68,0.6)] hover:scale-105 transition-transform active:scale-95 z-10"
                                >
                                    <Ban size={48} />
                                </button>
                                <span className="text-lg font-black text-white uppercase tracking-widest drop-shadow-md bg-red-600/80 px-3 py-1 rounded-full">CHẶN NGAY</span>
                             </div>
                         )}

                         {/* Answer Button (Right) */}
                         <div className="flex flex-col items-center gap-3">
                            <button 
                                onClick={handleAccept}
                                className={`${
                                    isDangerous 
                                    ? 'w-16 h-16 bg-transparent border-2 border-white/30 text-white/50 hover:bg-white/10' 
                                    : 'w-20 h-20 bg-green-500 hover:bg-green-600 border-4 border-green-600 animate-pulse'
                                } rounded-full flex items-center justify-center shadow-2xl transition-transform active:scale-95 text-white`}
                            >
                                <Phone size={isDangerous ? 28 : 36} fill="currentColor" />
                            </button>
                            <span className={`text-sm font-bold uppercase tracking-wide ${isDangerous ? 'text-white/50' : 'text-white/90'}`}>
                                {isDangerous ? 'Vẫn nghe' : 'Trả lời'}
                            </span>
                         </div>
                     </div>
                 )}

                 {/* Connected State */}
                 {status === 'connected' && (
                     <div className="flex justify-center">
                          <button 
                                onClick={handleHangup}
                                className="w-24 h-24 bg-red-600 hover:bg-red-700 border-8 border-red-800/50 rounded-full flex items-center justify-center text-white shadow-2xl transition-transform active:scale-95"
                          >
                                <PhoneOff size={40} fill="currentColor" />
                          </button>
                     </div>
                 )}
                 
                 {/* Ended State */}
                 {status === 'ended' && (
                     <div className="text-center font-bold text-2xl text-white/80 animate-pulse">
                         Cuộc gọi đã kết thúc
                     </div>
                 )}

            </div>
        </div>
    );
};

export default CallOverlay;
