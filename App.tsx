
import React, { useState, Suspense, lazy, useEffect } from 'react';
import { 
  Shield, MessageSquareText, 
  Bot, BookOpen, UserCircle, Search, ScanFace, Sparkles, Home, Menu
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
  <div className="flex-1 flex flex-col items-center justify-center h-full bg-slate-50/50">
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

  const handleNavClick = (tab: Tab) => {
      if(isSeniorMode) triggerHaptic('tap');
      setActiveTab(tab);
  };

  if (isLoading) return <LoadingFallback />;
  if (!user || isOnboarding) return <OnboardingFlow />;

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

  return (
    <div className={`flex flex-col h-full w-full overflow-hidden transition-colors duration-500 ${isSeniorMode ? 'bg-[#FFFBEB]' : 'bg-[#F8FAFC]'}`} data-senior-mode={isSeniorMode}>
      
      {/* --- DESKTOP SIDEBAR (Hidden Mobile) --- */}
      <aside className="hidden lg:flex w-80 flex-col bg-white/80 backdrop-blur-xl border-r border-white/50 shadow-2xl fixed h-full z-30 pt-8 px-6">
          <div className="flex items-center gap-3 mb-10 px-2">
            <div className="bg-blue-600 p-2.5 rounded-xl shadow-lg shadow-blue-500/30">
              <Shield className="w-7 h-7 text-white" fill="currentColor" />
            </div>
            <div>
               <h1 className="font-black text-xl tracking-tight text-slate-900 leading-none">TruthShield</h1>
               <span className="text-[10px] font-bold text-blue-600 uppercase tracking-widest">AI Protection</span>
            </div>
          </div>
          <nav className="space-y-2">
             <NavSideItem icon={<Home size={20} />} label="Trang chủ" isActive={activeTab === 'home'} onClick={() => setActiveTab('home')} />
             <NavSideItem icon={<Search size={20} />} label="Tra cứu số" isActive={activeTab === 'lookup'} onClick={() => setActiveTab('lookup')} />
             <NavSideItem icon={<MessageSquareText size={20} />} label="Tin nhắn" isActive={activeTab === 'messagescan'} onClick={() => setActiveTab('messagescan')} />
             <NavSideItem icon={<Bot size={20} />} label="Trợ lý AI" isActive={activeTab === 'chat'} onClick={() => setActiveTab('chat')} />
             <NavSideItem icon={<ScanFace size={20} />} label="Quét Deepfake" isActive={activeTab === 'scanner'} onClick={() => setActiveTab('scanner')} />
             <NavSideItem icon={<BookOpen size={20} />} label="Thư viện" isActive={activeTab === 'library'} onClick={() => setActiveTab('library')} />
             <NavSideItem icon={<UserCircle size={20} />} label="Cá nhân" isActive={activeTab === 'profile'} onClick={() => setActiveTab('profile')} />
          </nav>
      </aside>

      {/* --- MAIN CONTENT AREA --- */}
      <main className={`flex-1 flex flex-col h-full relative w-full lg:pl-80 overflow-hidden`}>
          
          {/* Header Mobile - Dynamic */}
          <header className={`lg:hidden flex items-center justify-between px-5 pt-safe pb-3 z-20 shrink-0 transition-colors duration-300 ${isSeniorMode ? 'bg-[#FFFBEB]' : 'bg-[#F8FAFC]/90 backdrop-blur-md'}`}>
              <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-xl flex-shrink-0 ${isSeniorMode ? 'bg-amber-100 text-amber-700' : 'bg-blue-600 text-white shadow-md shadow-blue-200'}`}>
                      <Shield className="w-6 h-6 fill-current" />
                  </div>
                  <div>
                      <span className={`font-black tracking-tight leading-none block ${isSeniorMode ? 'text-2xl text-slate-900' : 'text-xl text-slate-900'}`}>TruthShield</span>
                      {isSeniorMode && <span className="text-xs font-bold text-amber-700 uppercase tracking-wider">Người Cao Tuổi</span>}
                  </div>
              </div>
              <button 
                  onClick={() => setActiveTab('profile')}
                  className={`rounded-full flex items-center justify-center font-bold border transition-transform active:scale-95 overflow-hidden ${isSeniorMode ? 'w-12 h-12 text-lg bg-white border-amber-200 shadow-sm text-amber-900' : 'w-10 h-10 text-xs bg-white border-slate-200 text-slate-600 shadow-sm'}`}
              >
                  {user?.name?.charAt(0) || <UserCircle />}
              </button> 
          </header>

          {/* Scrollable Content - INCREASED PADDING BOTTOM TO 180px */}
          <div className="flex-1 overflow-y-auto overflow-x-hidden no-scrollbar pb-[180px] lg:pb-0 relative z-10 touch-pan-y">
             <Suspense fallback={<LoadingFallback />}>
               {renderContent()}
             </Suspense>
          </div>

          {/* --- MOBILE NAVIGATION BAR --- */}
          <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 pointer-events-none flex justify-center">
              {isSeniorMode ? (
                  /* SENIOR MODE NAV - GROUNDED */
                  <div className="pointer-events-auto bg-[#FFFDE7] w-full border-t-2 border-amber-200 shadow-[0_-4px_20px_rgba(217,119,6,0.15)] px-1 pt-2 pb-safe">
                      <div className="flex justify-around items-end h-16 w-full relative">
                          <NavTabSenior icon={<Home />} label="Nhà" isActive={activeTab === 'home'} onClick={() => handleNavClick('home')} />
                          <NavTabSenior icon={<Search />} label="Tra cứu" isActive={activeTab === 'lookup'} onClick={() => handleNavClick('lookup')} />
                          <NavTabSenior icon={<MessageSquareText />} label="Tin nhắn" isActive={activeTab === 'messagescan'} onClick={() => handleNavClick('messagescan')} />
                          
                          {/* Center Chat Button - Elevated in grounded bar */}
                          <div className="relative -top-6 mx-1 flex-shrink-0 z-10">
                              <button onClick={() => handleNavClick('chat')} className={`w-16 h-16 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 border-4 border-[#FFFDE7] shadow-xl flex items-center justify-center text-white transition-transform active:scale-95 ${activeTab === 'chat' ? 'ring-4 ring-amber-200' : ''}`}>
                                  <Sparkles size={32} fill={activeTab === 'chat' ? "currentColor" : "none"} strokeWidth={2} />
                              </button>
                              <span className="absolute -bottom-5 w-full text-center text-[10px] font-bold text-amber-900">Trợ lý</span>
                          </div>

                          <NavTabSenior icon={<ScanFace />} label="Quét mặt" isActive={activeTab === 'scanner'} onClick={() => handleNavClick('scanner')} />
                          <NavTabSenior icon={<BookOpen />} label="Thư viện" isActive={activeTab === 'library'} onClick={() => handleNavClick('library')} />
                          <NavTabSenior icon={<UserCircle />} label="Cá nhân" isActive={activeTab === 'profile'} onClick={() => handleNavClick('profile')} />
                      </div>
                  </div>
              ) : (
                  /* NORMAL MODE NAV - GROUNDED (UPDATED) */
                  <div className="pointer-events-auto bg-white/95 backdrop-blur-xl border-t border-slate-100 shadow-[0_-4px_20px_rgba(0,0,0,0.05)] w-full px-2 pt-2 pb-safe">
                      <div className="flex items-end justify-around gap-1 w-full max-w-lg mx-auto relative h-14">
                          <NavTabNormal icon={<Home />} isActive={activeTab === 'home'} onClick={() => setActiveTab('home')} />
                          <NavTabNormal icon={<Search />} isActive={activeTab === 'lookup'} onClick={() => setActiveTab('lookup')} />
                          <NavTabNormal icon={<MessageSquareText />} isActive={activeTab === 'messagescan'} onClick={() => setActiveTab('messagescan')} />
                          
                          {/* Chat Button - Elevated in grounded bar */}
                          <div className="relative -top-6 px-2 z-10">
                             <button 
                                onClick={() => setActiveTab('chat')}
                                className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all shadow-lg active:scale-95 border-4 border-white ${activeTab === 'chat' ? 'bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-blue-400/40 ring-2 ring-blue-100' : 'bg-slate-900 text-white ring-2 ring-slate-100'}`}
                              >
                                  <Sparkles size={26} fill={activeTab === 'chat' ? "currentColor" : "none"} strokeWidth={2} />
                              </button>
                          </div>

                          <NavTabNormal icon={<ScanFace />} isActive={activeTab === 'scanner'} onClick={() => setActiveTab('scanner')} />
                          <NavTabNormal icon={<BookOpen />} isActive={activeTab === 'library'} onClick={() => setActiveTab('library')} />
                          <NavTabNormal icon={<UserCircle />} isActive={activeTab === 'profile'} onClick={() => setActiveTab('profile')} />
                      </div>
                  </div>
              )}
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

// --- NAV COMPONENTS ---

const NavTabNormal = ({ icon, isActive, onClick }: any) => (
    <button 
        onClick={onClick}
        className={`flex-1 h-full pb-2 rounded-xl transition-all relative flex flex-col items-center justify-end active:scale-90 gap-1 ${isActive ? 'text-blue-600' : 'text-slate-400 hover:text-slate-600'}`}
    >
        {React.cloneElement(icon, { 
            size: 24, 
            strokeWidth: isActive ? 2.5 : 2,
            className: "transition-transform duration-300"
        })}
        {isActive && <span className="w-1 h-1 bg-blue-600 rounded-full"></span>}
    </button>
);

const NavTabSenior = ({ icon, label, isActive, onClick }: any) => (
    <button 
        onClick={onClick}
        className={`flex flex-col items-center justify-center flex-1 h-full gap-0.5 active:scale-95 transition-transform px-1 pb-1 ${isActive ? 'text-amber-800' : 'text-amber-800/50'}`}
    >
        {React.cloneElement(icon, { size: 28, strokeWidth: 2.5 })}
        <span className={`text-[10px] font-bold ${isActive ? 'text-amber-900' : 'text-amber-800/60'}`}>{label}</span>
    </button>
);

const NavSideItem = ({ icon, label, isActive, onClick }: any) => (
    <button 
        onClick={onClick}
        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all ${isActive ? 'bg-blue-50 text-blue-600' : 'text-slate-500 hover:bg-slate-50'}`}
    >
        {icon}
        <span>{label}</span>
    </button>
);

export default App;
