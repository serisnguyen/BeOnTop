
import React, { useState, Suspense, lazy, useEffect } from 'react';
import { 
  Shield, MessageSquareText, 
  Bot, BookOpen, UserCircle, Search, ScanFace, Grip, Sparkles, Home, Phone
} from 'lucide-react';
import { AuthProvider, useAuth } from './context/AuthContext';
import ErrorBoundary from './components/ErrorBoundary';
import OnboardingFlow from './components/OnboardingFlow';
import CallOverlay from './components/CallOverlay';

// Lazy Load Components
const HomeScreen = lazy(() => import('./components/HomeScreen'));
const MessageGuard = lazy(() => import('./components/MessageGuard')); 
const ChatScreen = lazy(() => import('./components/ChatScreen'));
const ProfileScreen = lazy(() => import('./components/ProfileScreen'));
const ScamLibraryScreen = lazy(() => import('./components/ScamLibraryScreen'));
const CallHistoryScreen = lazy(() => import('./components/CallHistoryScreen'));
const LookupScreen = lazy(() => import('./components/LookupScreen'));
const DeepfakeScanner = lazy(() => import('./components/DeepfakeScanner'));

export type Tab = 'home' | 'messagescan' | 'chat' | 'profile' | 'library' | 'history' | 'lookup' | 'scanner';

const LoadingFallback = () => (
  <div className="flex-1 flex flex-col items-center justify-center h-full">
    <div className="relative">
      <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
      <div className="absolute inset-0 flex items-center justify-center">
        <Shield size={24} className="text-blue-600" />
      </div>
    </div>
    <p className="text-slate-600 font-bold mt-4 text-sm uppercase tracking-wide animate-pulse">Đang khởi tạo...</p>
  </div>
);

