
import React, { useState, Suspense, lazy } from 'react';
import { 
  Shield, MessageSquareText, 
  Bot, BookOpen, UserCircle, Search, ScanFace, Grip, Sparkles, Home
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
  const { user, isLoading, isOnboarding, incomingCall, isSeniorMode } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>('home');

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

  // Safe Area Height Calculation for iPhone 16 Pro Header Consistency
  const headerHeightClass = isSeniorMode ? 'h-[5.5rem]' : 'h-[5rem]'; 
  const headerPaddingClass = isSeniorMode ? 'pt-[calc(5.5rem+env(safe-area-inset-top))]' : 'pt-[calc(5rem+env(safe-area-inset-top))]';

  return (
    <div className={`h-full w-full font-sans flex flex-col overflow-hidden ${isSeniorMode ? 'text-lg' : ''}`}>
      
      {/* --- Desktop Sidebar (Hidden on Mobile) --- */}
      <aside className="hidden lg:flex w-80 flex-col glass-panel z-30 fixed h-[96%] top-[2%] left-4 rounded-[32px] overflow-hidden border border-white/40 shadow-2xl">
        <div className="h-24 flex items-center px-8 bg-gradient-to-b from-white/40 to-transparent">
          <div className="relative">
            <div className="bg-gradient-to-br from-blue-600 to-indigo-600 p-2.5 rounded-2xl shadow-lg shadow-blue-500/30">
              <Shield className="w-7 h-7 text-white" fill="currentColor" />
            </div>
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white animate-pulse"></div>
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
      <main className="flex-1 lg:pl-[340px] flex flex-col h-full relative w-full bg-[#F8FAFC]">
        
        {/* Mobile Header (Sticky & Glass) */}
        <div className="lg:hidden absolute top-0 left-0 right-0 z-40">
           <div className={`w-full bg-white/80 backdrop-blur-xl border-b border-white/40 px-6 flex items-end pb-4 justify-between transition-all pt-[env(safe-area-inset-top)] ${headerHeightClass} box-border`}>
                <div className="flex items-center gap-3.5">
                    <div className="bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl p-1.5 shadow-md shadow-blue-500/20">
                        <Shield className="w-5 h-5 text-white fill-current" />
                    </div>
                    <div>
                        <span className="text-xl font-black text-slate-900 tracking-tight leading-none block">TruthShield</span>
                    </div>
                </div>
                {/* Profile Circle */}
                <div 
                    onClick={() => setActiveTab('profile')}
                    className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 font-bold text-xs border border-slate-200 active:scale-95 transition-transform"
                >
                    {user?.name?.charAt(0) || <UserCircle size={20} />}
                </div> 
           </div>
        </div>

        {/* Content Scroll Container */}
        <div className={`flex-1 overflow-y-auto scroll-smooth custom-scrollbar w-full pb-[calc(5.5rem+env(safe-area-inset-bottom))] lg:pb-0 ${headerPaddingClass} lg:pt-0`}>
          <Suspense fallback={<LoadingFallback />}>
            {renderContent()}
          </Suspense>
        </div>

        {/* --- Mobile Bottom Navigation (Uniform 6 Items) --- */}
        <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-xl border-t border-slate-200/80 pb-[env(safe-area-inset-bottom)] shadow-[0_-10px_40px_rgba(0,0,0,0.03)]">
          <div className="grid grid-cols-6 h-[4rem] items-center px-1">
            
            {/* 1. HOME */}
            <NavTab 
              icon={<Home />} 
              label="Trang chủ" 
              isActive={activeTab === 'home'} 
              onClick={() => setActiveTab('home')} 
            />
            
            {/* 2. LOOKUP */}
            <NavTab 
              icon={<Search />} 
              label="Tra cứu" 
              isActive={activeTab === 'lookup'} 
              onClick={() => setActiveTab('lookup')} 
            />

            {/* 3. MESSAGES */}
            <NavTab 
              icon={<MessageSquareText />} 
              label="Tin nhắn" 
              isActive={activeTab === 'messagescan'} 
              onClick={() => setActiveTab('messagescan')} 
            />

            {/* 4. CHATBOT (Standardized) */}
            <NavTab 
              icon={<Bot />} 
              label="Trợ lý AI" 
              isActive={activeTab === 'chat'} 
              onClick={() => setActiveTab('chat')} 
            />

            {/* 5. SCANNER */}
            <NavTab 
              icon={<ScanFace />} 
              label="Scan AI" 
              isActive={activeTab === 'scanner'} 
              onClick={() => setActiveTab('scanner')} 
            />

            {/* 6. LIBRARY */}
            <NavTab 
              icon={<BookOpen />} 
              label="Thư viện" 
              isActive={activeTab === 'library'} 
              onClick={() => setActiveTab('library')} 
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

// Uniform NavTab for all items
const NavTab = ({ icon, label, isActive, onClick }: any) => {
  return (
    <button 
      onClick={onClick}
      className={`flex flex-col items-center justify-center h-full w-full gap-1 transition-all duration-200 active:bg-slate-50 ${
        isActive ? 'text-blue-600' : 'text-slate-400 hover:text-slate-500'
      }`}
    >
      <div className={`transition-transform duration-200 ${isActive ? 'scale-110' : ''}`}>
        {React.cloneElement(icon, { 
            size: 22, 
            strokeWidth: isActive ? 2.5 : 2,
            fill: isActive ? "currentColor" : "none",
            className: isActive ? "fill-blue-600/10" : ""
        })}
      </div>
      <span className="text-[9px] font-bold tracking-tight leading-none text-center truncate w-full px-0.5">
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
