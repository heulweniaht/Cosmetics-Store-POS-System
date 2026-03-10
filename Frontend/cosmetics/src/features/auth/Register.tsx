import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthProvider';
import { useNavigate } from 'react-router-dom';

const RegisterForm = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    firstName: '',
    lastName: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await register(formData);
      alert('✅ Đăng ký thành công! Vui lòng đăng nhập.');
      navigate('/auth/login');
    } catch (error: unknown) {
      const errorMessage = error && typeof error === 'object' && 'response' in error 
        ? (error as { response?: { data?: { message?: string } } }).response?.data?.message || 'Đăng ký thất bại'
        : 'Đăng ký thất bại';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="register-form-container">
      <div className="register-header">
        <div className="register-icon">
          ✨
        </div>
        <h1 className="register-title">
          Đăng ký tài khoản
        </h1>
        <p className="register-subtitle">
          Tạo tài khoản mới để bắt đầu
        </p>
      </div>
      
      {error && (
        <div className="register-error">
          ⚠️ {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="register-form">
        <div className="input-group">
          <input
            name="username"
            type="text"
            placeholder="👤 Tên đăng nhập"
            value={formData.username}
            onChange={handleChange}
            required
            className="input-field"
          />
        </div>

        <div className="input-group">
          <input
            name="email"
            type="email"
            placeholder="📧 Email"
            value={formData.email}
            onChange={handleChange}
            required
            className="input-field"
          />
        </div>

        <div className="input-group-row">
          <input
            name="firstName"
            type="text"
            placeholder="👨 Họ"
            value={formData.firstName}
            onChange={handleChange}
            className="input-field input-field-half"
          />
          <input
            name="lastName"
            type="text"
            placeholder="👩 Tên"
            value={formData.lastName}
            onChange={handleChange}
            className="input-field input-field-half"
          />
        </div>

        <div className="input-group input-group-last">
          <input
            name="password"
            type="password"
            placeholder="🔒 Mật khẩu"
            value={formData.password}
            onChange={handleChange}
            required
            className="input-field"
          />
        </div>

        <button 
          type="submit" 
          disabled={loading}
          className={`submit-btn ${loading ? 'loading' : ''}`}
        >
          {loading ? '⏳ Đang tạo tài khoản...' : '🎉 Tạo tài khoản'}
        </button>

        <div className="login-link">
          <span className="login-text">
            Đã có tài khoản?{' '}
          </span>
          <a href="/auth/login" className="login-link-text">
            Đăng nhập ngay →
          </a>
        </div>
      </form>
    </div>
  );
};

export const Register = () => {
  return (
    <div className="register-page">
      <div className="register-container">
        {/* Left Side - Register Form */}
        <div className="register-form">
          <RegisterForm />
        </div>

        {/* Right Side - Image (Hidden on mobile) */}
        <div className="register-image">
          <div className="register-image-overlay">
            <div className="register-image-icon">
              🌟
            </div>
            <h2 className="register-image-title">
              Chào mừng bạn!
            </h2>
            <p className="register-image-subtitle">
              Tham gia cùng chúng tôi và khám phá thế giới mỹ phẩm
            </p>
          </div>
        </div>
      </div>

      <style>
        {`
          .register-page {
            width:100%;
            height: 100vh;
            background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 20px;
          }
          
          .register-container {
            width: 100%;
            max-width: 1200px;
            background: white;
            border-radius: 24px;
            box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.1);
            overflow: hidden;
            display: flex;
            min-height: 700px;
          }
          
          .register-form {
            flex: 1;
            padding: 0;
            display: flex;
            flex-direction: column;
          }
          
          .register-form-container {
            padding: 2rem;
            display: flex;
            flex-direction: column;
            justify-content: center;
            min-height: 600px;
          }
          
          .register-header {
            text-align: center;
            margin-bottom: 2.5rem;
          }
          
          .register-icon {
            font-size: 2rem;
            margin-bottom: 1rem;
          }
          
          .register-title {
            font-size: 2.5rem;
            font-weight: 700;
            margin: 0 0 0.5rem 0;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
          }
          
          .register-subtitle {
            font-size: 1.1rem;
            color: #64748b;
            margin: 0;
          }
          
          .register-error {
            background: linear-gradient(135deg, #fee2e2 0%, #fecaca 100%);
            color: #dc2626;
            padding: 1rem;
            border-radius: 12px;
            margin-bottom: 1.5rem;
            border: 1px solid #fca5a5;
            font-size: 0.95rem;
            font-weight: 500;
          }
          
          .register-form {
            width: 100%;
          }
          
          .input-group {
            margin-bottom: 1.5rem;
          }
          
          .input-group-row {
            display: flex;
            gap: 1rem;
            margin-bottom: 1.5rem;
          }
          
          .input-group-last {
            margin-bottom: 2rem;
          }
          
          .input-field {
            width: 100%;
            padding: 1rem 1.25rem;
            border: 2px solid #e2e8f0;
            border-radius: 12px;
            font-size: 1rem;
            outline: none;
            transition: all 0.3s ease;
            background: #f8fafc;
            box-sizing: border-box;
          }
          
          .input-field-half {
            flex: 1;
          }
          
          .input-field:focus {
            border-color: #667eea;
            background: white;
            box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
          }
          
          .submit-btn {
            width: 100%;
            padding: 1rem 1.5rem;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            border: none;
            border-radius: 12px;
            font-size: 1.1rem;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s ease;
            box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
            transform: translateY(0);
          }
          
          .submit-btn:hover:not(:disabled) {
            transform: translateY(-2px);
            box-shadow: 0 8px 25px rgba(102, 126, 234, 0.6);
          }
          
          .submit-btn.loading {
            background: linear-gradient(135deg, #94a3b8 0%, #64748b 100%);
            cursor: not-allowed;
            box-shadow: none;
            transform: none;
          }
          
          .login-link {
            text-align: center;
            margin-top: 2rem;
          }
          
          .login-text {
            color: #64748b;
            font-size: 0.95rem;
          }
          
          .login-link-text {
            color: #667eea;
            text-decoration: none;
            font-size: 0.95rem;
            font-weight: 600;
            transition: color 0.3s ease;
          }
          
          .login-link-text:hover {
            color: #764ba2;
          }
          
          .register-image {
            flex: 1;
            background: linear-gradient(135deg, rgba(102, 126, 234, 0.8) 0%, rgba(118, 75, 162, 0.8) 100%), url('https://i.pinimg.com/736x/f7/b6/7b/f7b67bfe4b19c7c48d7a73bd7dcf9e5c.jpg');
            background-size: cover;
            background-position: center;
            position: relative;
            display: flex;
            align-items: center;
            justify-content: center;
          }
          
          .register-image-overlay {
            text-align: center;
            color: white;
            z-index: 1;
          }
          
          .register-image-icon {
            font-size: 48px;
            margin-bottom: 1rem;
          }
          
          .register-image-title {
            font-size: 32px;
            font-weight: 700;
            margin: 0 0 1rem 0;
            text-shadow: 0 2px 4px rgba(0,0,0,0.3);
          }
          
          .register-image-subtitle {
            font-size: 18px;
            margin: 0;
            opacity: 0.9;
            text-shadow: 0 1px 2px rgba(0,0,0,0.3);
          }
          
          @media (max-width: 1024px) {
            .register-page {
              height:100% !important;
              padding:0;
            }
            .register-container {
              max-width: 900px;
            }
          }
          
          @media (max-width: 768px) {
           .register-page {
              height:100% !important;
              padding:0;
            }
            .register-container {
              flex-direction: column;
              max-width: 100%;
              width: 100%;
              min-height: auto;
              margin: 0;
              border-radius: 20px;
            }
            .register-image {
              display: none;
            }
            .register-form {
              padding: 0;
              width: 100%;
            }
            .register-form-container {
              padding: 1.5rem;
              min-height: calc(100vh - 40px);
              justify-content: center;
              padding-top: 2rem;
            }
          }
          
          @media (max-width: 480px) {
           .register-page {
              height:100% !important;
              padding:0;
            }
            .register-container {
              border-radius: 16px;
              box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1);
            }
            .register-form-container {
              padding: 1rem;
              padding-top: 1.5rem;
            }
            .input-field {
              font-size: 16px;
              padding: 12px 16px;
            }
            .submit-btn {
              padding: 12px;
              font-size: 16px;
            }
            .input-group-row {
              flex-direction: column;
              gap: 1.5rem;
            }
          }
          
          @media (max-width: 320px) {
            .register-container {
              border-radius: 12px;
            }
          }
        `}
      </style>
    </div>
  );
};