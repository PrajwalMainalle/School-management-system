import React from 'react';
import { AlertOctagon, RotateCcw, Home, ChevronDown, ChevronUp } from 'lucide-react';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      showDetails: false,
    };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught a render exception:', error, errorInfo);
    this.setState({ errorInfo });
  }

  handleReload = () => {
    window.location.reload();
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  toggleDetails = () => {
    this.setState((prev) => ({ showDetails: !prev.showDetails }));
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-[500px] flex items-center justify-center p-6">
          <div className="w-full max-w-xl bg-white border border-slate-200/90 rounded-3xl p-8 shadow-xl text-center space-y-6">
            {/* Warning Icon Banner */}
            <div className="w-16 h-16 rounded-2xl bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center mx-auto shadow-inner">
              <AlertOctagon className="w-8 h-8" />
            </div>

            {/* Title & Description */}
            <div className="space-y-2">
              <span className="px-3 py-1 bg-rose-100 text-rose-700 text-[11px] font-extrabold rounded-full uppercase tracking-wider">
                Application Rendering Notice
              </span>
              <h2 className="text-xl md:text-2xl font-extrabold text-slate-800 tracking-tight">
                Something went wrong loading this view
              </h2>
              <p className="text-slate-500 text-xs md:text-sm max-w-md mx-auto leading-relaxed">
                An unexpected interface rendering issue was caught. We prevented the screen from turning blank so you can safely reload or navigate back.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={this.handleReload}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-xs font-bold transition-all shadow-md hover:shadow-lg cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Reload Page</span>
              </button>

              <button
                type="button"
                onClick={this.handleGoHome}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all cursor-pointer"
              >
                <Home className="w-4 h-4" />
                <span>Back to Dashboard</span>
              </button>
            </div>

            {/* Expandable Technical Details for Troubleshooting */}
            {this.state.error && (
              <div className="pt-4 border-t border-slate-100 text-left">
                <button
                  type="button"
                  onClick={this.toggleDetails}
                  className="flex items-center justify-between w-full text-xs font-semibold text-slate-500 hover:text-slate-700 py-1"
                >
                  <span>Technical details</span>
                  {this.state.showDetails ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>

                {this.state.showDetails && (
                  <div className="mt-2 p-3 bg-slate-900 rounded-xl text-[11px] font-mono text-rose-300 overflow-x-auto max-h-48 whitespace-pre-wrap select-text">
                    <p className="font-bold text-white mb-1">
                      {this.state.error.toString()}
                    </p>
                    {this.state.errorInfo?.componentStack && (
                      <p className="text-slate-400 text-[10px]">
                        {this.state.errorInfo.componentStack}
                      </p>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
