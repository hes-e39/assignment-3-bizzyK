// ErrorBoundary.tsx

import {Component, ReactNode} from 'react';

interface ErrorBoundaryProps {
    children: ReactNode;
}

interface ErrorBoundaryState {
    hasError: boolean;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
    state = {hasError: false};

    static getDerivedStateFromError() {
        return {hasError: true};
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
        console.error("ErrorBoundary caught an error:", error, errorInfo);
    }

    handleRetry = () => {
        this.setState({hasError: false});
    };

    render() {
        if (this.state.hasError) {
            return (
                <div style={{
                    textAlign: "center",
                    padding: "2rem",
                    border: "1px solid #ddd",
                    borderRadius: "8px",
                    background: "#f9f9f9",
                    maxWidth: "400px",
                    margin: "2rem auto"
                }}>
                    <h2 style={{ color: "#d9534f" }}>Something went wrong!</h2>
                    <p style={{ marginBottom: "1rem" }}>An unexpected error occurred. Please try again later.</p>
                    <button
                        onClick={this.handleRetry}
                        style={{
                            padding: "0.5rem 1rem",
                            backgroundColor: "#007bff",
                            color: "white",
                            border: "none",
                            borderRadius: "4px",
                            cursor: "pointer"
                        }}
                    >
                        Retry
                    </button>
                </div>
            );
        }
        return this.props.children;
    }
}

export default ErrorBoundary;