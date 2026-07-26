import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Dashboard ErrorBoundary caught an error:", error, errorInfo);
    this.setState({ errorInfo });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '2rem',
          backgroundColor: '#f8fafc',
          color: '#0f172a',
          fontFamily: 'Inter, Sarabun, sans-serif'
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '16px',
            padding: '2rem',
            maxWidth: '650px',
            width: '100%',
            boxShadow: '0 20px 40px -15px rgba(0, 0, 0, 0.1)',
            border: '1px solid #e2e8f0',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⚠️</div>
            <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#ef4444', marginBottom: '0.5rem' }}>
              พบข้อผิดพลาดในการประมวลผลระบบ (Rendering Notice)
            </h2>
            <p style={{ fontSize: '0.9rem', color: '#64748b', marginBottom: '1.25rem' }}>
              เกิดข้อผิดพลาดชั่วคราวขณะโหลดหรือแปลงข้อมูล กรุณากดปุ่มรีโหลดเพื่อโหลดหน้าเว็บใหม่อีกครั้ง
            </p>
            
            <div style={{
              backgroundColor: '#f1f5f9',
              padding: '0.85rem',
              borderRadius: '8px',
              textAlign: 'left',
              fontSize: '0.775rem',
              fontFamily: 'monospace',
              color: '#334155',
              maxHeight: '150px',
              overflowY: 'auto',
              marginBottom: '1.5rem'
            }}>
              {this.state.error?.toString()}
            </div>

            <button 
              onClick={() => window.location.reload()}
              style={{
                padding: '0.75rem 1.75rem',
                backgroundColor: '#0ea5e9',
                color: 'white',
                border: 'none',
                borderRadius: '10px',
                fontSize: '0.9rem',
                fontWeight: 700,
                cursor: 'pointer',
                boxShadow: '0 4px 12px rgba(14, 165, 233, 0.3)'
              }}
            >
              🔄 รีโหลดระบบ (Reload Dashboard)
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