const AppContent: React.FC = () => {
  const { user, isLoading, isOnboarding, incomingCall, isSeniorMode, speakUI, triggerHaptic } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>('home');

  // Senior Mode Auto-Guide
  useEffect(() => {
      if (isSeniorMode) {
          const titles: Record<string, string> = {
              'home': 'Trang chủ',
              'chat': 'Trợ lý ảo',
              'scanner': 'Quét Deepfake',
              'profile': 'Cài đặt cá nhân',
              'lookup': 'Tra cứu số',
              'messagescan': 'Kiểm tra tin nhắn',
              'library': 'Thư viện'
          };
          const title = titles[activeTab] || 'Màn hình chính';
          speakUI(`Đang mở ${title}`);
      }
  }, [activeTab, isSeniorMode, speakUI]);

  // Handle Senior Navigation Click with Haptics
  const handleNavClick = (tab: Tab) => {
      if(isSeniorMode) triggerHaptic('tap');
      setActiveTab(tab);
  };

  // If loading
  if (isLoading) return <LoadingFallback />;

  // If not logged in or in onboarding process
  if (!user || isOnboarding) {
      return <OnboardingFlow />;
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'home': return <HomeScreen onNavigate={setActiveTab} />;
      case 'scanner': return <DeepfakeScanner />;
      case 'messagescan': return <MessageGuard />;
      case 'chat': return <ChatScreen onNavigate={setActiveTab} />;
      case 'profile': return <ProfileScreen />;
      case 'library': return <ScamLibraryScreen />;
      case 'history': return <CallHistoryScreen onBack={() => setActiveTab('profile')} />;
      case 'lookup': return <LookupScreen onBack={() => setActiveTab('home')} />;
      default: return <HomeScreen onNavigate={setActiveTab} />;
    }
  };

  // Safe Area Height Calculation
  // Senior mode gets a slightly taller header for larger text
  const headerHeightClass = isSeniorMode ? 'h-[6rem]' : 'h-[5rem]'; 
  const headerPaddingClass = isSeniorMode ? 'pt-[calc(6rem+env(safe-area-inset-top))]' : 'pt-[calc(5rem+env(safe-area-inset-top))]';
  
  // SENIOR MODE: Warm High-Contrast Theme
  const themeClass = isSeniorMode ? 'bg-amber-50 text-slate-900' : 'bg-[#F8FAFC]';

  return (
    <div className={`h-full w-full font-sans flex flex-col overflow-hidden ${themeClass} ${isSeniorMode ? 'text-xl' : ''}`}>
      
      {/* --- Desktop Sidebar (Hidden on Mobile) --- */}
      <aside className="hidden lg:flex w-80 flex-col glass-panel z-30 fixed h-[96%] top-[2%] left-4 rounded-[32px] overflow-hidden border border-white/40 shadow-2xl">
        <div className="h-24 flex items-center px-8 bg-gradient-to-b from-white/40 to-transparent">
          <div className="relative">
            <div className="bg-gradient-to-br from-blue-600 to-indigo-600 p-2.5 rounded-2xl shadow-lg shadow-blue-500/30">
              <Shield className="w-7 h-7 text-white" fill="currentColor" />
            </div>
          </div>
          <div className="ml-4">
            <h1 className="font-black text-xl tracking-tight text-slate-900 leading-none">TruthShield</h1>
            <div className="flex items-center gap-1 mt-1">
               <Sparkles size={12} className="text-blue-600" />
               <p className="text-[10px] font-bold text-blue-600 uppercase tracking-widest">AI Protection</p>
            </div>
          </div>
        </div>
        
        <nav className="flex-1 py-6 px-4 space-y-2 overflow-y-auto no-scrollbar">
          <NavSideItem icon={<Shield size={20} />} label="Tổng Quan" isActive={activeTab === 'home'} onClick={() => setActiveTab('home')} />
          <NavSideItem icon={<Search size={20} />} label="Tra Cứu Số" isActive={activeTab === 'lookup'} onClick={() => setActiveTab('lookup')} />
          <NavSideItem icon={<MessageSquareText size={20} />} label="Quét Tin Nhắn" isActive={activeTab === 'messagescan'} onClick={() => setActiveTab('messagescan')} />
          <NavSideItem icon={<Bot size={20} />} label="Trợ Lý AI" isActive={activeTab === 'chat'} onClick={() => setActiveTab('chat')} />
          <NavSideItem icon={<ScanFace size={20} />} label="Quét Deepfake" isActive={activeTab === 'scanner'} onClick={() => setActiveTab('scanner')} />
          <NavSideItem icon={<BookOpen size={20} />} label="Thư Viện" isActive={activeTab === 'library'} onClick={() => setActiveTab('library')} />
          <NavSideItem icon={<UserCircle size={20} />} label="Cá Nhân" isActive={activeTab === 'profile'} onClick={() => setActiveTab('profile')} />
        </nav>
      </aside>

      {/* --- Main Content Area --- */}
      <main className="flex-1 lg:pl-[340px] flex flex-col h-full relative w-full">
        
        {/* Mobile Header (Sticky & Glass) */}
        <div className="lg:hidden absolute top-0 left-0 right-0 z-40">
           <div className={`w-full ${isSeniorMode ? 'bg-amber-100/90 border-amber-200' : 'bg-white/80 border-white/40'} backdrop-blur-xl border-b px-6 flex items-end pb-4 justify-between transition-all pt-[env(safe-area-inset-top)] ${headerHeightClass} box-border`}>
                <div className="flex items-center gap-3.5">
                    <div className="bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl p-1.5 shadow-md shadow-blue-500/20">
                        <Shield className="w-6 h-6 text-white fill-current" />
                    </div>
                    <div>
                        <span className={`font-black text-slate-900 tracking-tight leading-none block ${isSeniorMode ? 'text-2xl' : 'text-xl'}`}>TruthShield</span>
                        {isSeniorMode && <span className="text-xs font-bold text-amber-700 uppercase tracking-wider">Chế độ người cao tuổi</span>}
                    </div>
                </div>
                {/* Profile Circle */}
                <div 
                    onClick={() => setActiveTab('profile')}
                    className={`rounded-full flex items-center justify-center font-bold border active:scale-95 transition-transform ${isSeniorMode ? 'w-12 h-12 text-lg bg-white border-amber-300 shadow-sm' : 'w-9 h-9 text-xs bg-slate-100 border-slate-200 text-slate-600'}`}
                >
                    {user?.name?.charAt(0) || <UserCircle size={isSeniorMode ? 28 : 20} />}
                </div> 
           </div>
        </div>

        {/* Content Scroll Container */}
        <div className={`flex-1 overflow-y-auto scroll-smooth custom-scrollbar w-full pb-[calc(6rem+env(safe-area-inset-bottom))] lg:pb-0 ${headerPaddingClass} lg:pt-0`}>
          <Suspense fallback={<LoadingFallback />}>
            {renderContent()}
          </Suspense>
        </div>

        {/* --- Mobile Bottom Navigation --- */}
        <div className={`lg:hidden fixed bottom-0 left-0 right-0 z-50 backdrop-blur-xl border-t pb-[env(safe-area-inset-bottom)] shadow-[0_-10px_40px_rgba(0,0,0,0.03)] ${
            isSeniorMode ? 'bg-amber-50/95 border-amber-300 h-[5.5rem]' : 'bg-white/95 border-slate-200/80 h-[4.5rem]'
        }`}>
            {/* Always Render 6 Cols */}
            <div className="grid grid-cols-6 h-full items-center px-1">
                <NavTab 
                    icon={<Home />} 
                    label="Trang chủ" 
                    isActive={activeTab === 'home'} 
                    onClick={() => handleNavClick('home')} 
                    isSeniorMode={isSeniorMode} 
                />
                <NavTab 
                    icon={<Search />} 
                    label="Tra cứu" 
                    isActive={activeTab === 'lookup'} 
                    onClick={() => handleNavClick('lookup')} 
                    isSeniorMode={isSeniorMode} 
                />
                <NavTab 
                    icon={<MessageSquareText />} 
                    label="Tin nhắn" 
                    isActive={activeTab === 'messagescan'} 
                    onClick={() => handleNavClick('messagescan')} 
                    isSeniorMode={isSeniorMode} 
                />
                <NavTab 
                    icon={<Bot />} 
                    label="Trợ lý AI" 
                    isActive={activeTab === 'chat'} 
                    onClick={() => handleNavClick('chat')} 
                    isSeniorMode={isSeniorMode} 
                />
                <NavTab 
                    icon={<ScanFace />} 
                    label="Scan AI" 
                    isActive={activeTab === 'scanner'} 
                    onClick={() => handleNavClick('scanner')} 
                    isSeniorMode={isSeniorMode} 
                />
                <NavTab 
                    icon={<BookOpen />} 
                    label="Thư viện" 
                    isActive={activeTab === 'library'} 
                    onClick={() => handleNavClick('library')} 
                    isSeniorMode={isSeniorMode} 
                />
            </div>
        </div>
      </main>

      {/* Global Overlays */}
      {incomingCall && <CallOverlay call={incomingCall} />}
    </div>
  );
};

