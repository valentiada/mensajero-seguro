import { StrictMode, Component, ReactNode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Global error boundary — catches any crash that escapes inner boundaries
class RootErrorBoundary extends Component<{ children: ReactNode }, { error: Error | null }> {
  constructor(props: { children: ReactNode }) { super(props); this.state = { error: null }; }
  static getDerivedStateFromError(e: Error) { return { error: e }; }
  render() {
    if (this.state.error) {
      return (
        <div style={{
          minHeight: '100dvh', display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center', gap: 16,
          background: '#0B1A12', color: '#E8F2EA', padding: 24, textAlign: 'center',
        }}>
          <div style={{ fontSize: 48 }}>⚠️</div>
          <div style={{ fontWeight: 700, fontSize: 18 }}>Щось пішло не так</div>
          <div style={{ fontSize: 13, color: 'rgba(232,242,234,0.5)', maxWidth: 320, wordBreak: 'break-word' }}>
            {this.state.error.message}
          </div>
          <button
            onClick={() => { this.setState({ error: null }); window.location.reload(); }}
            style={{
              marginTop: 8, padding: '12px 28px', borderRadius: 12,
              background: '#E4A24B', color: '#1a0d00', fontWeight: 800,
              fontSize: 14, border: 'none', cursor: 'pointer',
            }}>
            Перезавантажити
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RootErrorBoundary>
      <App />
    </RootErrorBoundary>
  </StrictMode>,
);
