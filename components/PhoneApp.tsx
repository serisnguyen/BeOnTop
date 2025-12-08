
import React, { useState } from 'react';
import { 
  Phone, Clock, Users, Delete, PhoneOutgoing, 
  ShieldCheck, ShieldAlert, CheckCircle2, MoreVertical,
  Plus, Search, UserPlus, X, Camera
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

type PhoneTab = 'keypad' | 'recents' | 'contacts';

const PhoneApp: React.FC = () => {
  const { user, isSeniorMode, setIncomingCall, addContact } = useAuth();
  const [activeTab, setActiveTab] = useState<PhoneTab>('recents');
  const [dialNumber, setDialNumber] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  // Add Contact State
  const [showAddContactModal, setShowAddContactModal] = useState(false);
  const [newContactName, setNewContactName] = useState('');
  const [newContactPhone, setNewContactPhone] = useState('');

  // --- ACTIONS ---
  const handleDigitPress = (digit: string) => {
    if (dialNumber.length < 15) {
      setDialNumber(prev => prev + digit);
    }
  };

  const handleDelete = () => {
    setDialNumber(prev => prev.slice(0, -1));
  };

  const handleCall = () => {
    if (!dialNumber) return;
    
    // Simulate Outgoing Call
    setIncomingCall({
        id: Date.now().toString(),
        phoneNumber: dialNumber,
        direction: 'outgoing', // Custom direction
        timestamp: Date.now(),
        duration: 0,
        riskStatus: 'safe', // Default safe for outgoing unless blocked
        contactName: user?.contacts.find(c => c.phone === dialNumber)?.name
    });
  };

  const openAddContactModal = (phone?: string) => {
      setNewContactPhone(phone || dialNumber);
      setNewContactName('');
      setShowAddContactModal(true);
  };

  const handleSaveContact = () => {
      if (!newContactName || !newContactPhone) {
          alert("Vui lòng nhập tên và số điện thoại.");
          return;
      }
      addContact({
          name: newContactName,
          phone: newContactPhone
      });
      setShowAddContactModal(false);
      setNewContactName('');
      setNewContactPhone('');
      alert("Đã lưu liên hệ thành công!");
      setActiveTab('contacts'); // Switch to contacts to show it
  };

  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleString('vi-VN', {
      hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit'
    });
  };

  // --- RENDER KEYPAD ---
  const renderKeypad = () => (
    <div className="flex flex-col min-h-full justify-center pb-8 pt-6 relative">
        {/* Quick Add Button */}
        {!dialNumber && (
            <button 
                onClick={() => openAddContactModal()}
                className="absolute top-4 right-6 p-2 bg-blue-50 text-blue-600 rounded-full hover:bg-blue-100 transition-colors flex items-center gap-2"
                title="Thêm danh bạ thủ công"
            >
                <Plus size={20} /> <span className="text-xs font-bold">Thêm mới</span>
            </button>
        )}

        {/* Display */}
        <div className="flex-none flex flex-col items-center justify-center mb-6 transition-all px-4">
            <input 
                readOnly
                value={dialNumber}
                className={`w-full text-center bg-transparent outline-none font-black text-slate-900 placeholder-slate-300 placeholder:font-bold ${
                    dialNumber.length > 10 ? 'text-3xl md:text-5xl' : 'text-5xl md:text-7xl tracking-tighter'
                }`}
                placeholder={dialNumber ? "" : "Nhập số..."}
            />
            {dialNumber && (
                <button 
                    onClick={() => openAddContactModal()} 
                    className="text-blue-600 font-bold text-sm mt-2 flex items-center gap-1 bg-blue-50 px-3 py-1.5 rounded-full hover:bg-blue-100 transition-colors"
                >
                    <UserPlus size={16} /> Thêm vào danh bạ
                </button>
            )}
        </div>

        {/* Grid */}
        <div className="grid grid-cols-3 gap-x-6 gap-y-4 max-w-xs mx-auto w-full px-4 flex-none">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, '*', 0, '#'].map((item) => (
                <button 
                    key={item}
                    onClick={() => handleDigitPress(item.toString())}
                    className={`aspect-square rounded-full flex flex-col items-center justify-center transition-all active:scale-95 active:bg-slate-200 ${
                        isSeniorMode 
                        ? 'bg-slate-100 text-4xl font-black text-slate-900' 
                        : 'bg-slate-50 hover:bg-slate-100 text-3xl font-bold text-slate-900'
                    }`}
                >
                    {item}
                    {typeof item === 'number' && item > 1 && item < 10 && (
                        <span className="text-[10px] font-bold text-slate-400 -mt-1 tracking-widest uppercase">
                           {['ABC', 'DEF', 'GHI', 'JKL', 'MNO', 'PQRS', 'TUV', 'WXYZ'][item - 2]}
                        </span>
                    )}
                </button>
            ))}
        </div>

        {/* Action Row */}
        <div className="grid grid-cols-3 max-w-xs mx-auto w-full px-4 mt-6 items-center flex-none">
            <div className="flex justify-center">
                {/* Empty left slot */}
            </div>
            <div className="flex justify-center">
                <button 
                    onClick={handleCall}
                    disabled={!dialNumber}
                    className={`rounded-full bg-green-500 text-white flex items-center justify-center shadow-lg shadow-green-200 active:scale-95 transition-all ${
                        isSeniorMode ? 'w-24 h-24' : 'w-20 h-20'
                    }`}
                >
                    <Phone size={isSeniorMode ? 40 : 32} fill="currentColor" />
                </button>
            </div>
            <div className="flex justify-center">
                {dialNumber && (
                    <button 
                        onClick={handleDelete}
                        onContextMenu={(e) => { e.preventDefault(); setDialNumber(''); }}
                        className="w-16 h-16 rounded-full flex items-center justify-center text-slate-400 hover:bg-slate-100 active:text-slate-600"
                    >
                        <Delete size={28} />
                    </button>
                )}
            </div>
        </div>
    </div>
  );

  // --- RENDER RECENTS ---
  const renderRecents = () => (
    <div className="space-y-0 divide-y divide-slate-100">
        <h3 className="px-6 py-4 font-black text-2xl text-slate-900">Gần đây</h3>
        {user?.callHistory && user.callHistory.length > 0 ? (
            [...user.callHistory].reverse().map((call) => (
                <div key={call.id} className={`flex items-center justify-between hover:bg-slate-50 transition-colors ${isSeniorMode ? 'p-5' : 'px-6 py-4'}`}>
                    <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                             call.aiAnalysis && call.aiAnalysis.riskScore > 70 ? 'bg-red-100 text-red-600' :
                             call.direction === 'outgoing' ? 'bg-slate-100 text-slate-500' : 'bg-blue-50 text-blue-600'
                        }`}>
                            {call.direction === 'outgoing' ? <PhoneOutgoing size={18} /> : <Phone size={18} />}
                        </div>
                        <div>
                            <h4 className={`font-bold ${call.aiAnalysis?.riskScore > 70 ? 'text-red-600' : 'text-slate-900'} ${isSeniorMode ? 'text-xl' : 'text-base'}`}>
                                {call.contactName || call.phoneNumber}
                            </h4>
                            <div className="flex items-center gap-2 text-xs text-slate-400 font-medium">
                                <span>{call.direction === 'outgoing' ? 'Cuộc gọi đi' : 'Cuộc gọi đến'}</span>
                                <span>•</span>
                                <span>{formatTime(call.timestamp)}</span>
                            </div>
                        </div>
                    </div>
                    {call.aiAnalysis && (
                         <div className={`px-2 py-1 rounded text-[10px] font-bold uppercase border ${
                             call.aiAnalysis.riskScore > 70 ? 'bg-red-50 text-red-600 border-red-200' : 
                             'bg-green-50 text-green-600 border-green-200'
                         }`}>
                             {call.aiAnalysis.riskScore > 70 ? 'Rủi ro' : 'An toàn'}
                         </div>
                    )}
                </div>
            ))
        ) : (
            <div className="p-10 text-center text-slate-400">Chưa có cuộc gọi nào.</div>
        )}
    </div>
  );

  // --- RENDER CONTACTS ---
  const renderContacts = () => {
      const contacts = user?.contacts || [];
      const lowerTerm = searchTerm.toLowerCase();
      const filtered = contacts.filter(c => 
          c.name.toLowerCase().includes(lowerTerm) || 
          c.phone.includes(searchTerm)
      );
      
      return (
        <div>
            <div className="sticky top-0 bg-[#F0F4F8]/95 backdrop-blur-md z-10 px-4 pt-4 pb-2">
                <div className="flex items-center justify-between mb-2">
                     <h3 className="font-black text-2xl text-slate-900 px-2">Danh bạ</h3>
                     <div className="flex gap-2">
                         <button onClick={() => openAddContactModal()} className="p-2 bg-blue-600 rounded-full shadow-sm text-white"><Plus size={20}/></button>
                     </div>
                </div>
                <div className="bg-slate-200 rounded-xl flex items-center px-3 py-2">
                    <Search size={18} className="text-slate-500 mr-2" />
                    <input 
                        className="bg-transparent outline-none w-full font-bold text-slate-700 placeholder-slate-400"
                        placeholder="Tìm tên hoặc số điện thoại..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                    />
                    {searchTerm && (
                        <button 
                            onClick={() => setSearchTerm('')}
                            className="p-1 bg-slate-300 rounded-full text-slate-600 hover:bg-slate-400 transition-colors"
                        >
                            <X size={14} />
                        </button>
                    )}
                </div>
            </div>

            <div className="divide-y divide-slate-100 bg-white mx-4 rounded-2xl shadow-sm border border-slate-200 overflow-hidden mb-20 min-h-[100px]">
                {filtered.length > 0 ? (
                    filtered.map((contact) => (
                    <div 
                        key={contact.id} 
                        onClick={() => {
                            setDialNumber(contact.phone);
                            setActiveTab('keypad');
                        }}
                        className={`flex items-center justify-between hover:bg-slate-50 cursor-pointer ${isSeniorMode ? 'p-5' : 'p-4'}`}
                    >
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-500">
                                {contact.name.charAt(0)}
                            </div>
                            <div>
                                <h4 className={`font-bold text-slate-900 ${isSeniorMode ? 'text-lg' : 'text-base'}`}>{contact.name}</h4>
                                <p className="text-slate-400 text-xs">{contact.phone}</p>
                            </div>
                        </div>
                    </div>
                ))
                ) : (
                    <div className="flex flex-col items-center justify-center py-10 text-slate-400">
                        <Search size={32} className="mb-2 opacity-50" />
                        <p className="font-medium">Không tìm thấy liên hệ</p>
                    </div>
                )}
            </div>
        </div>
      );
  };

  return (
    <div className={`h-full flex flex-col bg-[#F0F4F8] pt-safe md:pt-4 max-w-3xl mx-auto w-full animate-in fade-in duration-300`}>
       
       {/* Main Content Area */}
       <div className="flex-1 overflow-y-auto no-scrollbar relative">
           {activeTab === 'keypad' && renderKeypad()}
           {activeTab === 'recents' && renderRecents()}
           {activeTab === 'contacts' && renderContacts()}
       </div>

       {/* Add Contact Modal */}
       {showAddContactModal && (
           <div className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
               <div className="bg-white w-full max-w-sm rounded-[32px] p-6 shadow-2xl animate-in zoom-in duration-200">
                   <div className="flex justify-between items-center mb-6">
                       <h3 className="font-bold text-xl text-slate-900">Thêm Liên Hệ Mới</h3>
                       <button onClick={() => setShowAddContactModal(false)} className="p-2 bg-slate-100 rounded-full text-slate-500 hover:bg-slate-200">
                           <X size={20} />
                       </button>
                   </div>
                   
                   <div className="flex flex-col items-center mb-6">
                       <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center border-4 border-white shadow-lg mb-2 text-slate-300 relative overflow-hidden group">
                           {newContactName ? (
                               <span className="text-3xl font-black text-blue-500">{newContactName.charAt(0)}</span>
                           ) : (
                               <Camera size={32} />
                           )}
                           {/* Fake Avatar Upload */}
                           <div className="absolute inset-0 bg-black/10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                               <Plus className="text-white" />
                           </div>
                       </div>
                       <span className="text-xs font-bold text-slate-400 uppercase">Ảnh đại diện</span>
                   </div>

                   <div className="space-y-4">
                       <div>
                           <label className="text-xs font-bold text-slate-500 uppercase ml-2">Tên liên hệ</label>
                           <input 
                               autoFocus
                               className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 font-bold text-slate-800 outline-none focus:ring-2 focus:ring-blue-500"
                               placeholder="Nhập tên..."
                               value={newContactName}
                               onChange={e => setNewContactName(e.target.value)}
                           />
                       </div>
                       <div>
                           <label className="text-xs font-bold text-slate-500 uppercase ml-2">Số điện thoại</label>
                           <input 
                               className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 font-bold text-slate-800 outline-none focus:ring-2 focus:ring-blue-500"
                               placeholder="09..."
                               value={newContactPhone}
                               onChange={e => setNewContactPhone(e.target.value)}
                               type="tel"
                           />
                       </div>

                       <div className="flex gap-3 mt-6">
                           <button 
                               onClick={() => setShowAddContactModal(false)}
                               className="flex-1 py-3 bg-slate-100 text-slate-600 rounded-xl font-bold hover:bg-slate-200 transition-colors"
                           >
                               Hủy
                           </button>
                           <button 
                               onClick={handleSaveContact}
                               className="flex-1 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200"
                           >
                               Lưu Lại
                           </button>
                       </div>
                   </div>
               </div>
           </div>
       )}

       {/* Bottom Tab Bar (Local for Phone App) */}
       <div className="bg-white border-t border-slate-200 px-6 py-2 flex justify-around items-center pb-safe md:pb-2">
           <button 
                onClick={() => setActiveTab('recents')}
                className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all ${activeTab === 'recents' ? 'text-blue-600' : 'text-slate-400'}`}
           >
               <Clock size={24} strokeWidth={activeTab === 'recents' ? 3 : 2} />
               <span className="text-[10px] font-bold uppercase">Gần đây</span>
           </button>
           
           <button 
                onClick={() => setActiveTab('keypad')}
                className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all ${activeTab === 'keypad' ? 'text-blue-600' : 'text-slate-400'}`}
           >
                {/* Visual indicator for Keypad being "Active" Dialer */}
               <div className={`w-14 h-14 rounded-full flex items-center justify-center -mt-8 border-4 border-[#F0F4F8] ${activeTab === 'keypad' ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' : 'bg-slate-200 text-slate-500'}`}>
                   <div className="grid grid-cols-3 gap-0.5">
                       {[...Array(9)].map((_,i) => <div key={i} className="w-1 h-1 bg-current rounded-full"></div>)}
                   </div>
               </div>
               <span className="text-[10px] font-bold uppercase">Bàn phím</span>
           </button>

           <button 
                onClick={() => setActiveTab('contacts')}
                className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all ${activeTab === 'contacts' ? 'text-blue-600' : 'text-slate-400'}`}
           >
               <Users size={24} strokeWidth={activeTab === 'contacts' ? 3 : 2} />
               <span className="text-[10px] font-bold uppercase">Danh bạ</span>
           </button>
       </div>
    </div>
  );
};

export default PhoneApp;