const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ErrorBoundary>
  );
}

// --- SUB-COMPONENTS ---

const NavTab = ({ icon, label, isActive, onClick, isSeniorMode }: any) => {
  // Styles based on Senior Mode vs Normal
  const activeColor = isSeniorMode ? 'text-blue-800' : 'text-blue-600';
  const inactiveColor = isSeniorMode ? 'text-slate-700' : 'text-slate-400 hover:text-slate-500';
  
  // Larger Size for Senior
  const iconSize = isSeniorMode ? 28 : 22;
  const textSize = isSeniorMode ? 'text-[10px] font-black' : 'text-[9px] font-bold';
  
  // High Contrast Background for Active Senior Tab
  const bgActive = isSeniorMode && isActive ? 'bg-amber-200/50 rounded-xl' : '';

  return (
    <button 
      onClick={onClick}
      className={`flex flex-col items-center justify-center h-full w-full gap-0.5 transition-all duration-200 active:bg-slate-50 ${
        isActive ? activeColor : inactiveColor
      }`}
    >
      <div className={`transition-transform duration-200 p-1.5 ${isActive ? 'scale-110' : ''} ${bgActive}`}>
        {React.cloneElement(icon, { 
            size: iconSize, 
            strokeWidth: isActive || isSeniorMode ? 2.5 : 2,
            fill: isActive ? "currentColor" : "none",
            className: isActive ? (isSeniorMode ? "fill-blue-700/10" : "fill-blue-600/10") : ""
        })}
      </div>
      <span className={`${textSize} tracking-tight leading-none text-center truncate w-full px-0.5`}>
        {label}
      </span>
    </button>
  );
};

const NavSideItem = ({ icon, label, isActive, onClick }: any) => (
  <button 
    onClick={onClick}
    className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all font-bold text-sm group relative overflow-hidden ${
      isActive 
        ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' 
        : 'text-slate-600 hover:bg-white/60 hover:text-slate-900'
    }`}
  >
    <div className={`relative z-10 flex items-center gap-4 transition-transform ${isActive ? 'translate-x-1' : ''}`}>
        {icon}
        <span>{label}</span>
    </div>
    {isActive && <div className="absolute inset-0 bg-gradient-to-r from-transparent to-white/10"></div>}
  </button>
);

export default App;
