import React, { ReactNode } from 'react';
import ErrorIcon from './ErrorIcon';
import { StyledAppBoundary } from './index.styled';

class AppErrorBoundary extends React.Component<{ children: ReactNode }, { hasError: boolean }> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    // Update state so the next render will show the fallback UI.
    return { hasError: true };
  }

  componentDidCatch() {
    // You can also log the error to an error reporting service
    // logErrorToMyService(error, errorInfo);
  }

  handleNavigateToDashboard = () => {
    // Navigate to the dashboard and reload
    window.location.href = `${import.meta.env.VITE_BASE_URL}/dashboard`;
  };

  render() {
    if (this.state.hasError) {
      return (
        <StyledAppBoundary>
          <ErrorIcon />
          <div style={{ fontSize: 30, marginTop: 4 }}>Ah! Something went wrong.</div>
          <div style={{ fontSize: 18, textAlign: 'center' }}>Brace yourself till we get the error fixed.</div>
          <div style={{ fontSize: 18, textAlign: 'center' }}>You may also refresh the page or try again later.</div>
          <button
            onClick={this.handleNavigateToDashboard}
            style={{
              marginTop: 20,
              padding: '10px 20px',
              fontSize: 16,
              borderRadius: 5,
              border: 'none',
              backgroundColor: '#007bff',
              color: 'white',
              cursor: 'pointer',
            }}
          >
            Go to Dashboard
          </button>
        </StyledAppBoundary>
      );
    } else {
      return this.props.children;
    }
  }
}

export default AppErrorBoundary;
