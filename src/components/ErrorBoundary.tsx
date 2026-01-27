import React, { Component, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
    children: ReactNode;
    fallback?: ReactNode;
    onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = {
            hasError: false,
            error: null,
        };
    }

    static getDerivedStateFromError(error: Error): State {
        return {
            hasError: true,
            error,
        };
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
        console.error('[ErrorBoundary] Caught error:', error, errorInfo);

        // Call optional error handler
        if (this.props.onError) {
            this.props.onError(error, errorInfo);
        }

        // In production, send to error tracking service (Sentry, LogRocket, etc.)
        // if (import.meta.env.PROD) {
        //   sendToErrorTracking(error, errorInfo);
        // }
    }

    handleReset = () => {
        this.setState({
            hasError: false,
            error: null,
        });
    };

    render() {
        if (this.state.hasError) {
            // Use custom fallback if provided
            if (this.props.fallback) {
                return this.props.fallback;
            }

            // Default error UI
            return (
                <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center p-4">
                    <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl p-8 text-center">
                        {/* Error Icon */}
                        <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                            <AlertTriangle className="w-10 h-10 text-red-600" />
                        </div>

                        {/* Error Message */}
                        <h1 className="font-playfair text-2xl font-bold text-gray-900 mb-3">
                            Algo salió mal
                        </h1>
                        <p className="text-gray-600 mb-6">
                            Ha ocurrido un error inesperado. Por favor, intenta recargar la página.
                        </p>

                        {/* Error Details (only in development) */}
                        {(!import.meta.env.PROD) && this.state.error && (
                            <div className="mb-6 p-4 bg-red-50 rounded-lg text-left">
                                <p className="text-xs font-mono text-red-800 break-all">
                                    {this.state.error.toString()}
                                </p>
                            </div>
                        )}

                        {/* Actions */}
                        <div className="flex gap-3">
                            <button
                                onClick={this.handleReset}
                                className="flex-1 px-6 py-3 bg-ocean-600 text-white rounded-xl hover:bg-ocean-700 transition-colors flex items-center justify-center gap-2 font-semibold"
                            >
                                <RefreshCw className="w-5 h-5" />
                                Intentar nuevamente
                            </button>
                            <button
                                onClick={() => window.location.href = '/'}
                                className="flex-1 px-6 py-3 bg-white border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-semibold"
                            >
                                Ir al inicio
                            </button>
                        </div>

                        {/* Support Link */}
                        <p className="mt-6 text-sm text-gray-500">
                            Si el problema persiste,{' '}
                            <a href="mailto:support@escapauy.com" className="text-ocean-600 hover:underline font-semibold">
                                contáctanos
                            </a>
                        </p>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

// Convenience wrapper for functional component usage
export function withErrorBoundary<P extends object>(
    Component: React.ComponentType<P>,
    fallback?: ReactNode
) {
    return function WithErrorBoundaryWrapper(props: P) {
        return (
            <ErrorBoundary fallback={fallback}>
                <Component {...props} />
            </ErrorBoundary>
        );
    };
}
