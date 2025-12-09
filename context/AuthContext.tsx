
import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { 
  User, 
  AlertHistoryItem, 
  MessageAnalysisLog, 
  CallLogItem,
  PhoneLookupResult,
  ContactItem,
  SubscriptionPlan,
  DeepfakeScanLog
} from '../types';
import { useUserProfile } from '../hooks/useUserProfile';
import { MOCK_PHONE_DATABASE } from '../data/mockData';

// Re-export types
export * from '../types';

// --- CONSTANTS ---
export const LIMITS = {
    FREE: {
        DEEPFAKE_SCANS: 3,
        MESSAGE_SCANS: 2,
        CALL_LOOKUPS: 5
    }
};

const MOCK_PHONE_CONTACTS = [
    { name: 'Mẹ Yêu', phone: '0901234567' },
    { name: 'Bố', phone: '0912345678' },
    { name: 'Anh Trai', phone: '0987654321' },
    { name: 'Chị Gái', phone: '0999888777' }, 
];

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isOnboarding: boolean;
  completeOnboarding: () => void;
  login: (phone: string) => Promise<void>;
  logout: () => void;
  incomingCall: CallLogItem | null;
  setIncomingCall: (call: CallLogItem | null) => void;
  addAlertToHistory: (alert: Omit<AlertHistoryItem, 'id' | 'timestamp'>) => void;
  clearAlertHistory: () => void;
  addMessageAnalysis: (log: Omit<MessageAnalysisLog, 'id' | 'timestamp'>) => void;
  clearMessageHistory: () => void;
  updateMessageHistoryItem: (id: string, result: 'safe' | 'suspicious' | 'scam', explanation: string) => void;
  addDeepfakeScan: (log: Omit<DeepfakeScanLog, 'id' | 'timestamp'>) => void;
  clearDeepfakeHistory: () => void;
  updateCallHistoryItem: (callId: string, updates: Partial<CallLogItem>) => void;
  updateSettings: (settings: Partial<User>) => void;
  blockNumber: (phone: string) => void;
  unblockNumber: (phone: string) => void;
  isOnline: boolean;
  isSeniorMode: boolean;
  
  // Features
  lookupPhoneNumber: (phone: string) => Promise<PhoneLookupResult | null>;
  reportPhoneNumber: (phone: string, type: 'scam' | 'spam' | 'safe', label: string) => Promise<void>;
  toggleSeniorMode: () => void;
  upgradeSubscription: (plan: SubscriptionPlan) => void;
  
  // Usage Checks
  checkLimit: (feature: 'deepfake' | 'message' | 'lookup') => boolean;
  incrementUsage: (feature: 'deepfake' | 'message' | 'lookup') => void;

  role: 'elder' | 'user'; 
  addContact: (contact: Omit<ContactItem, 'id'>) => void;

  // Accessibility
  triggerHaptic: (type?: 'success' | 'error' | 'tap') => void;
  speakUI: (text: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isOnboarding, setIsOnboarding] = useState(false);
  const [incomingCall, setIncomingCall] = useState<CallLogItem | null>(null);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
        window.removeEventListener('online', handleOnline);
        window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Sync state across tabs
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
        if (e.key === 'truthshield_profile_cache' && e.newValue) {
            try {
                const updatedUser = JSON.parse(e.newValue);
                setUser(updatedUser);
            } catch (err) {
                console.error('Failed to sync user from storage', err);
            }
        }
    };
    
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Check and Reset Daily Usage on Load
  const checkDailyReset = (userData: User): User => {
      const today = new Date().toISOString().split('T')[0];
      if (userData.usage?.lastResetDate !== today) {
          return {
              ...userData,
              usage: {
                  deepfakeScans: 0,
                  messageScans: 0,
                  callLookups: 0,
                  lastResetDate: today
              }
          };
      }
      return userData;
  };

  useEffect(() => {
    const token = localStorage.getItem('truthshield_token');
    if (token) {
      try {
        const storedProfile = localStorage.getItem('truthshield_profile_cache');
        if (storedProfile) {
          let parsedUser = JSON.parse(storedProfile);
          if (parsedUser.isSeniorMode === undefined) parsedUser.isSeniorMode = false;
          if (parsedUser.blockedNumbers === undefined) parsedUser.blockedNumbers = [];
          if (parsedUser.plan === undefined) parsedUser.plan = 'free';
          if (parsedUser.deepfakeHistory === undefined) parsedUser.deepfakeHistory = [];
          
          // Initialize usage if missing
          if (!parsedUser.usage) {
              parsedUser.usage = { deepfakeScans: 0, messageScans: 0, callLookups: 0, lastResetDate: new Date().toISOString().split('T')[0] };
          }

          parsedUser = checkDailyReset(parsedUser);
          setUser(parsedUser);
        }
      } catch (e) {
        localStorage.removeItem('truthshield_token');
      }
    }
    setIsLoading(false);
  }, []);

  const persistUser = (userData: User) => {
    setUser(userData);
    localStorage.setItem('truthshield_profile_cache', JSON.stringify(userData));
  };

  const userActions = useUserProfile({ user, persistUser });
  
  const login = async (phone: string) => {
    return new Promise<void>((resolve) => {
      setTimeout(() => {
        const storedProfile = localStorage.getItem('truthshield_profile_cache');
        let finalUser: User | null = null;
        
        if (storedProfile) {
            const u = JSON.parse(storedProfile);
            if (u.phone === phone) finalUser = u;
        }

        if (!finalUser) {
          setIsOnboarding(true);
          finalUser = {
            id: Date.now().toString(),
            name: "Người dùng", 
            phone: phone,
            contacts: MOCK_PHONE_CONTACTS.map(c => ({ id: c.phone, name: c.name, phone: c.phone })),
            alertHistory: [],
            messageHistory: [],
            deepfakeHistory: [],
            callHistory: [],
            contactsPermission: true,
            securityQuestions: [],
            riskThreshold: 70,
            autoHangupHighRisk: false,
            isSeniorMode: false,
            blockedNumbers: [],
            plan: 'free',
            usage: {
                deepfakeScans: 0,
                messageScans: 0,
                callLookups: 0,
                lastResetDate: new Date().toISOString().split('T')[0]
            }
          };
        }

        finalUser = checkDailyReset(finalUser);
        persistUser(finalUser);
        localStorage.setItem('truthshield_token', 'mock_token_' + phone);
        resolve();
      }, 500);
    });
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('truthshield_token');
    localStorage.removeItem('truthshield_profile_cache');
    setIsOnboarding(false);
  };

  const completeOnboarding = () => {
      setIsOnboarding(false);
  };

  // --- ACCESSIBILITY FUNCTIONS ---
  const triggerHaptic = useCallback((type: 'success' | 'error' | 'tap' = 'tap') => {
    if (navigator.vibrate) {
        switch(type) {
            case 'success': navigator.vibrate([50, 50, 50]); break; // Dub-dub-dub
            case 'error': navigator.vibrate([200, 50, 200]); break; // Buzz-Buzz
            case 'tap': navigator.vibrate(50); break; // Tick
        }
    }
  }, []);

  const speakUI = useCallback((text: string) => {
      if (!user?.isSeniorMode) return;
      if ('speechSynthesis' in window) {
          window.speechSynthesis.cancel();
          const utterance = new SpeechSynthesisUtterance(text);
          utterance.lang = 'vi-VN';
          utterance.rate = 0.9;
          window.speechSynthesis.speak(utterance);
      }
  }, [user?.isSeniorMode]);

  // --- FEATURE GATING & LIMITS ---

  const checkLimit = (feature: 'deepfake' | 'message' | 'lookup'): boolean => {
      if (!user) return false;
      if (user.plan === 'monthly' || user.plan === 'yearly') return true; 

      const usage = user.usage;
      if (feature === 'deepfake') return usage.deepfakeScans < LIMITS.FREE.DEEPFAKE_SCANS;
      if (feature === 'message') return usage.messageScans < LIMITS.FREE.MESSAGE_SCANS;
      if (feature === 'lookup') return usage.callLookups < LIMITS.FREE.CALL_LOOKUPS;
      
      return false;
  };

  const incrementUsage = (feature: 'deepfake' | 'message' | 'lookup') => {
      if (!user || user.plan === 'monthly' || user.plan === 'yearly') return;

      const newUsage = { ...user.usage };
      if (feature === 'deepfake') newUsage.deepfakeScans += 1;
      if (feature === 'message') newUsage.messageScans += 1;
      if (feature === 'lookup') newUsage.callLookups += 1;

      const updatedUser = { ...user, usage: newUsage };
      persistUser(updatedUser);
  };

  // --- NEW FEATURES IMPLEMENTATION ---

  const lookupPhoneNumber = async (phone: string): Promise<PhoneLookupResult | null> => {
      return new Promise<PhoneLookupResult | null>((resolve) => {
          setTimeout(() => {
              const normalized = phone.replace(/\s/g, '');
              const result = MOCK_PHONE_DATABASE[normalized];
              
              if (result) {
                  resolve(result);
              } else {
                  const isRandomSpam = Math.random() < 0.3; 
                  resolve({
                      phoneNumber: phone,
                      carrier: 'Unknown / Chưa xác định',
                      tags: isRandomSpam ? ['spam'] : [],
                      reportCount: isRandomSpam ? Math.floor(Math.random() * 20) : 0,
                      reputationScore: isRandomSpam ? 45 : 80,
                      communityLabel: isRandomSpam ? 'Có báo cáo rải rác' : 'Chưa có báo cáo từ cộng đồng'
                  });
              }
          }, 400); 
      });
  };

  const reportPhoneNumber = async (phone: string, type: 'scam' | 'spam' | 'safe', label: string) => {
      return new Promise<void>((resolve) => {
          setTimeout(() => {
              const normalized = phone.replace(/\s/g, '');
              MOCK_PHONE_DATABASE[normalized] = {
                  phoneNumber: phone,
                  carrier: 'Unknown',
                  tags: [type],
                  reportCount: (MOCK_PHONE_DATABASE[normalized]?.reportCount || 0) + 1,
                  reputationScore: type === 'safe' ? 100 : 10,
                  communityLabel: label
              };
              resolve();
          }, 800);
      });
  };

  const upgradeSubscription = (plan: SubscriptionPlan) => {
      if (user) {
          const updated = { ...user, plan };
          persistUser(updated);
      }
  };

  const toggleSeniorMode = () => {
      if (user) {
          const newState = !user.isSeniorMode;
          const updated = { ...user, isSeniorMode: newState };
          persistUser(updated);
          
          triggerHaptic('success');
          speakUI(newState ? "Đã bật chế độ cho người cao tuổi" : "Đã tắt chế độ người cao tuổi");
      }
  };

  const role = user?.isSeniorMode ? 'elder' : 'user';

  return (
    <AuthContext.Provider value={{ 
      user, 
      isLoading,
      isOnboarding,
      completeOnboarding,
      login, 
      logout,
      incomingCall,
      setIncomingCall,
      isOnline,
      isSeniorMode: user?.isSeniorMode || false,
      lookupPhoneNumber,
      reportPhoneNumber,
      toggleSeniorMode,
      upgradeSubscription,
      checkLimit,
      incrementUsage,
      role,
      triggerHaptic,
      speakUI,
      ...userActions,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
