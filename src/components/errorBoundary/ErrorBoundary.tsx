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

    componentDidCatch(error: Error) {
        console.error("ErrorBoundary caught an error:", error);
    }

    render() {
        if (this.state.hasError) {
            return <h2>Something went wrong. Please try again later.</h2>;
        }
        return this.props.children;
    }
}

export default ErrorBoundary;