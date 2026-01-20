import React from 'react';

class GlobalErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null, errorInfo: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        console.error("Uncaught error:", error, errorInfo);
        this.setState({ errorInfo });
    }

    render() {
        if (this.state.hasError) {
            return (
                <div style={{
                    padding: '20px',
                    color: 'white',
                    backgroundColor: '#c0392b',
                    height: '100vh',
                    overflow: 'auto',
                    fontFamily: 'monospace',
                    zIndex: 999999,
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    width: '100%',
                    boxSizing: 'border-box'
                }}>
                    <h1>⚠️ 應用程式發生錯誤 (Crash)</h1>
                    <h2 style={{ color: '#f1c40f' }}>{this.state.error && this.state.error.toString()}</h2>
                    <details style={{ whiteSpace: 'pre-wrap', marginTop: '10px' }}>
                        <summary>詳細錯誤資訊 (Stack Trace)</summary>
                        <hr />
                        {this.state.errorInfo && this.state.errorInfo.componentStack}
                    </details>
                    <button
                        onClick={() => {
                            localStorage.clear();
                            window.location.reload();
                        }}
                        style={{
                            marginTop: '20px',
                            padding: '10px 20px',
                            fontSize: '1.2rem',
                            fontWeight: 'bold',
                            cursor: 'pointer',
                            background: 'white',
                            border: 'none',
                            borderRadius: '5px'
                        }}
                    >
                        🔄 清除快取並重啟 (Clear & Retry)
                    </button>
                    <div style={{ marginTop: '20px', fontSize: '0.8rem' }}>
                        若持續發生，請截圖此畫面回報。
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default GlobalErrorBoundary;
