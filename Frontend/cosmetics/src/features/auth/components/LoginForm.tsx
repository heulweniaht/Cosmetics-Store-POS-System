
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthProvider';

export const LoginForm: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate();
  const { login, user, isAdmin, isUser, isAuthenticated } = useAuth();

  // Watch for authentication changes
  useEffect(() => {
    if (isAuthenticated && user) {
      const userIsAdmin = isAdmin();
      const userIsUser = isUser();
      
      setTimeout(() => {
        if (userIsAdmin) {
          navigate('/admin/dashboard', { replace: true });
        } else if (userIsUser) {
          navigate('/user/home', { replace: true });
        } else {
          setError('Tài khoản không có quyền truy cập hợp lệ');
        }
      }, 200);
    }
  }, [isAuthenticated, user, navigate, isAdmin, isUser]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(username, password);
    } catch (error: unknown) {
      console.error('Login error:', error);
      const errorMessage = error && typeof error === 'object' && 'response' in error 
        ? (error as { response?: { data?: { message?: string } }; message?: string }).response?.data?.message || 
          (error as { message?: string }).message || 
          'Đăng nhập thất bại. Vui lòng thử lại!'
        : 'Đăng nhập thất bại. Vui lòng thử lại!';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };



  return (
    <div className="login-form-container">
      {/* Header */}
      <div className="login-header">
        <div className="login-icon">
          🔐
        </div>
        <h1 className="login-title">
          Chào mừng trở lại!
        </h1>
        <p className="login-subtitle">
          Đăng nhập để truy cập hệ thống POS
        </p>
      </div>
      
      {/* Error Message */}
      {error && (
        <div className="login-error">
          <span>⚠️</span>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="login-form">
        {/* Username Input */}
        <div className="input-group">
          <label className="input-label">
            👤 Tên đăng nhập
          </label>
          <input
            type="text"
            placeholder="Nhập tên đăng nhập"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            disabled={loading}
            className="input-field"
          />
        </div>

        {/* Password Input */}
        <div className="input-group input-group-last">
          <label className="input-label">
            🔒 Mật khẩu
          </label>
          <input
            type="password"
            placeholder="Nhập mật khẩu"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={loading}
            className="input-field"
          />
        </div>

        {/* Submit Button */}
        <button 
          type="submit" 
          disabled={loading}
          className={`submit-btn ${loading ? 'loading' : ''}`}
        >
          {loading ? (
            <span className="btn-content">
              <span className="spinner"></span>
              Đang đăng nhập...
            </span>
          ) : (
            <span className="btn-content">
              🚀 Đăng nhập
            </span>
          )}
        </button>

        {/* Register Link */}
        <div className="register-link">
          <p className="register-text">
            Chưa có tài khoản?{' '}
            <a href="/auth/register" className="register-link-text">
              Đăng ký ngay
            </a>
          </p>
        </div>
      </form>

      {/* Test Accounts */}
      <div className="test-accounts">
        <div className="test-accounts-title">
          🧪 Tài khoản test
        </div>
        <div className="test-accounts-content">
          <div className="test-account-item">
            👑 <strong>Admin:</strong> <code>admin</code> / <code>admin</code>
          </div>
          <div>
            👤 <strong>User:</strong> <code>tuandang111</code> / <code>123456</code>
          </div>
        </div>
      </div>

      <style>
        {`
          .login-form-container {
            padding: 2rem;
            height: 100%;
            display: flex;
            flex-direction: column;
            justify-content: center;
          }
          
          .login-header {
            text-align: center;
            margin-bottom: 2rem;
          }
          
          .login-icon {
            width: 64px;
            height: 64px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            border-radius: 16px;
            display: flex;
            align-items: center;
            justify-content: center;
            margin: 0 auto 1rem;
            font-size: 24px;
          }
          
          .login-title {
            color: #1a202c;
            margin: 0;
            font-size: 28px;
            font-weight: 700;
            margin-bottom: 8px;
          }
          
          .login-subtitle {
            color: #64748b;
            margin: 0;
            font-size: 16px;
          }
          
          .login-error {
            background: linear-gradient(135deg, #fee2e2 0%, #fecaca 100%);
            color: #dc2626;
            padding: 12px 16px;
            border-radius: 12px;
            margin-bottom: 1.5rem;
            border: 1px solid #fca5a5;
            font-size: 14px;
            display: flex;
            align-items: center;
            gap: 8px;
          }
          
          .login-form {
            flex: 1;
          }
          
          .input-group {
            margin-bottom: 1.5rem;
          }
          
          .input-group-last {
            margin-bottom: 2rem;
          }
          
          .input-label {
            text-align: left;
            display: block;
            margin-bottom: 8px;
            color: #374151;
            font-size: 14px;
            font-weight: 500;
          }
          
          .input-field {
            width: 100%;
            padding: 12px 16px;
            border: 2px solid #e1e8ed;
            border-radius: 12px;
            font-size: 16px;
            outline: none;
            box-sizing: border-box;
            transition: all 0.3s ease;
            background-color: #f8fafc;
          }
          
          .input-field:focus {
            border-color: #667eea;
            background-color: #ffffff;
            box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
          }
          
          .input-field:disabled {
            opacity: 0.6;
            cursor: not-allowed;
          }
          
          .submit-btn {
            width: 100%;
            padding: 14px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            border: none;
            border-radius: 12px;
            font-size: 16px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s ease;
            box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
            transform: translateY(0);
            margin-bottom: 1.5rem;
          }
          
          .submit-btn:hover:not(:disabled) {
            transform: translateY(-2px);
            box-shadow: 0 8px 20px rgba(102, 126, 234, 0.4);
          }
          
          .submit-btn.loading {
            background: #cbd5e0;
            cursor: not-allowed;
            box-shadow: none;
            transform: none;
          }
          
          .btn-content {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 8px;
          }
          
          .spinner {
            width: 16px;
            height: 16px;
            border: 2px solid #ffffff40;
            border-top: 2px solid #ffffff;
            border-radius: 50%;
            animation: spin 1s linear infinite;
          }
          
          .register-link {
            text-align: center;
          }
          
          .register-text {
            color: #64748b;
            font-size: 14px;
            margin: 0;
          }
          
          .register-link-text {
            color: #667eea;
            text-decoration: none;
            font-weight: 600;
            transition: color 0.2s ease;
          }
          
          .register-link-text:hover {
            color: #5a67d8;
          }
          
          .test-accounts {
            margin-top: 2rem;
            padding: 16px;
            background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
            border-radius: 12px;
            border: 1px solid #bae6fd;
          }
          
          .test-accounts-title {
            font-size: 12px;
            color: #0369a1;
            font-weight: 600;
            margin-bottom: 8px;
            display: flex;
            align-items: center;
            gap: 6px;
          }
          
          .test-accounts-content {
            font-size: 12px;
            color: #0c4a6e;
            line-height: 1.4;
          }
          
          .test-account-item {
            margin-bottom: 4px;
          }
          
          .test-accounts-content code {
            background: #ffffff;
            padding: 2px 6px;
            border-radius: 4px;
          }
          
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}
      </style>
    </div>
  );
};