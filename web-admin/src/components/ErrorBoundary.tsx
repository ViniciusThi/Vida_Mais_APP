import { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('ErrorBoundary:', error, info.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center min-h-screen gap-4 p-8 text-center bg-gray-50">
          <div className="text-6xl">⚠️</div>
          <h1 className="text-2xl font-bold text-gray-800">Algo deu errado</h1>
          <p className="text-gray-500 max-w-md">
            Ocorreu um erro inesperado. Recarregue a página ou entre em contato com o suporte.
          </p>
          <button
            onClick={() => {
              this.setState({ hasError: false });
              window.location.href = '/';
            }}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            Voltar ao início
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
