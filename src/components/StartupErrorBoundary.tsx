import { Component, type ErrorInfo, type ReactNode } from "react";
import StartupFallbackHome from "@/components/StartupFallbackHome";

type Props = {
  children: ReactNode;
  fallback?: ReactNode;
};

type State = {
  error: Error | null;
};

export default class StartupErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("[MasterChess Entry] ERROR_STATE", {
      step: "RENDER",
      message: error.message,
      componentStack: info.componentStack,
    });
  }

  render() {
    if (this.state.error) {
      return this.props.fallback ?? <StartupFallbackHome reason="render-error" />;
    }

    return this.props.children;
  }
}