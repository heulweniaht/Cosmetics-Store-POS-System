import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthProvider';

export const Header = () => {
  const { user, logout } = useAuth();
  const location = useLocation();

  const menuItems = [
    { path: '/user/home', label: 'Trang chủ' },
    { path: '/user/products', label: 'Sản phẩm' },
    { path: '/user/sales', label: 'Bán hàng' },
    { path: '/user/cart', label: 'Hoá đơn' },
    { path: '/user/orders', label: 'Đơn hàng' },
    { path: '/user/profile', label: 'Thông tin' },
  ];

  return (
    <header
      style={{
        background: "linear-gradient(90deg, #3C95FB 0%, #007BFF 100%)",
        padding: "0.5rem 1.5rem",
        boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 1000,
        width: "100%",
        height: "60px",
        borderBottomLeftRadius: "10px",
        borderBottomRightRadius: "10px",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          maxWidth: "1200px",
          margin: "0 auto",
          height: "100%",
        }}
      >
        {/* Logo */}
        <div
          className="logo"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
          }}
        >
          <Link
            to="/user"
            style={{
              textDecoration: "none",
              color: "white",
              display: "flex",
              alignItems: "center",
            }}
          >
            <h2
              style={{
                margin: 0,
                fontSize: "1.6rem",
                fontWeight: "800",
                letterSpacing: "0.5px",
              }}
            >
              💄 Cosmetics <span style={{ color: "#FFD60A" }}>POS</span>
            </h2>
          </Link>
        </div>

        {/* Menu */}
        <nav
          style={{
            display: "flex",
            gap: "1.2rem",
            alignItems: "center",
          }}
        >
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              style={{
                textDecoration: "none",
                color: "#f0f8ff",
                fontWeight: location.pathname === item.path ? "700" : "500",
                padding: "0.4rem 0.8rem",
                borderRadius: "6px",
                background:
                  location.pathname === item.path
                    ? "rgba(255,255,255,0.25)"
                    : "transparent",
                transition: "all 0.3s ease",
                fontSize: "1rem",
              }}
              onMouseEnter={(e) => {
                e.target.style.background = "rgba(255,255,255,0.15)";
              }}
              onMouseLeave={(e) => {
                e.target.style.background =
                  location.pathname === item.path
                    ? "rgba(255,255,255,0.25)"
                    : "transparent";
              }}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* User info + Logout */}
        <div
          className="user-menu"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "1rem",
            color: "white",
          }}
        >
          <span
            style={{
              fontSize: "0.95rem",
              display: "flex",
              alignItems: "center",
              gap: "0.3rem",
              background: "rgba(255,255,255,0.15)",
              padding: "0.3rem 0.7rem",
              borderRadius: "6px",
            }}
          >
            👋 {user?.username || "User"}
          </span>

          <button
            onClick={logout}
            style={{
              padding: "0.4rem 0.8rem",
              background: "#FF4D4F",
              color: "white",
              border: "none",
              borderRadius: "6px",
              cursor: "pointer",
              fontWeight: "600",
              transition: "all 0.3s ease",
            }}
            onMouseEnter={(e) => {
              e.target.style.background = "#d9363e";
            }}
            onMouseLeave={(e) => {
              e.target.style.background = "#FF4D4F";
            }}
          >
            Đăng xuất
          </button>
        </div>
      </div>
    </header>


  );
};