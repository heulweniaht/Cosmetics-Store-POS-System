// Component Button tái sử dụng
import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger';
}

export const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'primary', 
  ...props 
}) => {
  const getVariantStyles = () => {
    switch (variant) {
      case 'secondary':
        return { background: '#6c757d', color: 'white' };
      case 'danger':
        return { background: '#dc3545', color: 'white' };
      default:
        return { background: '#007bff', color: 'white' };
    }
  };

  return (
    <button
      {...props}
      style={{
        padding: '0.5rem 1rem',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer',
        fontSize: '1rem',
        ...getVariantStyles(),
        ...props.style
      }}
    >
      {children}
    </button>
  );
};