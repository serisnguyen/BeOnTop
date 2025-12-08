
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

    // 2. Auto-Hangup Logic (Fixed Race Condition)
    useEffect(() => {
        let timeoutId: any;
        
        if (status === 'ringing' && communityInfo?.tags.includes('scam') && AUTO_HANGUP && !isProcessing && !contactName) {
             timeoutId = setTimeout(() => {
                 handleAutoHangup();
             }, 3000); // 3 seconds delay before auto-hangup to allow user to see warning
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

    const getBgColor = () => {
        if (status === 'auto_ended') return 'bg-slate-900';
        if (status === 'connected') return 'bg-slate-900/95';
        if (isScam) return 'bg-red-600';
        if (isSpam) return 'bg-amber-600';
        if (isDelivery) return 'bg-blue-600';
        if (isSafe) return 'bg-green-600';
        return 'bg-slate-800'; // Unknown
    };

    return (
        <div className={`fixed inset-0 z-[100] ${getBgColor()} transition-colors duration-500 flex flex-col items-center justify-between py-12 px-6 text-white animate-in slide-in-from-bottom duration-300`}>
            
            {/* --- HEADER --- */}
            <div className="text-center w-full relative">
                 {/* Auto-Ended Badge */}
                 {status === 'auto_ended' && (
                     <div className="bg-red-500 text-white font-black text-xl py-2 px-6 rounded-full inline-flex items-center gap-2 mb-6 animate-pulse">
                         <Ban size={24} /> AI ĐÃ CHẶN CUỘC GỌI
                     </div>
                 )}
                 
                 {/* Scam Warning Badge */}
                 {status === 'ringing' && isScam && (
                     <div className="bg-white text-red-600 font-black text-xl py-2 px-6 rounded-full inline-flex items-center gap-2 mb-6 animate-bounce shadow-lg">
                         <ShieldAlert size={24} /> CẢNH BÁO LỪA ĐẢO
                     </div>
                 )}
            </div>

            {/* --- CALLER INFO --- */}
            <div className="flex flex-col items-center text-center">
                <div className={`w-32 h-32 rounded-full flex items-center justify-center mb-6 shadow-2xl relative ${
                    isScam ? 'bg-white text-red-600' : 
                    isSafe ? 'bg-white/20 text-white backdrop-blur-md' : 'bg-white/10 text-white'
                }`}>
                    {contactName ? <User size={64} /> : isScam ? <ShieldAlert size={64} /> : <Globe size={64} />}
                    
                    {/* Ripple Effect for Ringing */}
                    {status === 'ringing' && (
                        <>
                            <div className="absolute inset-0 rounded-full border-2 border-white/50 animate-ping"></div>
                            <div className="absolute inset-0 rounded-full border-2 border-white/30 animate-ping delay-150"></div>
                        </>
                    )}
                </div>

                <h2 className={`font-black tracking-tight mb-2 ${isSeniorMode ? 'text-5xl' : 'text-4xl'}`}>
                    {contactName || call.phoneNumber}
                </h2>
                
                {status === 'connected' ? (
                     <div className="text-2xl font-mono font-bold opacity-80 mt-2">{formatDuration(timer)}</div>
                ) : (
                    <div className="space-y-1">
                        <p className={`font-bold opacity-90 ${isSeniorMode ? 'text-2xl' : 'text-lg'}`}>
                             {communityInfo?.carrier || "Đang kết nối..."}
                        </p>
                        {communityInfo?.communityLabel && (
                             <div className="inline-block bg-black/20 backdrop-blur-md rounded-lg px-3 py-1 text-sm font-medium mt-2">
                                 "{communityInfo.communityLabel}"
                             </div>
                        )}
                        {!contactName && !isLoadingData && !communityInfo && (
                             <p className="text-sm opacity-60">Số lạ - Chưa có báo cáo</p>
                        )}
                    </div>
                )}
            </div>

            {/* --- ACTIONS --- */}
            <div className="w-full max-w-sm">
                 
                 {/* Auto Ended State */}
                 {status === 'auto_ended' && (
                     <div className="text-center">
                         <p className="text-slate-300 mb-6">Hệ thống đã tự động ngắt kết nối để bảo vệ bạn.</p>
                         <button 
                             onClick={() => setIncomingCall(null)}
                             className="bg-white text-slate-900 w-full py-4 rounded-2xl font-bold text-lg"
                         >
                             Đóng
                         </button>
                     </div>
                 )}

                 {/* Ringing State */}
                 {status === 'ringing' && (
                     <div className={`flex items-center w-full ${isScam ? 'justify-center gap-4' : 'justify-between gap-6'}`}>
                         
                         {/* Decline Button (Left) */}
                         <div className="flex flex-col items-center gap-2">
                            <button 
                                onClick={handleDecline}
                                className={`${isScam ? 'w-14 h-14 bg-red-500/80 border border-red-400' : 'w-20 h-20 bg-red-500'} rounded-full flex items-center justify-center text-white shadow-lg hover:bg-red-600 transition-transform active:scale-95`}
                            >
                                <PhoneOff size={isScam ? 24 : 32} fill="currentColor" />
                            </button>
                            <span className="text-sm font-bold opacity-90">Từ chối</span>
                         </div>

                         {/* Block Button (SCAM ONLY - Center) */}
                         {isScam && (
                             <div className="flex flex-col items-center gap-2 -mt-4">
                                <button 
                                    onClick={() => {
                                        blockNumber(call.phoneNumber);
                                        handleDecline();
                                    }}
                                    className="w-24 h-24 bg-slate-900 border-4 border-red-500 rounded-full flex items-center justify-center text-red-500 shadow-2xl hover:bg-slate-800 transition-transform active:scale-95 z-10"
                                >
                                    <Ban size={40} />
                                </button>
                                <span className="text-base font-black text-red-300 uppercase tracking-wide">CHẶN NGAY</span>
                             </div>
                         )}

                         {/* Answer Button (Right) - Now visible even for Scam */}
                         <div className="flex flex-col items-center gap-2">
                            <button 
                                onClick={handleAccept}
                                className={`${
                                    isScam 
                                    ? 'w-14 h-14 bg-transparent border-2 border-green-400 text-green-400 hover:bg-green-900/30' 
                                    : 'w-20 h-20 bg-green-500 text-white animate-pulse'
                                } rounded-full flex items-center justify-center shadow-lg transition-transform active:scale-95`}
                            >
                                <Phone size={isScam ? 24 : 32} fill="currentColor" />
                            </button>
                            <span className={`text-sm font-bold ${isScam ? 'text-green-300' : 'text-white'}`}>
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
                                className="w-24 h-24 bg-red-600 rounded-full flex items-center justify-center text-white shadow-xl hover:bg-red-700 transition-transform active:scale-95"
                          >
                                <PhoneOff size={40} fill="currentColor" />
                          </button>
                     </div>
                 )}
                 
                 {/* Ended State */}
                 {status === 'ended' && (
                     <div className="text-center font-bold text-xl opacity-80">
                         Cuộc gọi đã kết thúc
                     </div>
                 )}

            </div>
        </div>
    );
};

export default CallOverlay;
