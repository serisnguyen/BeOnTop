
import { 
  User, 
  ContactItem,
  AlertHistoryItem,
  MessageAnalysisLog,
  CallLogItem,
  DeepfakeScanLog
} from '../types';

interface UseUserProfileProps {
  user: User | null;
  persistUser: (user: User) => void;
}

export const useUserProfile = ({ user, persistUser }: UseUserProfileProps) => {

  const addContact = (contact: Omit<ContactItem, 'id'>) => {
    if (user) {
      const newContact: ContactItem = {
        id: Date.now().toString(),
        name: contact.name,
        phone: contact.phone
      };
      // Ensure contacts array exists
      const currentContacts = user.contacts || [];
      const updatedUser = { ...user, contacts: [...currentContacts, newContact] };
      persistUser(updatedUser);
    }
  };

  const addAlertToHistory = (alert: Omit<AlertHistoryItem, 'id' | 'timestamp'>) => {
    if (user) {
      const newAlert: AlertHistoryItem = {
        ...alert,
        id: Date.now().toString(),
        timestamp: Date.now()
      };
      const updatedUser = { ...user, alertHistory: [newAlert, ...(user.alertHistory || [])] };
      persistUser(updatedUser);
    }
  };

  const clearAlertHistory = () => {
    if (user) {
      persistUser({ ...user, alertHistory: [] });
    }
  };

  const addMessageAnalysis = (log: Omit<MessageAnalysisLog, 'id' | 'timestamp'>) => {
    if (user) {
      const newLog: MessageAnalysisLog = {
        ...log,
        id: Date.now().toString(),
        timestamp: Date.now()
      };
      const updatedUser = { ...user, messageHistory: [newLog, ...(user.messageHistory || [])] };
      persistUser(updatedUser);
    }
  };

  const clearMessageHistory = () => {
    if (user) {
      persistUser({ ...user, messageHistory: [] });
    }
  };

  const updateMessageHistoryItem = (id: string, result: 'safe' | 'suspicious' | 'scam', explanation: string) => {
    if (user) {
      const updatedHistory = (user.messageHistory || []).map(item => 
        item.id === id ? { ...item, result, explanation } : item
      );
      persistUser({ ...user, messageHistory: updatedHistory });
    }
  };

  const addDeepfakeScan = (log: Omit<DeepfakeScanLog, 'id' | 'timestamp'>) => {
    if (user) {
      const newLog: DeepfakeScanLog = {
        ...log,
        id: Date.now().toString(),
        timestamp: Date.now()
      };
      // Initialize if undefined
      const currentHistory = user.deepfakeHistory || [];
      const updatedUser = { ...user, deepfakeHistory: [newLog, ...currentHistory] };
      persistUser(updatedUser);
    }
  };

  const clearDeepfakeHistory = () => {
    if (user) {
      persistUser({ ...user, deepfakeHistory: [] });
    }
  };

  const updateCallHistoryItem = (callId: string, updates: Partial<CallLogItem>) => {
    if (user) {
      const updatedHistory = (user.callHistory || []).map(call => 
        call.id === callId ? { ...call, ...updates } : call
      );
      persistUser({ ...user, callHistory: updatedHistory });
    }
  };

  const updateSettings = (settings: Partial<User>) => {
    if (user) {
      persistUser({ ...user, ...settings });
    }
  };

  const blockNumber = (phone: string) => {
    if (user) {
      const currentBlocked = user.blockedNumbers || [];
      if (!currentBlocked.includes(phone)) {
        persistUser({ ...user, blockedNumbers: [...currentBlocked, phone] });
      }
    }
  };

  const unblockNumber = (phone: string) => {
    if (user) {
      const currentBlocked = user.blockedNumbers || [];
      persistUser({ ...user, blockedNumbers: currentBlocked.filter(p => p !== phone) });
    }
  };

  return { 
    addContact,
    addAlertToHistory,
    clearAlertHistory,
    addMessageAnalysis,
    clearMessageHistory,
    updateMessageHistoryItem,
    addDeepfakeScan,
    clearDeepfakeHistory,
    updateCallHistoryItem,
    updateSettings,
    blockNumber,
    unblockNumber
  };
};
