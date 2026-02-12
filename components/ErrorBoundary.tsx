import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertCircle, RefreshCw, Home } from 'lucide-react';

interface Props {
    children: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
    errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false,
        error: null,
        errorInfo: null
    };

    public static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error, errorInfo: null };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error('Uncaught error:', error, errorInfo);
        this.setState({ errorInfo });
    }

    public render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen w-full flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900 p-6 text-center">
                    <div className="w-20 h-20 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mb-6">
                        <AlertCircle className="w-10 h-10 text-red-500" />
                    </div>

                    <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                        哎呀，出错了
                    </h1>

                    <p className="text-gray-600 dark:text-gray-400 max-w-sm mb-8">
                        应用程序遇到了一些问题。我们已经记录了错误，请尝试刷新页面。
                    </p>

                    <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 w-full max-w-md mb-8 text-left overflow-hidden">
                        <p className="text-xs font-mono text-red-500 break-words">
                            {this.state.error?.toString()}
                        </p>
                        {this.state.errorInfo && (
                            <details className="mt-2">
                                <summary className="text-xs text-gray-400 cursor-pointer hover:text-gray-600">查看详细堆栈</summary>
                                <pre className="mt-2 text-[10px] text-gray-500 overflow-x-auto whitespace-pre-wrap">
                                    {this.state.errorInfo.componentStack}
                                </pre>
                            </details>
                        )}
                    </div>

                    <div className="flex gap-4">
                        <button
                            onClick={() => window.location.reload()}
                            className="flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-xl font-medium hover:bg-primary/90 transition-colors shadow-lg shadow-primary/30"
                        >
                            <RefreshCw className="w-4 h-4" />
                            刷新页面
                        </button>

                        <button
                            onClick={() => {
                                try {
                                    localStorage.removeItem('gifts_auth_token');
                                    localStorage.removeItem('doubao_api_key');
                                    localStorage.removeItem('app-theme');
                                    localStorage.removeItem('gifts_cloud_only_migration_v1');
                                    localStorage.removeItem('gifts_timeline_view_mode');
                                    localStorage.removeItem('gifts_timeline_sort_order');
                                } catch {}
                                window.location.href = '/';
                                setTimeout(() => window.location.reload(), 100);
                            }}
                            className="flex items-center gap-2 px-6 py-3 bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-xl font-medium hover:bg-gray-300 dark:hover:bg-gray-700 transition-colors"
                        >
                            <Home className="w-4 h-4" />
                            重置应用
                        </button>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}
