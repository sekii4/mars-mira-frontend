import { type ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export const ProtectedRoute = ({ children }: { children: ReactNode }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#f8faf8' }}>
        <div style={{ textAlign: 'center', color: '#006c49', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
          <div className="spinner" style={{
            width: '40px',
            height: '40px',
            border: '4px solid #ECFDF5',
            borderTop: '4px solid #10B981',
            borderRadius: '50%',
            animation: 'spin 0.8s linear infinite',
            margin: '0 auto 16px'
          }} />
          <p style={{ fontWeight: 600, fontSize: '14px' }}>Učitavanje...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/auth" replace />;
  }

  return <>{children}</>;
};
