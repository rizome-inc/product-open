// ErrorBoundary.tsx
import { ComponentLoggingProps, withLogging } from "@/types";
import React, { Component, ErrorInfo } from "react";

type ErrorBoundaryProps = React.PropsWithChildren<ComponentLoggingProps>;

type ErrorBoundaryState = {
  hasError: boolean;
  error: Error | null;
};

class ErrorBoundaryBase extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  public readonly state: ErrorBoundaryState;
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      error: null,
      hasError: false,
    };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.props.logger?.error?.(error.message, errorInfo);
  }

  render() {
    const { hasError, error } = this.state;
    const { children } = this.props;

    if (hasError) {
      return <div>Something went wrong: {error?.message}</div>;
    }

    return children;
  }
}

export const ErrorBoundary = withLogging("ErrorBoundary")(ErrorBoundaryBase);
