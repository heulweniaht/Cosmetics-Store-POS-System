import { ReactNode } from 'react';
import { Header } from '../components/layout/Header';
import {useLocation} from "react-router-dom";

interface UserLayoutProps {
  children: ReactNode;
}

export const UserLayout = ({ children }: UserLayoutProps) => {
  const location = useLocation();
  const isSalesScreen = location.pathname === '/user/sales';
  // For sales screen, render without header and footer
  if (isSalesScreen) {
      return <div className="sales-layout">{children}</div>;
  }

  return (
    <div className="user-layout">
      <Header />
      <main style={{ 
        minHeight: 'calc(100vh - 120px)', 
        padding: '2rem',
        background: '#f8f9fa',
      }}>
        {children}
      </main>
      <footer style={{ 
        background: '#343a40', 
        color: 'white',
        padding: '1rem', 
        textAlign: 'center'
      }}>
        <p>&copy; 2025 Cosmetics POS. All rights reserved.</p>
      </footer>
    </div>
  );
};