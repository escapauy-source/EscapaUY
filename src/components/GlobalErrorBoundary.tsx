import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
    children: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
    errorInfo: ErrorInfo | null;
}

export class GlobalErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false,
        error: null,
        errorInfo: null
    };

    public static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error, errorInfo: null };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error("Uncaught error:", error, errorInfo);
        this.setState({ errorInfo });
    }

    private handleReset = () => {
        localStorage.clear();
        window.location.href = '/';
    };

    public render() {
        if (this.state.hasError) {
            return (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-900 text-white p-8">
                    <div className="max-w-xl w-full space-y-6 bg-zinc-800 p-8 rounded-xl border border-red-500/20 shadow-2xl">
                        <h1 className="text-3xl font-bold text-red-500">Critical Error Caught</h1>

                        <div className="space-y-2">
                            <p className="text-zinc-300">Something went wrong in the application engine.</p>
                            <div className="bg-black/50 p-4 rounded-md font-mono text-xs overflow-auto max-h-48">
                                <p className="text-red-400 font-bold mb-2">{this.state.error?.message}</p>
                                <pre className="text-zinc-500">{this.state.errorInfo?.componentStack}</pre>
                            </div>
                        </div>

                        <div className="pt-4 border-t border-zinc-700">
                            <p className="text-sm text-zinc-400 mb-4">
                                The navigation or data might be corrupted. Please try resetting the application locally.
                            </p>
                            <button
                                onClick={this.handleReset}
                                className="w-full py-3 px-4 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg transition-colors flex items-center justify-center gap-2"
                            >
                                <span>⚠️ Emergency Reset & Reload</span>
                            </button>
                        </div>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}
