import * as React from "react";

export interface ILogger {
  error: <TContext extends Object = any>(message: string, context?: TContext) => void;
  info: <TContext extends Object = any>(message: string, context?: TContext) => void;
  pageView: <TContext extends Object = any>(pageName: string, context?: TContext) => void;
}

class ConsoleLogger {
  log<TContext extends Object = any>({
    context,
    label,
    level,
    message,
  }: {
    context?: TContext;
    label: string;
    level: "error" | "info";
    message: string;
  }) {
    if (process.env.NODE_ENV !== "production") {
      console[level](`[${label}]: ${message}`, context);
    }
  }
}

const WebAppLogger = new ConsoleLogger();

export function useLogger(label: string): ILogger {
  const loggerRef = React.useRef<ILogger>({
    error: <TContext extends Object = any>(message: string, context?: TContext) => {
      WebAppLogger.log({
        context,
        label,
        level: "error",
        message,
      });
    },
    info: <TContext extends Object = any>(message: string, context?: TContext) => {
      WebAppLogger.log({
        context,
        label,
        level: "info",
        message,
      });
    },
    pageView: <TContext extends Object = any>(pageName: string, context?: TContext) => {
      WebAppLogger.log({
        context,
        label,
        level: "info",
        message: `[Page]: ${pageName}`,
      });
    },
  });
  return loggerRef.current;
}

export type ComponentLoggingProps = {
  logger?: ILogger;
};

export function withLogging<TComponentProps = any>(label: string) {
  return (
    WrappedComponent: React.ComponentType<TComponentProps & ComponentLoggingProps>,
  ): React.ComponentType<TComponentProps & ComponentLoggingProps> => {
    return function WithLogging(props: TComponentProps & ComponentLoggingProps) {
      const logger = useLogger(label);
      return <WrappedComponent {...props} logger={logger} />;
    };
  };
}
