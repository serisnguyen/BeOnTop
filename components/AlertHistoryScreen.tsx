
import React from 'react';
import { ArrowLeft, AlertTriangle, ShieldAlert, MessageSquareWarning, Trash2, Clock } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface AlertHistoryScreenProps {
  onBack: () => void;
}

const AlertHistoryScreen: React.FC<AlertHistoryScreenProps> = ({ onBack }) => {
  const { user, clearAlertHistory, isSeniorMode } = useAuth();

  const getIcon = (type: string) => {
    const size = isSeniorMode ? 32 : 24;
    switch (type) {
      case 'deepfake':
        return <ShieldAlert size={size} className="text-red-600" />;
      case 'scam_msg':
        return <MessageSquareWarning size={size} className="text-amber-600" />;
      default:
        return <AlertTriangle size={size} className="text-slate-500" />;
    }
  };

  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
  };

  const handleClearHistory = () => {
    if (window.confirm("CẢNH BÁO: Bạn có chắc chắn muốn xóa toàn bộ lịch sử cảnh báo không? Hành động này không thể hoàn tác.")) {
        clearAlertHistory();
    }
  };

  return (
    <div className={`p-6 pt-20 md:pt-10 pb-32 min-h-screen max-w-2xl mx-auto animate-in fade-in duration-300 ${isSeniorMode ? 'text-lg' : ''}`}>
        
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
            <button 
                onClick={onBack}
                className="p-2 hover:bg-slate-100 rounded-full transition-colors"
                aria-label="Quay lại"
            >
                <ArrowLeft size={isSeniorMode ? 32 : 24} className="text-slate-700" />
            </button>
            <div>
                <h2 className={`${isSeniorMode ? 'text-3xl' : 'text-2xl'} font-bold text-slate-900`}>Lịch Sử Cảnh Báo</h2>
                <p className={`${isSeniorMode ? 'text-lg' : 'text-sm'} text-slate-500`}>Nhật ký các sự kiện an ninh</p>
            </div>
            <div className="ml-auto">
                <button 
                    onClick={handleClearHistory}
                    className="p-3 text-red-500 hover:bg-red-50 rounded-full transition-colors"
                    title="Xóa lịch sử"
                    aria-label="Xóa toàn bộ lịch sử cảnh báo"
                >
                    <Trash2 size={isSeniorMode ? 28 : 20} />
                </button>
            </div>
        </div>

        {/* List */}
        <div className="space-y-4">
            {user?.alertHistory && user.alertHistory.length > 0 ? (
                user.alertHistory.map((alert) => (
                    <div key={alert.id} className={`bg-white rounded-2xl border border-slate-200 shadow-sm flex gap-4 ${isSeniorMode ? 'p-6' : 'p-4'}`}>
                        <div className={`rounded-xl flex items-center justify-center flex-shrink-0 ${
                            isSeniorMode ? 'w-16 h-16' : 'w-12 h-12'
                        } ${
                            alert.type === 'deepfake' ? 'bg-red-100' :
                            alert.type === 'scam_msg' ? 'bg-amber-100' :
                            'bg-blue-100'
                        }`}>
                            {getIcon(alert.type)}
                        </div>
                        <div className="flex-1">
                            <div className="flex justify-between items-start">
                                <h3 className={`font-bold text-slate-800 uppercase ${isSeniorMode ? 'text-xl' : 'text-base'}`}>
                                    {alert.type === 'deepfake' ? 'Cảnh Báo Deepfake' :
                                     alert.type === 'scam_msg' ? 'Tin Nhắn Rác' :
                                     'Cảnh Báo Cộng Đồng'}
                                </h3>
                                <span className={`text-slate-400 flex items-center gap-1 bg-slate-50 px-2 py-1 rounded ${isSeniorMode ? 'text-sm' : 'text-xs'}`}>
                                    <Clock size={isSeniorMode ? 14 : 10} />
                                    {formatTime(alert.timestamp)}
                                </span>
                            </div>
                            <p className={`text-slate-600 mt-1 ${isSeniorMode ? 'text-lg' : 'text-sm'}`}>{alert.details}</p>
                            
                            {alert.riskScore > 0 && (
                                <div className="mt-3 flex items-center gap-2">
                                    <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                                        <div 
                                            className={`h-full rounded-full ${
                                                alert.riskScore > 80 ? 'bg-red-500' :
                                                alert.riskScore > 50 ? 'bg-amber-500' : 'bg-green-500'
                                            }`}
                                            style={{ width: `${alert.riskScore}%` }}
                                        ></div>
                                    </div>
                                    <span className={`font-bold ${isSeniorMode ? 'text-base' : 'text-xs'} ${
                                        alert.riskScore > 80 ? 'text-red-600' :
                                        alert.riskScore > 50 ? 'text-amber-600' : 'text-green-600'
                                    }`}>
                                        {alert.riskScore}% Rủi ro
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>
                ))
            ) : (
                <div className="text-center py-20">
                    <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                        <ShieldAlert size={40} className="text-slate-300" />
                    </div>
                    <h3 className="text-slate-500 font-bold">Chưa có cảnh báo nào</h3>
                    <p className="text-slate-400 text-sm mt-2">Hệ thống an ninh của bạn đang hoạt động tốt.</p>
                </div>
            )}
        </div>

    </div>
  );
};

export default AlertHistoryScreen;
