
import React, { useState, useEffect } from 'react';
import { Users, Search, Phone, UserPlus, Plus, Loader2, X, AlertTriangle, ShieldCheck, ShieldAlert } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { PhoneLookupResult } from '../types';

const ContactsScreen: React.FC = () => {
  const { user, lookupPhoneNumber, isSeniorMode } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [loadingContacts, setLoadingContacts] = useState(true);
  
  // Scanning State
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState<PhoneLookupResult | null>(null);
  const [showResultModal, setShowResultModal] = useState(false);

  // Simulate initial loading
  useEffect(() => {
    const timer = setTimeout(() => {
        setLoadingContacts(false);
    }, 600);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const handler = setTimeout(() => {
        setDebouncedSearchTerm(searchTerm);
    }, 300);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  const contacts = user?.contacts || [];
  const filteredContacts = contacts.filter(c => 
      c.name.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) || 
      c.phone.includes(debouncedSearchTerm)
  );

  const handleScanContact = async (phone: string) => {
    setIsScanning(true);
    setScanResult(null);
    try {
        const result = await lookupPhoneNumber(phone);
        setScanResult(result);
        setShowResultModal(true);
    } catch (error) {
        console.error("Scan failed", error);
        alert("Không thể tra cứu số điện thoại này.");
    } finally {
        setIsScanning(false);
    }
  };

  const getScoreColor = (score: number) => {
      if (score > 80) return 'text-green-600 border-green-200 bg-green-50';
      if (score > 50) return 'text-amber-600 border-amber-200 bg-amber-50';
      return 'text-red-600 border-red-200 bg-red-50';
  };

  return (
    <div className="p-4 md:p-6 pt-20 md:pt-10 pb-32 animate-in fade-in max-w-4xl mx-auto">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-6 gap-4">
            <div>
                <h2 className="text-3xl font-black text-slate-900 mb-1">Danh Bạ</h2>
                <p className="text-slate-500">
                    Danh sách các liên hệ đã lưu.
                </p>
            </div>
        </div>

        {/* Search */}
        <div className="relative mb-6">
            <Search className="absolute left-4 top-3.5 text-slate-400" size={20} />
            <input 
                type="text"
                placeholder="Tìm kiếm danh bạ..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            />
        </div>

        {/* Contacts List */}
        <div role="region" aria-label="Danh sách danh bạ">
            {loadingContacts ? (
                <div className="flex justify-center py-20">
                    <Loader2 size={40} className="text-blue-500 animate-spin" />
                </div>
            ) : (
                <div className="space-y-3">
                    {filteredContacts.map(contact => (
                        <div key={contact.id} className="bg-white p-4 rounded-2xl border border-slate-200 flex items-center justify-between hover:shadow-sm transition-shadow">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center text-slate-500 font-bold text-lg">
                                    {contact.name.charAt(0)}
                                </div>
                                <div>
                                    <h4 className="font-bold text-slate-700">{contact.name}</h4>
                                    <p className="text-xs text-slate-400">{contact.phone}</p>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <button 
                                    onClick={() => handleScanContact(contact.phone)}
                                    className="p-2 bg-slate-100 text-slate-500 rounded-lg hover:bg-blue-50 hover:text-blue-600 transition-colors"
                                    title="Quét số điện thoại"
                                >
                                    <Search size={16} />
                                </button>
                                <button 
                                    className="p-2 bg-slate-100 text-slate-500 rounded-lg hover:bg-green-50 hover:text-green-600 transition-colors"
                                    aria-label="Gọi"
                                >
                                    <Phone size={16} />
                                </button>
                            </div>
                        </div>
                    ))}
                    {filteredContacts.length === 0 && (
                        <div className="text-center p-10 text-slate-400">
                            <Users size={48} className="mx-auto mb-4 opacity-50" />
                            <p>Không tìm thấy liên hệ nào.</p>
                        </div>
                    )}
                </div>
            )}
        </div>

        {/* Scan Result Modal */}
        {showResultModal && scanResult && (
            <div 
                className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200"
                role="dialog"
                aria-modal="true"
            >
                <div className="bg-white w-full max-w-sm rounded-[32px] overflow-hidden shadow-2xl animate-in zoom-in duration-300">
                    <div className="relative p-6 text-center border-b border-slate-100">
                        <button 
                            onClick={() => setShowResultModal(false)}
                            className="absolute top-4 right-4 p-2 bg-slate-100 rounded-full text-slate-500 hover:bg-slate-200 transition-colors"
                        >
                            <X size={20} />
                        </button>
                        
                        <div className={`mx-auto w-20 h-20 rounded-full flex items-center justify-center mb-4 border-4 ${getScoreColor(scanResult.reputationScore)} bg-opacity-10`}>
                             {scanResult.reputationScore < 50 ? <AlertTriangle size={40} className="text-red-600" /> : <ShieldCheck size={40} className={scanResult.reputationScore > 80 ? 'text-green-600' : 'text-amber-600'} />}
                        </div>
                        
                        <h3 className="text-2xl font-black text-slate-900">{scanResult.phoneNumber}</h3>
                        <p className="text-slate-500 font-bold">{scanResult.carrier}</p>
                    </div>

                    <div className="p-6">
                        <div className="grid grid-cols-2 gap-4 mb-6">
                            <div className={`text-center p-3 rounded-2xl border ${getScoreColor(scanResult.reputationScore)} bg-opacity-10`}>
                                <div className={`text-3xl font-black ${scanResult.reputationScore > 80 ? 'text-green-600' : scanResult.reputationScore > 50 ? 'text-amber-600' : 'text-red-600'}`}>
                                    {scanResult.reputationScore}
                                </div>
                                <div className="text-[10px] font-bold uppercase text-slate-500 mt-1">Điểm Uy Tín</div>
                            </div>
                            <div className="text-center p-3 rounded-2xl border border-slate-200 bg-slate-50">
                                <div className="text-3xl font-black text-slate-800">
                                    {scanResult.reportCount}
                                </div>
                                <div className="text-[10px] font-bold uppercase text-slate-500 mt-1">Lượt Báo Cáo</div>
                            </div>
                        </div>

                        <div className="mb-6">
                            <h4 className="text-xs font-bold text-slate-400 uppercase mb-2">Nhãn cộng đồng</h4>
                            <div className="flex flex-wrap gap-2">
                                {scanResult.tags.map((tag, i) => (
                                    <span key={i} className={`px-3 py-1 rounded-lg text-xs font-bold border ${
                                        tag === 'scam' ? 'bg-red-100 text-red-700 border-red-200' :
                                        tag === 'safe' ? 'bg-green-100 text-green-700 border-green-200' :
                                        'bg-blue-100 text-blue-700 border-blue-200'
                                    }`}>
                                        {tag === 'scam' ? 'Lừa đảo' : tag === 'safe' ? 'An toàn' : tag}
                                    </span>
                                ))}
                                {scanResult.tags.length === 0 && <span className="text-slate-400 italic text-sm">Chưa có nhãn</span>}
                            </div>
                        </div>

                        <button 
                            onClick={() => setShowResultModal(false)}
                            className="w-full py-3 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition-colors"
                        >
                            Đóng
                        </button>
                    </div>
                </div>
            </div>
        )}

        {isScanning && (
            <div className="fixed inset-0 z-[60] flex items-center justify-center bg-white/50 backdrop-blur-sm">
                <div className="bg-white p-4 rounded-2xl shadow-xl flex items-center gap-3">
                    <Loader2 className="animate-spin text-blue-600" size={24} />
                    <span className="font-bold text-slate-700">Đang tra cứu...</span>
                </div>
            </div>
        )}
    </div>
  );
};

export default ContactsScreen;
