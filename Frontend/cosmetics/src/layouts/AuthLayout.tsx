import { Outlet } from 'react-router-dom';

export const AuthLayout = () => {
  return (
    <div style={{
      height: '100%',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '10px'
    }}>
      <div style={{
        background: 'white',
        borderRadius: '12px',
        boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
        width: '100%',
        maxWidth: '1280px'
      }}>
        <Outlet />
      </div>
    </div>
  );
};