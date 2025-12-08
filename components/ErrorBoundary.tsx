import React, { ErrorInfo, ReactNode } from 'react';
import { AlertOctagon, RefreshCw } from 'lucide-react';

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends React.Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-slate-50 text-center">
            <div className="bg-red-100 p-4 rounded-full mb-4 animate-bounce">
                <AlertOctagon size={48} className="text-red-600" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900 mb-2">Đã xảy ra lỗi hệ thống</h1>
            <p className="text-slate-500 mb-6 max-w-md">
                Xin lỗi, ứng dụng gặp sự cố không mong muốn. Vui lòng tải lại trang.
            </p>
            <div className="bg-slate-100 p-4 rounded-xl mb-6 text-left w-full max-w-md overflow-auto max-h-32 border border-slate-200 shadow-inner">
                <code className="text-xs text-slate-600 font-mono">
                    {this.state.error?.toString()}
                </code>
            </div>
            <button 
                onClick={() => window.location.reload()}
                className="bg-blue-600 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200"
            >
                <RefreshCw size={20} /> Tải lại ứng dụng
            </button>
        </div>
      );
    }

    // Workaround for TypeScript error: Property 'props' does not exist on type 'ErrorBoundary'
    return (this as any).props.children;
  }
}

export default ErrorBoundary;