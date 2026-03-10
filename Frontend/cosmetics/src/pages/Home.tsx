import { useNavigate } from 'react-router-dom';
import './Home.css';

export const Home = () => {
  const navigate = useNavigate();

  const quickActions = [
    {
      title: 'Bán hàng',
      description: 'Quản lý bán hàng và tạo đơn hàng mới',
      icon: '🛒',
      color: 'primary',
      path: '/user/sales'
    },
    {
      title: 'Sản phẩm',
      description: 'Xem danh sách sản phẩm có sẵn',
      icon: '💄',
      color: 'success',
      path: '/user/products'
    },
    {
      title: 'Hoá đơn',
      description: 'Xem và quản lý hoá đơn',
      icon: '🛍️',
      color: 'warning',
      path: '/user/cart'
    },
    {
      title: 'Đơn hàng',
      description: 'Theo dõi trạng thái đơn hàng',
      icon: '📋',
      color: 'info',
      path: '/user/orders'
    }
  ];

  const features = [
    {
      title: 'Quản lý bán hàng thông minh',
      description: 'Hệ thống POS hiện đại với giao diện thân thiện',
      icon: '⚡'
    },
    {
      title: 'Theo dõi đơn hàng real-time',
      description: 'Cập nhật trạng thái đơn hàng theo thời gian thực',
      icon: '📊'
    },
    {
      title: 'Quản lý sản phẩm dễ dàng',
      description: 'Thêm, sửa, xóa sản phẩm một cách nhanh chóng',
      icon: '📦'
    }
  ];

  return (
    <div className="home-page">
      {/* Hero Section */}
      <div className="hero-section">
        <div className="hero-content">
          <h1 className="hero-title">
            Chào mừng đến với <span className="highlight">CosmeticsPOS</span> 🎉
          </h1>
          <p className="hero-subtitle">
            Hệ thống quản lý bán hàng mỹ phẩm hiện đại, giúp bạn quản lý cửa hàng một cách hiệu quả và chuyên nghiệp.
          </p>
          <div className="hero-actions">
            <button 
              className="btn btn-primary"
              onClick={() => navigate('/user/sales')}
            >
              <span className="icon">🛒</span>
              Bắt đầu bán hàng
            </button>
            <button 
              className="btn btn-outline"
              onClick={() => navigate('/user/products')}
            >
              <span className="icon">💄</span>
              Xem sản phẩm
            </button>
          </div>
        </div>
        <div className="hero-image">
          <div className="floating-card">
            <div className="card-icon">💄</div>
            <div className="card-title">Mỹ phẩm cao cấp</div>
          </div>
          <div className="floating-card delay-1">
            <div className="card-icon">🛒</div>
            <div className="card-title">Bán hàng nhanh</div>
          </div>
          <div className="floating-card delay-2">
            <div className="card-icon">📊</div>
            <div className="card-title">Báo cáo chi tiết</div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="quick-actions-section">
        <h2 className="section-title">Truy cập nhanh</h2>
        <div className="quick-actions-grid">
          {quickActions.map((action, index) => (
            <div 
              key={index}
              className={`action-card action-card-${action.color}`}
              onClick={() => navigate(action.path)}
            >
              <div className="action-icon">
                {action.icon}
              </div>
              <div className="action-content">
                <h3 className="action-title">{action.title}</h3>
                <p className="action-description">{action.description}</p>
              </div>
              <div className="action-arrow">→</div>
            </div>
          ))}
        </div>
      </div>

      {/* Features */}
      <div className="features-section">
        <h2 className="section-title">Tính năng nổi bật</h2>
        <div className="features-grid">
          {features.map((feature, index) => (
            <div key={index} className="feature-card">
              <div className="feature-icon">{feature.icon}</div>
              <h3 className="feature-title">{feature.title}</h3>
              <p className="feature-description">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Stats */}
      <div className="stats-section">
        <div className="stats-grid">
          <div className="stat-item">
            <div className="stat-number">500+</div>
            <div className="stat-label">Sản phẩm</div>
          </div>
          <div className="stat-item">
            <div className="stat-number">1000+</div>
            <div className="stat-label">Đơn hàng</div>
          </div>
          <div className="stat-item">
            <div className="stat-number">99%</div>
            <div className="stat-label">Hài lòng</div>
          </div>
          <div className="stat-item">
            <div className="stat-number">24/7</div>
            <div className="stat-label">Hỗ trợ</div>
          </div>
        </div>
      </div>
    </div>
  );
};