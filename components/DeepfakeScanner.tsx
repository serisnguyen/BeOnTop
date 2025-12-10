
import React, { useState, useRef, useEffect } from 'react';
import { 
  ScanFace, Upload, FileImage, X, 
  Activity, HeartPulse, 
  Cpu, Mic, AlertCircle, Eye, ShieldAlert, Terminal, CheckCircle, Clock, Trash2, ChevronRight,
  Layers, ShieldCheck, Mic2
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { analyzeMediaDeepfake } from '../services/aiService';
import PremiumUpgradeModal from './PremiumUpgradeModal';

const DeepfakeScanner: React.FC = () => {
  const { isSeniorMode, checkLimit, incrementUsage, addDeepfakeScan, user, clearDeepfakeHistory } = useAuth();
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [showPremiumModal, setShowPremiumModal] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  
  // Analysis States
  const [status, setStatus] = useState<'idle' | 'analyzing' | 'result'>('idle');
  const [analysisStep, setAnalysisStep] = useState(0); 
  const [result, setResult] = useState<any>(null);

  // Audio/Video Playback
  const [isPlaying, setIsPlaying] = useState(false);
  const mediaRef = useRef<HTMLMediaElement | null>(null);

  // --- HELPER: GET FILE TYPE ---
  const getFileType = (f: File | null) => {
      if (!f) return 'image';
      if (f.type.startsWith('audio/')) return 'audio';
      if (f.type.startsWith('video/')) return 'video';
      return 'image';
  };

  const fileType = getFileType(file);

  // --- SCIENTIFIC STEPS SIMULATION (ADAPTIVE) ---
  const getSteps = (type: string) => {
      if (type === 'audio') {
          return [
              "Khởi tạo môi trường Psychoacoustics...",
              "Phân tích biểu đồ quang phổ (Spectrogram)...",
              "Kiểm tra độ rung dây thanh quản (Micro-tremors)...",
              "Phát hiện dấu hiệu Vocoder (Metallic artifacts)...",
              "Tổng hợp chỉ số sinh trắc học..."
          ];
      }
      return [
          "Khởi tạo môi trường Forensic v4.5...",
          "Trích xuất bản đồ PPG (Lưu lượng máu)...",
          "Quét mạng nơ-ron tích chập (CNN) tìm lỗi ánh sáng...",
          "Kiểm tra độ khớp khẩu hình (Phoneme-Viseme)...",
          "Tổng hợp chỉ số sinh trắc học..."
      ];
  };

  const steps = getSteps(fileType);

  // --- TECH STACK BADGES CONFIG ---
  const techStack = [
      { name: "Intel FakeCatcher", icon: <HeartPulse size={14} className="text-rose-500" /> },
      { name: "Microsoft Auth", icon: <ShieldCheck size={14} className="text-blue-500" /> },
      { name: "Hive AI", icon: <Layers size={14} className="text-purple-500" /> },
      { name: "Forensic CNN", icon: <Cpu size={14} className="text-cyan-500" /> },
      { name: "Phoneme-Viseme", icon: <Mic2 size={14} className="text-orange-500" /> },
      { name: "Spectral Analysis", icon: <Activity size={14} className="text-emerald-500" /> },
  ];

  useEffect(() => {
      return () => {
          if (previewUrl) URL.revokeObjectURL(previewUrl);
      };
  }, [previewUrl]);

  const handleFileSelect = (selectedFile: File) => {
    const isImage = selectedFile.type.startsWith('image/');
    const isAudio = selectedFile.type.startsWith('audio/');
    const isVideo = selectedFile.type.startsWith('video/');
    
    if (!isImage && !isAudio && !isVideo) return alert("Chỉ hỗ trợ file Hình ảnh, Video hoặc Âm thanh.");
    
    if (previewUrl) URL.revokeObjectURL(previewUrl);

    setFile(selectedFile);
    const url = URL.createObjectURL(selectedFile);
    setPreviewUrl(url);
    setStatus('idle');
    setResult(null);
    setAnalysisStep(0);
    setIsPlaying(false);
  };

  const startAnalysis = async () => {
    if (!file) return;

    if (!checkLimit('deepfake')) {
        setShowPremiumModal(true);
        return;
    }

    setStatus('analyzing');
    setAnalysisStep(0);
    
    // Simulate steps progress for UI effect
    let stepCount = 0;
    const stepInterval = setInterval(() => {
        if (stepCount < steps.length - 1) {
            setAnalysisStep(prev => prev + 1);
            stepCount++;
        }
    }, 1500); // 1.5s per step

    try {
        let type: 'image' | 'audio' | 'video' = 'image';
        if (file.type.startsWith('audio/')) type = 'audio';
        if (file.type.startsWith('video/')) type = 'video';

        const data = await analyzeMediaDeepfake(file, type);
        
        clearInterval(stepInterval);
        setAnalysisStep(steps.length - 1); // Finish steps
        incrementUsage('deepfake');

        // Save to history
        addDeepfakeScan({
            fileName: file.name,
            fileType: type,
            result: data.isDeepfake ? 'FAKE' : 'REAL',
            confidenceScore: data.confidenceScore
        });

        setTimeout(() => {
            setResult(data);
            setStatus('result');
        }, 800); 
        
    } catch (error) {
        clearInterval(stepInterval);
        setStatus('idle');
        alert("Lỗi phân tích.");
    }
  };

  const reset = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setFile(null);
    setPreviewUrl(null);
    setStatus('idle');
    setResult(null);
  };

  const renderAnalyzing = () => (
      <div className="bg-slate-900 rounded-[32px] p-8 h-full flex flex-col items-center justify-center text-white relative overflow-hidden border border-slate-700 shadow-2xl">
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10"></div>
          
          <div className="relative w-40 h-40 mb-10">
               {/* Spinning Rings */}
               <div className="absolute inset-0 border-4 border-slate-700/50 rounded-full"></div>
               <div className="absolute inset-0 border-4 border-t-green-500 rounded-full animate-spin duration-[2s]"></div>
               <div className="absolute inset-4 border-4 border-b-blue-500 rounded-full animate-spin duration-[3s] direction-reverse"></div>
               
               {/* Core Pulse */}
               <div className="absolute inset-8 bg-slate-800 rounded-full flex items-center justify-center animate-pulse shadow-[0_0_30px_rgba(34,197,94,0.2)]">
                   {fileType === 'audio' ? <Mic size={56} className="text-green-500" /> : <ScanFace size={56} className="text-green-500" />}
               </div>
          </div>

          <h3 className="text-2xl font-black mb-4 tracking-tight uppercase">Đang Phân Tích...</h3>
          
          <div className="w-full max-w-md bg-slate-800 h-2 rounded-full overflow-hidden mb-4 border border-slate-700">
               <div 
                  className="h-full bg-gradient-to-r from-blue-500 to-green-500 transition-all duration-500 ease-out relative" 
                  style={{ width: `${((analysisStep + 1) / steps.length) * 100}%` }}
               >
                  <div className="absolute right-0 top-0 bottom-0 w-2 bg-white/50 animate-pulse"></div>
               </div>
          </div>

          <p className="text-green-400 font-mono text-sm font-bold min-h-[24px] flex items-center gap-2">
              <Terminal size={14} /> {steps[analysisStep]}
          </p>
      </div>
  );

  const renderResult = () => {
      if (!result) return null;
      const isFake = result.isDeepfake;
      const themeText = isFake ? 'text-red-600' : 'text-green-600';
      const themeBorder = isFake ? 'border-red-200' : 'border-green-200';
      const themeBg = isFake ? 'bg-red-50' : 'bg-green-50';

      return (
          <div className={`rounded-[32px] h-full flex flex-col border-2 overflow-hidden bg-white shadow-xl ${themeBorder}`}>
              
              {/* HEADER */}
              <div className={`p-8 flex items-center justify-between border-b ${themeBorder} ${themeBg}`}>
                  <div>
                      <div className="flex items-center gap-2 mb-2">
                           <span className="bg-slate-900 text-white text-[10px] font-mono px-2 py-0.5 rounded uppercase tracking-widest flex items-center gap-1">
                               <Cpu size={10} /> AI Confidence
                           </span>
                      </div>
                      <h2 className={`text-6xl font-black uppercase tracking-tighter leading-none ${themeText}`}>
                          {isFake ? 'FAKE' : 'REAL'}
                      </h2>
                      <p className="font-bold text-slate-500 text-sm mt-1 uppercase tracking-wider">Kết quả phân tích</p>
                  </div>
                  <div className={`w-28 h-28 rounded-full border-8 flex flex-col items-center justify-center bg-white shadow-lg ${isFake ? 'border-red-500 text-red-600' : 'border-green-500 text-green-600'}`}>
                      <span className="text-3xl font-black">{result.confidenceScore}</span>
                      <span className="text-[10px] font-bold uppercase">%</span>
                  </div>
              </div>

              <div className="p-8 flex-1 overflow-y-auto custom-scrollbar">
                  
                  {/* EXPLANATION */}
                  <div className="mb-8">
                      <h3 className="font-bold text-slate-900 text-sm uppercase flex items-center gap-2 mb-3">
                          <Activity size={16} /> Giải thích kỹ thuật
                      </h3>
                      <p className="text-slate-700 leading-relaxed font-medium bg-slate-50 p-5 rounded-2xl border border-slate-100">
                          {result.explanation}
                      </p>
                  </div>

                  {/* METRICS - ADAPTIVE LABELS */}
                  <div className="space-y-6 mb-8">
                      {/* Metric 1: Biological (PPG or Jitter) */}
                      <MetricBar 
                          label={fileType === 'audio' ? "Độ tự nhiên thanh quản" : "Tín hiệu sinh học (PPG)"}
                          sub={fileType === 'audio' ? "Micro-tremors & Hơi thở" : "Độ tự nhiên của mạch máu dưới da"}
                          score={result.details.biologicalScore}
                          icon={<HeartPulse size={18} />}
                      />
                      
                      {/* Metric 2: Structural (CNN or Spectral) */}
                      <MetricBar 
                          label={fileType === 'audio' ? "Phổ âm thanh (Spectral)" : "Độ nguyên vẹn hình ảnh"}
                          sub={fileType === 'audio' ? "Không có lỗi Vocoder/Metallic" : "Không có lỗi ánh sáng/bóng đổ (CNN)"}
                          score={result.details.visualIntegrityScore}
                          icon={fileType === 'audio' ? <Activity size={18} /> : <Eye size={18} />}
                      />

                      {/* Metric 3: Sync/Env (Audio Sync or Noise Floor) */}
                      {result.details.audioSyncScore !== null && (
                          <MetricBar 
                              label={fileType === 'audio' ? "Môi trường & Tạp âm" : "Đồng bộ âm thanh"}
                              sub={fileType === 'audio' ? "Noise Floor tự nhiên" : "Khớp giữa khẩu hình và âm thanh"}
                              score={result.details.audioSyncScore}
                              icon={fileType === 'audio' ? <Mic size={18} /> : <Mic size={18} />}
                          />
                      )}
                  </div>

                  {/* ARTIFACTS */}
                  {result.artifacts && result.artifacts.length > 0 && (
                      <div className="bg-red-50 rounded-2xl p-5 border border-red-100">
                          <h3 className="font-bold text-red-800 text-xs uppercase mb-3 flex items-center gap-2">
                              <AlertCircle size={16} /> Phát hiện lỗi (Artifacts)
                          </h3>
                          <ul className="space-y-2">
                              {result.artifacts.map((artifact: string, i: number) => (
                                  <li key={i} className="flex items-start gap-2 text-sm text-red-700 font-medium">
                                      <span className="w-1.5 h-1.5 rounded-full bg-red-500 mt-1.5 flex-shrink-0"></span>
                                      {artifact}
                                  </li>
                              ))}
                          </ul>
                      </div>
                  )}
              </div>
          </div>
      );
  };

  return (
    <div className={`p-4 md:p-6 pt-24 md:pt-10 pb-32 min-h-screen max-w-7xl mx-auto animate-in fade-in duration-300 ${isSeniorMode ? 'text-lg' : ''}`}>
      
      {/* Header Section */}
      <div className="mb-8 border-b border-slate-200 pb-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-start gap-6">
              <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                       <span className="bg-slate-900 text-white text-[10px] font-mono px-2 py-0.5 rounded uppercase tracking-widest flex items-center gap-1">
                           <Terminal size={10} /> Forensic Module v5.0
                       </span>
                  </div>
                  <h2 className="text-3xl md:text-4xl font-black text-slate-900 mb-2 tracking-tight">
                      Deepfake Scanner
                  </h2>
                  <p className="text-slate-500 font-medium max-w-2xl text-sm mb-4">
                      Công cụ phân tích pháp y kỹ thuật số. Phát hiện Deepfake khuôn mặt & giọng nói.
                  </p>

                  {/* Powered By / Tech Stack Row - REFACTORED TO WRAP */}
                  <div className="flex flex-wrap gap-2 pb-2">
                     {techStack.map((tech, idx) => (
                         <div key={idx} className="flex items-center gap-2 bg-white border border-slate-200 px-3 py-1.5 rounded-lg shadow-sm whitespace-nowrap hover:shadow-md transition-all cursor-default">
                            {tech.icon}
                            <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wide">{tech.name}</span>
                         </div>
                     ))}
                  </div>
              </div>
              <button 
                onClick={() => setShowHistory(true)}
                className="flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold px-4 py-2 rounded-xl transition-colors self-start"
              >
                  <Clock size={20} /> Lịch sử
              </button>
          </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 h-[700px] lg:h-[600px]">
          
          {/* LEFT: SCANNER VIEWPORT */}
          <div className="flex-1 lg:max-w-[45%] h-full flex flex-col">
              {!file ? (
                  <div 
                      className={`flex-1 border-2 border-dashed rounded-[32px] flex flex-col items-center justify-center text-center transition-all cursor-pointer bg-white group hover:border-blue-500 hover:bg-blue-50/30 relative overflow-hidden ${
                          isDragging ? 'border-blue-600 bg-blue-50' : 'border-slate-300'
                      }`}
                  >
                      <div className="rounded-full bg-blue-600 w-20 h-20 flex items-center justify-center mb-6 shadow-xl shadow-blue-100 group-hover:scale-110 transition-transform">
                          <ScanFace size={40} className="text-white" />
                      </div>
                      <h3 className="font-black text-slate-900 text-2xl mb-2">Tải lên Media</h3>
                      <p className="text-slate-400 font-bold uppercase text-xs tracking-widest mb-8">
                          Ảnh, Video hoặc Ghi âm
                      </p>
                      
                      <label className="bg-slate-900 text-white rounded-xl font-bold px-8 py-4 hover:bg-slate-800 transition-colors cursor-pointer shadow-lg active:scale-95 flex items-center gap-3">
                          <Upload size={20} /> Chọn tệp tin
                          <input type="file" className="hidden" accept="image/*,audio/*,video/*" onChange={(e) => e.target.files && e.target.files[0] && handleFileSelect(e.target.files[0])} />
                      </label>
                  </div>
              ) : (
                  <div className="relative bg-black rounded-[32px] overflow-hidden shadow-2xl border border-slate-800 flex items-center justify-center group flex-1">
                      <button onClick={reset} disabled={status === 'analyzing'} className="absolute top-4 right-4 z-40 p-2 bg-black/40 hover:bg-red-500 text-white rounded-full transition-colors backdrop-blur-md border border-white/10">
                          <X size={24} />
                      </button>

                      {file.type.startsWith('image/') ? (
                           <img src={previewUrl!} alt="Preview" className="max-w-full max-h-full object-contain" />
                      ) : file.type.startsWith('video/') ? (
                           <video 
                               ref={mediaRef as React.RefObject<HTMLVideoElement>}
                               src={previewUrl!} 
                               className="max-w-full max-h-full"
                               controls={status !== 'analyzing'}
                           />
                      ) : (
                           <div className="flex flex-col items-center justify-center text-white">
                               <div className="w-32 h-32 rounded-full border-2 border-slate-700 flex items-center justify-center mb-6">
                                   <Activity size={48} className="text-slate-500" />
                               </div>
                               <audio ref={mediaRef as React.RefObject<HTMLAudioElement>} src={previewUrl!} />
                           </div>
                      )}
                      
                      {/* Scanning Overlay Line */}
                      {status === 'analyzing' && (
                          <div className="absolute inset-0 z-30 pointer-events-none border-b-[2px] border-green-500/80 animate-scan-line shadow-[0_0_20px_rgba(74,222,128,0.5)] h-[15%]"></div>
                      )}
                  </div>
              )}
          </div>

          {/* RIGHT: DASHBOARD */}
          <div className="flex-1 h-full">
              {status === 'idle' && file ? (
                   <div className="bg-white rounded-[32px] border border-slate-200 p-8 h-full flex flex-col items-center justify-center text-center shadow-sm">
                       <FileImage size={48} className="text-slate-300 mb-4" />
                       <h3 className="font-bold text-xl text-slate-900 mb-1">{file.name}</h3>
                       <p className="text-slate-400 text-sm mb-8">Sẵn sàng phân tích.</p>
                       <button 
                          onClick={startAnalysis}
                          className="bg-blue-600 text-white rounded-xl font-bold px-10 py-4 hover:bg-blue-700 transition-all shadow-xl shadow-blue-200 active:scale-95 flex items-center gap-2"
                      >
                          <Cpu size={20} /> KÍCH HOẠT QUÉT AI
                      </button>
                   </div>
              ) : status === 'analyzing' ? (
                  renderAnalyzing()
              ) : status === 'result' ? (
                  renderResult()
              ) : (
                   <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-[32px] h-full flex flex-col items-center justify-center text-slate-400 font-bold p-8 text-center">
                       <ShieldAlert size={48} className="mb-4 opacity-50" />
                       <p>Kết quả phân tích sẽ hiển thị tại đây.</p>
                   </div>
              )}
          </div>
      </div>

      {/* History Modal */}
      {showHistory && (
          <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
              <div className="bg-white w-full max-w-2xl rounded-[32px] overflow-hidden shadow-2xl flex flex-col max-h-[80vh] animate-in zoom-in duration-200">
                  <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                      <h3 className="font-black text-2xl text-slate-900">Lịch sử quét Deepfake</h3>
                      <button onClick={() => setShowHistory(false)} className="p-2 hover:bg-slate-100 rounded-full"><X size={24} /></button>
                  </div>
                  <div className="flex-1 overflow-y-auto p-6 bg-slate-50">
                      {user?.deepfakeHistory && user.deepfakeHistory.length > 0 ? (
                          <div className="space-y-3">
                              {user.deepfakeHistory.map(item => (
                                  <div key={item.id} className="bg-white p-4 rounded-xl border border-slate-200 flex items-center justify-between shadow-sm">
                                      <div className="flex items-center gap-4">
                                          <div className={`w-12 h-12 rounded-full flex items-center justify-center font-black text-sm border-2 ${
                                              item.result === 'FAKE' ? 'bg-red-100 text-red-600 border-red-200' : 'bg-green-100 text-green-600 border-green-200'
                                          }`}>
                                              {item.result}
                                          </div>
                                          <div>
                                              <h4 className="font-bold text-slate-800 line-clamp-1">{item.fileName}</h4>
                                              <div className="flex items-center gap-2 text-xs text-slate-500">
                                                  <Clock size={12} /> {new Date(item.timestamp).toLocaleString('vi-VN')}
                                                  <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                                                  <span>{item.fileType.toUpperCase()}</span>
                                              </div>
                                          </div>
                                      </div>
                                      <div className={`font-black text-lg ${item.confidenceScore > 80 ? 'text-slate-900' : 'text-slate-500'}`}>
                                          {item.confidenceScore}%
                                      </div>
                                  </div>
                              ))}
                          </div>
                      ) : (
                          <div className="text-center py-10 text-slate-400">
                              <ScanFace size={48} className="mx-auto mb-3 opacity-50" />
                              <p>Chưa có lịch sử quét nào.</p>
                          </div>
                      )}
                  </div>
                  {user?.deepfakeHistory && user.deepfakeHistory.length > 0 && (
                      <div className="p-4 border-t border-slate-200 bg-white text-center">
                          <button onClick={() => { if(confirm("Xóa toàn bộ lịch sử?")) clearDeepfakeHistory(); }} className="text-red-500 font-bold text-sm hover:underline">
                              Xóa toàn bộ lịch sử
                          </button>
                      </div>
                  )}
              </div>
          </div>
      )}

      {showPremiumModal && <PremiumUpgradeModal onClose={() => setShowPremiumModal(false)} triggerSource="deepfake_limit" />}
    </div>
  );
};

