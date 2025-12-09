
import React, { useEffect, useState, useRef, useCallback } from 'react';
import { Phone, PhoneOff, ShieldCheck, ShieldAlert, AlertTriangle, User, Globe, ThumbsDown, Ban, X } from 'lucide-react';
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
    const AUTO_HANGUP = user?.autoHangupHighRisk ?? false;

    // Contact Check
    const contactName = user?.contacts.find(c => c.phone === call.phoneNumber)?.name || null;

    // --- FETCH CARRIER DATA ---
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

    // Initialize Warning Sound
    useEffect(() => {
        // Create audio instance
        audioRef.current = new Audio('https://actions.google.com/sounds/v1/alarms/spaceship_alarm.ogg');
        audioRef.current.loop = true; // Loop enabled for continuous warning
        audioRef.current.volume = 0.8; // Increased volume

        return () => {
            // Cleanup: Stop audio when component unmounts to prevent memory leaks and zombie sounds
            if (audioRef.current) {
                audioRef.current.pause();
                audioRef.current.src = ""; // Detach source
                audioRef.current = null;
            }
        };
    }, []);

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
        if (audioRef.current) {
             audioRef.current.pause();
             audioRef.current.currentTime = 0;
        }
        setStatus('connected');
    }, [isProcessing]);

    const handleDecline = useCallback(async () => {
        if (isProcessing) return;
        setIsProcessing(true);
        
        if (audioRef.current) audioRef.current.pause();
        setStatus('ended');
        
        // Save history
        updateCallHistoryItem(call.id, {
            duration: timer,
            communityInfo: communityInfo || undefined,
            contactName: contactName || undefined
        });

        setTimeout(() => {
            setIncomingCall(null);
            setIsProcessing(false);
        }, 1000);
    }, [isProcessing, call.id, timer, communityInfo, contactName, updateCallHistoryItem, setIncomingCall]);

    const handleHangup = useCallback(async () => {
        if (isProcessing) return;
        setIsProcessing(true);
        if (audioRef.current) audioRef.current.pause();

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
    }, [isProcessing, call.id, timer, communityInfo, contactName, updateCallHistoryItem, setIncomingCall]);

    const handleAutoHangup = useCallback(async () => {
        if (isProcessing) return;
        setIsProcessing(true);
        if (audioRef.current) audioRef.current.pause();
        
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
        }, 2000); // Show "Blocked" screen for 2s
    }, [isProcessing, call.id, communityInfo, contactName, updateCallHistoryItem, setIncomingCall]);

    // --- AUTO LOGIC ---

    // 1. Play Warning if Scam Detected & Ringing
    useEffect(() => {
        if (status === 'ringing' && communityInfo?.tags.includes('scam') && !warningPlayed && !contactName) {
            setWarningPlayed(true);
            if (audioRef.current) {
                audioRef.current.play().catch(e => console.error("Audio play failed", e));
            }
        }
    }, [status, communityInfo, warningPlayed, contactName]);

    // 2. Auto-Hangup Logic
    useEffect(() => {
        let timeoutId: any;
        
        if (status === 'ringing' && communityInfo?.tags.includes('scam') && AUTO_HANGUP && !isProcessing && !contactName) {
             timeoutId = setTimeout(() => {
                 handleAutoHangup();
             }, 3000); // 3 seconds delay before auto-hangup
        }
        
        return () => {
            if (timeoutId) clearTimeout(timeoutId);
        };
    }, [status, communityInfo, AUTO_HANGUP, isProcessing, contactName, handleAutoHangup]);


    // Determine UI State
    const isScam = communityInfo?.tags.includes('scam');
    const isSpam = communityInfo?.tags.includes('spam');
    const isSafe = communityInfo?.tags.includes('safe') || !!contactName;
    const isDelivery = communityInfo?.tags.includes('delivery');

    // HIGH OPACITY GRADIENTS
    const getBgClass = () => {
        if (status === 'auto_ended') return 'bg-slate-900';
        if (status === 'connected') return 'bg-gradient-to-b from-slate-900 to-slate-800'; // Solid dark
        
        if (isScam) return 'bg-gradient-to-br from-red-900/95 to-rose-800/95 backdrop-blur-xl';
        if (isSpam) return 'bg-gradient-to-br from-amber-900/95 to-orange-800/95 backdrop-blur-xl';
        if (isSafe || isDelivery) return 'bg-gradient-to-br from-emerald-900/95 to-teal-800/95 backdrop-blur-xl';
        
        // Default Unknown - Dark Blue/Slate
        return 'bg-gradient-to-br from-slate-900/95 to-blue-900/95 backdrop-blur-xl'; 
    };

    return (
        <div className={`fixed inset-0 z-[100] ${getBgClass()} transition-all duration-700 flex flex-col items-center justify-between py-12 px-6 text-white animate-in zoom-in-95 duration-300`}>
            
            {/* --- HEADER --- */}
            <div className="text-center w-full relative pt-8">
                 {/* Auto-Ended Badge */}
                 {status === 'auto_ended' && (
                     <div className="bg-red-600 text-white font-black text-xl py-3 px-8 rounded-2xl inline-flex items-center gap-2 mb-6 animate-pulse shadow-xl border border-red-400">
                         <Ban size={28} /> AI ĐÃ CHẶN CUỘC GỌI
                     </div>
                 )}
                 
                 {/* Scam Warning Badge */}
                 {status === 'ringing' && isScam && (
                     <div className="bg-white text-red-700 font-black text-2xl py-3 px-8 rounded-2xl inline-flex items-center gap-3 mb-6 animate-bounce shadow-2xl border-4 border-red-200">
                         <ShieldAlert size={32} /> CẢNH BÁO LỪA ĐẢO
                     </div>
                 )}

                 {/* Safe Badge */}
                 {status === 'ringing' && isSafe && (
                     <div className="bg-white text-emerald-700 font-black text-lg py-2 px-6 rounded-2xl inline-flex items-center gap-2 mb-6 shadow-xl">
                         <ShieldCheck size={24} /> AN TOÀN - ĐÃ XÁC MINH
                     </div>
                 )}
            </div>

            {/* --- CALLER INFO --- */}
            <div className="flex flex-col items-center text-center">
                <div className={`w-40 h-40 rounded-full flex items-center justify-center mb-8 shadow-[0_0_40px_rgba(0,0,0,0.3)] relative border-4 border-white/20 ${
                    isScam ? 'bg-red-600' : isSafe ? 'bg-emerald-600' : 'bg-slate-700'
                }`}>
                    {contactName ? <User size={80} className="text-white" /> : isScam ? <ShieldAlert size={80} className="text-white" /> : <Globe size={80} className="text-white" />}
                    
                    {/* Ripple Effect for Ringing */}
                    {status === 'ringing' && (
                        <>
                            <div className="absolute inset-0 rounded-full border-4 border-white/40 animate-ping"></div>
                            <div className="absolute inset-0 rounded-full border-4 border-white/20 animate-ping delay-150"></div>
                        </>
                    )}
                </div>

                <h2 className={`font-black tracking-tight mb-3 drop-shadow-lg ${isSeniorMode ? 'text-5xl leading-tight' : 'text-4xl'}`}>
                    {contactName || call.phoneNumber}
                </h2>
                
                {status === 'connected' ? (
                     <div className="text-3xl font-mono font-bold text-emerald-300 mt-2 tracking-widest">{formatDuration(timer)}</div>
                ) : (
                    <div className="space-y-2">
                        <p className={`font-bold text-white/90 ${isSeniorMode ? 'text-3xl' : 'text-xl'}`}>
                             {communityInfo?.carrier || "Đang kết nối..."}
                        </p>
                        {communityInfo?.communityLabel && (
                             <div className={`inline-block rounded-xl px-4 py-2 text-lg font-bold mt-2 shadow-lg ${
                                 isScam ? 'bg-red-800 text-white border border-red-500' : 'bg-white/20 text-white backdrop-blur-md border border-white/30'
                             }`}>
                                 "{communityInfo.communityLabel}"
                             </div>
                        )}
                        {!contactName && !isLoadingData && !communityInfo && (
                             <p className="text-lg text-white/60 font-medium">Số lạ - Chưa có báo cáo</p>
                        )}
                    </div>
                )}
            </div>

            {/* --- ACTIONS --- */}
            <div className="w-full max-w-sm pb-8">
                 
                 {/* Auto Ended State */}
                 {status === 'auto_ended' && (
                     <div className="text-center">
                         <p className="text-slate-300 mb-8 text-lg font-medium">Hệ thống đã tự động ngắt kết nối để bảo vệ bạn.</p>
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
                     <div className={`flex items-center w-full ${isScam ? 'justify-center gap-6' : 'justify-between gap-8'}`}>
                         
                         {/* Decline Button (Left) */}
                         <div className="flex flex-col items-center gap-3">
                            <button 
                                onClick={handleDecline}
                                className={`${isScam ? 'w-16 h-16 bg-white/20 border-2 border-white/30 hover:bg-white/30' : 'w-24 h-24 bg-red-600 hover:bg-red-700 border-4 border-red-700'} rounded-full flex items-center justify-center text-white shadow-2xl transition-transform active:scale-95`}
                            >
                                <PhoneOff size={isScam ? 28 : 40} fill="currentColor" />
                            </button>
                            <span className="text-base font-bold text-white/90 uppercase tracking-wide">Từ chối</span>
                         </div>

                         {/* Block Button (SCAM ONLY - Center) */}
                         {isScam && (
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
                                    isScam 
                                    ? 'w-16 h-16 bg-transparent border-2 border-white/30 text-white/50 hover:bg-white/10' 
                                    : 'w-24 h-24 bg-green-500 hover:bg-green-600 border-4 border-green-600 animate-pulse'
                                } rounded-full flex items-center justify-center shadow-2xl transition-transform active:scale-95 text-white`}
                            >
                                <Phone size={isScam ? 28 : 40} fill="currentColor" />
                            </button>
                            <span className={`text-base font-bold uppercase tracking-wide ${isScam ? 'text-white/50' : 'text-white/90'}`}>
                                {isScam ? 'Vẫn nghe' : 'Trả lời'}
                            </span>
                         </div>
                     </div>
                 )}

                 {/* Connected State */}
                 {status === 'connected' && (
                     <div className="flex justify-center">
                          <button 
                                onClick={handleHangup}
                                className="w-28 h-28 bg-red-600 hover:bg-red-700 border-8 border-red-800/50 rounded-full flex items-center justify-center text-white shadow-2xl transition-transform active:scale-95"
                          >
                                <PhoneOff size={48} fill="currentColor" />
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