// --- SUB-COMPONENTS ---

const MetricBar = ({ label, sub, score, icon }: { label: string, sub: string, score: number, icon: any }) => {
    // Logic: 
    // High Score (80-100) = Real (Green)
    // Med Score (50-79) = Suspicious (Amber)
    // Low Score (0-49) = Fake (Red)
    
    let colorClass = 'bg-green-500';
    let textClass = 'text-green-600';
    
    if (score < 50) {
        colorClass = 'bg-red-500';
        textClass = 'text-red-600';
    } else if (score < 80) {
        colorClass = 'bg-amber-500';
        textClass = 'text-amber-600';
    }

    return (
        <div>
            <div className="flex justify-between items-end mb-2">
                <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-xl bg-slate-100 text-slate-600`}>{icon}</div>
                    <div>
                        <div className="font-bold text-slate-800 text-sm">{label}</div>
                        <div className="text-[10px] text-slate-400 font-medium uppercase tracking-wide">{sub}</div>
                    </div>
                </div>
                <div className={`font-black text-lg ${textClass}`}>{score}/100</div>
            </div>
            <div className="h-3 bg-slate-100 rounded-full overflow-hidden border border-slate-200/50">
                <div 
                    className={`h-full ${colorClass} transition-all duration-1000 ease-out`} 
                    style={{ width: `${score}%` }}
                ></div>
            </div>
        </div>
    );
};

export default DeepfakeScanner;
